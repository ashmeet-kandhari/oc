const expect = require('chai').expect;
const sinon = require('sinon');

describe('registry : routes : helpers : nested-renderer', () => {
  const NestedRenderer =
    require('../../dist/registry/domain/nested-renderer').default;

  let nestedRenderer;
  let renderer;

  const initialise = (rendererMocks, conf) => {
    if (Array.isArray(rendererMocks)) {
      renderer = sinon.stub();

      rendererMocks.forEach((rendererMock, i) => {
        renderer.onCall(i).yields(rendererMock);
      });
    } else {
      renderer = sinon.stub().yields(rendererMocks);
    }

    nestedRenderer = NestedRenderer(renderer, conf || {});
  };

  describe('when rendering nested component', () => {
    describe('when req is not valid', () => {
      describe('when componentName not valid', () => {
        beforeEach(() => {
          initialise();
        });

        it('should throw an error', () => {
          const f = () => {
            nestedRenderer.renderComponent();
          };
          expect(f).to.throw("component's name is not valid");
        });
      });

      describe('when componentName empty', () => {
        beforeEach(() => {
          initialise();
        });

        it('should throw an error', () => {
          const f = () => {
            nestedRenderer.renderComponent('');
          };
          expect(f).to.throw("component's name is not valid");
        });
      });

      describe('when requesting a not existent component', () => {
        let error;
        beforeEach((done) => {
          initialise({
            status: 404,
            response: {
              error: 'Component not found 404'
            }
          });

          nestedRenderer
            .renderComponent('404-component', {})
            .catch((err) => {
              error = err;
            })
            .finally(done);
        });

        it('should return an error in the callback', () => {
          expect(error).to.equal('Component not found 404');
        });
      });
    });

    describe('when req is valid', () => {
      describe('when all params specified', () => {
        let result;
        let error;
        beforeEach((done) => {
          initialise(
            {
              status: 200,
              response: {
                html: '<b>Some html</b>'
              }
            },
            { bla: 'blabla' }
          );

          nestedRenderer
            .renderComponent('my-component', {
              headers: {
                'accept-language': 'en-GB',
                accept: 'blargh'
              },
              parameters: { a: 1234 },
              version: '1.2.X'
            })
            .then((res) => {
              result = res;
            })
            .catch((err) => {
              error = err;
            })
            .finally(done);
        });

        it('should get the html result', () => {
          expect(result).to.equal('<b>Some html</b>');
        });

        it('should make correct request to renderer', () => {
          expect(renderer.args[0][0]).to.eql({
            name: 'my-component',
            ip: '',
            conf: { bla: 'blabla' },
            headers: {
              'accept-language': 'en-GB',
              accept: 'application/vnd.oc.rendered+json'
            },
            parameters: { a: 1234 },
            version: '1.2.X'
          });
        });

        it('should get no error', () => {
          expect(error).to.be.undefined;
        });
      });

      describe('when minimal params specified', () => {
        let result;
        let error;
        beforeEach((done) => {
          initialise(
            {
              status: 200,
              response: {
                html: '<b>Some html</b>'
              }
            },
            { bla: 'blabla' }
          );

          nestedRenderer
            .renderComponent('my-component')
            .then((res) => {
              result = res;
            })
            .catch((err) => {
              error = err;
            })
            .finally(done);
        });

        it('should get the html result', () => {
          expect(result).to.equal('<b>Some html</b>');
        });

        it('should make correct request to renderer', () => {
          expect(renderer.args[0][0]).to.eql({
            name: 'my-component',
            ip: '',
            conf: { bla: 'blabla' },
            headers: {
              accept: 'application/vnd.oc.rendered+json'
            },
            parameters: {},
            version: ''
          });
        });

        it('should get no error', () => {
          expect(error).to.be.undefined;
        });
      });
    });
  });

  describe('when rendering nested components', () => {
    describe('when req is not valid', () => {
      describe('when components not valid', () => {
        beforeEach(() => {
          initialise();
        });

        it('should throw an error', () => {
          const f = () => {
            nestedRenderer.renderComponents();
          };
          expect(f).to.throw('components is not valid');
        });
      });

      describe('when components empty', () => {
        beforeEach(() => {
          initialise();
        });

        it('should throw an error', () => {
          const f = () => {
            nestedRenderer.renderComponents([]);
          };
          expect(f).to.throw('components is not valid');
        });
      });

      describe('when requesting not existent components', () => {
        let result;
        let error;
        beforeEach((done) => {
          initialise({
            status: 404,
            response: {
              error: 'Component not found!'
            }
          });

          nestedRenderer
            .renderComponents(
              [
                { name: '404-component' },
                { name: 'another-not-existent-component' }
              ],
              {}
            )
            .then((res) => {
              result = res;
            })
            .catch((err) => {
              error = err;
            })
            .finally(done);
        });

        it('should return no error in the callback', () => {
          expect(error).to.be.undefined;
        });

        it('should return error in result callback', () => {
          expect(result[0].toString()).to.equal('Error: Component not found!');
          expect(result[1].toString()).to.equal('Error: Component not found!');
        });
      });
    });

    describe('when req is valid', () => {
      describe('when all params specified', () => {
        let result;
        let error;
        beforeEach((done) => {
          initialise(
            [
              {
                status: 200,
                response: { html: '<b>Some html</b>' }
              },
              {
                status: 200,
                response: { html: '<b>Some other html</b>' }
              }
            ],
            { bla: 'blabla' }
          );

          nestedRenderer
            .renderComponents(
              [
                {
                  name: 'my-component',
                  parameters: { x: 123 },
                  version: '1.2.X'
                },
                {
                  name: 'my-other-component',
                  parameters: { y: 456 },
                  version: '^1.4.6'
                }
              ],
              {
                headers: {
                  'accept-language': 'en-GB',
                  accept: 'blargh'
                },
                parameters: {
                  x: 456,
                  z: 789
                }
              }
            )
            .then((res) => {
              result = res;
            })
            .catch((err) => {
              error = err;
            })
            .finally(done);
        });

        it('should get the html result', () => {
          expect(result).to.eql(['<b>Some html</b>', '<b>Some other html</b>']);
        });

        it('should make correct request to renderer', () => {
          expect(renderer.args.length).to.equal(2);

          expect(renderer.args[0][0]).to.eql({
            name: 'my-component',
            ip: '',
            conf: { bla: 'blabla' },
            headers: {
              'accept-language': 'en-GB',
              accept: 'application/vnd.oc.rendered+json'
            },
            parameters: {
              x: 123,
              z: 789
            },
            version: '1.2.X'
          });

          expect(renderer.args[1][0]).to.eql({
            name: 'my-other-component',
            ip: '',
            conf: { bla: 'blabla' },
            headers: {
              'accept-language': 'en-GB',
              accept: 'application/vnd.oc.rendered+json'
            },
            parameters: {
              x: 456,
              y: 456,
              z: 789
            },
            version: '^1.4.6'
          });
        });

        it('should get no error', () => {
          expect(error).to.be.undefined;
        });
      });

      describe('when minimal params specified', () => {
        let result;
        let error;
        beforeEach((done) => {
          initialise(
            [
              {
                status: 200,
                response: { html: '<b>Some html</b>' }
              },
              {
                status: 200,
                response: { html: '<b>Some other html</b>' }
              }
            ],
            { bla: 'blabla' }
          );

          nestedRenderer
            .renderComponents([
              { name: 'my-component' },
              { name: 'my-other-component' }
            ])
            .then((res) => {
              result = res;
            })
            .catch((err) => {
              error = err;
            })
            .finally(done);
        });

        it('should get the html result', () => {
          expect(result).to.eql(['<b>Some html</b>', '<b>Some other html</b>']);
        });

        it('should make correct request to renderer', () => {
          expect(renderer.args.length).to.equal(2);

          expect(renderer.args[0][0]).to.eql({
            name: 'my-component',
            ip: '',
            conf: { bla: 'blabla' },
            headers: { accept: 'application/vnd.oc.rendered+json' },
            parameters: {},
            version: ''
          });

          expect(renderer.args[1][0]).to.eql({
            name: 'my-other-component',
            ip: '',
            conf: { bla: 'blabla' },
            headers: { accept: 'application/vnd.oc.rendered+json' },
            parameters: {},
            version: ''
          });
        });

        it('should get no error', () => {
          expect(error).to.be.undefined;
        });
      });
    });
  });
});
