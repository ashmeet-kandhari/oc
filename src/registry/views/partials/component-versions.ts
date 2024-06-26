import type { Component } from '../../../types';

const componentVersions =
  ({ component }: { component: Component }) =>
  (): string => {
    const componentOption = (version: string) =>
      `<option value="${version}"${
        version === component.version ? ' selected="selected"' : ''
      }>${version}</option>`;

    return `<select id="versions">${component.allVersions
      .map(componentOption)
      .join('')}</select>`;
  };

export default componentVersions;
