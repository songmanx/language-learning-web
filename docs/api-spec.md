# API Spec

## Purpose

이 문서는 현재 Phase 3 프론트엔드가 기대하는 API 계약을 정리한다.
현재 앱은 mock `apiClient`를 사용할 수 있지만,
아래 형식은 실제 GAS Web App이 따라야 하는 계약 기준이다.

## Runtime Configuration

- Base URL env: `VITE_GAS_BASE_URL`
- Current behavior:
  - 실제 GAS URL이 없으면 앱은 mock client를 사용한다.
  - 프론트는 이미 안정적인 DTO 구조를 기준으로 UI 모델에 매핑한다.

## Transport Contract

- Endpoint shape: 단일 GAS Web App URL
- HTTP method: `POST`
- Content-Type: `text/plain;charset=utf-8`
- Request body rule: 모든 요청은 `action` 필드를 포함한다.
- Response body rule: 모든 응답은 공통 `ApiResponse<T>` envelope를 사용한다.

Current frontend browser note:

- 브라우저 `fetch`는 GAS Web App의 CORS preflight를 피하기 위해 JSON 문자열을 `text/plain;charset=utf-8`로 전송한다.
- GAS는 `e.postData.contents`를 그대로 `JSON.parse`하는 현재 구조를 유지하면 된다.

Current frontend request builder:

```ts
{
  action: string;
  ...payload;
}
```

Current frontend response reader:

```ts
type ApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: ApiErrorCode;
        message: string;
      };
    };
```

## Endpoints

### 1. Login

- Intent: `loginId`와 `password`로 인증
- Frontend method: `apiClient.login(request)`

Request body:

```ts
type LoginRequest = {
  loginId: string;
  password: string;
};
```

Actual POST JSON:

```json
{
  "action": "login",
  "loginId": "YOUR_LOGIN_ID",
  "password": "YOUR_PASSWORD"
}
```

Success DTO:

```ts
type LoginResponseDto = {
  session_token: string;
  player_id: string;
  nickname: string;
};
```

Mapped UI model:

```ts
type LoginSession = {
  token: string;
  playerId: string;
  nickname: string;
};
```

Success envelope example:

```json
{
  "ok": true,
  "data": {
    "session_token": "mock-token-demo",
    "player_id": "player-demo",
    "nickname": "demo"
  }
}
```

### 2. Language Meta

- Intent: 선택 가능한 언어와 단어 수 로드
- Frontend method: `apiClient.getMeta()`

Actual POST JSON:

```json
{
  "action": "getMeta"
}
```

Success DTO:

```ts
type LanguageMetaDto = {
  language_code: string;
  label: string;
  total_words: number;
};
```

Mapped UI model:

```ts
type LanguageMeta = {
  languageCode: string;
  label: string;
  totalWords: number;
};
```

Current Phase 3 note:

- 현재 mock과 GAS 스켈레톤은 `ja`만 반환한다.

Success envelope example:

```json
{
  "ok": true,
  "data": [
    {
      "language_code": "ja",
      "label": "일본어",
      "total_words": 20
    }
  ]
}
```

### 3. Load Words

- Intent: 선택한 언어의 단어 목록 로드
- Frontend method: `apiClient.getWords(languageCode)`

Input:

- `languageCode: string`

Actual POST JSON:

```json
{
  "action": "getWords",
  "languageCode": "ja"
}
```

Success DTO:

```ts
type QuestionType = "word_to_meaning" | "meaning_to_word";

type WordItemDto = {
  word_id: string;
  prompt: string;
  choices: string[];
  answer: string;
  meaning: string;
  question_type?: QuestionType;
};
```

Mapped UI model:

```ts
type WordItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  meaning: string;
  questionType: QuestionType;
};
```

Mapping rules:

- `word_id -> id`
- `question_type -> questionType`
- `question_type`가 없으면 기본값은 `word_to_meaning`

Success envelope example:

```json
{
  "ok": true,
  "data": [
    {
      "word_id": "ja-1",
      "prompt": "ねこ",
      "choices": ["cat", "dog", "bird", "fish"],
      "answer": "cat",
      "meaning": "cat",
      "question_type": "word_to_meaning"
    }
  ]
}
```

Current GAS-aligned rule:

- 현재 GAS 스켈레톤은 master 시트의 원본 row에서 직접 문제 DTO를 만들고, source pool에서 distractor를 골라 `choices: string[]`를 생성한다.
- 즉, 현재 master 시트에는 `choices` 컬럼이 없어도 된다.

Current source workbook direction:

- `master` workbook can contain multiple sheets by part of speech
- Japanese example sheets:
  - `명사`
  - `동사`
  - `い형용사`
  - `な형용사`
  - `부사`
  - `기타`
- GAS should merge those sheets as one source pool before building question DTOs
- source sheet columns and API DTO columns are no longer assumed to be identical

Current requested quiz directions:

- `jp_kanji -> meaning`
- `jp_furigana -> meaning`
- `jp_furigana_2 -> meaning` when present
- meaning -> `jp_kanji`
- meaning -> `jp_furigana`

Current implementation note:

- 위 방향 중 현재 프론트와 GAS 스켈레톤이 실제로 구현한 것은 문자열 prompt 기반 객관식인 `word_to_meaning`, `meaning_to_word` 2종이다.
- audio 문제는 아직 현재 구현 범위에 포함되지 않으며, 후속 Phase 3 작업 또는 다음 Phase 후보로 남아 있다.

### 4. Save Session

- Intent: 완료 또는 중간 종료된 세션을 batch 형태로 저장
- Frontend method: `apiClient.saveSession(payload)`

Request body:

