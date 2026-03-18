# PROJECT_STATE.md

## 문서 목적

이 문서는 `PROJECT_CONTEXT.md`의 설계 문서를 바탕으로, 지금 이 저장소에 실제로 구현되어 있는 상태만 정리한 현재 상태 스냅샷이다.  
다른 PC의 Codex가 이 문서 하나만 읽어도 현재 구현 범위, 주요 파일, 데이터 구조, 다음 작업을 바로 이해할 수 있도록 작성한다.

## 현재 진행 Phase

- 현재 Phase: Phase 3 - 핵심 기능 확장
- 기준 문서: `TASKS.md`
- 현재 방향:
  - 플레이 이후 흐름인 결과, 복습, 통계, 연습 모드를 안정화
  - mock/real API 분기와 GAS/Google Sheets 실연동 준비를 진행
  - 실제 시트 구조와 프론트 payload 매핑을 맞추는 중

## 현재 구현된 기능

### 1. 인증과 진입 흐름

- 로그인 화면 구현
- 보호 라우트 구현
- 로그인 성공 시 언어 선택 화면으로 이동
- 실연동 모드에서는 demo 기본값을 강제로 넣지 않음
- 로그인 실패 시 오류 문구를 화면에 표시

### 2. 언어 선택과 데이터 로드

- 언어 메타 로드
- 일본어 1개 언어 기준 선택 화면 구현
- 언어 선택 직후 홈 화면으로 먼저 이동
- 단어 데이터는 백그라운드로 로드해 진입 체감 속도를 보정
- 단어 로드 실패 시 cache 또는 fallback mock 데이터 사용

### 3. 홈 화면

- 선택 언어, 준비된 문제 수 표시
- 플레이 시작
- 연습 모드 시작
- 복습센터 진입
- 통계 화면 진입
- 언어 다시 선택
- 로그아웃
- pending session 재저장 버튼
- mock 모드 안내 표시
- 상단에서 현재 연결 상태 표시

### 4. 플레이와 결과 처리

- 문제 유형 2종 구현
  - `word_to_meaning`
  - `meaning_to_word`
- 점수, 하트, 콤보 계산
- 세션 시간 추적
- 문항별 응답 시간 추적
- `뜻 -> 단어` 문제에서 현재 문제 DTO의 단어 보기만 사용하도록 수정 완료
- 세션 종료 시 결과 화면으로 이동
- 결과 화면에서 점수, 정답 수, 복습 상태 미리보기, CTA 표시

### 5. 복습과 통계

- `Review_State` 계산 로직 구현
- 복습센터 화면 구현
- 우선순위 기반 복습 목록 정렬
- 연습 모드 재진입
- 기본 통계 화면 구현
- 로컬 snapshot 기반 누적 통계 표시

### 6. 저장 실패 복구

- 세션 저장 실패 시 pending session 임시 저장
- 홈 화면에서 pending session 재저장 가능
- `review snapshot`, `daily stats snapshot` 로컬 저장

### 7. API와 실연동 준비

- mock API / GAS Web App 런타임 분기 구현
- `.env` 기반 runtime 설정 해석
- 브라우저에서 GAS 호출 시 `text/plain;charset=utf-8` 방식으로 전송하여 CORS preflight 문제 회피
- 실제 업로드된 Excel 헤더 기준으로 GAS 스켈레톤과 문서 정렬
- 실연동 문서 세트 작성 완료
- 현재 배포된 GAS Web App 기준 `login`, `getMeta`, `getWords`, `saveSession` 최소 smoke test 응답 확인 완료

### 8. 테스트 상태

- Vitest + React Testing Library 기반 테스트 구성
- 현재 주요 화면, 저장 흐름, 런타임 분기, 세션 복구, 문제 라운드 테스트 존재
- 최근 확인 기준:
  - `npm run test` 통과
  - `npm run build` 통과
  - 실제 GAS Web App에 `songmanx / 8686` 로그인 요청 성공
  - 실제 GAS Web App에 `getMeta`, `getWords`, 최소 `saveSession` 요청 성공
- 최근 테스트 수: 38개 통과 기준으로 관리 중

