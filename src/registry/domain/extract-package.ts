import path from 'node:path';
import { promisify } from 'node:util';
import targz from 'targz';

import type { Component } from '../../types';
import getPackageJsonFromTempDir from './get-package-json-from-temp-dir';

export default async function extractPackage(
  files:
    | Express.Multer.File[]
    | {
        [fieldname: string]: Express.Multer.File[];
      },
  tarExtractMode: number
): Promise<{
  outputFolder: string;
  packageJson: Component;
}> {
  const packageFile = (files as Express.Multer.File[])[0];
  const packagePath = path.resolve(packageFile.path);
  const packageUntarOutput = path.resolve(
    packageFile.path,
    '..',
    packageFile.filename.replace('.tar.gz', '')
  );
  const packageOutput = path.resolve(packageUntarOutput, '_package');

  const decompress = promisify(targz.decompress);

  await decompress({
    src: packagePath,
    dest: packageUntarOutput,
    tar: {
      dmode: tarExtractMode,
      fmode: tarExtractMode
    }
  });

  const packageJson = await getPackageJsonFromTempDir(packageOutput);

  return {
    outputFolder: packageOutput,
    packageJson
  };
}
