# Sheet Schema

## Purpose

이 문서는 현재 업로드된 실제 Excel 구조와 프론트 payload 기준을 함께 정리한 문서다.
핵심 원칙은 다음과 같다.

- 사용자 파일은 공통 `user` workbook 하나를 쓴다.
- 언어가 추가될 때마다 `master`, `record` 파일이 2개씩 늘어난다.
- `master`는 원본 단어 소스다.
- `record`는 플레이 기록과 복습 상태 저장용이다.
- 프론트 API DTO와 원본 시트 컬럼은 같지 않을 수 있으며, GAS가 중간 변환을 담당한다.

## Workbook Layout

### 1. User Workbook

- file: `user`
- sheet: `Users`
- structure:
  - 1행: 한글 표시명
  - 2행: machine key
  - 3행부터: 실제 데이터

Verified machine keys:

- `player_id`
- `display_name`
- `login_id`
- `password_plain_or_hash`
- `is_active`
- `role`
- `created_at`
- `notes`

Current login mapping note:

- GAS 로그인은 `login_id`, `password_plain_or_hash`, `is_active`를 기준으로 본다.
- 응답의 닉네임은 `display_name`을 우선 사용한다.

### 2. Language Master Workbook

Current direction:

- 언어별 `master` workbook 1개
- 언어별 `record` workbook 1개

Current Japanese example:

- file: `japanese_master`
- sheets:
  - `명사`
  - `동사`
  - `い형용사`
  - `な형용사`
  - `부사`
  - `기타`

Important note:

- 시트 구성은 언어마다 달라질 수 있다.
- 따라서 GAS는 특정 품사 이름에 영구적으로 고정되기보다, `word_id` 계열 헤더를 가진 시트를 source sheet로 인식하는 방향이 안전하다.
- 현재 일본어는 위 6개 시트를 모두 읽어서 하나의 source pool로 합친다.

### Master Header Structure

모든 주요 시트 구조:

- 1행: 한글 표시명
- 2행: machine key
- 3행부터: 실제 데이터

Verified Japanese master machine keys:

Common keys:

- `word_id`
- `jp_kanji`
- `jp_furigana`
- `meaning_ko_1`
- `meaning_ko_2`
- `meaning_ko_3`
- `difficulty`
- `is_active`
- `notes`

Optional extra key:

- `jp_furigana_2`

Verified note from uploaded file:

- 현재 업로드본에서는 `명사` 시트에만 `jp_furigana_2`가 있다.
- 나머지 시트는 `jp_furigana_2` 없이도 동작해야 한다.

### Columns Removed By Current Request

아래 컬럼은 현재 방향에서 제거 대상으로 본다.

- `lang`
- `pos`
- `category`
- `subcategory`
- `script_main`
- `romanization`
- `ipa_or_reading`
- `example_foreign`
- `example_ko`
- `image_key`
- `image_url`
- `audio_text`
- `alt_answers`
- `distractor_tags`
- `display_mode`

### Columns Added By Current Request

- `jp_furigana_2`

### Current Content Assumptions

- `jp_kanji`가 일본어 대표 표기다.
- `jp_furigana`는 기본 읽기 표기다.
- `jp_furigana_2`는 보조 읽기가 있을 때만 사용한다.
- 로마자 전용 기능은 현재 범위에서 제외한다.
- 예문 문제는 현재 범위에서 제외한다.
- 이미지 문제는 현재 범위에서 제외한다.
- category / subcategory 기반 출제는 현재 범위에서 제외한다.

## Source Workbook vs Frontend API

프론트는 여전히 아래 DTO 형태를 기대한다.

| API field | Description |
| --- | --- |
| `word_id` | Stable word id |
| `prompt` | UI에 보이는 제시문 |
| `choices` | 객관식 보기 배열 |
| `answer` | 정답 |
| `meaning` | 대표 뜻 |
| `question_type` | `word_to_meaning` or `meaning_to_word` |

즉, GAS는 원본 시트 row를 바로 내려주지 않고, 문제용 DTO로 변환해야 한다.

## Requested Quiz Directions

현재 요청 기준 단어 퀴즈 방향은 아래와 같다.

