import type { VM } from '../../../types';

export default function componentsTemplates(vm: VM): string {
  const externalLink = ({
    global,
    url
  }: {
    global: string | string[];
    url: string;
  }) => `<a href="${url}" target="_blank">${global}</a>`;

  const templateRow = ({
    externals,
    type,
    version
  }: {
    type: string;
    version: string;
    externals: Array<{ global: string | string[]; url: string }>;
  }) => {
    const externalLinks = externals.map(externalLink).join(', ');
    const externalsLabel = externalLinks ? `(Externals: ${externalLinks})` : '';

    return `<div class="componentRow row table">
    <p class="release">
      <a href="https://www.npmjs.com/package/${type}" target="_blank">${type}@${version}</a>
      ${externalsLabel}
    </p>
  </div>
`;
  };

  return `<div id="components-templates" class="box">${vm.templates
    .map(templateRow)
    .join('')}</div>`;
}