## 현재 프로젝트 폴더 구조

```text
.
├─ src/
│  ├─ components/
│  │  ├─ AppShell.tsx
│  │  └─ ProtectedRoute.tsx
│  ├─ features/
│  │  └─ game/
│  │     ├─ mockWords.ts
│  │     ├─ questionRound.ts
│  │     ├─ questionRound.test.ts
│  │     ├─ resultState.ts
│  │     ├─ session.ts
│  │     └─ session.test.ts
│  ├─ pages/
│  │  ├─ LoginPage.tsx
│  │  ├─ LanguageSelectPage.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ PlayPage.tsx
│  │  ├─ ResultPage.tsx
│  │  ├─ ReviewPage.tsx
│  │  ├─ StatsPage.tsx
│  │  └─ 각 페이지 테스트 파일
│  ├─ services/
│  │  ├─ apiClient.ts
│  │  ├─ apiTypes.ts
│  │  ├─ gasClient.ts
│  │  ├─ gasMappers.ts
│  │  ├─ logger.ts
│  │  ├─ runtimeConfig.ts
│  │  ├─ sessionRecovery.ts
│  │  ├─ storage.ts
│  │  └─ storageKeys.ts
│  ├─ stores/
│  │  ├─ authStore.ts
│  │  └─ languageStore.ts
│  ├─ test/
│  │  └─ setup.ts
│  ├─ utils/
│  │  └─ reviewState.ts
│  ├─ App.tsx
│  └─ main.tsx
├─ gas/
│  ├─ Code.gs
│  ├─ appsscript.json
│  └─ README.md
├─ docs/
│  ├─ api-spec.md
│  ├─ sheet-schema.md
│  ├─ google-sheets-setup-guide.md
│  ├─ gas-click-by-click-guide.md
│  ├─ gas-deploy-checklist.md
│  ├─ gas-5minute-checklist.md
│  ├─ gas-docs-start-here.md
│  ├─ gas-connection-values-template.md
│  ├─ real-connection-smoke-test.md
│  └─ 기타 연결/설명 문서
├─ 백업/
│  ├─ user.xlsx
│  ├─ japanese_master.xlsx
│  └─ japanese_record.xlsx
├─ AGENTS.md
├─ TASKS.md
├─ ROADMAP.md
├─ PROJECT_CONTEXT.md
├─ PROJECT_STATE.md
├─ CHANGELOG.md
├─ README.md
├─ .env
└─ .env.example
```

## 주요 파일 및 역할

### 라우팅/앱 셸

- `src/App.tsx`
  - 전체 라우트 정의
  - `/login`, `/languages`, `/home`, `/play`, `/practice`, `/result`, `/review`, `/stats`
- `src/components/AppShell.tsx`
  - 공통 레이아웃
  - 상단 연결 상태 배지 표시
- `src/components/ProtectedRoute.tsx`
  - 로그인 상태가 아니면 접근 차단

### 상태 관리

- `src/stores/authStore.ts`
  - 로그인 세션, `playerId`, `nickname`, `token`, `isLoggedIn`, `logout`
- `src/stores/languageStore.ts`
  - 선택 언어, 언어 메타, 단어 목록, 로딩/오류, `loadMeta`, `loadWords`, `selectLanguage`

### 게임 로직

- `src/features/game/questionRound.ts`
  - 문제 유형별 prompt, instruction, type label, choices 생성
  - `meaning_to_word`는 현재 DTO의 `choices` 그대로 사용
- `src/features/game/session.ts`
  - 세션 종료 payload 생성
  - 실제 답변 수 기준으로 `totalQuestions` 정합성 유지
- `src/features/game/resultState.ts`
  - 결과 화면에 필요한 표시용 상태 계산
- `src/utils/reviewState.ts`
  - 답변 로그로부터 `Review_State` 레코드 계산

### 화면

- `src/pages/LoginPage.tsx`
  - 로그인 입력, 오류 표시, 실연동 모드 문구 처리
- `src/pages/LanguageSelectPage.tsx`
  - 언어 카드 표시, 선택 시 홈 이동 + 백그라운드 단어 로드