1. 품사 선택
2. 방식 선택
3. `jp_kanji -> meaning`
4. `jp_furigana -> meaning`
5. `jp_furigana_2 -> meaning` (값이 있을 때만)
6. 일본어 음성 -> meaning
7. `meaning -> jp_kanji`
8. `meaning -> jp_furigana`

Current implementation note:

- 현재 프론트와 GAS 스켈레톤은 우선 문자열 prompt 기반 객관식 DTO를 만든다.
- 음성 문제는 현재 저장 구조/문서 방향에는 반영됐지만, 실제 프론트 문제 생성 로직은 별도 후속 작업이 필요하다.

## Language Record Workbook

Current Japanese example:

- file: `japanese_record`
- sheets:
  - `Guide`
  - `Game_Log`
  - `Answer_Log`
  - `Review_State`
  - `Daily_Stats`
  - `Badges_Master`
  - `Settings`

현재 프론트/GAS 연동 대상은 아래 4개가 핵심이다.

- `Game_Log`
- `Answer_Log`
- `Review_State`
- `Daily_Stats`

### 1. Game_Log

- 1행: 한글 표시명
- 2행: machine key
- 3행부터: 실제 데이터

Verified machine keys:

- `log_id`
- `played_at`
- `player_id`
- `mode_type`
- `quiz_type`
- `total_questions`
- `correct_count`
- `partial_count`
- `wrong_count`
- `max_combo`
- `final_score`
- `hearts_left`
- `total_time_sec`
- `settings_json`

Current request note:

- 파일 자체가 언어별 record 파일이므로 `language_code`는 `Game_Log`에서 제거 방향이 맞다.

### 2. Answer_Log

Verified machine keys:

- `answer_log_id`
- `played_at`
- `player_id`
- `session_log_id`
- `word_id`
- `question_type`
- `shown_prompt`
- `selected_answer`
- `result_grade`
- `numeric_score`
- `response_time_ms`
- `combo_at_time`
- `difficulty_snapshot`
- `note`

### 3. Review_State

Verified machine keys:

- `player_id`
- `word_id`
- `status`
- `wrong_count_total`
- `partial_count_total`
- `correct_count_total`
- `wrong_streak`
- `correct_streak`
- `ease_score`
- `priority_score`
- `last_seen_at`
- `next_due_at`
- `manual_flag`
- `mastered_at`
- `memo`

### 4. Daily_Stats

Verified machine keys:

- `stat_date`
- `player_id`
- `solved_count`
- `correct_count`
- `study_minutes`
- `sessions_count`
- `best_score`
- `earned_badges`
- `streak_days`
- `notes`

## Mapping From Frontend Save Payload

Frontend payload:

```ts
type SaveSessionRequest = {
  playerId: string;
  languageCode: string;
  score: number;
  heartsLeft: number;
  totalQuestions: number;
  correctAnswers: number;
  answerLog: AnswerLog[];
  reviewState: ReviewStateRecord[];
};
```

Current GAS mapping direction against uploaded workbook:

### Game_Log row

| Frontend field | Record key | Notes |
| --- | --- | --- |
| GAS generated | `log_id` | session id |
| save time | `played_at` | timestamp |
| `playerId` | `player_id` | required |
| `modeType` | `mode_type` | `standard` or `practice` |
| `quizType` | `quiz_type` | `word_to_meaning`, `meaning_to_word`, or `mixed` |
| `totalQuestions` | `total_questions` | answered count |
| `correctAnswers` | `correct_count` | correct count |
| fixed/default | `partial_count` | currently `0` |
| derived | `wrong_count` | total - correct |
| derived | `max_combo` | max combo in answerLog |
| `score` | `final_score` | final score |
| `heartsLeft` | `hearts_left` | remaining hearts |
| `totalTimeSec` | `total_time_sec` | current 프론트 payload에서 직접 전달 |
| derived | `settings_json` | contains language metadata |

### Answer_Log rows

One `answerLog` item becomes one row.

