# GAS Connection Values Template

실제 연결할 때 필요한 값들과 CLI 기본값을 한곳에 적어두는 템플릿이다.

기계용 기본값 블록:

<!-- machine-defaults:start -->
```text
USER_SHEET_ID=1YxwcHXtrUFStlO_8KBrnHK9BIaSAwo1t-uy_SbQnBuE
JA_MASTER_SHEET_ID=1OMrgGZID4ClV1J6ptoliLh1jRLe1yoNnUMot10Mr02s
JA_RECORD_SHEET_ID=1hhQxfszQD3ZdZnYuoNjWrRMymktaJ0ctgXp54aFIFF0
WEB_APP_URL=https://script.google.com/macros/s/AKfycbxEfSUJcLU-mvGlB6mzMX8G_JDER5kCHMHkwR2v_iY1PtAPt9fiF58IM_kPf-bmcUEGjg/exec
LOGIN_ID=test
PASSWORD=1234
PLAYER_ID=u001
NICKNAME=테스트
LANGUAGE_LABEL=
LANGUAGE_CODE=ja
TOTAL_WORDS=94
QUESTION_COUNT=377
MODE_TYPE=practice
CORRECT_ANSWERS=1
SCORE=10
FIRST_WORD_ID=JA_N_0001
```
<!-- machine-defaults:end -->

이 문서에서 자동으로 읽는 값:

- `smoke:gas`: `login_id`, `password`
- `verify:record`: `Spreadsheet ID`, 기대 `player_id`, `word_id`, `mode_type`, `score`, `language_code`
- `check:live`: 위 두 묶음을 모두 사용

## 1. Spreadsheet IDs

### User Sheet

- 파일 이름: user
- Spreadsheet ID: 1YxwcHXtrUFStlO_8KBrnHK9BIaSAwo1t-uy_SbQnBuE

### JA Master Sheet

- 파일 이름: japanese_master
- Spreadsheet ID: 1OMrgGZID4ClV1J6ptoliLh1jRLe1yoNnUMot10Mr02s

### JA Record Sheet

- 파일 이름: japanese_record
- Spreadsheet ID: 1hhQxfszQD3ZdZnYuoNjWrRMymktaJ0ctgXp54aFIFF0

## 2. Script Properties

```text
USER_SHEET_ID=1YxwcHXtrUFStlO_8KBrnHK9BIaSAwo1t-uy_SbQnBuE
JA_MASTER_SHEET_ID=1OMrgGZID4ClV1J6ptoliLh1jRLe1yoNnUMot10Mr02s
JA_RECORD_SHEET_ID=1hhQxfszQD3ZdZnYuoNjWrRMymktaJ0ctgXp54aFIFF0
```

## 3. Web App Deploy

- Apps Script 프로젝트 이름:language-learning-web
- Web App URL:https://script.google.com/macros/s/AKfycbxEfSUJcLU-mvGlB6mzMX8G_JDER5kCHMHkwR2v_iY1PtAPt9fiF58IM_kPf-bmcUEGjg/exec
- 마지막 배포 설명:llw first deploy

## 4. Frontend `.env`

```bash
VITE_GAS_BASE_URL=https://script.google.com/macros/s/AKfycbxEfSUJcLU-mvGlB6mzMX8G_JDER5kCHMHkwR2v_iY1PtAPt9fiF58IM_kPf-bmcUEGjg/exec
VITE_GAS_USE_MOCK=false
VITE_STATIC_DATA_META_URL=/data/languages.json
VITE_STATIC_DATA_WORDS_BASE_PATH=/data
```

## 5. 테스트 계정 / smoke 기본값

- `login_id`:test
- `password`:1234
- `player_id`:u001
- `nickname`:테스트

## 6. verify/check 기본 기대값

- 기대 `player_id`: `u001`
- 기대 언어: `ja`
- 기대 문제 수: `94` 메타 / `377` 문제 DTO
- 기대 저장 모드: `practice`
- 기대 정답 수: `1`
- 기대 점수: `10`
- 기대 첫 단어 ID: `JA_N_0001`

## 7. 최근 확인 결과 메모

- `npm run smoke:gas -- --login-id test --password 1234`: 성공
- 로그인 성공 여부: 성공 (`player_id=u001`)
- `일본어` 표시 여부: 성공 (`language_code=ja`, `total_words=94`)
- 플레이 시작 여부: API smoke 기준 `getWords 377개`, `saveSession saved:true` 확인
- `Game_Log` 저장 여부: 성공
- `Answer_Log` 저장 여부: 성공
- `Review_State` 저장 여부: 성공
- `Daily_Stats` 저장 여부: 성공

## 8. 막혔을 때 적어둘 것

- 화면 오류 문구:
- Apps Script 로그 메시지:
- 막힌 단계:
