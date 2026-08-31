const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const csv = readFileSync(path.join(root, 'tests/test-cases/qa-test-cases.csv'), 'utf8');
const procedure = readFileSync(
  path.join(root, 'tests/procedures/full-quality-procedure.spec.ts'),
  'utf8'
);

const csvIds = [...csv.matchAll(/^"(TC-\d+)"/gm)].map((match) => match[1]);
const procedureIds = [...procedure.matchAll(/test\.step\(\s*['"`](TC-\d+)\b/g)].map(
  (match) => match[1]
);

function findDuplicates(ids) {
  return ids.filter((id, index) => ids.indexOf(id) !== index);
}

if (!csvIds.length) throw new Error('qa-test-cases.csv에서 TC ID를 찾지 못했습니다.');
if (!procedureIds.length) throw new Error('전체 절차 spec에서 TC test.step을 찾지 못했습니다.');
if (findDuplicates(csvIds).length || findDuplicates(procedureIds).length) {
  throw new Error('TC ID가 중복되었습니다.');
}
if (JSON.stringify(csvIds) !== JSON.stringify(procedureIds)) {
  throw new Error(
    `TC와 전체 절차의 순서 또는 구성이 다릅니다. CSV=${csvIds.join(',')} PROCEDURE=${procedureIds.join(',')}`
  );
}

console.log(`TC 동기화 확인: ${csvIds.join(' > ')}`);
