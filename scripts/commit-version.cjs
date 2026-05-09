const fs = require('fs');
const path = require('path');

const messagePath = process.argv[2];
const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, 'package.json');
const packageLockPath = path.join(repoRoot, 'package-lock.json');

if (!messagePath || !fs.existsSync(messagePath)) {
  process.exit(0);
}

const commitMessage = fs.readFileSync(messagePath, 'utf8').trim();
const firstLine = commitMessage.split(/\r?\n/, 1)[0];

if (!firstLine || firstLine.startsWith('Merge ')) {
  process.exit(0);
}

if (/^chore(?:\([^)]+\))?:\s*(?:bump|release)\b/i.test(firstLine)) {
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

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));

const currentVersionParts = packageJson.version.split('.').map(Number);

if (currentVersionParts.length !== 3 || currentVersionParts.some(Number.isNaN)) {
  process.exit(1);
}

if (releaseType === 'patch') {
  currentVersionParts[2] += 1;
} else if (releaseType === 'major') {
  currentVersionParts[0] += 1;
  currentVersionParts[1] = 0;
  currentVersionParts[2] = 0;
}

const nextVersion = currentVersionParts.join('.');

packageJson.version = nextVersion;
packageLock.version = nextVersion;

if (packageLock.packages && packageLock.packages['']) {
  packageLock.packages[''].version = nextVersion;
}

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);