# Test data

메뉴별 테스트 입력값과 기대값을 `test-data/<menu>/` 아래 YAML 파일로 관리합니다.

예시:

```text
test-data/
└─ metadata-collection/
   ├─ tc-001.yml
   └─ tc-002.yml
```

규칙:

- TC 파일에는 화면에 입력할 일반 테스트 데이터와 기대값만 저장합니다.
- 비밀번호, 토큰, 쿠키, 실제 개인정보는 저장하지 않습니다.
- URL과 계정은 `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_USERNAME`, `PLAYWRIGHT_PASSWORD` 환경변수를 사용합니다.
- YAML에는 실제 자격증명 대신 사용할 환경변수 이름만 저장합니다.
- 파일명은 TC ID를 기준으로 작성합니다.