| Frontend field | Record key | Notes |
| --- | --- | --- |
| GAS generated | `answer_log_id` | session based id |
| save time | `played_at` | timestamp |
| `playerId` | `player_id` | required |
| GAS generated | `session_log_id` | Game_Log id |
| `answerLog[].wordId` | `word_id` | required |
| `answerLog[].questionType` | `question_type` | current 프론트 payload에서 직접 전달 |
| `answerLog[].shownPrompt` | `shown_prompt` | 현재 화면에 실제로 보여준 문제 문구 |
| `answerLog[].selectedAnswer` | `selected_answer` | learner answer |
| derived | `result_grade` | `correct` or `wrong` |
| `answerLog[].earnedScore` | `numeric_score` | numeric score |
| `answerLog[].responseTimeMs` | `response_time_ms` | current 프론트 payload에서 직접 전달 |
| `answerLog[].comboAfterAnswer` | `combo_at_time` | combo snapshot |
| `answerLog[].difficultySnapshot` | `difficulty_snapshot` | current word difficulty snapshot |
| fixed/default | `note` | blank |

### Review_State upsert rows

| Frontend field | Record key | Notes |
| --- | --- | --- |
| `playerId` | `player_id` | upsert key |
| `reviewState[].wordId` | `word_id` | upsert key |
| mapped stage | `status` | from review stage |
| derived | `wrong_count_total` | accumulated |
| fixed/default | `partial_count_total` | currently unchanged |
| derived | `correct_count_total` | accumulated |
| derived | `wrong_streak` | accumulated |
| derived | `correct_streak` | accumulated |
| existing/default | `ease_score` | currently preserved |
| `reviewState[].priorityScore` | `priority_score` | required |
| save time | `last_seen_at` | timestamp |
| existing/default | `next_due_at` | preserved |
| existing/default | `manual_flag` | preserved |
| existing/default | `mastered_at` | preserved |
| existing/default | `memo` | preserved |

### Daily_Stats aggregate rows

| Payload source | Record key | Notes |
| --- | --- | --- |
| save date | `stat_date` | `Asia/Seoul` 기준 |
| `playerId` | `player_id` | aggregate key |
| `totalQuestions` | `solved_count` | 누적 |
| `correctAnswers` | `correct_count` | 누적 |
| derived | `study_minutes` | `Math.ceil(totalTimeSec / 60)` 누적 |
| session count | `sessions_count` | +1 |
| `score` | `best_score` | max |
| existing/default | `earned_badges` | preserved |
| existing/default | `streak_days` | preserved |
| existing/default | `notes` | preserved |

## Operational Rules

### 1. `choices` rule

- master workbook에는 `choices` 컬럼이 없다.
- GAS가 source pool에서 distractor를 골라 `choices: string[]`를 만들어야 한다.
- 현재 구현은 동일 방향 pool에서 4지선다를 만든다.

### 2. `jp_furigana_2` rule

- 값이 있으면 별도 prompt source로 사용한다.
- 값이 없으면 그냥 건너뛴다.

### 3. `Daily_Stats.stat_date` rule

- `Asia/Seoul` 기준 `YYYY-MM-DD`를 사용한다.

### 4. `Game_Log.language_code` rule

- 언어별 record workbook 구조에서는 `Game_Log`에 `language_code`를 두지 않는다.
- 필요 메타는 `settings_json`에 보조 정보로 넣을 수 있다.

### 5. `totalQuestions` rule

- `totalQuestions`는 실제 답변 수여야 한다.
- `answerLog.length`와 다르면 저장을 실패 처리하는 것이 맞다.

## Current Known Gaps

- 실제 프론트 question generation은 아직 source workbook 변경 방향을 완전히 반영하지 않았다.
- audio quiz는 요청 방향에 포함돼 있지만 현재 프론트와 GAS 스켈레톤에는 아직 구현되지 않았다.
- `study_minutes`는 현재 `totalTimeSec` 기준으로 계산하고, `difficulty_snapshot`은 현재 word difficulty를 snapshot으로 저장한다.
- `difficulty_snapshot` 외의 고급 난이도 이력이나 `study_minutes` 세부 정책은 이후 더 정교화할 수 있다.
- 실제 운영에서는 이후 프론트 payload 확장 또는 GAS 보강이 더 필요하다.

