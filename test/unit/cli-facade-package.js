const expect = require('chai').expect;
const path = require('node:path');
const sinon = require('sinon');

describe('cli : facade : package', () => {
  const logSpy = {};
  const Local = require('../../dist/cli/domain/local').default;
  const local = Local();
  const PackageFacade = require('../../dist/cli/facade/package.js').default;
  const packageFacade = PackageFacade({ local: local, logger: logSpy });

  const execute = (compress, cb) => {
    logSpy.err = sinon.stub();
    logSpy.ok = sinon.stub();
    logSpy.warn = sinon.stub();
    packageFacade(
      {
        componentPath: 'test/fixtures/components/hello-world/',
        compress
      },
      () => {
        cb();
      }
    );
  };

  describe('before packaging a component', () => {
    it('should always show a message', (done) => {
      sinon.stub(local, 'package').rejects('the component is not valid');
      execute(false, () => {
        local.package.restore();

        const message = logSpy.warn.args[0][0];
        const re = new RegExp('\\' + path.sep, 'g');
        const messageWithSlashesOnPath = message.replace(re, '/');

        expect(messageWithSlashesOnPath).to.include('Packaging -> ');
        expect(messageWithSlashesOnPath).to.include(
          'components/hello-world/_package'
        );
        done();
      });
    });

    describe('when packaging', () => {
      describe('when a component is not valid', () => {
        beforeEach((done) => {
          sinon.stub(local, 'package').rejects('the component is not valid');
          execute(false, done);
        });

        afterEach(() => {
          local.package.restore();
        });

        it('should show an error', () => {
          expect(logSpy.err.args[0][0]).to.equal(
            'An error happened when creating the package: the component is not valid'
          );
        });
      });

      describe('when a component is valid', () => {
        beforeEach(() => {
          sinon.stub(local, 'package').resolves({
            name: 'hello-world',
            version: '1.0.0'
          });
        });

        afterEach(() => {
          local.package.restore();
        });

        it('should package and show success message', (done) => {
          execute(false, () => {
            const warnMessage = logSpy.warn.args[0][0];
            const okMessage = logSpy.ok.args[0][0];
            const re = new RegExp('\\' + path.sep, 'g');
            const warnMessageWithSlashesOnPath = warnMessage.replace(re, '/');
            const okMessageWithSlashesOnPath = okMessage.replace(re, '/');

            expect(warnMessageWithSlashesOnPath).to.include('Packaging -> ');
            expect(warnMessageWithSlashesOnPath).to.include(
              'components/hello-world/_package'
            );

            expect(okMessageWithSlashesOnPath).to.include('Packaged -> ');
            expect(okMessageWithSlashesOnPath).to.include(
              'components/hello-world/_package'
            );
            done();
          });
        });

        describe('when creating tar.gz archive', () => {
          it('should not compress when option set to false', (done) => {
            sinon.stub(local, 'compress').resolves(null);

            execute(false, () => {
              local.compress.restore();
              const warnMessage = logSpy.warn.args[0][0];
              const warnDependenciesMessage = logSpy.warn.args[1][0];
              const okMessage = logSpy.ok.args[0][0];
              const re = new RegExp('\\' + path.sep, 'g');
              const warnMessageWithSlashesOnPath = warnMessage.replace(re, '/');
              const warnDependenciesMessageWithSlashesOnPath =
                warnDependenciesMessage.replace(re, '/');
              const okMessageWithSlashesOnPath = okMessage.replace(re, '/');
              expect(warnDependenciesMessageWithSlashesOnPath).to.include(
                'Ensuring dependencies are loaded...'
              );
              expect(warnMessageWithSlashesOnPath).to.include('Packaging -> ');
              expect(okMessageWithSlashesOnPath).to.include('Packaged -> ');
              expect(logSpy.warn.args[2]).to.be.undefined;
              done();
            });
          });

          describe('when compression is successful', () => {
            beforeEach(() => {
              sinon.stub(local, 'compress').resolves(null);
            });

            afterEach(() => {
              local.compress.restore();
            });

            it('should show a message for success', (done) => {
              execute(true, () => {
                const warnDependenciesMessage = logSpy.warn.args[1][0];
                const warnMessage = logSpy.warn.args[2][0];
                const okMessage = logSpy.ok.args[1][0];
                const re = new RegExp('\\' + path.sep, 'g');
                const warnMessageWithSlashesOnPath = warnMessage.replace(
                  re,
                  '/'
                );
                const warnDependenciesMessageWithSlashesOnPath =
                  warnDependenciesMessage.replace(re, '/');
                const okMessageWithSlashesOnPath = okMessage.replace(re, '/');

                expect(warnDependenciesMessageWithSlashesOnPath).to.include(
                  'Ensuring dependencies are loaded...'
                );
                expect(warnMessageWithSlashesOnPath).to.include(
                  'Compressing -> '
                );
                expect(warnMessageWithSlashesOnPath).to.include(
                  'components/hello-world/package.tar.gz'
                );
                expect(okMessageWithSlashesOnPath).to.include('Compressed -> ');
                expect(okMessageWithSlashesOnPath).to.include(
                  'components/hello-world/package.tar.gz'
                );
                done();
              });
            });
          });

          describe('when compression fails', () => {
            beforeEach(() => {
              sinon.stub(local, 'compress').rejects('error while compressing');
            });

            afterEach(() => {
              local.compress.restore();
            });

            it('should show a message for failure', (done) => {
              execute(true, () => {
                const warnDependenciesMessage = logSpy.warn.args[1][0];
                const warnMessage = logSpy.warn.args[2][0];
                const errorMessage = logSpy.err.args[0][0];
                const re = new RegExp('\\' + path.sep, 'g');
                const warnMessageWithSlashesOnPath = warnMessage.replace(
                  re,
                  '/'
                );
                const warnDependenciesMessageWithSlashesOnPath =
                  warnDependenciesMessage.replace(re, '/');

                expect(warnDependenciesMessageWithSlashesOnPath).to.include(
                  'Ensuring dependencies are loaded...'
                );
                expect(warnMessageWithSlashesOnPath).to.include(
                  'Compressing -> '
                );
                expect(warnMessageWithSlashesOnPath).to.include(
                  'components/hello-world/package.tar.gz'
                );
                expect(errorMessage).to.equal(
                  'An error happened when creating the package: error while compressing'
                );
                done();
              });
            });
          });
        });
      });
    });
  });
});
