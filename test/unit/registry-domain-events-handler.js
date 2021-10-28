'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

describe('registry : domain : events-handler', () => {
  const eventsHandler =
    require('../../dist/registry/domain/events-handler').default;

  describe('when requiring it multiple times', () => {
    const spy = sinon.spy();
    let handler2;

    before(() => {
      eventsHandler.on('eventName', spy);
      handler2 = require('../../dist/registry/domain/events-handler').default;
      handler2.fire('eventName', { a: 1234 });
    });

    after(() => {
      eventsHandler.reset();
    });

    it('should be a singleton', () => {
      expect(spy.called).to.be.true;
    });
  });

  describe('when firing an event that has multiple subscribers', () => {
    const spy = sinon.spy();
    let c = 0;

    before(() => {
      eventsHandler.on('fire', payload => {
        spy(++c, payload);
      });
      eventsHandler.on('fire', payload => {
        spy(++c, payload);
      });
      eventsHandler.fire('fire', { hello: true });
    });

    after(() => {
      eventsHandler.reset();
    });

    it('should call the subscribers in the correct order', () => {
      expect(spy.args[0][0]).to.equal(1);
      expect(spy.args[1][0]).to.equal(2);
    });

    it('should call the subscribers with the event payload', () => {
      expect(spy.args[0][1]).to.eql({ hello: true });
      expect(spy.args[1][1]).to.eql({ hello: true });
    });
  });

  describe('when subscribing a request event using a not valid handler', () => {
    const execute = function () {
      eventsHandler.on('request', 'this is not a function');
    };

    it('should throw an error', () => {
      expect(execute).to.throw(
        "Registry configuration is not valid: registry.on's callback must be a function"
      );
    });
  });

  describe('when unsubscribing a request event', () => {
    const executeNonFunction = function () {
      eventsHandler.off('request', 'this is not a function');
    };
    const execute = function () {
      eventsHandler.off('request', () => {});
    };

    it('should throw an error if callback is not a function', () => {
      expect(executeNonFunction).to.throw(
        "Registry configuration is not valid: registry.off's callback must be a function"
      );
    });
    it('should not throw an error if event name is not registered', () => {
      expect(execute).not.to.throw();
    });
    it('should remove the specific callback but not the others', () => {
      const spy = sinon.spy();
      const spyToBeRemoved = sinon.spy();
      eventsHandler.on('eventName', spy);
      eventsHandler.on('eventName', spyToBeRemoved);

      eventsHandler.off('eventName', spyToBeRemoved);
      eventsHandler.fire('eventName', {});

      expect(spy.called).to.be.true;
      expect(spyToBeRemoved.called).not.to.be.true;
      eventsHandler.reset();
    });
  });
});
