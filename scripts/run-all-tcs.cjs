const { readdirSync, readFileSync } = require('node:fs');
const { join, relative } = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = join(__dirname, '..');
const modulesRoot = join(projectRoot, 'tests', 'modules');

function findSpecs(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findSpecs(path);
    return entry.isFile() && entry.name.endsWith('.spec.ts') ? [path] : [];
  });
}

const testCases = findSpecs(modulesRoot)
  .map((path) => {
    const match = readFileSync(path, 'utf8').match(/test\(\s*['"`]TC-(\d+)/);
    return match ? { number: Number(match[1]), path } : null;
  })
  .filter(Boolean)
  .sort((left, right) => left.number - right.number);

if (testCases.length === 0) {
  console.error('TC 번호가 포함된 spec 파일을 찾지 못했습니다.');
  process.exit(1);
}

for (const testCase of testCases) {
  const specPath = relative(projectRoot, testCase.path).replaceAll('\\', '/');
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['playwright', 'test', specPath, '--project=chromium', '--workers=1', '--headed'],
    { cwd: projectRoot, env: process.env, stdio: 'inherit' }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
