const { existsSync, readFileSync, readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { parse: parseYaml } = require('yaml');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const testDataRoot = path.join(root, 'tests', 'test-data');
const packageData = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const contextPath = path.join(root, 'tests', 'test-context', 'project-context.yml');

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

requireValue(existsSync(contextPath), '테스트 실행 컨텍스트가 없습니다.');
const context = parseYaml(readFileSync(contextPath, 'utf8'));
requireValue(context?.automationVersion === packageData.version, '컨텍스트와 package.json 버전이 다릅니다.');
for (const relativePath of context?.readOrder ?? []) {
  requireValue(existsSync(path.resolve(root, relativePath)), `컨텍스트 필수 파일이 없습니다: ${relativePath}`);
}
for (const relativePath of Object.values(context?.sources ?? {})) {
  requireValue(typeof relativePath === 'string' && existsSync(path.resolve(root, relativePath)), `컨텍스트 원본 경로가 없습니다: ${relativePath}`);
}

for (const filename of readdirSync(testDataRoot).filter((name) => /\.ya?ml$/i.test(name))) {
  parseYaml(readFileSync(path.join(testDataRoot, filename), 'utf8'));
}

const loginConfig = parseYaml(readFileSync(path.join(testDataRoot, 'login.yml'), 'utf8'));
const localFile = loginConfig?.credentials?.localFile;
requireValue(typeof localFile === 'string' && localFile.trim(), 'login.yml의 localFile 설정이 없습니다.');

const localPath = path.resolve(testDataRoot, localFile);
requireValue(localPath.startsWith(`${testDataRoot}${path.sep}`), '로컬 로그인 파일 경로가 잘못되었습니다.');
requireValue(existsSync(localPath), `로컬 로그인 파일이 없습니다: ${localFile}`);
const login = parseYaml(readFileSync(localPath, 'utf8'));
requireValue(login?.loginUrl?.trim(), '로컬 로그인 URL이 없습니다.');
requireValue(login?.username?.trim(), '로컬 로그인 계정이 없습니다.');
requireValue(login?.password, '로컬 로그인 비밀번호가 없습니다.');
requireValue(/^https?:\/\//i.test(login.loginUrl), '로그인 URL 형식이 올바르지 않습니다.');
requireValue(existsSync(chromium.executablePath()), 'Playwright Chromium이 설치되지 않았습니다.');

const sync = spawnSync(process.execPath, [path.join(root, 'scripts', 'check-tc-sync.cjs')], {
  cwd: root,
  encoding: 'utf8'
});
if (sync.status !== 0) throw new Error(sync.stderr || sync.stdout || 'TC 동기화 검사 실패');
process.stdout.write(sync.stdout);

const git = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
const commit = git.status === 0 ? git.stdout.trim() : 'unknown';
console.log(`사전점검 완료: automation=${packageData.version} commit=${commit}`);
