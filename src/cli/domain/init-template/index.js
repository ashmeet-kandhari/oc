'use strict';

const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const installTemplate = require('./install-template');
const npm = require('../../../utils/npm-utils');
const scaffold = require('./scaffold').default;

module.exports = function(options, callback) {
  const { compiler, componentPath } = options;
  const compilerPath = path.join(componentPath, 'node_modules', compiler);
  const npmOptions = { initPath: componentPath, silent: true };

  async.series(
    [
      cb => fs.ensureDir(componentPath, cb),
      // @ts-ignore
      cb => npm.init(npmOptions, cb),
      cb => installTemplate(options, cb),
      // @ts-ignore
      cb => scaffold(_.extend(options, { compilerPath }), cb)
    ],
    callback
  );
};
