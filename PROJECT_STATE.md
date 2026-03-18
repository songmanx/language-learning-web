# PROJECT_STATE.md

## 문서 목적

이 문서는 `PROJECT_CONTEXT.md`의 설계 문서가 아니라, 현재 저장소에 실제로 구현되어 있는 상태만 정리한 현재 상태 스냅샷이다.  
다른 PC의 Codex가 이 문서 하나만 읽고도 지금 무엇이 구현되어 있고, 어떤 구조로 동작하며, 다음에 무엇을 이어서 개발해야 하는지 바로 파악할 수 있도록 작성한다.

## 현재 진행 Phase

- 현재 Phase: Phase 3 - 핵심 기능 확장
- 기준 문서: `TASKS.md`
- 현재 방향:
  - 플레이 이후 흐름인 결과, 복습, 통계, 연습 모드를 안정화
  - Google Sheets 실연동과 정적 JSON 운영 흐름을 정리
  - 문서/운영 스크립트를 단순화해 다른 환경에서도 바로 이어서 검증할 수 있게 만드는 중

## 현재 구현된 기능

### 1. 인증과 진입 흐름

- 로그인 화면 구현 완료
- 보호 라우트 구현 완료
- Zustand 기반 인증 상태 저장 완료
- 로그인 성공 시 `/languages`로 이동
- 실연동 모드에서는 GAS `GET` warm-up 후 로그인
- 로그인 직후 언어 메타를 선로딩해 언어 선택 진입 대기 시간을 줄여 둠

### 2. 언어 선택과 데이터 로드

- 언어 선택 화면 구현 완료
- 현재 지원 언어는 일본어(`ja`) 1개
- 언어 메타는 `getMeta()`로 로드
- 단어 데이터는 `getWords("ja")`로 로드
- 언어 선택 직후 홈으로 먼저 이동하고, 단어는 백그라운드 로드
- 단어 로드 실패 시 localStorage cache 우선 fallback, 없으면 내장 fallbackWords 사용

### 3. 홈 화면

- 현재 선택 언어 표시
- 준비된 문제 수 표시
- 기본 플레이 시작 버튼
- 연습 모드 시작 버튼
- 복습센터 이동 버튼
- 통계 화면 이동 버튼
- 언어 재선택 버튼
- 로그아웃 버튼
- pending session이 남아 있으면 홈에서 재저장 시도 가능
- 현재 데이터 읽기 모드 안내 표시
  - mock 모드 안내
  - 정적 JSON + GAS 저장 모드 안내

### 4. 플레이 화면

- 기본 플레이(`/play`)와 연습 모드(`/practice`) 공용 화면 구현
- HUD 요소 구현:
  - 하트
  - 점수
  - 콤보
  - 진행도
  - 남은 문제 수
- 문제 유형 2종 지원:
  - `word_to_meaning`
  - `meaning_to_word`
- 마지막 문제 또는 하트 소진 시 세션 종료
- 세션 종료 직후 결과 화면을 먼저 보여 주고 저장은 뒤에서 계속 진행
- 답안 클릭 직후 입력 잠금 처리 구현
  - 빠른 연타로 같은 문제가 중복 처리되지 않음

### 5. 결과 / 복습 / 통계 흐름

- 결과 화면 구현 완료
  - 점수
  - 정답 수
  - 정확도
  - 남은 하트
  - 저장 상태(`saving`, `saved`, `pending`)
  - 복습 상태 미리보기
  - 다음 행동 제안
- 복습센터 화면 구현 완료
  - localStorage에 저장된 최근 `reviewState` snapshot 기준 정렬
  - 우선순위 높은 단어부터 표시
- 통계 화면 구현 완료
  - localStorage에 저장된 `dailyStats` snapshot 기준 표시
  - 누적 세션 수, 연습 세션 수, 누적 점수, 최고 점수, 정확도 등 표시

### 6. 저장 / 복구 / 로컬 snapshot

- 세션 종료 시 `SaveSessionRequest` payload 생성
- 저장 성공 시 결과 화면에서 `saved` 상태 표시
- 저장 실패 시 pending session을 localStorage에 저장
- 홈 화면에서 pending session 재저장 가능
- `Review_State`용 snapshot localStorage 저장
- `Daily_Stats`용 snapshot localStorage 저장
- 단어 cache localStorage 저장
- 선택 언어 localStorage 저장

### 7. 정적 JSON 운영

- 현재 읽기 경로는 정적 JSON 우선 구조로 전환됨
- `public/data/languages.json`
- `public/data/ja/words.json`
- `.env` 기준 현재 동작:
  - 로그인 / 저장: GAS
  - 메타 / 단어 읽기: 정적 JSON