- `src/pages/HomePage.tsx`
  - 플레이/연습/복습/통계/재저장 진입
  - 단어가 비어 있으면 진입 직전 재로드
- `src/pages/PlayPage.tsx`
  - 플레이 루프, 정답 처리, 점수/하트/콤보, 세션 저장
- `src/pages/ResultPage.tsx`
  - 결과 요약, 저장 상태, 복습 상태 미리보기
- `src/pages/ReviewPage.tsx`
  - 로컬 review snapshot 기반 복습 목록
- `src/pages/StatsPage.tsx`
  - 로컬 daily stats snapshot 기반 통계

### API/실연동

- `src/services/apiTypes.ts`
  - 프론트 내부 타입과 DTO 타입 정의
- `src/services/apiClient.ts`
  - mock / real 모드 분기
  - 브라우저에서 GAS Web App으로 실제 요청 전송
- `src/services/gasClient.ts`
  - mock GAS 역할의 프론트 측 클라이언트
- `src/services/gasMappers.ts`
  - GAS 응답 DTO -> 프론트 타입 매핑
- `src/services/runtimeConfig.ts`
  - `.env`의 `VITE_GAS_BASE_URL`, `VITE_GAS_USE_MOCK` 해석
- `src/services/sessionRecovery.ts`
  - cache, pending session, review snapshot, stats snapshot 저장/조회

### GAS

- `gas/Code.gs`
  - `doPost`, `doGet`
  - `login`, `getMeta`, `getWords`, `saveSession` action 처리
  - 실제 Excel 헤더 기준 시트 읽기/쓰기
- `gas/appsscript.json`
  - Apps Script 매니페스트
- `gas/README.md`
  - GAS 사용 및 시트 구성 안내

### 문서

- `docs/api-spec.md`
  - 현재 프론트와 GAS가 기대하는 action 기반 요청/응답 구조
- `docs/sheet-schema.md`
  - 실제 업로드된 Excel 헤더 기준 시트 구조와 저장 매핑
- `docs/real-connection-smoke-test.md`
  - 실연동 후 로그인/로드/저장 확인 순서
- `docs/gas-click-by-click-guide.md`
  - Apps Script 설정과 배포를 초보자 기준으로 안내

## 데이터 구조

## 프론트 핵심 타입

현재 프론트 타입은 `src/services/apiTypes.ts` 기준으로 아래 구조를 사용한다.

```ts
type QuestionType = "word_to_meaning" | "meaning_to_word";
type SessionMode = "standard" | "practice";

type WordItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  meaning: string;
  difficulty: string;
  questionType: QuestionType;
};

type AnswerLog = {
  wordId: string;
  questionType: QuestionType;
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
  modeType: SessionMode;
  quizType: QuestionType | "mixed";
  totalTimeSec: number;
  score: number;
  heartsLeft: number;
  totalQuestions: number;
  correctAnswers: number;
  answerLog: AnswerLog[];
  reviewState: ReviewStateRecord[];
};
```

## 브라우저 localStorage 구조

- words cache
  - 계정 + 언어 기준으로 분리
- pending session
  - 저장 실패 시 원본 payload 보존
- review snapshot
  - 결과/복습 화면용 최근 `Review_State`
- daily stats snapshot
  - 통계 화면용 누적 정보

대표 구조:

```ts
type PendingSessionRecord = {
  payload: SaveSessionRequest;
  savedAt: string;
  reason: string;
};
```

## Google Sheets 구조

현재 프로젝트는 사용자 파일 1개 + 언어별 파일 2개 구조를 전제로 한다.

### 1. 사용자 파일

- 파일: `user.xlsx` 기준
- 주요 시트: `Users`
- 현재 GAS 로그인에서 사용하는 핵심 컬럼:
  - `login_id`
  - `password_plain_or_hash`
  - `player_id`
  - `display_name`
  - `is_active`

현재 확인된 실제 계정 예시:

- `songmanx / 8686`
- `quilt3 / 2446`

### 2. 일본어 master 파일

- 파일: `japanese_master.xlsx`
- 현재 구조:
  - `명사`
  - `동사`
  - `い형용사`
  - `な형용사`
  - `부사`
  - `기타`
