# GAS Deploy Checklist

이 문서는 실제 Google Apps Script Web App 배포 직전에 빠르게 확인하는 체크리스트다.

## 1. Google Sheets 준비 체크

- `lang_user_sheet` 스프레드시트를 만들었다.
- `lang_ja_master_sheet` 스프레드시트를 만들었다.
- `lang_ja_record_sheet` 스프레드시트를 만들었다.
- `lang_user_sheet` 안에 `Users` 탭이 있다.
- `lang_ja_master_sheet` 안에 `명사`, `동사`, `い형용사`, `な형용사`, `부사`, `기타` 중 필요한 source 탭이 있다.
- `lang_ja_record_sheet` 안에 `Game_Log` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Answer_Log` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Review_State` 탭이 있다.
- `lang_ja_record_sheet` 안에 `Daily_Stats` 탭이 있다.

## 2. 헤더 구조 체크

- 모든 시트는 가능하면 `1행 표시명 / 2행 machine key / 3행부터 데이터` 구조를 쓴다.
- 현재 GAS는 2행 machine key를 기준으로 컬럼을 읽는다.

### Users

```text
login_id,password_plain_or_hash,player_id,display_name,is_active
```

### 일본어 master source 시트 공통 key 예시

```text
word_id,jp_kanji,jp_furigana,meaning_ko_1,meaning_ko_2,meaning_ko_3,difficulty,is_active,notes
```

### Game_Log

```text
log_id,played_at,player_id,mode_type,quiz_type,total_questions,correct_count,partial_count,wrong_count,max_combo,final_score,hearts_left,total_time_sec,settings_json
```

### Answer_Log

```text
answer_log_id,played_at,player_id,session_log_id,word_id,question_type,shown_prompt,selected_answer,result_grade,numeric_score,response_time_ms,combo_at_time,difficulty_snapshot,note
```

### Review_State

```text
player_id,word_id,status,wrong_count_total,partial_count_total,correct_count_total,wrong_streak,correct_streak,ease_score,priority_score,last_seen_at,next_due_at,manual_flag,mastered_at,memo
```

### Daily_Stats

```text
stat_date,player_id,solved_count,correct_count,study_minutes,sessions_count,best_score,earned_badges,streak_days,notes
```

## 3. 데이터 입력 체크

- `Users` 시트에 테스트용 계정 1개 이상을 넣었다.
- master source 시트에 일본어 단어 데이터 1개 이상을 넣었다.
- `word_id`, `jp_kanji`, 대표 뜻 컬럼이 실제로 들어 있다.
- `is_active`가 비어 있지 않다.

## 4. Apps Script 프로젝트 체크

- [Code.gs](D:/smx_coding_d/learning/language_learning_web/gas/Code.gs) 내용을 Apps Script 프로젝트에 붙여넣었다.
- [appsscript.json](D:/smx_coding_d/learning/language_learning_web/gas/appsscript.json) 기본 설정을 맞췄다.
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
- `Answer_Log.shown_prompt`, `response_time_ms` 값이 들어가는지 확인한다.
- `Game_Log.mode_type`, `quiz_type`, `total_time_sec` 값이 들어가는지 확인한다.

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
