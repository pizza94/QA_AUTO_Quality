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

로그인 정보가 필요한 경우 `PLAYWRIGHT_USERNAME`, `PLAYWRIGHT_PASSWORD` 환경변수를 사용합니다.
실제 URL·자격증명이 들어간 `.env` 파일이나 설정은 Git에 커밋하지 않습니다.

## 주요 명령

- `npm test`: 전체 테스트
- `npm run test:chromium`: Chromium 단일 워커 실행
- `npm run test:login`: 환경변수로 제공한 계정의 로그인 TC
- `npm run test:headed`: 브라우저가 보이는 상태로 실행
- `npm run test:ui`: Playwright UI 모드
- `npm run report`: HTML 결과 보고서

실패 로그는 `logs/test-errors/*.log`에 생성됩니다.

## 프로젝트 구조

```text
QA_AUTO_Quality/
├─ docs/                         # 프로젝트 인수인계와 날짜별 작업일지
│  └─ test-cases/                # 전체 TC 목록과 실행 이력 CSV
├─ logs/test-errors/             # 실패 테스트 전용 로그(생성 로그는 Git 제외)
├─ reporters/                    # Playwright 커스텀 리포터
├─ tests/
│  ├─ modules/<menu>/            # 메뉴별 Page / Flow / Spec
│  ├─ test-data/                 # 메뉴별 자동화 입력값·검증값 YAML
│  ├─ support/                   # 공통 데이터 로더와 유틸리티
│  └─ fixtures.ts                # 공통 Playwright fixture
├─ playwright.config.ts
└─ package.json
```

새 메뉴는 `tests/modules/<menu>/`에 `<menu>.page.ts`, `<menu>.flow.ts`,
`<menu>.spec.ts`를 한 묶음으로 추가합니다. TC 정의와 실행 이력은
`docs/test-cases/qa-test-cases.csv`, 비민감 자동화 입력값과 검증값은
`tests/test-data/<menu>.yml`에서 관리합니다.

로그인 TC 실행 전에는 `PLAYWRIGHT_LOGIN_URL`, `PLAYWRIGHT_USERNAME`,
`PLAYWRIGHT_PASSWORD`를 현재 터미널 세션의 환경변수로 설정합니다. 실제 URL과
자격증명은 저장소 파일에 기록하지 않습니다.
