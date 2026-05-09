const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

function main() {
  let gitDir;

  try {
    gitDir = execFileSync('git', ['rev-parse', '--git-dir'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return;
  }

  const hooksDir = path.resolve(repoRoot, gitDir, 'hooks');
  const hookPath = path.join(hooksDir, 'prepare-commit-msg');
  const legacyHookPath = path.join(hooksDir, 'commit-msg');
  const hookTarget = path.join(repoRoot, 'scripts', 'commit-version.cjs').replace(/\\/g, '/');
  const hookContents = `#!/bin/sh\nnode "${hookTarget}" "$1"\n`;

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(hookPath, hookContents, 'utf8');
  if (fs.existsSync(legacyHookPath)) {
    fs.unlinkSync(legacyHookPath);
  }

  try {
    fs.chmodSync(hookPath, 0o755);
  } catch {
    // Windows Git installations may ignore execute bits.
  }
}

main();