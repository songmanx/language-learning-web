# Live Connection Order

이 문서는 실제 Google Sheets, GAS Web App, 프론트 연결을 어떤 순서로 진행하면 덜 막히는지 빠르게 정리한 안내서다.

## 가장 추천하는 시작 순서

1. Google Sheets 3개를 준비한다.
2. 탭 이름과 헤더 구조를 문서 기준으로 맞춘다.
3. Apps Script에 [Code.gs](D:/smx_coding_d/learning/language_learning_web/gas/Code.gs), [appsscript.json](D:/smx_coding_d/learning/language_learning_web/gas/appsscript.json)을 반영한다.
4. Script Properties에 `USER_SHEET_ID`, `JA_MASTER_SHEET_ID`, `JA_RECORD_SHEET_ID`를 넣는다.
5. Web App으로 배포한다.
6. 프론트 `.env`에 배포 URL을 넣고 `VITE_GAS_USE_MOCK=false`로 바꾼다.
7. 앱 로그인, 언어 목록, 플레이, 결과 화면 흐름을 확인한다.
8. 마지막으로 `smoke:gas`, `verify:record`, `check:live`와 실제 시트 row 반영을 확인한다.

## 지금 바로 보면 좋은 문서 순서

- 가장 빠른 진입: [gas-docs-start-here.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-docs-start-here.md)
- 5분 체크 순서: [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)
- 운영 중 빠른 확인: [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)

## 지금 기준으로 꼭 맞아야 하는 것

현재 프로젝트 기준으로 아래만 먼저 맞으면 된다.

- Google Sheets 준비
- 탭 이름과 헤더 구조 정렬
- Apps Script 코드 반영
- Script Properties 입력
- Web App 배포
- 프론트 `.env` 연결

굳이 지금 먼저 할 필요가 없는 것:

- 별도 OAuth 화면 구성
- 별도 백엔드 서버 추가
- 복잡한 외부 API 발급 흐름

현재 구조는 GAS Web App이 Google Sheets를 직접 읽고 저장하는 방식이기 때문이다.

## 단계별 준비 메모

### 1. Google Sheets 준비

준비물:

- 사용자 시트 1개
- 일본어 master 시트 1개
- 일본어 record 시트 1개

관련 문서:

- [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)

### 2. 탭 이름과 헤더 구조 정렬

현재 기준은 아래다.

- source 시트는 탭 이름이 실제 GAS 설정과 맞아야 한다.
- 1행은 표시명이다.
- 2행은 machine key다.
- 3행부터 실제 데이터가 들어간다.

`Words` 단일 탭 전제 문서는 더 이상 기준이 아니다.

### 3. Apps Script 코드 반영

준비물:

- [Code.gs](D:/smx_coding_d/learning/language_learning_web/gas/Code.gs)
- [appsscript.json](D:/smx_coding_d/learning/language_learning_web/gas/appsscript.json)

결과:

- `login`
- `getMeta`
- `getWords`
- `saveSession`

4개 action이 Web App에서 준비된다.

### 4. Script Properties 입력

넣을 값:

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

관련 문서:

- [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)

### 5. Web App 배포

결과:

- Web App URL 1개 확보

관련 문서:

- [gas-click-by-click-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-click-by-click-guide.md)
- [gas-deploy-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-deploy-checklist.md)

### 6. 프론트 `.env` 연결

넣을 값:

```bash
VITE_GAS_BASE_URL=배포_URL
VITE_GAS_USE_MOCK=false
```

정적 JSON 읽기 모드도 함께 둘 때는 아래를 같이 쓴다.

```bash
VITE_STATIC_DATA_META_URL=/data/languages.json
VITE_STATIC_DATA_WORDS_BASE_PATH=/data
```

## 가장 빠른 확인 순서

1. 헤더에 `GAS 실연동 모드` 또는 `정적 JSON 읽기 + GAS 저장 모드`가 보이는지 확인한다.
2. 테스트 계정으로 로그인한다.
3. `일본어`가 언어 목록에 보이는지 확인한다.
4. 플레이 또는 연습을 1회 진행한다.
5. 결과 화면까지 이동한다.
6. `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` row를 확인한다.

## CLI로 먼저 확인하는 방법

브라우저 진입 전에 API만 먼저 확인하고 싶으면 아래 순서가 가장 짧다.

```bash
npm run smoke:gas
npm run verify:record
npm run check:live
```

현재 세 명령은 템플릿 문서와 환경변수의 기본값을 최대한 자동으로 읽는다.

관련 문서:

- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)
- [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)

## 막히면 먼저 볼 것

### 로그인 안 됨

- `Users.login_id`
- `Users.password_plain_or_hash`
- `Users.is_active`
- `USER_SHEET_ID`

### 언어 목록이나 단어가 비어 있음

- `JA_MASTER_SHEET_ID`
- source 시트 탭 이름
- source 시트 2행 machine key
- `is_active`

### 결과 저장이 안 됨

- `JA_RECORD_SHEET_ID`
- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 탭 이름
- 최신 Web App 버전으로 다시 배포했는지

## 권장 순서 한 줄 요약

시트 준비 -> 탭/헤더 구조 정렬 -> GAS 반영 -> Script Properties -> Web App 배포 -> `.env` 연결 -> smoke/verify/check -> 실제 row 확인