- Google Sheets -> JSON export 스크립트 구현
- JSON validate 스크립트 구현
- 로컬 통합 명령 구현:
  - `npm run export:json`
  - `npm run validate:json`
  - `npm run refresh:json`
- GitHub Actions `Export Static JSON` workflow로 자동 export/validate/commit 가능

### 8. 실연동 운영/검증

- GAS Web App `login`, `getMeta`, `getWords`, `saveSession` smoke test 스크립트 구현
- 기록 시트 4개 탭 검증 스크립트 구현
  - `Game_Log`
  - `Answer_Log`
  - `Review_State`
  - `Daily_Stats`
- 통합 명령 구현:
  - `npm run smoke:gas`
  - `npm run verify:record`
  - `npm run check:live`
- 현재 프로젝트 환경에서는 기본값 기반 실행이 많이 단순화됨
- `docs/live-check-latest.json`에 최근 실연동 검증 결과 저장

## 현재 프로젝트 폴더 구조

현재 작업에 중요한 폴더만 적는다.

```text
language_learning_web/
  .github/
    workflows/
      export-static-json.yml
  docs/
    api-spec.md
    sheet-schema.md
    json-export-workflow.md
    real-connection-smoke-test.md
    static-json-ops-quickref.md
    live-ops-quickref.md
    gas-docs-start-here.md
    gas-connection-values-template.md
    live-check-latest.json
  gas/
    Code.gs
  public/
    data/
      languages.json
      ja/
        words.json
  scripts/
    export_google_sheets_json.py
    validate_static_json.py
    run_static_json_refresh.mjs
    run_gas_smoke_test.mjs
    verify_record_sheet_state.py
    run_full_connection_check.mjs
    sync_live_check_report.mjs
  src/
    components/
    features/game/
    pages/
    services/
    stores/
    utils/
    App.tsx
    main.tsx
  AGENTS.md
  PROJECT_CONTEXT.md
  PROJECT_STATE.md
  ROADMAP.md
  TASKS.md
  CHANGELOG.md
  package.json
  .env
```

## 주요 파일 및 역할

### 라우팅 / 앱 프레임

- `src/App.tsx`
  - 전체 라우팅 정의
  - `/login`, `/languages`, `/home`, `/play`, `/practice`, `/result`, `/review`, `/stats`
- `src/components/AppShell.tsx`
  - 공통 레이아웃과 상단 상태 영역
- `src/components/ProtectedRoute.tsx`
  - 로그인 여부에 따른 보호 라우트

### 페이지

- `src/pages/LoginPage.tsx`
  - 로그인 폼
  - GAS warm-up
  - 로그인 성공 후 언어 메타 선로딩
- `src/pages/LanguageSelectPage.tsx`
  - 사용 가능 언어 목록 표시 및 선택
- `src/pages/HomePage.tsx`
  - 시작 허브
  - pending session 재저장
  - 현재 읽기 모드 안내
- `src/pages/PlayPage.tsx`
  - 실제 문제 풀이 핵심 화면
  - 점수/콤보/하트 계산
  - 결과 화면 선이동 + 저장 후상태 업데이트
  - 최근 수정: 답안 입력 잠금
- `src/pages/ResultPage.tsx`
  - 세션 요약과 저장 상태 표시
- `src/pages/ReviewPage.tsx`
  - 로컬 review snapshot 기반 복습 목록
- `src/pages/StatsPage.tsx`
  - 로컬 daily stats snapshot 기반 통계 화면

### 게임 로직

- `src/features/game/questionRound.ts`
  - 현재 문항 DTO를 실제 UI 문제 형식으로 변환
- `src/features/game/session.ts`
  - `SaveSessionRequest` payload 생성
- `src/features/game/resultState.ts`
  - 결과 화면으로 넘기는 상태 타입
- `src/utils/reviewState.ts`
  - 정답/오답 기준 reviewState 계산

### 상태 관리

- `src/stores/authStore.ts`
  - 로그인 상태, 토큰, playerId, nickname
- `src/stores/languageStore.ts`
  - 선택 언어
  - 언어 메타
  - 단어 목록
  - 메타/단어 로드
  - cache fallback

### API / 저장 / 설정

- `src/services/apiClient.ts`
  - mock / GAS / static JSON 분기 진입점
  - 현재는 `readDataMode`가 `json`
- `src/services/runtimeConfig.ts`
  - `.env` 값 파싱
