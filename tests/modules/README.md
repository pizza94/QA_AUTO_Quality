# Menu modules

QualityStream 메뉴별 자동화 코드를 `tests/modules/<menu>/` 단위로 관리합니다.

권장 구성:

```text
tests/modules/<menu>/
├─ <menu>.page.ts     # 화면 요소와 직접 UI 조작
├─ <menu>.flow.ts     # 단방향 업무 흐름
└─ <menu>.spec.ts     # TC와 검증 조건
```

공통 로그인, 데이터 로딩, 로그 수집 등은 `tests/support/`와 `tests/fixtures.ts`에 둡니다.
