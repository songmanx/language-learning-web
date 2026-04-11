# Real Connection Smoke Test

이 문서는 실제 GAS Web App과 Google Sheets를 연결한 뒤,
짧게 정상 동작만 확인하는 순서를 정리한 문서다.

현재 가장 짧은 추천 순서:

1. [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)로 시트/배포 준비 점검
2. `npm run smoke:gas`
3. `npm run verify:record`
4. 한 번에 돌릴 때만 `npm run check:live`

## 시작 전에

프론트 `.env`에 아래 값이 들어 있어야 한다.

```bash
VITE_GAS_BASE_URL=실제_GAS_배포_URL
VITE_GAS_USE_MOCK=false
```

그리고 앱 상단 헤더에 `GAS 실연동 모드`가 보여야 한다.

빠르게 API만 먼저 확인하고 싶다면 아래 명령도 사용할 수 있다.

```bash
npm run smoke:gas -- --login-id YOUR_LOGIN_ID --password YOUR_PASSWORD
```

현재 프로젝트 기본값이 준비되어 있으면 아래처럼 더 짧게 실행해도 된다.

```bash
npm run smoke:gas
```

이 명령은 현재 `.env`의 `VITE_GAS_BASE_URL`을 읽어 `login -> getMeta -> getWords -> saveSession`를 순서대로 확인한다.

record 시트 4개 탭을 CLI로 바로 확인하고 싶다면 아래 명령도 쓸 수 있다.

```bash
npm run verify:record -- --credentials path\to\service-account.json --spreadsheet-id YOUR_JA_RECORD_SHEET_ID
```

프로젝트 루트 service account JSON과 템플릿 문서 값이 맞춰져 있으면 아래 기본 명령만으로도 된다.

```bash
npm run verify:record
```

기본 기대값은 현재 smoke 기준으로 `u001`, `JA_N_0001`, `practice`, `10`, `ja`다.

중요:

- 이 검증은 `japanese_record` 시트를 서비스 계정 이메일과도 공유해야 한다.
- `japanese_master`만 공유되어 있고 `japanese_record`가 공유되지 않으면 `The caller does not have permission` 오류가 난다.

두 단계를 한 번에 돌리고 싶다면 아래 통합 명령을 쓴다.

```bash
npm run check:live -- --login-id YOUR_LOGIN_ID --password YOUR_PASSWORD --credentials path\to\service-account.json --spreadsheet-id YOUR_JA_RECORD_SHEET_ID
```

이 명령은 `smoke:gas` 실행 후 바로 `verify:record`까지 이어서 실행한다.

현재 통합 명령은 아래 기본값도 자동으로 읽는다.

- `docs/gas-connection-values-template.md`의 `login_id`, `password`, `JA Record Sheet Spreadsheet ID`
- `docs/gas-connection-values-template.md`의 기대 `player_id`, `word_id`, `mode_type`, `score`, `language_code`
- 환경변수 `GOOGLE_SERVICE_ACCOUNT_PATH`

즉, 서비스 계정 JSON 경로만 환경변수로 잡아 두면 아래처럼 더 짧게 실행할 수 있다.

PowerShell:

```bash
$env:GOOGLE_SERVICE_ACCOUNT_PATH="C:\path\to\service-account.json"
npm run check:live
```

cmd:

```bash
set GOOGLE_SERVICE_ACCOUNT_PATH=C:\path\to\service-account.json
npm run check:live
```

성공하면 검증 결과 JSON이 기본값으로 [live-check-latest.json](D:/smx_coding_d/learning/language_learning_web/docs/live-check-latest.json)에 저장된다.
같이 [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)의 저장 여부 메모도 자동으로 갱신된다.

현재 확인된 예시 결과:

- `login`: `player_id=u001`, `nickname=테스트`
- `getMeta`: `language_code=ja`, `label=일본어`, `total_words=94`
- `getWords`: `377개`, 첫 단어 `JA_N_0001`
- `saveSession`: `saved: true`

## 1. 앱 실행

실행 명령:

```bash
npm run dev
```

확인할 것:

- 앱이 정상적으로 열린다.
- 상단 헤더에 `GAS 실연동 모드`가 보인다.
- 홈 화면의 mock 안내 문구가 더 이상 보이지 않는다.

## 2. 로그인 확인

해야 할 것:

- `Users` 시트에 넣어 둔 테스트 계정으로 로그인한다.

확인할 것:

- 로그인에 성공한다.
- 언어 선택 화면으로 이동한다.

실패하면 먼저 볼 것:

- `Users.login_id`
- `Users.password_plain_or_hash`
- `Users.is_active`
- `USER_SHEET_ID`

## 3. 언어 목록 확인

해야 할 것:

- 언어 선택 화면을 본다.

확인할 것:

- `일본어`가 목록에 보인다.
- 준비된 문제 수가 비정상적으로 비어 있지 않다.

실패하면 먼저 볼 것:

- `JA_MASTER_SHEET_ID`
- source 시트 존재 여부:
  - `명사`
  - `동사`
  - `い형용사`
  - `な형용사`
  - `부사`
  - `기타`
- 각 품사 시트 2행 machine key 아래에 실제 단어 행이 1개 이상 있는지

## 4. 단어 로드 확인

해야 할 것:

