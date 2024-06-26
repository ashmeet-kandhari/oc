const expect = require('chai').expect;
const sinon = require('sinon');

describe('cli : facade : mock', () => {
  const logSpy = {};
  const MockFacade = require('../../dist/cli/facade/mock').default;
  const Local = require('../../dist/cli/domain/local').default;
  const local = Local();
  const mockFacade = MockFacade({ local: local, logger: logSpy });

  const execute = (done) => {
    logSpy.ok = sinon.spy();
    mockFacade(
      { targetType: 'plugin', targetName: 'getValue', targetValue: 'value' },
      () => done()
    );
  };

  describe('when mocking plugin', () => {
    describe('when it succeeds', () => {
      beforeEach((done) => {
        sinon.stub(local, 'mock').resolves('ok');
        execute(done);
      });

      afterEach(() => {
        local.mock.restore();
      });

      it('should show a confirmation message', () => {
        expect(logSpy.ok.args[0][0]).to.equal(
          'Mock for plugin has been registered: getValue () => value'
        );
      });
    });
  });
});
