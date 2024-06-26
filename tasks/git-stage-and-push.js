const changelog = require('./changelog');
const packageJson = require('../package');
const path = require('node:path');
const simpleGit = require('simple-git');

const git = simpleGit(path.join(__dirname, '..'));
const ocVersion = packageJson.version;

git
  .add('.')
  .commit(ocVersion)
  .addAnnotatedTag(`v${ocVersion}`, `Package version upgrade to: ${ocVersion}`)
  .exec(() =>
    changelog().then(() =>
      git
        .add('CHANGELOG.md')
        .commit('changelog')
        .push('origin', 'master', { '--follow-tags': null })
    )
  );
