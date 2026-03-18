# Google Sheets Setup Guide

이 문서는 현재 프로젝트를 실제 Google Apps Script + Google Sheets와 연결하기 전에,
초보자도 그대로 따라 할 수 있게 준비 순서를 정리한 가이드다.

## 먼저 알아둘 점

- 지금 단계에서는 `Google Sheets API`를 따로 켤 필요가 없다.
- 이 프로젝트는 보통 Google Apps Script가 같은 구글 계정의 스프레드시트를 직접 읽고 쓰는 방식으로 동작한다.
- 그래서 우선 필요한 것은 다음 네 가지다.
  - 스프레드시트 만들기
  - 시트 탭 만들기
  - 첫 행 헤더 입력하기
  - Apps Script에 스프레드시트 ID 넣기

## 준비물

- 구글 계정 1개
- Google Sheets 사용 가능 상태
- Google Apps Script 프로젝트 1개

## 만들어야 하는 스프레드시트

현재 Phase 3 기준으로 아래 3개를 준비하면 된다.

1. 사용자 스프레드시트
2. 일본어 원본 데이터 스프레드시트
3. 일본어 기록 스프레드시트

권장 파일 이름:

- `lang_user_sheet`
- `lang_ja_master_sheet`
- `lang_ja_record_sheet`

## 1. 사용자 스프레드시트 만들기

스프레드시트 이름:

- `lang_user_sheet`

시트 탭 이름:

- `Users`

첫 행 헤더:

```text
login_id,password,player_id,nickname,active
```

예시 데이터:

```text
demo,1234,player-demo,데모,true
```

주의:

- `active`는 `true` 또는 `false`처럼 고정해서 쓰는 것이 안전하다.
- 현재 로그인 로직은 `login_id`, `password`, `active`를 먼저 확인한다.

## 2. 일본어 원본 데이터 스프레드시트 만들기

스프레드시트 이름:

- `lang_ja_master_sheet`

시트 탭 이름:

- `Words`

첫 행 헤더:

```text
word_id,prompt,choices,answer,meaning,question_type
```

예시 데이터:

```text
ja-1,ねこ,cat|dog|bird|fish,cat,cat,word_to_meaning
ja-2,cat,ねこ|いぬ|とり|さかな,ねこ,cat,meaning_to_word
```

주의:

- `choices`는 현재 `|` 구분 문자열로 넣는 방식을 권장한다.
- GAS가 이 값을 배열로 바꿔서 프론트에 내려주면 된다.
- `question_type`에는 아래 두 값만 사용한다.
  - `word_to_meaning`
  - `meaning_to_word`

## 3. 일본어 기록 스프레드시트 만들기

스프레드시트 이름:

- `lang_ja_record_sheet`

아래 4개 시트 탭을 만든다.

1. `Game_Log`
2. `Answer_Log`
3. `Review_State`
4. `Daily_Stats`

### 3-1. Game_Log

첫 행 헤더:

```text
session_id,player_id,language_code,score,hearts_left,total_questions,correct_answers,saved_at
```

### 3-2. Answer_Log

첫 행 헤더:

```text
session_id,player_id,language_code,word_id,selected_answer,correct,combo_after_answer,earned_score,saved_at
```

### 3-3. Review_State

첫 행 헤더:

```text
player_id,language_code,word_id,priority_score,review_stage,last_result,updated_at
```

### 3-4. Daily_Stats

첫 행 헤더:

```text
player_id,language_code,stat_date,session_count,practice_session_count,total_score,best_score,total_questions,correct_answers,average_accuracy,last_played_at,updated_at
```

## 탭 이름과 헤더를 이렇게 고정하는 이유

현재 프론트와 문서 기준으로 가장 안정적인 조합은 아래와 같다.

- 사용자 탭: `Users`
- 단어 탭: `Words`
- 기록 탭: `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`

헤더 이름이 달라지면 GAS에서 컬럼 매핑을 따로 더 복잡하게 맞춰야 하므로,
처음에는 문서와 같은 이름으로 정확히 만드는 것이 가장 안전하다.

## 4. 스프레드시트 ID 찾는 방법

각 스프레드시트를 열면 주소가 아래처럼 보인다.

```text
https://docs.google.com/spreadsheets/d/여기가-스프레드시트-ID/edit
```

즉,

- `/d/` 다음부터
- `/edit` 앞까지

이 부분이 스프레드시트 ID다.

## 5. Apps Script의 Script Properties에 넣을 값

Apps Script 프로젝트에서 아래 3개 값을 넣어야 한다.

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

각 값의 의미:

- `USER_SHEET_ID`: `lang_user_sheet`의 ID
- `JA_MASTER_SHEET_ID`: `lang_ja_master_sheet`의 ID
- `JA_RECORD_SHEET_ID`: `lang_ja_record_sheet`의 ID

## 6. 지금 당장 필요 없는 것

아래는 지금 바로 하지 않아도 된다.

- Google Sheets API 별도 활성화
- OAuth 클라이언트 설정
- 서비스 계정 발급
- Cloud 프로젝트 복잡한 권한 설정

현재 구조는 Apps Script가 같은 계정 안의 시트를 직접 읽고 쓰는 방식이라,
보통은 위 항목들이 초기 연결 단계에 꼭 필요하지 않다.

## 7. 준비가 끝나면 다음으로 할 일

준비가 끝나면 아래 순서로 진행하면 된다.

1. `gas/Code.gs`를 Apps Script 프로젝트에 붙여넣기
2. Script Properties에 시트 ID 3개 넣기
3. Web App으로 배포하기
4. 배포 URL을 프론트 `.env`의 `VITE_GAS_BASE_URL`에 넣기
5. `VITE_GAS_USE_MOCK=false`로 바꾸기

## 8. 나중에 알려주면 좋은 정보

설정이 끝난 뒤 아래 정보 중 가능한 것만 알려주면 다음 단계를 더 빠르게 도와드릴 수 있다.

- Apps Script 배포 URL
- 실제 시트 탭 이름이 문서와 같은지 여부
- `choices`를 `|` 구분 문자열로 넣었는지 여부
- 테스트용 계정 1개를 만들었는지 여부

## 9. 가장 흔한 실수

- 시트 탭 이름이 문서와 다름
- 첫 행 헤더 철자가 다름
- `active` 값이 비어 있음
- `choices` 형식이 제각각임

## 10. 다음 설정이 필요해지는 시점

아래 단계로 넘어가면 제가 다시 아주 쉽게 설명드리겠다.

- Apps Script Web App 배포
- Script Properties 입력
- 프론트 `.env` 연결

그때는 어디를 눌러야 하는지, 어떤 값을 복사해야 하는지까지
한국어로 천천히 설명드릴 수 있다.