- `src/services/sessionRecovery.ts`
  - pending session / review snapshot / daily stats snapshot / words cache 관리
- `src/services/storage.ts`
  - JSON localStorage read/write 래퍼
- `src/services/gasMappers.ts`
  - GAS DTO -> 프론트 타입 매핑
- `src/services/apiTypes.ts`
  - 핵심 데이터 타입 정의

### GAS / 운영 스크립트

- `gas/Code.gs`
  - 실제 GAS endpoint
  - `login`, `getMeta`, `getWords`, `saveSession`
- `scripts/export_google_sheets_json.py`
  - Google Sheets master workbook -> 정적 JSON export
- `scripts/validate_static_json.py`
  - 생성된 JSON 검증
- `scripts/run_static_json_refresh.mjs`
  - export + validate 통합
- `scripts/run_gas_smoke_test.mjs`
  - GAS smoke test
- `scripts/verify_record_sheet_state.py`
  - record workbook 검증
- `scripts/run_full_connection_check.mjs`
  - smoke + verify + report sync 통합

## 데이터 구조

### 1. 프론트 핵심 타입

`src/services/apiTypes.ts` 기준:

```ts
type WordItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  meaning: string;
  difficulty: string;
  questionType: "word_to_meaning" | "meaning_to_word";
};

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

### 2. 현재 정적 JSON 구조

`public/data/languages.json`

- 현재 일본어 1개
- 현재 `total_words: 94`

`public/data/ja/words.json`

- 현재 일본어 문제 DTO 목록
- 현재 question count는 377
- `choices`는 master 시트 원본 컬럼이 아니라 exporter/GAS가 만든 문제용 보기 배열

### 3. Google Sheets 구조

#### User workbook

- workbook: `lang_user_sheet`
- sheet: `Users`
- 현재 로그인 참조 컬럼:
  - `player_id`
  - `display_name`
  - `login_id`
  - `password_plain_or_hash`
  - `is_active`

#### Japanese master workbook

- workbook 예시: `japanese_master`
- source sheets:
  - `명사`
  - `동사`
  - `い형용사`
  - `な형용사`
  - `부사`
  - `기타`
- 현재 source 인식 기준:
  - `word_id`
  - `jp_kanji`
  - `is_active`
  를 포함하는 시트

주요 컬럼:

- `word_id`
- `jp_kanji`
- `jp_furigana`
- `jp_furigana_2` (일부 시트만)
- `meaning_ko_1`
- `meaning_ko_2`
- `meaning_ko_3`
- `difficulty`
- `is_active`
- `notes`

#### Japanese record workbook

핵심 연동 탭:

- `Game_Log`
- `Answer_Log`
- `Review_State`
- `Daily_Stats`

`Game_Log` machine keys:

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

`Answer_Log` machine keys:

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

`Review_State` machine keys:

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

`Daily_Stats` machine keys:

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

### 4. 현재 로컬 snapshot 구조

로컬 snapshot은 실제 Google Sheets 구조와 다르다.

`sessionRecovery.ts` 기준:

- words cache
- pending session
- review snapshot
- daily stats snapshot

특히 `ReviewPage`, `StatsPage`는 현재 Google Sheets를 다시 읽지 않는다.  
최근 세션 기준 localStorage snapshot을 읽어 보여 준다.

## 핵심 로직 설명

### 1. 현재 API 읽기/쓰기 분리 구조

현재 `.env` 기준:

- 메타 읽기: 정적 JSON
- 단어 읽기: 정적 JSON
- 로그인: GAS
- 세션 저장: GAS

즉, read-heavy 경로는 JSON, write/auth 경로는 GAS로 분리돼 있다.

### 2. 플레이 -> 저장 흐름

1. `PlayPage`가 현재 단어를 `questionRound`로 변환
2. 사용자가 답안 클릭
3. 점수/콤보/하트 계산
4. `AnswerLog` 누적
5. 마지막 문제 또는 하트 소진 시 `buildSaveSessionPayload()` 호출
6. `reviewState`와 `dailyStats` snapshot을 localStorage에 먼저 기록
7. 결과 화면으로 즉시 이동(`saveStatus: "saving"`)
8. `apiClient.saveSession()` 시도
9. 성공 시 결과 화면 상태를 `saved`로 교체
10. 실패 시 pending session 저장 후 결과 화면 상태를 `pending`로 교체

### 3. reviewState 계산

`computeReviewState()` 기준:

- 정답:
  - `priorityScore = max(10, 40 - comboAfterAnswer * 5)`
  - combo 2 이상이면 `review`
  - 아니면 `learning`
- 오답:
  - `priorityScore = 100`
  - `learning`

현재 프론트 reviewState는 UI/저장 payload 기준 구조이고, GAS가 이를 실제 `Review_State.status` 등 시트 구조로 변환한다.

### 4. GAS 저장 매핑

`gas/Code.gs` 기준:

- `saveSession` 호출 시
  - `appendGameLog_()`
  - `appendAnswerLog_()`
  - `upsertReviewState_()`
  - `upsertDailyStats_()`
  순서로 기록

중요한 현재 규칙:

- `session_id`는 GAS에서 생성
- `choices`는 master 원본 컬럼이 아니라 문제 생성 단계에서 만들어짐
- `Daily_Stats.study_minutes`는 `Math.ceil(totalTimeSec / 60)` 누적
- `Review_State.status`는 프론트 `reviewStage`를 GAS가 변환

### 5. 운영 스크립트 흐름

정적 JSON:

- 로컬 갱신: `npm run refresh:json`
- GitHub 자동 갱신: `Actions > Export Static JSON`

실연동 검증:

- API만 확인: `npm run smoke:gas`
- record 시트만 확인: `npm run verify:record`
- 둘 다: `npm run check:live`

## 현재 확인된 동작 상태

현재 프로젝트 기준으로 이미 확인된 상태:

- `npm run build` 통과
- `npm run smoke:gas` 통과
- `npm run verify:record` 통과
- `npm run check:live` 통과
- 정적 JSON export/validate 통과
- GitHub Actions `Export Static JSON` 통과
- 실제 일본어 master 기준:
  - source rows: 94
  - generated question count: 377

현재 실환경 관련 값은 아래 문서에 모아 둠:

- `docs/gas-connection-values-template.md`
- `docs/live-check-latest.json`

## 아직 구현되지 않은 기능

현재 코드 기준 미구현 또는 후순위 항목:

- 이미지 문제
- 음성 문제 실제 플레이 로직
- 듣기 모드 고도화
- 자기채점 작문 완성형
- 다국어 실제 확장
- 고급 통계 시각화
- 업적 시스템
- 관리자 UI
- PWA
- 실제 Google Sheets 데이터를 다시 읽는 복습/통계 화면
  - 현재는 로컬 snapshot 기반

## 현재 주의할 점

- `PROJECT_CONTEXT.md`의 일부 문장은 현재 구현보다 보수적으로 적혀 있다.
  - 실제로는 GAS URL, master/record 구조, smoke/verify 흐름이 상당 부분 확정되었다.
- `public/data/languages.json`은 현재 터미널 출력에서 한글이 깨져 보일 수 있으나, 실제 앱에서는 정적 JSON 경로로 사용 중이다.
- 루트에 service account JSON 파일이 존재하지만, 다른 PC에서는 동일 파일이 없을 수 있다.
  - 다른 PC에서는 별도 credentials 또는 GitHub Secret 기반 환경을 준비해야 한다.
- `ReviewPage`, `StatsPage`는 아직 Google Sheets 실시간 조회 화면이 아니다.

## 다음 개발 작업

현재 `TASKS.md` 기준 다음 우선순위는 아래와 같다.

### 1. Phase 3 남은 운영 정리

- GAS / Google Sheets 문서 최신 상태 유지
- 정적 JSON 자동 생성 흐름 안정화 유지
- Phase 3 산출 문서 최신화 유지

### 2. 플레이/출제 소작업

- 현재 master 구조에 맞는 출제 흐름의 추가 보강
- 플레이 화면의 작은 안정화/피드백 개선
- 큰 게임성 개편 없이 Phase 3 범위의 작은 UX 개선부터 진행

### 3. 다음 Codex가 바로 해도 되는 시작점

다른 Codex가 바로 이어받는다면 아래 순서를 추천한다.

1. `TASKS.md`로 현재 Phase와 작업 우선순위 확인
2. `PROJECT_CONTEXT.md`로 설계 목표 확인
3. 이 `PROJECT_STATE.md`로 현재 구현 상태 확인
4. 필요 시 아래 명령으로 상태 검증

```powershell
npm run build
npm run smoke:gas
npm run verify:record
npm run refresh:json
```

## 한 줄 요약

현재 프로젝트는 “로그인/저장은 GAS, 메타/단어 읽기는 정적 JSON” 구조로 전환된 일본어 학습 웹앱이며, 로그인 -> 언어 선택 -> 홈 -> 플레이 -> 결과 -> 복습/통계의 전체 흐름과 실연동 검증 스크립트까지 이미 갖춰진 Phase 3 상태다.
