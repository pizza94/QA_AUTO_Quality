# Testcases

메뉴별 TC 입력값과 기대값을 `tests/testcases/<menu>.testcase.yml` 한 파일에서 관리합니다.

- 일반 입력값과 기대값은 YAML에 직접 저장합니다.
- 실제 URL, 비밀번호, 토큰, 쿠키, 개인정보는 저장하지 않습니다.
- 자격증명 필드에는 실행 시 사용할 환경변수 이름만 저장합니다.
- Page/Flow/Spec 코드는 `tests/modules/<menu>/`에서 관리합니다.
