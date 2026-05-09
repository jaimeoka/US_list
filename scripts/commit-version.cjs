const fs = require('fs');
const { execFileSync } = require('child_process');

const messagePath = process.argv[2];

if (!messagePath || !fs.existsSync(messagePath)) {
  process.exit(0);
}

const commitMessage = fs.readFileSync(messagePath, 'utf8').trim();
const firstLine = commitMessage.split(/\r?\n/, 1)[0];

if (!firstLine || firstLine.startsWith('Merge ')) {
  process.exit(0);
}

const match = firstLine.match(/^(?<type>[a-z]+)(?<breaking>!)?(?:\([^)]+\))?:\s/);
const isConventional = Boolean(match);
const breaking = Boolean(match?.groups?.breaking) || /BREAKING CHANGE:/i.test(commitMessage);

let releaseType = null;

if (!isConventional) {
  process.exit(0);
}

if (breaking) {
  releaseType = 'major';
} else {
  releaseType = 'patch';
}

if (!releaseType) {
  process.exit(0);
}

execFileSync(
  'npm',
  ['version', releaseType, '--no-git-tag-version', '--no-commit-hooks'],
  {
    stdio: 'inherit',
    cwd: process.cwd(),
  },
);

execFileSync('git', ['add', 'package.json', 'package-lock.json'], {
  stdio: 'inherit',
  cwd: process.cwd(),
});