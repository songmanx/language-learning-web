# Google Sheets Setup Guide

이 문서는 현재 프로젝트를 실제 Google Apps Script + Google Sheets와 연결하기 전에,
초보자도 그대로 따라 할 수 있게 준비 순서를 정리한 가이드다.

## 먼저 알아둘 점

- 지금 단계에서는 `Google Sheets API`를 따로 켤 필요가 없다.
- 이 프로젝트는 보통 Google Apps Script가 같은 구글 계정의 스프레드시트를 직접 읽고 쓰는 방식으로 동작한다.
- 그래서 우선 필요한 것은 다음 네 가지다.
  - 스프레드시트 만들기
  - 시트 탭 만들기
  - 헤더 구조 입력하기
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

## 헤더 구조를 먼저 이해하기

현재 GAS는 아래 구조를 가장 안정적으로 읽는다.

- 1행: 한글 표시명
- 2행: machine key
- 3행부터: 실제 데이터

사용자 시트, master 시트, record 시트 모두 이 구조를 권장한다.

## 1. 사용자 스프레드시트 만들기

스프레드시트 이름:

- `lang_user_sheet`

시트 탭 이름:

- `Users`

1행 표시명 예시:

```text
로그인ID,비밀번호,플레이어ID,닉네임,활성여부
```

2행 machine key:

```text
login_id,password_plain_or_hash,player_id,display_name,is_active
```

3행 예시 데이터:

```text
demo,1234,player-demo,데모,true
```

주의:

- 현재 로그인 로직은 `login_id`, `password_plain_or_hash`, `is_active`를 우선 확인한다.
- 예전 문서의 `password`, `active`, `nickname`도 일부 fallback으로 읽지만, 지금은 위 machine key가 기준이다.

## 2. 일본어 원본 데이터 스프레드시트 만들기

스프레드시트 이름:

- `lang_ja_master_sheet`

권장 source 시트 탭:

- `명사`
- `동사`
- `い형용사`
- `な형용사`
- `부사`
- `기타`

중요:

- 현재 GAS는 `Words` 단일 탭을 기준으로 하지 않는다.
- `word_id`, `jp_kanji` machine key가 있는 시트를 source 시트로 인식해 여러 탭을 합쳐 읽는다.

권장 헤더 구조 예시:

```text
1행 표시명: 단어ID,일본어표기,후리가나,뜻1,뜻2,뜻3,난이도,활성여부,메모
2행 key   : word_id,jp_kanji,jp_furigana,meaning_ko_1,meaning_ko_2,meaning_ko_3,difficulty,is_active,notes
3행 데이터: JA_N_0001,猫,ねこ,고양이,,,A,true,
```

추가 메모:

- `jp_furigana_2`는 있을 때만 추가로 둘 수 있다.
- master workbook에는 `choices` 컬럼이 없다.
- 객관식 보기는 GAS가 source pool에서 골라 `choices: string[]`로 만든다.

## 3. 일본어 기록 스프레드시트 만들기

스프레드시트 이름:

- `lang_ja_record_sheet`

아래 4개 시트 탭을 만든다.

1. `Game_Log`
2. `Answer_Log`
3. `Review_State`
4. `Daily_Stats`

### 3-1. Game_Log

```text
1행 표시명: 로그ID,플레이시각,플레이어ID,모드,문제구성,총문항수,정답수,부분정답수,오답수,최대콤보,최종점수,남은하트,총시간(초),설정JSON
2행 key   : log_id,played_at,player_id,mode_type,quiz_type,total_questions,correct_count,partial_count,wrong_count,max_combo,final_score,hearts_left,total_time_sec,settings_json
```

### 3-2. Answer_Log

```text
1행 표시명: 답안로그ID,플레이시각,플레이어ID,세션로그ID,단어ID,문제유형,표시문구,선택답,결과등급,점수,반응시간(ms),당시콤보,난이도스냅샷,메모
2행 key   : answer_log_id,played_at,player_id,session_log_id,word_id,question_type,shown_prompt,selected_answer,result_grade,numeric_score,response_time_ms,combo_at_time,difficulty_snapshot,note
```

### 3-3. Review_State

```text
1행 표시명: 플레이어ID,단어ID,상태,누적오답수,누적부분정답수,누적정답수,오답연속,정답연속,ease점수,우선순위,마지막학습,next_due,수동표시,완료시각,메모
2행 key   : player_id,word_id,status,wrong_count_total,partial_count_total,correct_count_total,wrong_streak,correct_streak,ease_score,priority_score,last_seen_at,next_due_at,manual_flag,mastered_at,memo
```

### 3-4. Daily_Stats

```text
1행 표시명: 기준일,플레이어ID,푼문제수,정답수,학습분,세션수,최고점수,획득배지,연속일수,메모
2행 key   : stat_date,player_id,solved_count,correct_count,study_minutes,sessions_count,best_score,earned_badges,streak_days,notes
```

## 탭 이름과 헤더를 이렇게 고정하는 이유

현재 프론트와 문서 기준으로 가장 안정적인 조합은 아래와 같다.

- 사용자 탭: `Users`
- master 탭: `명사`, `동사`, `い형용사`, `な형용사`, `부사`, `기타`
- 기록 탭: `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`

탭 이름이나 2행 machine key가 달라지면 GAS에서 매핑이 어긋날 수 있으므로,
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
- master 시트를 다중 탭으로 만들었는지 여부
- 2행 machine key를 문서와 같게 넣었는지 여부
- 테스트용 계정 1개를 만들었는지 여부

## 9. 가장 흔한 실수

- 시트 탭 이름이 문서와 다름
- 2행 machine key 철자가 다름
- `is_active` 값이 비어 있음
- master 시트를 `Words` 단일 탭으로 만들어 current GAS와 기준이 어긋남

## 10. 다음 설정이 필요해지는 시점

아래 단계로 넘어가면 제가 다시 아주 쉽게 설명드리겠다.

- Apps Script Web App 배포
- Script Properties 입력
- 프론트 `.env` 연결

그때는 어디를 눌러야 하는지, 어떤 값을 복사해야 하는지까지
한국어로 천천히 설명드릴 수 있다.
