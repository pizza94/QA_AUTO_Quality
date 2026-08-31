# QA_AUTO_퀄리티

Playwright 기반 웹 UI QA 자동화 프로젝트입니다.

QualityStream의 TC를 `화면 진입 → 값 입력 → 실행 → 결과 검증 → 다음 단계` 순서로 진행하는
단방향 시나리오로 자동화하며, 최종적으로 실제 브라우저 UI에서 TC 수행 과정을 시연합니다.

## 시작

```powershell
npm install
npm.cmd exec playwright install chromium
$env:PLAYWRIGHT_BASE_URL = 'https://target.example'
$env:PLAYWRIGHT_LOGIN_URL = 'https://target.example/login'
npm.cmd run test:chromium
```

로그인 정보는 `tests/test-data/login.yml`이 가리키는 Git 제외 파일 `tests/test-data/login.local.yml`에서 읽습니다.
`login.local.example.yml`을 복사해 실제 URL·계정·비밀번호를 입력하며, 실제 값이 든 로컬 YAML은 Git에 커밋하지 않습니다.

## 주요 명령

- `npm.cmd run preflight`: YAML·로컬 접속정보·Chromium·CSV/전체 절차 동기화 사전점검
- `npm.cmd run check:tc-sync`: CSV TC와 전체 절차의 TC 번호 및 순서 일치 검사
- `npm.cmd run test:procedure`: 하나의 브라우저 세션에서 전체 TC를 화면 없이 순차 실행
- `npm test`: 전체 테스트
- `npm run test:chromium`: Chromium 단일 워커 실행
- `npm run test:login`: 환경변수로 제공한 계정의 로그인 TC
- `npm run test:quality`: 로그인 후 QualityStream 진입 TC
- `npm run test:collection`: 증가형 예약명으로 메타데이터 수집 예약 등록 TC
- `npm run test:collection-now`: 최신 증가형 수집 예약 즉시실행 TC
- `npm run test:verification-target`: 미반영 검증대상 상위 1건 업무 반영 TC
- `npm.cmd run test:profiling-settings`: TC-006 기본 실행(화면 없는 헤드리스)
- `npm.cmd run test:headed`: 하나의 브라우저 세션에서 로그인은 한 번만 하고 전체 TC를 절차대로 이어서 실행하는 UI 화면 시연 전용 명령(실제 등록·수집·반영·저장 작업 수행)

새 TC는 개별 spec과 함께 `tests/procedures/full-quality-procedure.spec.ts`에 TC 번호순 `test.step`으로 추가하여 전체 시연에도 항상 포함합니다.
CSV와 전체 절차가 다르면 사전점검 단계에서 실행을 차단합니다. 새 대화나 장기간 중단 후에는 단일 기준 파일 `tests/test-context/project-context.yml`부터 확인합니다. 실행 구조·재시작 절차·원본 경로·불변 규칙·버전 정책을 이 파일에서 통합 관리하며, 사전점검이 파일 경로와 자동화 버전을 확인합니다. 버전 변경 이력은 `CHANGELOG.md`에 남깁니다.

전체 실행마다 자동화 버전과 Git 커밋을 `logs/test-runs/YYYY-MM-DD/*.json`에 로컬 기록하며 Git에는 올리지 않습니다.
- `npm run test:ui`: Playwright UI 모드
- `npm run report`: HTML 결과 보고서

실패 로그는 `logs/test-errors/YYYY-MM-DD/*.log`에 실행일(Asia/Seoul)별로 생성되며,
각 로그에 오류 유형·추정 원인·권장 조치가 자동 기록됩니다.

## 프로젝트 구조

