# GAS Click-by-Click Guide

이 문서는 시트 준비가 끝난 뒤,
Apps Script에서 실제 연결 직전 설정을 클릭 순서대로 진행하는 안내서다.

## 시작 전에 준비할 것

이미 아래가 준비되어 있어야 한다.

- `user`
- `japanese_master`
- `japanese_record`
- 각 시트의 탭 이름과 첫 행 헤더

아직 준비가 안 됐다면 먼저 아래 문서를 본다.

- [google-sheets-setup-guide.md](/D:/smx_coding_d/language_learning_web/docs/google-sheets-setup-guide.md)

## 1. Apps Script 프로젝트 열기

1. 구글 브라우저에서 [script.google.com](https://script.google.com)으로 들어간다.
2. `새 프로젝트`를 누른다.
3. 프로젝트 이름을 적당히 바꾼다.
   - 예: `language-learning-web`

## 2. `Code.gs` 붙여넣기

1. 왼쪽 파일 목록에서 기본 `Code.gs`를 연다.
2. 안에 있는 내용을 모두 지운다.
3. 아래 파일 내용을 그대로 붙여넣는다.
   - [Code.gs](/D:/smx_coding_d/language_learning_web/gas/Code.gs)
4. 저장 버튼을 누른다.

## 3. `appsscript.json` 맞추기

1. 왼쪽 톱니바퀴 또는 `프로젝트 설정`으로 들어간다.
2. `앱스크립트 매니페스트 파일 보기`를 켠다.
3. 파일 목록에서 `appsscript.json`을 연다.
4. 아래 파일 내용과 맞춘다.
   - [appsscript.json](/D:/smx_coding_d/language_learning_web/gas/appsscript.json)
5. 저장 버튼을 누른다.

## 4. 스프레드시트 ID 3개 복사하기

아래 3개 시트를 각각 열고 주소창에서 ID를 복사한다.

- `lang_user_sheet`
- `lang_ja_master_sheet`
- `lang_ja_record_sheet`

복사 위치:

- 주소에서 `/d/` 다음부터 `/edit` 앞까지

## 5. Script Properties 넣기

1. Apps Script 상단 메뉴에서 `프로젝트 설정`으로 들어간다.
2. `스크립트 속성` 또는 `Script properties` 영역을 찾는다.
3. 아래 키 3개를 추가한다.

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

4. 각 값에는 아까 복사한 시트 ID를 넣는다.
5. 저장한다.

넣는 값 예시:

- `USER_SHEET_ID` -> `lang_user_sheet`의 ID
- `JA_MASTER_SHEET_ID` -> `lang_ja_master_sheet`의 ID
- `JA_RECORD_SHEET_ID` -> `lang_ja_record_sheet`의 ID

## 6. Web App으로 배포하기

1. 오른쪽 위 `배포` 버튼을 누른다.
2. `새 배포`를 누른다.
3. 배포 유형에서 `웹 앱`을 선택한다.
4. 설명은 짧게 적는다.
   - 예: `first deploy`
5. 실행 사용자는 본인 계정으로 둔다.
6. 접근 권한은 테스트 가능한 범위로 설정한다.
7. `배포`를 누른다.
8. 처음이면 구글 권한 허용 화면이 뜰 수 있다.
9. 배포가 끝나면 Web App URL을 복사한다.

## 7. 프론트 `.env` 연결하기

프로젝트 루트의 `.env`에 아래 값을 넣는다.

```bash
VITE_GAS_BASE_URL=복사한_Web_App_URL
VITE_GAS_USE_MOCK=false
```

## 8. 앱에서 바로 확인하기

1. 프론트 앱을 실행한다.
2. 상단 헤더에 `GAS 실연동 모드`가 보이는지 확인한다.
3. 테스트 계정으로 로그인한다.
4. `일본어`가 보이는지 확인한다.
5. 플레이 1회 후 결과 화면까지 이동한다.

## 9. 시트에서 바로 확인하기

아래 탭에 저장이 들어갔는지 본다.

- `Game_Log`
- `Answer_Log`
- `Review_State`
- `Daily_Stats`

## 10. 자주 막히는 부분

### 로그인 실패

먼저 확인:

- `Users.login_id`
- `Users.password`
- `Users.active`
- `USER_SHEET_ID`

### 단어가 안 보임

먼저 확인:

- `JA_MASTER_SHEET_ID`
- `Words` 탭 이름
- `choices` 값 형식

### 결과는 뜨는데 저장이 안 됨

먼저 확인:

- `JA_RECORD_SHEET_ID`
- 기록 탭 4개 이름
- Web App을 최신 버전으로 다시 배포했는지

## 11. 이 다음에 볼 문서

- 빠른 체크만 다시 보고 싶으면:
  - [gas-5minute-checklist.md](/D:/smx_coding_d/language_learning_web/docs/gas-5minute-checklist.md)
- 저장 결과를 자세히 확인하고 싶으면:
  - [real-connection-smoke-test.md](/D:/smx_coding_d/language_learning_web/docs/real-connection-smoke-test.md)