## Local Snapshot vs Record Sheet

복습센터와 기본 통계 화면은 현재 `japanese_record` 시트를 직접 다시 읽지 않는다.
플레이 종료 시점의 프론트 계산 결과를 localStorage snapshot으로 저장하고, 화면은 그 snapshot을 우선 보여준다.

관련 코드 기준:

- `src/pages/PlayPage.tsx`
- `src/services/sessionRecovery.ts`
- `src/pages/ReviewPage.tsx`
- `src/pages/StatsPage.tsx`

### 1. Review snapshot

로컬 복습 snapshot 타입:

```ts
type ReviewSnapshot = {
  reviewState: ReviewStateRecord[];
  savedAt: string;
};

type ReviewStateRecord = {
  wordId: string;
  priorityScore: number;
  reviewStage: "new" | "learning" | "review";
  lastResult: "correct" | "wrong";
};
```

실제 `Review_State` 시트는 아래 성격이 더 강하다.

- 누적 상태 저장소
- streak / count / due date / memo 중심
- machine key는 `status`, `wrong_count_total`, `correct_count_total`, `priority_score` 등

즉, 로컬 snapshot과 실제 시트의 차이는 다음과 같다.

| Local snapshot field | Record key | Relation |
| --- | --- | --- |
| `wordId` | `word_id` | 직접 대응 |
| `priorityScore` | `priority_score` | 직접 대응 |
| `reviewStage` | `status` | 이름만 다르고 같은 단계 의미 |
| `lastResult` | 없음 | UI 미리보기용 로컬 필드 |
| `savedAt` | 없음 | 로컬 저장 시각 |

운영 원칙:

- `Review_State`의 authoritative field는 시트의 `status`, count 계열, due date 계열이다.
- `lastResult`는 결과 화면/복습센터 표시용 로컬 보조 정보로만 본다.
- 따라서 현재 복습센터는 "최근 세션 기준 미리보기" 성격이고, 시트의 모든 누적 필드를 그대로 복원한 화면은 아니다.

### 2. Daily stats snapshot

로컬 통계 snapshot 타입:

```ts
type DailyStatsSnapshot = {
  sessionCount: number;
  practiceSessionCount: number;
  totalScore: number;
  bestScore: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  lastPlayedAt: string;
};
```

실제 `Daily_Stats` 시트는 날짜별 누적 저장소다.

즉, 로컬 snapshot과 실제 시트의 차이는 다음과 같다.

| Local snapshot field | Record key | Relation |
| --- | --- | --- |
| `sessionCount` | `sessions_count` | 직접 대응에 가까움 |
| `totalQuestions` | `solved_count` | 직접 대응에 가까움 |
| `correctAnswers` | `correct_count` | 직접 대응에 가까움 |
| `bestScore` | `best_score` | 직접 대응 |
| `practiceSessionCount` | 없음 | UI 집계용 로컬 필드 |
| `totalScore` | 없음 | UI 집계용 로컬 필드 |
| `averageAccuracy` | 없음 | `correctAnswers / totalQuestions` 로컬 계산값 |
| `lastPlayedAt` | 없음 | 로컬 최근 플레이 시각 |

운영 원칙:

- `Daily_Stats`는 날짜별 저장용 record다.
- `StatsPage`는 현재 "최근 로컬 누적 snapshot"을 보여주는 화면이다.
- `practiceSessionCount`, `totalScore`, `averageAccuracy`, `lastPlayedAt`는 현재 시트에 1:1로 저장되지 않는 UI 보조 지표다.
- 실제 시트 값과 화면 값을 완전히 같게 맞추려면 이후 별도 조회 API 또는 snapshot 재구성 규칙이 더 필요하다.

## Recommended Next Alignment

- `Code.gs`가 현재 uploaded workbook key row(2행)를 기준으로 읽고 쓰게 유지한다.
- 프론트 question generation이 다중 시트 source 구조와 품사/방식 선택을 반영하도록 후속 보강한다.
- 실제 업로드 workbook이 바뀌면 이 문서도 다시 대조한다.