- 공통 특징:
  - 1행: 한글 표시명
  - 2행: machine key
  - 3행부터 데이터

현재 문제 생성에 실제로 중요하게 쓰는 컬럼:

- `word_id`
- `jp_kanji`
- `jp_furigana`
- `jp_furigana_2`
- `meaning_ko_1`
- `meaning_ko_2`
- `meaning_ko_3`
- `difficulty`
- `is_active`

현재 GAS의 문제 생성 방향:

- `jp_kanji -> 뜻 맞추기`
- `뜻 -> jp_kanji 맞추기`
- `jp_furigana -> 뜻 맞추기`
- `뜻 -> jp_furigana 맞추기`
- `jp_furigana_2 -> 뜻 맞추기`
- `jp_furigana_2`에 대해서는 아직 `뜻 -> 후리가나2` 문제는 만들지 않음

### 3. 일본어 record 파일

- 파일: `japanese_record.xlsx`
- 주요 시트:
  - `Game_Log`
  - `Answer_Log`
  - `Review_State`
  - `Daily_Stats`
- 공통 특징:
  - 1행: 한글 표시명
  - 2행: machine key
  - 3행부터 데이터

#### Game_Log

현재 GAS가 쓰는 핵심 key:

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

#### Answer_Log

현재 GAS가 쓰는 핵심 key:

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

#### Review_State

현재 GAS가 upsert하는 핵심 key:

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

#### Daily_Stats

현재 GAS가 upsert하는 핵심 key:

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

현재 집계 규칙:

- `stat_date`: `Asia/Seoul` 기준 `YYYY-MM-DD`
- `study_minutes`: `Math.ceil(totalTimeSec / 60)` 누적
- `sessions_count`: 세션마다 1 증가

## 핵심 로직 설명

### 1. 로그인

1. `LoginPage`에서 `authStore.login` 호출
2. `apiClient.login()`이 mock 또는 real 모드로 분기
3. real 모드면 GAS `login` action 호출
4. 성공 시 `playerId`, `nickname`, `token` 저장
5. 실패 시 화면에 오류 메시지 출력

### 2. 언어 메타와 단어 로드

1. `LanguageSelectPage` 진입 시 `loadMeta()`
2. 언어 선택 시 `selectLanguage(languageCode)` 실행
3. 홈으로 먼저 이동
4. `loadWords(languageCode)`는 백그라운드로 시작
5. `HomePage` 또는 진입 시점에 단어가 없으면 다시 `loadWords()` 실행
6. `loadWords()` 실패 시
   - 계정/언어별 cache 사용
   - 그래도 없으면 fallback mock words 사용

### 3. 문제 생성

`PlayPage`는 현재 `WordItem`을 기반으로 `buildQuestionRound()`를 호출한다.

- `word_to_meaning`
  - prompt: 일본어
  - choices: 뜻 보기
  - answer: 뜻
- `meaning_to_word`
  - prompt: 뜻
  - choices: 일본어 단어 보기
  - answer: 일본어 단어

중요:

- 이전에는 `뜻 -> 단어` 문제에서 전체 단어 풀을 다시 섞어 뜻/단어가 섞일 수 있었음
- 현재는 해당 문제 DTO의 `choices`를 그대로 써서 이 문제가 수정됨

### 4. 플레이 루프

1. 정답 선택
2. 정답 여부 계산
3. 점수, 콤보, 하트 갱신
4. `AnswerLog` 누적
5. 마지막 문제이거나 하트 소진이면 세션 종료
6. 아니면 다음 문제 진행

### 5. 세션 종료와 저장

1. `session.ts`에서 `SaveSessionRequest` 생성
2. `reviewState.ts`로 `ReviewStateRecord[]` 계산
3. `sessionRecovery.ts`로 review snapshot, daily stats snapshot 저장
4. `apiClient.saveSession()` 호출
5. 실패 시 pending session 저장
6. 결과 화면으로 이동

### 6. GAS 저장 처리

`gas/Code.gs`의 `saveSession`은 아래 순서로 처리한다.

