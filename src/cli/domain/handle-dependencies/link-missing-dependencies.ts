import path from 'node:path';
import fs from 'fs-extra';
import strings from '../../../resources/index';
import stripVersion from '../../../utils/strip-version';
import type { Logger } from '../../logger';
import getMissingDependencies from './get-missing-dependencies';

export default async function linkMissingDependencies(options: {
  componentPath: string;
  dependencies: Record<string, string>;
  logger: Logger;
}): Promise<void> {
  const { componentPath, dependencies, logger } = options;

  const missingDependencies = getMissingDependencies(dependencies);

  if (!missingDependencies.length) {
    return;
  }

  logger.warn(
    strings.messages.cli.LINKING_DEPENDENCIES(missingDependencies.join(', ')),
    true
  );

  const symLinkType = 'dir';

  for (const dependency of missingDependencies) {
    const moduleName = stripVersion(dependency);
    const pathToComponentModule = path.resolve(
      componentPath,
      'node_modules',
      moduleName
    );
    const pathToModule = path.resolve('.', 'node_modules', moduleName);
    try {
      await fs.ensureSymlink(pathToComponentModule, pathToModule, symLinkType);
    } catch (err) {
      logger.err(
        strings.errors.cli.DEPENDENCY_LINK_FAIL(moduleName, String(err))
      );
      throw strings.errors.cli.DEPENDENCIES_LINK_FAIL;
    }
  }
}
