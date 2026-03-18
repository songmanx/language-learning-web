# Live Connection Order

이 문서는 실제 Google Sheets + GAS + 프론트를 어떤 순서로 연결하면 가장 덜 막히는지 정리한 문서다.

## 가장 추천하는 진행 순서

1. Google Sheets 3개를 준비한다.
2. 시트 탭 이름과 첫 행 헤더를 문서 기준으로 맞춘다.
3. Apps Script 프로젝트에 [Code.gs](D:/smx_coding_d/learning/language_learning_web/gas/Code.gs), [appsscript.json](D:/smx_coding_d/learning/language_learning_web/gas/appsscript.json)을 반영한다.
4. Script Properties에 `USER_SHEET_ID`, `JA_MASTER_SHEET_ID`, `JA_RECORD_SHEET_ID`를 넣는다.
5. Web App으로 배포한다.
6. 프론트 `.env`에 배포 URL을 넣고 `VITE_GAS_USE_MOCK=false`로 바꾼다.
7. 앱 로그인과 화면 흐름을 확인한다.
8. 마지막으로 smoke test와 실제 시트 row 반영을 확인한다.

## 지금 꼭 필요한 설정

현재 프로젝트 기준으로 바로 필요한 것은 아래다.

- Google Sheets 준비
- Apps Script 코드 반영
- Script Properties 입력
- Web App 배포
- 프론트 `.env` 연결

## 지금은 굳이 안 해도 되는 것

현재 구조에서는 아래를 먼저 붙잡지 않아도 된다.

- 별도 OAuth 화면 설정
- 복잡한 외부 API 발급
- 프론트 서버 쪽 별도 백엔드 구성

이유:

- 현재 프로젝트는 GAS Web App이 Google Sheets를 직접 읽고 저장하는 구조다.

## 단계별 준비물

### 1. Google Sheets 준비

준비물:

- 사용자 시트 1개
- 일본어 master 시트 1개
- 일본어 record 시트 1개

관련 문서:

- [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)

### 2. Apps Script 코드 반영

준비물:

- [Code.gs](D:/smx_coding_d/learning/language_learning_web/gas/Code.gs)
- [appsscript.json](D:/smx_coding_d/learning/language_learning_web/gas/appsscript.json)

결과:

- `login`, `getMeta`, `getWords`, `saveSession` 액션 준비

### 3. Script Properties 입력

넣을 값:

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

관련 문서:

- [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)

### 4. Web App 배포

결과:

- Web App URL 1개 확보

관련 문서:

- [gas-click-by-click-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-click-by-click-guide.md)
- [gas-deploy-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-deploy-checklist.md)

### 5. 프론트 `.env` 연결

넣을 값:

```bash
VITE_GAS_BASE_URL=배포_URL
VITE_GAS_USE_MOCK=false
```

정적 JSON 읽기 가속 모드를 같이 쓸 때는 아래도 추가한다.

```bash
VITE_STATIC_DATA_META_URL=/data/languages.json
VITE_STATIC_DATA_WORDS_BASE_PATH=/data
```

## 가장 빠른 확인 순서

1. 앱 헤더에 `GAS 실연동 모드` 또는 `정적 JSON 읽기 + GAS 저장 모드`가 보이는지 확인
2. 테스트 계정으로 로그인
3. `일본어`가 언어 목록에 보이는지 확인
4. 홈 진입 후 플레이 또는 연습 시작
5. 결과 화면까지 이동
6. `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` row 확인

## CLI로 더 빨리 확인하는 방법

브라우저 전에 API만 먼저 확인하고 싶으면 아래 명령을 실행한다.

```bash
npm run smoke:gas -- --login-id YOUR_LOGIN_ID --password YOUR_PASSWORD
```

이 명령은 현재 `.env`의 `VITE_GAS_BASE_URL`을 기준으로 아래를 순서대로 확인한다.

- `login`
- `getMeta`
- `getWords`
- `saveSession`

관련 문서:

- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)

## 막히면 먼저 볼 것

### 로그인이 안 될 때

- `Users.login_id`
- `Users.password_plain_or_hash`
- `Users.is_active`
- `USER_SHEET_ID`

### 언어 목록이 비어 있을 때

- `JA_MASTER_SHEET_ID`
- 품사 시트 이름
- 품사 시트 2행 machine key
- `is_active` 값

### 저장이 안 될 때

- `JA_RECORD_SHEET_ID`
- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 탭 이름
- 최신 Web App 재배포 여부

## 권장 흐름 한 줄 요약

시트 준비 -> GAS 반영 -> Script Properties -> Web App 배포 -> `.env` 연결 -> smoke test -> 실제 row 확인
