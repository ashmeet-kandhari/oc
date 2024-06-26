const expect = require('chai').expect;

describe('registry : domain : sanitiser', () => {
  const sanitiser = require('../../dist/registry/domain/sanitiser');

  describe("when sanitising component's request parameters", () => {
    const sanitise = (a, b) => sanitiser.sanitiseComponentParameters(a, b);

    describe('when component has boolean parameter', () => {
      it('should convert string to boolean when true', () => {
        const componentParameters = {
          isTrue: {
            type: 'boolean',
            mandatory: true,
            example: true
          }
        };

        const requestParameters = { isTrue: 'true' };
        const sanitisedParameters = sanitise(
          requestParameters,
          componentParameters
        );

        expect(sanitisedParameters).to.eql({ isTrue: true });
      });

      it('should convert string to boolean when true', () => {
        const componentParameters = {
          isTrue: {
            type: 'boolean',
            mandatory: true,
            example: true
          }
        };

        const requestParameters = { isTrue: 'false' };
        const sanitisedParameters = sanitise(
          requestParameters,
          componentParameters
        );

        expect(sanitisedParameters).to.eql({ isTrue: false });
      });
    });

    describe('when component has string parameter', () => {
      it('should convert null to empty', () => {
        const componentParameters = {
          myString: {
            type: 'string',
            mandatory: false,
            example: 'hello'
          }
        };

        const requestParameters = { myString: null };
        const sanitisedParameters = sanitise(
          requestParameters,
          componentParameters
        );

        expect(sanitisedParameters).to.eql({ myString: '' });
      });
    });

    describe('when component has number parameter', () => {
      it('should convert string to number', () => {
        const componentParameters = {
          age: {
            type: 'number',
            mandatory: true,
            example: 1234
          }
        };

        const requestParameters = { age: '123' };
        const sanitisedParameters = sanitise(
          requestParameters,
          componentParameters
        );

        expect(sanitisedParameters).to.eql({ age: 123 });
      });
    });

    describe('when component have not defined optional parameter', () => {
      it('should keep the parameter as it is', () => {
        const componentParameters = {};
        const requestParameters = { age: 123 };
        const sanitisedParameters = sanitise(
          requestParameters,
          componentParameters
        );

        expect(sanitisedParameters).to.eql({ age: 123 });
      });
    });
  });
});
