# QA 자동화 장기 재현 구조

## 목적

새 대화나 장기간 중단 후에도 대화 기억이 아니라 저장소의 문서·데이터·실행 코드만으로 동일한 TC 절차를 재현한다. 대상 제품이나 데이터가 변경되면 조용히 다른 동작을 하지 않고 사전점검 또는 검증 단계에서 차이를 드러낸다.

## 기준 파일

- `AGENTS.md`: 작업 방식, 메뉴 탐색, 데이터 보안, 커밋 규칙
- `docs/CODEX_CONTEXT.md`: 현재 상태, 결정사항, 다음 작업과 장애 요인
- `tests/test-cases/qa-test-cases.csv`: TC 순서, 메뉴 경로, 사전조건, 절차, 기대결과
- `tests/test-data/*.yml`: 입력값과 기대값
- `tests/procedures/full-quality-procedure.spec.ts`: 단일 세션 전체 실행 절차
- `docs/work-log/YYYY-MM-DD.md`: 날짜별 변경 및 검증 기록
- `CHANGELOG.md`: 자동화 버전별 주요 변경사항

## 실행 흐름

1. `npm.cmd run preflight`가 YAML, 로컬 접속정보, Chromium, TC 동기화를 검사한다.
2. `npm.cmd run test:procedure`는 화면 없이 단일 세션 전체 TC를 실행한다.
3. `npm.cmd run test:headed`는 명시적으로 요청한 경우에만 같은 전체 절차를 화면에 표시한다.
4. 실행 결과의 자동화 버전, Git 커밋, 상태는 `logs/test-runs/YYYY-MM-DD/*.json`에 로컬 기록된다.
5. 실패 세부정보와 원인 분석은 `logs/test-errors/YYYY-MM-DD/*.log`에 기록된다.

## TC 추가 규칙

새 TC는 CSV, 메뉴별 개별 spec, 테스트 데이터 YAML, 전체 절차의 TC 번호순 `test.step`을 함께 추가한다. CSV와 전체 절차의 TC 구성이나 순서가 다르면 사전점검이 실패한다. 전체 절차에서는 TC-001의 로그인부터 하나의 브라우저 세션을 이어가며 이전 TC를 다시 수행하지 않는다.

## 버전 관리

자동화 버전은 `package.json`의 SemVer를 사용한다.

- PATCH: 선택자 수정, 대기조건 수정처럼 TC 의미가 바뀌지 않는 변경
- MINOR: 새 TC, 새 메뉴, 새 검사 기능 추가
- MAJOR: 전체 절차나 데이터 구조가 호환되지 않게 변경

Git 커밋이 모든 변경의 원본 이력이며, 검증 완료된 배포 기준점에는 `v0.2.0` 같은 Git 태그를 사용한다. 문서 복사본을 버전별로 늘리지 않고 `CHANGELOG.md`와 Git 이력으로 추적한다.

## 장기 재실행 체크

한두 달 뒤에는 `git pull`, `npm ci`, `npm.cmd exec playwright install chromium`, `npm.cmd run preflight` 순서로 환경을 복원한다. 이후 헤드리스 전체 절차를 먼저 실행하고, 필요할 때만 UI 시연을 실행한다.
