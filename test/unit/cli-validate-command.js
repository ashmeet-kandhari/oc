const validate = require('../../dist/cli/validate-command').default;
const expect = require('chai').expect;

describe('cli : validate-command : valid', () => {
  const scenarios = [
    {
      _: ['registry', 'add'],
      level: 0
    },
    {
      _: ['registry', 'add'],
      level: 1
    },
    {
      _: ['registry', 'ls'],
      level: 1
    }
  ];

  for (const scenario of scenarios) {
    describe(`given "${scenario._.join(' ')}"`, () => {
      it(`"${scenario._[scenario.level]}" should be a valid command`, () => {
        const argv = {
          _: scenario._
        };
        const level = scenario.level;

        expect(validate(argv, level)).to.be.true;
      });
    });
  }
});

describe('cli : validate-command : invalid', () => {
  const scenarios = [
    {
      _: ['foo', 'bar'],
      level: 0
    },
    {
      _: ['registry', 'bar'],
      level: 1
    }
  ];

  for (const scenario of scenarios) {
    describe(`given "${scenario._.join(' ')}"`, () => {
      it(`"${scenario._[scenario.level]}" should be an invalid command`, () => {
        const argv = {
          _: scenario._
        };
        const level = scenario.level;

        expect(() => {
          validate(argv, level);
        }).to.throw();
      });
    });
  }
});
