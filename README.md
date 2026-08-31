# QA_AUTO_퀄리티

Playwright 기반 웹 UI QA 자동화 프로젝트입니다.

## 시작

```powershell
npm install
npm.cmd exec playwright install chromium
$env:PLAYWRIGHT_BASE_URL = 'https://target.example'
npm.cmd run test:chromium
```

로그인 정보가 필요한 경우 `PLAYWRIGHT_USERNAME`, `PLAYWRIGHT_PASSWORD` 환경변수를 사용합니다.
실제 값이 들어간 `.env` 파일이나 자격증명은 Git에 커밋하지 않습니다.

## 주요 명령

- `npm test`: 전체 테스트
- `npm run test:chromium`: Chromium 단일 워커 실행
- `npm run test:headed`: 브라우저가 보이는 상태로 실행
- `npm run test:ui`: Playwright UI 모드
- `npm run report`: HTML 결과 보고서

실패 로그는 `logs/test-errors/*.log`에 생성됩니다.
