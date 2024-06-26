const expect = require('chai').expect;

describe('registry : domain : register-templates', () => {
  const registerTemplates =
    require('../../dist/registry/domain/register-templates.js').default;

  describe('when templates get registered without additional templates', () => {
    const registerd = registerTemplates();

    it('should correctly register core-templates', () => {
      expect(registerd.templatesHash).to.deep.eql({
        'oc-template-es6': require('oc-template-es6'),
        'oc-template-jade': require('oc-template-jade'),
        'oc-template-handlebars': require('oc-template-handlebars')
      });
      expect(registerd.templatesInfo).to.deep.eql([
        require('oc-template-es6').getInfo(),
        require('oc-template-jade').getInfo(),
        require('oc-template-handlebars').getInfo()
      ]);
    });
  });

  describe('when templates get registered with additional templates', () => {
    const getTemplateMock = (dev) => ({
      getInfo() {
        return {
          type: 'new-tpl',
          version: '6.6.6',
          externals: [{ url: 'produrl', ...(dev && { devUrl: 'devurl' }) }]
        };
      }
    });
    const templateMock = getTemplateMock();
    const devTemplateMock = getTemplateMock(true);

    const registered = registerTemplates([templateMock]);

    it('should correctly register core-templates & extra templates', () => {
      expect(registered.templatesHash).to.deep.eql({
        'oc-template-es6': require('oc-template-es6'),
        'oc-template-jade': require('oc-template-jade'),
        'oc-template-handlebars': require('oc-template-handlebars'),
        'new-tpl': templateMock
      });
      expect(registered.templatesInfo).to.deep.eql([
        require('oc-template-es6').getInfo(),
        require('oc-template-jade').getInfo(),
        require('oc-template-handlebars').getInfo(),
        templateMock.getInfo()
      ]);
    });

    const devRegistered = registerTemplates([devTemplateMock], true);

    it('should replace the devurl for the url field', () => {
      expect(devRegistered.templatesInfo[3].externals[0].url).to.eql('devurl');
    });

    describe('and additional template is already part of core-templates', () => {
      const registered = registerTemplates([require('oc-template-jade')]);

      it('should correctly register core-templates only', () => {
        expect(registered.templatesHash).to.deep.eql({
          'oc-template-es6': require('oc-template-es6'),
          'oc-template-jade': require('oc-template-jade'),
          'oc-template-handlebars': require('oc-template-handlebars')
        });
        expect(registered.templatesInfo).to.deep.eql([
          require('oc-template-es6').getInfo(),
          require('oc-template-jade').getInfo(),
          require('oc-template-handlebars').getInfo()
        ]);
      });
    });
  });
});
