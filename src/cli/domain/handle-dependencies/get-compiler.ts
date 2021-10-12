import path from 'path';

import cleanRequire from '../../../utils/clean-require';
import { Logger } from '../../logger';
import installCompiler from './install-compiler';

export default function getCompiler(
  options: {
    compilerDep: string;
    componentPath: string;
    logger: Logger;
    pkg: { devDependencies: Dictionary<string> };
  },
  cb: Callback<string, string | number>
): void {
  const { compilerDep, componentPath, logger, pkg } = options;
  const compilerPath = path.join(componentPath, 'node_modules', compilerDep);
  const compiler = cleanRequire(compilerPath, { justTry: true });

  if (compiler) {
    return cb(null, compiler);
  }

  let dependency = compilerDep;
  if (pkg.devDependencies[compilerDep]) {
    dependency += `@${pkg.devDependencies[compilerDep]}`;
  }

  const installOptions = {
    compilerPath,
    componentPath,
    dependency,
    logger
  };

  installCompiler(installOptions, cb);
}