```ts
type AnswerLog = {
  wordId: string;
  questionType: "word_to_meaning" | "meaning_to_word";
  shownPrompt: string;
  difficultySnapshot: string;
  responseTimeMs: number;
  selectedAnswer: string;
  correct: boolean;
  comboAfterAnswer: number;
  earnedScore: number;
};

type ReviewStateRecord = {
  wordId: string;
  priorityScore: number;
  reviewStage: "new" | "learning" | "review";
  lastResult: "correct" | "wrong";
};

type SaveSessionRequest = {
  playerId: string;
  languageCode: string;
  modeType: "standard" | "practice";
  quizType: "word_to_meaning" | "meaning_to_word" | "mixed";
  totalTimeSec: number;
  score: number;
  heartsLeft: number;
  totalQuestions: number;
  correctAnswers: number;
  answerLog: AnswerLog[];
  reviewState: ReviewStateRecord[];
};
```

Actual POST JSON:

```json
{
  "action": "saveSession",
  "payload": {
    "playerId": "player-demo",
    "languageCode": "ja",
    "modeType": "standard",
    "quizType": "mixed",
    "totalTimeSec": 18,
    "score": 120,
    "heartsLeft": 2,
    "totalQuestions": 5,
    "correctAnswers": 4,
    "answerLog": [
      {
        "wordId": "ja-1",
        "questionType": "word_to_meaning",
        "shownPrompt": "ねこ",
        "difficultySnapshot": "1",
        "responseTimeMs": 1400,
        "selectedAnswer": "cat",
        "correct": true,
        "comboAfterAnswer": 1,
        "earnedScore": 10
      }
    ],
    "reviewState": [
      {
        "wordId": "ja-1",
        "priorityScore": 10,
        "reviewStage": "learning",
        "lastResult": "correct"
      }
    ]
  }
}
```

Important frontend rule:

- `totalQuestions`는 로드한 전체 단어 수가 아니라 실제 답변 수여야 한다.
- 현재 프론트는 `modeType`, `quizType`, `answerLog[].questionType`, `answerLog[].shownPrompt`를 함께 보내므로, GAS는 이 값을 그대로 record 시트에 쓰는 편이 안전하다.
- 현재 프론트는 `totalTimeSec`, `answerLog[].responseTimeMs`, `answerLog[].difficultySnapshot`도 함께 보내므로, `Game_Log.total_time_sec`, `Answer_Log.response_time_ms`, `Answer_Log.difficulty_snapshot`를 기본값 대신 실제 값으로 기록할 수 있다.

Current GAS-aligned rule:

- `totalQuestions !== answerLog.length`이면 GAS는 `SAVE_FAILED` 오류로 저장을 거부한다.
- per-language `record` workbook direction now allows `Game_Log` to omit `language_code`
- 현재 GAS 스켈레톤은 `getMeta`, `getWords`, `saveSession` 실패를 각각 `META_LOAD_FAILED`, `WORDS_LOAD_FAILED`, `SAVE_FAILED`로 감싸 응답한다.

Success DTO:

```ts
type SaveSessionResponseDto = {
  saved: boolean;
};
```

Mapped frontend result:

```ts
type SaveSessionResult = {
  ok: boolean;
};
```

Success envelope example:

```json
{
  "ok": true,
  "data": {
    "saved": true
  }
}
```

## Error Model

실제 API는 아래 공통 오류 envelope를 사용해야 한다.

```ts
type ApiErrorCode =
  | "AUTH_FAILED"
  | "META_LOAD_FAILED"
  | "WORDS_LOAD_FAILED"
  | "SAVE_FAILED"
  | "UNKNOWN_ERROR";

type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
};

type ApiErrorResponse = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

Recommended transport rule:

- 애플리케이션 레벨 오류는 가능하면 HTTP `200` + envelope로 통일한다.
- HTTP status code를 별도로 쓴다면 그 규칙을 문서에 따로 고정해야 한다.

Error envelope example:

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다."
  }
}
```

## Mock Data Notes

Current mock language data:

- `ja`

Current mock question coverage:

- `word_to_meaning`
- `meaning_to_word`

Mock save behavior:

- 테스트에서 강제 실패를 주입하지 않으면 저장은 성공한다.

## Integration Checklist

- 실제 GAS 응답은 위에 적은 snake_case DTO 필드를 그대로 유지해야 한다.
- `question_type`는 프론트 기본값이 있더라도 가능하면 항상 보내는 편이 안전하다.
- `saveSession`은 아래 데이터를 처리해야 한다.
  - 세션 요약 1행
  - 답변 로그 여러 행
  - 최신 복습 상태 upsert
  - 일일 통계 집계
- 실제 GAS가 받아야 하는 action 이름은 아래 4개다.
  - `login`
  - `getMeta`
  - `getWords`
  - `saveSession`
- 현재 GAS 스켈레톤 기준 추가 정렬 사항:
  - `getMeta`는 `일본어` 라벨을 반환한다.
  - `getWords`는 master 다중 시트를 합쳐 question DTO를 만들고 `choices`를 `string[]`로 생성한다.
  - `saveSession`은 `Asia/Seoul` 기준 날짜로 `stat_date`를 만든다.
  - `saveSession`은 `player_id + timestamp` 기반 `log_id`를 만들고, `Answer_Log.session_log_id`로 연결한다.
- 현재 시트 구조 변경 메모:
  - source `master` workbook은 언어별 다중 시트 원본 구조로 바뀌는 방향이다.
  - 현재 문서 기준은 `gas/Code.gs`와 `docs/sheet-schema.md`에 맞춰 다중 source 시트 / 2행 machine key 구조로 정렬돼 있다.