1. payload 검증
   - `playerId`, `languageCode`, `modeType`, `quizType`, `totalTimeSec`
   - `answerLog`, `reviewState`
   - `totalQuestions === answerLog.length`
2. `session_id` 생성
3. `Game_Log` append
4. `Answer_Log` append
5. `Review_State` upsert
6. `Daily_Stats` upsert

### 7. 실연동 모드

현재 `.env` 기준 실연동을 지원한다.

- `VITE_GAS_BASE_URL`
- `VITE_GAS_USE_MOCK`

현재 작업 환경에서는 실연동 URL이 입력된 상태에서 테스트했고, 브라우저 요청은 `text/plain;charset=utf-8`로 보내도록 되어 있다.

## 아직 구현되지 않은 기능

### 기능 미구현

- 품사 선택 UI
- 방식 선택 UI
- 실제 master 구조를 반영한 단계별 출제 흐름 완성
- 실제 시트 저장 결과를 화면 통계와 완전히 동기화하는 구조
- 고급 통계 시각화
- 이미지 문제
- 듣기 모드 고도화
- 자기채점 작문 완성형
- 업적 시스템
- 다국어 실제 확장
- 관리자 UI
- PWA

### 실연동 미완료 항목

- 실제 Google Sheets 운영 구조 최종 확정
- 실제 GAS Web App과 프론트의 end-to-end 저장 검증 완료
- 실제 시트에서 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` row 반영 여부 직접 확인
- Review/Stats 로컬 snapshot과 시트 저장 구조의 최종 대조
- 언어 추가 시 master/record 파일 확장 규칙의 실제 운영 검증

## 현재 알려진 상태와 주의점

- 로컬 테스트와 빌드는 통과 상태다.
- 프론트는 실연동 준비가 많이 되어 있지만, 실제 운영 검증은 아직 진행 중이다.
- 문서 수가 많으므로 실제 작업 시작 전에는 `TASKS.md`를 우선 보고, 필요할 때만 관련 실연동 문서를 여는 편이 효율적이다.
- `백업/` 폴더의 Excel 파일은 실제 구조 대조용이며 수정 대상이 아니다.
- 실제 Google Sheets 데이터 내용은 사용자가 직접 관리한다.

## 다음 개발 작업

우선순위는 `TASKS.md` 기준으로 아래 순서를 권장한다.

1. 실제 실연동 저장 검증
   - 로그인, 언어 메타 로드, 단어 로드 API 응답 확인 완료
   - 최소 `saveSession` API 응답 확인 완료
   - 다음은 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 실제 row 확인

2. 문제 생성/출제 흐름 확장
   - 품사 선택
   - 방식 선택
   - 현재 다중 품사 master 구조에 맞는 문제 출제 흐름 보강

3. 정적 JSON 운영 흐름 정리
   - GitHub Secrets 설정
   - GitHub Actions 첫 실행
   - public/data/languages.json, public/data/ja/words.json 생성 확인
   - 프론트 .env를 JSON 읽기 모드로 전환

4. Review/Stats 정합성 보강
   - 로컬 snapshot 구조와 실제 시트 저장 구조 최종 대조
   - 필요한 경우 프론트 표시값과 GAS 저장 규칙 조정

5. 문서 최신화 유지
   - `TASKS.md`
   - `CHANGELOG.md`
   - `docs/api-spec.md`
   - `docs/sheet-schema.md`

## 이어받는 Codex를 위한 빠른 시작 가이드

다른 Codex가 바로 시작하려면 아래 순서를 권장한다.

1. `AGENTS.md`
2. `TASKS.md`
3. 이 문서 `PROJECT_STATE.md`
4. 필요 시 `PROJECT_CONTEXT.md`
5. 실연동 작업이면 `docs/api-spec.md`, `docs/sheet-schema.md`, `gas/Code.gs`

현재 가장 중요한 포인트는 다음 두 가지다.

- 프론트와 GAS의 저장 payload 매핑은 이미 많이 맞춰져 있다.
- 다음 실질 작업은 문서 추가보다 실제 실연동 검증과 출제 흐름 보강이다.



