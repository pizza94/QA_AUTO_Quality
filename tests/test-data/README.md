# Test data

자동화 실행에 사용하는 메뉴별 입력값과 검증값을 `tests/test-data/<menu>.yml`에서 관리합니다.

- TC ID, 절차, 기대결과, 실행 이력은 `tests/test-cases/qa-test-cases.csv`에서 관리합니다.
- 일반 테스트 입력값과 검증값은 YAML에 직접 저장합니다.
- 실제 URL, 비밀번호, 토큰, 쿠키, 개인정보는 저장하지 않습니다.
- 자격증명 필드에는 실행 시 사용할 환경변수 이름만 저장합니다.
