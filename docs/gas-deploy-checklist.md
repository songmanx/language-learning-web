# GAS Deploy Checklist

이 문서는 실제 Google Apps Script Web App 배포 직전에 빠르게 확인하는 체크리스트다.

## 1. Google Sheets 준비 체크

- `lang_user_sheet` 스프레드시트를 만들었다.
- `lang_ja_master_sheet` 스프레드시트를 만들었다.
- `lang_ja_record_sheet` 스프레드시트를 만들었다.
- `lang_user_sheet` 안에 `Users` 탭이 있다.
- `lang_ja_master_sheet` 안에 `Words` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Game_Log` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Answer_Log` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Review_State` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Daily_Stats` 탭이 있다.

## 2. 첫 행 헤더 체크

### Users

```text
login_id,password,player_id,nickname,active
```

### Words

```text
word_id,prompt,choices,answer,meaning,question_type
```

### Game_Log

```text
session_id,player_id,language_code,score,hearts_left,total_questions,correct_answers,saved_at
```

### Answer_Log

```text
session_id,player_id,language_code,word_id,selected_answer,correct,combo_after_answer,earned_score,saved_at
```

### Review_State

```text
player_id,language_code,word_id,priority_score,review_stage,last_result,updated_at
```

### Daily_Stats

```text
player_id,language_code,stat_date,session_count,practice_session_count,total_score,best_score,total_questions,correct_answers,average_accuracy,last_played_at,updated_at
```

## 3. 데이터 입력 체크

- `Users` 시트에 테스트용 계정 1개 이상을 넣었다.
- `Words` 시트에 일본어 단어 데이터 1개 이상을 넣었다.
- `Words.choices`는 `|` 구분 문자열 또는 올바른 JSON 배열 문자열이다.
- `Words.question_type`는 `word_to_meaning` 또는 `meaning_to_word`만 사용했다.

## 4. Apps Script 프로젝트 체크

- [Code.gs](D:/smx_coding_d/language_learning_web/gas/Code.gs) 내용을 Apps Script 프로젝트에 붙여넣었다.
- [appsscript.json](D:/smx_coding_d/language_learning_web/gas/appsscript.json) 기본 설정을 맞췄다.
- Script Properties 화면을 열 수 있다.

## 5. Script Properties 체크

아래 3개 키를 모두 넣었다.

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

## 6. Web App 배포 체크

- Apps Script에서 `배포` 버튼을 누를 수 있다.
- 배포 유형을 `웹 앱`으로 선택했다.
- 실행 사용자를 본인 계정으로 선택했다.
- 접근 권한을 테스트 가능한 범위로 설정했다.
- 배포 URL을 복사했다.

## 7. 프론트 연결 체크

프론트 `.env`에 아래 값을 넣는다.

```bash
VITE_GAS_BASE_URL=여기에_배포_URL
VITE_GAS_USE_MOCK=false
```

## 8. 첫 연결 테스트 체크

- 로그인 화면에서 테스트 계정으로 로그인한다.
- 언어 목록에 `일본어`가 보이는지 확인한다.
- 문제와 선택지가 정상적으로 보이는지 확인한다.
- 플레이 1회 후 결과 화면이 뜨는지 확인한다.
- `Game_Log`, `Answer_Log`에 새 행이 들어가는지 확인한다.

## 9. 지금 당장 필요 없는 것

아래는 지금 바로 하지 않아도 된다.

- Google Sheets API 별도 활성화
- 서비스 계정 만들기
- OAuth 복잡한 설정

## 10. 막히면 알려주면 좋은 것

아래 중 가능한 것만 알려주면 다음 단계를 더 빨리 도와드릴 수 있다.

- Apps Script 배포 URL
- 어느 단계에서 막혔는지
- 화면 오류 문구
- 시트 탭 이름을 문서와 똑같이 만들었는지 여부
