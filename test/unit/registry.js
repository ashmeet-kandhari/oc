const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');

describe('registry', () => {
  const repositoryInitStub = sinon.stub();

  const deps = {
    './app-start': sinon.stub(),
    './domain/events-handler': { fire: sinon.stub() },
    express: sinon.stub(),
    'node:http': {
      createServer: sinon.stub()
    },
    './middleware': { bind: sinon.stub().returns({}) },
    './domain/plugins-initialiser': { init: sinon.stub() },
    './domain/repository': sinon.stub().returns({
      init: repositoryInitStub
    }),
    './router': { create: sinon.stub() },
    './domain/options-sanitiser': sinon.stub(),
    './domain/validators': {
      validateRegistryConfiguration: sinon.stub()
    }
  };

  const Registry = injectr('../../dist/registry/index.js', deps).default;

  describe('when instanciated', () => {
    describe('when options are not valid', () => {
      let init;
      beforeEach(() => {
        deps['./domain/validators'].validateRegistryConfiguration.returns({
          isValid: false,
          message: 'blargh'
        });
        init = () => {
          Registry({});
        };
      });

      it('should throw an error', () => {
        expect(init).to.throw('blargh');
      });
    });

    describe('when options are valid', () => {
      let registry;
      beforeEach(() => {
        deps['./domain/validators'].validateRegistryConfiguration.returns({
          isValid: true
        });
        deps.express.returns('express instance');
        deps['./domain/options-sanitiser'].returns({ port: 3000 });
        registry = Registry({});
      });

      it('should instantiate express', () => {
        expect(deps.express.called).to.be.true;
      });

      it('should bind the middleware', () => {
        const bind = deps['./middleware'].bind;
        expect(bind.called).to.be.true;
        expect(bind.args[0][0]).to.equal('express instance');
        expect(bind.args[0][1]).to.eql({ port: 3000 });
      });

      it('should instanciate the repository', () => {
        expect(deps['./domain/repository'].called).to.be.true;
      });

      describe('when starting it', () => {
        describe('when plugins initialiser fails', () => {
          let error;
          beforeEach((done) => {
            deps['./domain/plugins-initialiser'].init.rejects(
              new Error('error!')
            );
            registry.start((err) => {
              error = err;
              done();
            });
          });

          it('should fail with error', () => {
            expect(error.message).to.equal('error!');
          });
        });

        describe('when plugins initialiser succeeds', () => {
          describe('when repository initialisation fails', () => {
            let error;
            beforeEach((done) => {
              deps['./domain/plugins-initialiser'].init.resolves('ok');
              repositoryInitStub.rejects(new Error('nope'));

              registry.start((err) => {
                error = err;
                done();
              });
            });

            it('should fail with error', () => {
              expect(error.message).to.equal('nope');
            });
          });

          describe('when repository initialisation succeeds', () => {
            describe('when app fails to start', () => {
              let error;
              beforeEach((done) => {
                deps['./domain/plugins-initialiser'].init.resolves('ok');
                repositoryInitStub.resolves('ok');
                deps['./app-start'].rejects({ msg: 'I got a problem' });

                registry.start((err) => {
                  error = err;
                  done();
                });
              });

              it('should fail with error', () => {
                expect(error).to.equal('I got a problem');
              });
            });

            describe('when app starts', () => {
              describe('when http listener errors', () => {
                let error;
                beforeEach((done) => {
                  deps['./domain/plugins-initialiser'].init.resolves('ok');
                  repositoryInitStub.resolves('ok');
                  deps['./app-start'].resolves('ok');

                  deps['node:http'].createServer.returns({
                    listen: sinon.stub().yields('Port is already used'),
                    on: sinon.stub()
                  });

                  registry.start((err) => {
                    error = err;
                    done();
                  });
                });

                it('should fail with error', () => {
                  expect(error).to.equal('Port is already used');
                });
              });

              describe('when http listener succeeds', () => {
                let error;
                let result;
                beforeEach((done) => {
                  deps['./domain/plugins-initialiser'].init.resolves('ok');
                  repositoryInitStub.resolves('ok');
                  deps['./app-start'].resolves('ok');
                  deps['./domain/events-handler'].fire = sinon.stub();

                  deps['node:http'].createServer.returns({
                    listen: sinon.stub().yields(null, 'ok'),
                    on: sinon.stub()
                  });

                  registry.start((err, res) => {
                    error = err;
                    result = res;
                    done();
                  });
                });

                it('should not return error', () => {
                  expect(error).to.be.null;
                });

                it('should return the server instance', () => {
                  expect(result.app).to.not.be.null;
                  expect(result.server).to.not.be.null;
                });

                it('should emit a start event', () => {
                  expect(deps['./domain/events-handler'].fire.args[0]).to.eql([
                    'start',
                    {}
                  ]);
                });
              });

              describe('when http listener emits an error before the listener to start', () => {
                let error;
                beforeEach((done) => {
                  deps['./domain/plugins-initialiser'].init.resolves('ok');
                  repositoryInitStub.resolves('ok');
                  deps['./app-start'].resolves('ok');
                  deps['./domain/events-handler'].fire = sinon.stub();

                  deps['node:http'].createServer.returns({
                    listen: sinon.stub(),
                    on: sinon.stub().yields('I failed for some reason')
                  });

                  registry.start((err) => {
                    error = err;
                    done();
                  });
                });

                it('should return error', () => {
                  expect(error).to.be.equal('I failed for some reason');
                });

                it('should emit an error event', () => {
                  expect(deps['./domain/events-handler'].fire.args[0]).to.eql([
                    'error',
                    {
                      code: 'EXPRESS_ERROR',
                      message: 'I failed for some reason'
                    }
                  ]);
                });
              });
            });
          });
        });
      });
    });
  });
});