- `일본어`를 선택하고 홈으로 이동한다.
- `플레이 시작` 또는 `연습 시작`을 누른다.

확인할 것:

- 문제 prompt가 보인다.
- 보기 4개가 정상적으로 보인다.
- `choices`가 깨지지 않고 배열처럼 내려온다.

실패하면 먼저 볼 것:

- 각 source 시트 2행 machine key 철자
- `word_id`, `jp_kanji`, `jp_furigana`, `meaning_ko_1`, `difficulty`, `is_active` 값 존재 여부
- `jp_furigana_2`는 있어도 되고 비어 있어도 된다.

현재 GAS 기준 주의:

- 현재 구조에서는 master 시트에 `choices` 컬럼이 없다.
- GAS가 원본 단어 풀에서 보기 4개를 자동 생성한다.
- `difficulty`는 문제 DTO와 저장 snapshot 양쪽에 같이 사용된다.

## 5. 플레이 저장 확인

해야 할 것:

- 최소 1문제 이상 답한다.
- 결과 화면까지 이동한다.

확인할 것:

- 결과 화면으로 정상 이동한다.
- 저장 실패 경고가 뜨지 않는다.

실패하면 먼저 볼 것:

- `JA_RECORD_SHEET_ID`
- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 탭 존재 여부
- Apps Script 배포 URL이 현재 `.env` 값과 같은지

현재 GAS 기준 주의:

- `totalQuestions`는 실제 답변 수와 같아야 한다.
- 이 값이 `answerLog.length`와 다르면 `SAVE_FAILED`로 저장이 실패한다.

## 6. 시트 저장 확인

플레이 1회 뒤 아래 탭을 직접 확인한다.

### Game_Log

확인할 것:

- 새 행이 1개 추가되었는지
- `player_id`가 `u001`인지
- `mode_type`이 `practice`인지
- `final_score`가 `10`인지
- `player_id`, `mode_type`, `quiz_type`, `final_score`가 맞는지
- `total_time_sec`가 `0`이 아니라 실제 플레이 시간 비슷한 값으로 들어갔는지
- `log_id`가 `player_id-YYYYMMDDTHHMMSS` 비슷한 형태로 들어갔는지

### Answer_Log

확인할 것:

- 답한 문제 수만큼 행이 들어갔는지
- `word_id`가 `JA_N_0001`인지
- `selected_answer`가 정답과 같고 `numeric_score`가 `10`인지
- `selected_answer`, `result_grade`, `numeric_score` 값이 맞는지
- `question_type`, `shown_prompt`, `response_time_ms`, `difficulty_snapshot`이 비어 있지 않은지
- 같은 플레이의 `session_log_id`가 Game_Log의 `log_id`와 같은지

### Review_State

확인할 것:

- 플레이한 단어 기준으로 최신 상태가 들어갔는지
- `word_id`가 `JA_N_0001`인지
- `status=review` 또는 현재 단계값으로 들어갔는지
- `priority_score`가 채워졌는지
- `wrong_count_total`, `correct_count_total`, `last_seen_at`가 비어 있지 않은지

### Daily_Stats

확인할 것:

- 오늘 날짜 행이 생기거나 갱신되었는지
- `sessions_count`, `solved_count`, `correct_count`가 최소 1 이상인지
- `sessions_count`, `solved_count`, `correct_count`, `best_score`가 누적되는지
- `study_minutes`가 `0`이 아니라 실제 플레이 시간 기준으로 올라가는지
- `stat_date`가 `Asia/Seoul` 기준 날짜로 저장되는지

## 7. 다시 로그인해서 재확인

해야 할 것:

- 앱을 새로고침한다.
- 다시 로그인한다.
- 한 번 더 플레이해 본다.

확인할 것:

- 첫 번째 저장 이후에도 로그인과 로드가 계속 정상인지
- 두 번째 플레이 뒤에도 시트 누적이 정상인지

## 8. 가장 흔한 문제

### 언어가 안 보임

먼저 확인:

- `JA_MASTER_SHEET_ID`
- 품사 시트 이름
- 각 품사 시트 2행 machine key 존재 여부
- `is_active`가 활성 상태인지

### 로그인이 실패함

먼저 확인:

- `Users.is_active` 값
- `login_id`, `password_plain_or_hash` 값
- `USER_SHEET_ID`

### 결과는 뜨는데 시트 저장이 안 됨

먼저 확인:

- `JA_RECORD_SHEET_ID`
- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 탭 이름
- Apps Script 최신 버전으로 Web App을 다시 배포했는지

### 보기 값이 비어 있거나 이상함

먼저 확인:

- master 시트의 `meaning_ko_1`, `jp_kanji`, `jp_furigana` 값이 비어 있지 않은지
- 같은 품사 시트에 실제로 단어 행이 충분한지
- `difficulty`, `is_active` 값이 비정상적으로 비어 있지 않은지

## 9. 알려주면 바로 다음 도움을 줄 수 있는 정보

아래 중 가능한 것만 알려주면 다음 점검을 더 빨리 도와드릴 수 있다.

- 로그인은 되는데 어느 단계에서 막히는지
- 어느 시트는 저장되고 어느 시트는 비는지
- 화면에 나온 오류 문구
- Apps Script 실행 로그에 나온 메시지