```text
QA_AUTO_Quality/
├─ docs/                         # 프로젝트 인수인계와 날짜별 작업일지
├─ logs/test-errors/YYYY-MM-DD/  # 날짜별 실패 로그(생성 로그는 Git 제외)
├─ reporters/                    # Playwright 커스텀 리포터
├─ tests/
│  ├─ modules/<menu>/            # 메뉴별 Page / Flow / Spec
│  ├─ procedures/                # 단일 세션 전체 TC 실행 절차
│  ├─ test-context/              # 다음 실행에서 가장 먼저 읽는 단일 컨텍스트
│  ├─ test-cases/                # 전체 TC 목록과 실행 이력 CSV
│  ├─ test-data/                 # 테스트 입력값·검증값 YAML과 환경정보 템플릿
│  ├─ support/                   # 공통 데이터 로더와 유틸리티
│  └─ fixtures.ts                # 공통 Playwright fixture
├─ playwright.config.ts
└─ package.json
```

새 메뉴는 `tests/modules/<menu>/`에 `<menu>.page.ts`, `<menu>.flow.ts`,
`<menu>.spec.ts`를 한 묶음으로 추가합니다. TC 정의와 실행 이력은
`tests/test-cases/qa-test-cases.csv`, 비민감 자동화 입력값과 검증값은
`tests/test-data/<menu>.yml`에서 관리합니다.

로그인 정보는 `tests/test-data/login.yml`이 가리키는 Git 제외 로컬 YAML에서 읽습니다.
실제 URL과 자격증명은 해당 로컬 파일에만 보관하고 Git에는 올리지 않습니다.

## 작업 종료 전 저장 체크리스트

TC를 추가하거나 수정한 작업을 마칠 때는 아래 원본을 확인합니다.

1. `tests/test-cases/qa-test-cases.csv`: TC 번호, 메뉴 경로, 사전조건, 절차, 데이터, 기대결과
2. `tests/test-data/<menu>.yml`: 실제 입력값과 기대값
3. `tests/modules/<menu>/`: 메뉴 Page, Flow, 개별 Spec
4. `tests/procedures/full-quality-procedure.spec.ts`: 새 TC의 번호순 `test.step`과 이전 TC 상태 연결
5. `tests/test-context/project-context.yml`: 현재 상태, 다음 작업, 원본 경로 또는 불변 규칙이 달라진 경우
6. `docs/work-log/YYYY-MM-DD.md`: 당일 변경·실행·실패·결정 기록
7. `package.json`과 `CHANGELOG.md`: 자동화 버전을 올릴 정도의 변경인 경우
8. `AGENTS.md`와 README: 반복 적용할 작업 규칙이나 명령·구조가 바뀐 경우에만 수정

저장 전 `npm.cmd run preflight`, `npm.cmd run typecheck`을 통과시킵니다. 전체 기능 검증이 필요하면 `npm.cmd run test:procedure`를 실행하고, 사용자가 요청한 경우에만 `npm.cmd run test:headed`를 실행합니다. 마지막으로 Git 상태를 확인한 뒤 요청 범위만 커밋·푸시합니다.

## 다음 대화에서 사용할 요청문

화면 없이 전체 TC를 재실행하려면 다음 문장을 그대로 입력합니다.

> `tests/test-context/project-context.yml을 기준으로 프로젝트 상태를 복원하고, preflight 후 현재 등록된 전체 TC를 test:procedure로 백그라운드 실행해. 실패하면 날짜별 로그를 분석하고 결과만 알려줘. UI는 띄우지 마.`

화면 시연이 필요할 때만 다음 문장을 사용합니다.

> `tests/test-context/project-context.yml을 먼저 읽고 preflight 후 현재 등록된 전체 TC를 test:headed로 단일 세션에서 시연해.`

새 TC 작업을 이어갈 때는 다음처럼 입력합니다.

> `tests/test-context/project-context.yml과 qa-test-cases.csv를 읽고 현재 다음 TC부터 이어서 작성해. 완료 후 CSV, YAML, 메뉴 모듈, 전체 절차, 컨텍스트와 작업일지를 함께 갱신하고 커밋 전에는 확인받아.`
