# PROJECT_STATE.md

## 1. 문서 목적

이 문서는 `project_context.md`의 설계 문서를 기반으로, **현재 실제 구현 상태만** 정리한 스냅샷 문서다.  
다른 Codex가 이 파일만 읽어도 현재 프로젝트의 구조, 동작, 데이터 흐름, 다음 작업 지점을 바로 이해할 수 있도록 작성한다.

기준 시점:
- 프로젝트 경로: `D:\smx_coding_d\learning\language_learning_web`
- 현재 단계: **Phase 5 진행 중**
- 현재 핵심 상태:
  - 일본어/영어 2개 언어 지원
  - 정적 JSON + GAS 저장 구조 동작
  - GitHub Pages 배포 구조 연결
  - Google Sheets -> JSON 발행 GUI/CLI 도구 존재

---

## 2. 현재 구현된 기능

### 2.1 기본 앱 흐름

- 로그인 페이지
- 언어 선택 페이지
- 홈 페이지
- 플레이 페이지
- 결과 페이지
- 복습 모드
- 통계 페이지
- 전체 순위표 페이지

### 2.2 지원 언어

- 일본어 (`ja`)
- 영어 (`en`)

언어 선택 후 상단 고정 헤더는 선택 언어 기준 테마/배지를 유지한다.  
로그인/언어선택 페이지는 언어 선택 전이므로 중립형 헤더를 사용한다.

### 2.3 게임 모드

- 기본 플레이 (`standard`)
  - 20문항 고정
  - 하트 10
  - 문제당 10초 제한
  - 결과/통계/순위표 반영

- 연습 모드 (`practice`)
  - 시간 제한 없음
  - 하트 없음
  - 현재 필터에 맞는 문제를 랜덤으로 1회씩 풂
  - 누적 통계/순위표 반영 안 함

- 복습 모드 (`review`)
  - 틀린 단어들만 대상으로 랜덤 출제
  - 복습 모드에서 누적 정답 5회 도달 시 해당 단어는 복습 대상에서 제거
  - 실제 “복습 플레이”로 동작하며, 예전의 리스트형 복습센터는 제거됨

### 2.4 출제 방식

#### 일본어

- `한자 → 뜻`
- `후리가나 → 뜻`
- `뜻 → 한자`
- `뜻 → 후리가나`
- `음성 → 뜻`

#### 영어

- `단어 → 뜻`
- `뜻 → 단어`
- `음성 → 뜻`

영어 `음성 → 뜻`은 별도 음성 파일이 아니라 브라우저 TTS를 사용한다.  
영어는 `en-US` 계열 보이스를 우선 선택하도록 되어 있다.

### 2.5 게임 UX / HUD

- 정답/오답 시 별도 피드백 톤 재생
- `음성 → 뜻`에서 TTS 자동 재생 + 다시 듣기 버튼
- 진행도 표시
  - 기본 플레이: 20개 원형 진행도
  - 연습 모드: 진행도 숨김
- 점수/하트/페이스 HUD 표시
- 갑작스러운 라우팅 이탈 원인 추적을 위한 persistent debug log 저장

### 2.6 결과 / 통계 / 순위표

- 결과 요약
- 결과 화면 하단 Top 10 개인 순위표
- 통계 페이지
  - 성과 요약
  - 개인 순위표
  - 빠른 이동 버튼
  - 누적 통계
  - 내 기록 삭제
- 전체 순위표 페이지
  - 모든 사용자 기준 Top 50
  - 방식별 필터
  - 닉네임 / 날짜 / 시간 / 점수 표기

### 2.7 저장 / 복구 / 안정성

- 세션 종료 시 batch 저장
- 저장 실패 시 pending session으로 localStorage 임시 저장
- 홈에서 재저장 가능
- 예외 상황 로그 localStorage 저장
  - 인증 풀림
  - 세션 중 필수 상태 유실
  - 전역 런타임 에러
  - unhandled promise rejection

### 2.8 데이터 발행 / 운영 도구

- Google Sheets -> static JSON 변환 Python 스크립트
- 일본어/영어 동시 발행 GUI 도구
- GitHub 반영 2단계 GUI
- GitHub Actions 기반 static JSON export workflow
- GitHub Pages 배포 workflow

---

## 3. 현재 프로젝트 폴더 구조

아래는 현재 개발에 중요한 폴더 기준 구조다.

```text
language_learning_web/
├─ .agents/
├─ .github/
│  └─ workflows/
├─ docs/
├─ gas/
│  ├─ Code.gs
│  ├─ appsscript.json
│  └─ README.md
├─ public/
│  └─ data/
│     ├─ languages.json
│     ├─ ja/words.json
│     └─ en/words.json
├─ scripts/
│  ├─ export_google_sheets_json.py
│  ├─ export_words_json.py
│  ├─ json_publish_gui.py
│  ├─ validate_static_json.py
│  └─ 기타 점검 스크립트
├─ src/
│  ├─ components/
│  ├─ features/
│  │  └─ game/
│  ├─ pages/
│  ├─ services/
│  ├─ stores/
│  ├─ test/
│  └─ utils/
├─ AGENTS.md
├─ CHANGELOG.md
├─ project_context.md
├─ PROJECT_STATE.md
├─ ROADMAP.md
├─ TASKS.md
├─ package.json
├─ index.html
└─ vite.config.ts
```

---

## 4. 주요 파일 및 역할

### 4.1 앱 엔트리 / 라우팅

- `src/main.tsx`
  - 앱 부트스트랩
  - GitHub Pages 대응용 라우터 사용

- `src/App.tsx`
  - 전체 라우트 구성
  - 전역 런타임 오류 / unhandled rejection 로깅

- `src/components/ProtectedRoute.tsx`
  - 로그인 상태 확인
  - 인증 유실 시 `/login` 리다이렉트
  - 이탈 원인 로그 기록

### 4.2 화면 파일

- `src/pages/LoginPage.tsx`
  - 로그인

- `src/pages/LanguageSelectPage.tsx`
  - 언어 선택
  - 일본어 / 영어 카드 표시

- `src/pages/HomePage.tsx`
  - 게임 시작 / 연습 / 복습 / 통계 / 전체순위표 진입

- `src/pages/PlayPage.tsx`
  - 실제 게임 진행 핵심
  - 모드별 분기
  - HUD
  - 타이머
  - TTS
  - 저장 로직 호출

- `src/pages/ResultPage.tsx`
  - 결과 요약
  - 재도전 / 연습 / 복습 / 통계 / 홈 이동
  - 개인 순위표 표시

- `src/pages/ReviewPage.tsx`
  - 현재는 예전 리스트형 센터가 아니라 복습 흐름용 보조 페이지 역할
  - 실제 복습 플레이는 `PlayPage`의 `review` 모드가 담당

- `src/pages/StatsPage.tsx`
  - 개인 통계
  - 개인 순위표
  - 전체순위표 이동
  - 내 기록 삭제

- `src/pages/OverallLeaderboardPage.tsx`
  - 전체 사용자 순위표 Top 50

### 4.3 게임 핵심 로직

- `src/features/game/sessionConfig.ts`
  - 품사 / 난이도 / 출제방식 필터
  - 언어별 지원 방식 계산
  - 세션 큐 생성
  - 랜덤 정렬
  - 복습 대상 필터링

- `src/features/game/questionRound.ts`
  - 보기 생성
  - distractor 품질 보정
  - 정답 위치 셔플

- `src/features/game/session.ts`
  - 세션 저장 payload 생성

- `src/features/game/resultState.ts`
  - 결과 페이지 전달 상태 정의

- `src/features/game/mockWords.ts`
  - mock 모드 fallback 데이터

### 4.4 서비스 계층

- `src/services/apiClient.ts`
  - mock / static JSON / GAS 분기
  - 로그인, 메타 로드, 단어 로드, 세션 저장

- `src/services/runtimeConfig.ts`
  - 환경변수 기반 런타임 설정
  - mock/static/GAS 읽기 모드 결정

- `src/services/sessionRecovery.ts`
  - pending session
  - review snapshot
  - leaderboard
  - daily stats
  - session config snapshot

- `src/services/audioFeedback.ts`
  - 정답/오답 피드백 톤
  - 브라우저 TTS
  - 언어별 voice 선택

- `src/services/logger.ts`
  - 콘솔 + localStorage debug log 저장

### 4.5 상태관리 / 유틸

- `src/stores/authStore.ts`
  - 로그인 세션 상태

- `src/stores/languageStore.ts`
  - 선택 언어
  - 언어 메타 로드
  - fallback 언어 유지

- `src/utils/reviewState.ts`
  - 복습 누적 상태 계산

---

## 5. 데이터 구조

## 5.1 정적 JSON 구조

### `public/data/languages.json`

언어 메타 배열:

```json
[
  {
    "language_code": "ja",
    "label": "일본어",
    "total_words": 377
  },
  {
    "language_code": "en",
    "label": "영어",
    "total_words": 598
  }
]
```

### `public/data/{lang}/words.json`

문제 단위 배열:

```json
[
  {
    "word_id": "JA_N_0001",
    "prompt": "携帯",
    "choices": ["핸드폰", "시야", "앱", "구체적이다"],
    "answer": "핸드폰",
    "meaning": "핸드폰",
    "difficulty": "1",
    "question_type": "word_to_meaning"
  }
]
```

영어도 같은 DTO 구조를 사용한다.

---

## 5.2 Google Sheets 구조

### A. 사용자 인증 시트

- 별도 사용자 시트 파일 사용
- 필수 탭:
  - `Users`

`Users`에서 현재 코드가 읽는 대표 컬럼:
- `login_id`
- `password_plain_or_hash` 또는 `password`
- `player_id`
- `display_name` 또는 `nickname`
- `is_active` 또는 `active`

### B. 언어별 master 시트

#### 일본어

- 스프레드시트: `ja master`
- 시트별 품사 분리
- exporter가 기대하는 대표 컬럼:
  - `word_id`
  - `jp_kanji`
  - `jp_furigana`
  - `jp_furigana_2`
  - `meaning_ko_1`
  - `meaning_ko_2`
  - `meaning_ko_3`
  - `difficulty`
  - `is_active`
  - `notes`

#### 영어

- 스프레드시트: `english_master`
- 제공받은 ID:
  - `1bq-dAzc1agAJ2jY05NaT_FNV3mTvcfldb73oEtUWFXM`
- 시트 중 변경점:
  - `な형용사` 제거
  - `い형용사` -> `형용사`
- 모든 품사 시트 공통 헤더:
  - `word_id`
  - `eng_word`
  - `meaning_ko_1`
  - `meaning_ko_2`
  - `meaning_ko_3`
  - `difficulty`
  - `is_active`
  - `notes`
- 영어 word_id 예시:
  - `EN_N_0043`
  - 형용사: `EN_A_0001`

### C. 언어별 record 시트

#### 일본어

- 일본어 record 스프레드시트 사용

#### 영어

- 스프레드시트: `english_record`
- 제공받은 ID:
  - `1Y9zZqUZLpjJPBgULwNGHEC6xvagjOJF4f57y5d3NYks`

공통 기록 탭:
- `Game_Log`
- `Answer_Log`
- `Review_State`
- `Daily_Stats`

현재 GAS는 언어별 record 시트로 위 4개 탭에 append/upsert 한다.

---

## 6. 핵심 로직 설명

### 6.1 데이터 로드 방식

런타임은 다음 우선순위로 동작한다.

1. `static JSON` 사용 가능 시 `public/data/...` 읽기
2. 아니면 GAS 호출
3. 둘 다 불가하면 mock fallback

배포본에서는 mock이 아니라 static JSON + GAS 구조를 쓰는 것이 정상 상태다.

### 6.2 세션 큐 생성

`sessionConfig.ts`가 품사 / 난이도 / 출제방식 기준으로 필터링한 뒤 세션 큐를 만든다.

추가 규칙:
- 기본 플레이: 최대 20문항
- 연습 모드: 해당 조건 문제 전부 1회씩
- 복습 모드: review 대상만 출제
- 문제가 부족할 때만 일부 재사용 허용
- 최근 문항과 같은 단어/의미/prompt가 몰리지 않도록 보정

### 6.3 출제방식 해석

#### 일본어

- prompt에 한자가 있으면 `한자 → 뜻`
- 가나면 `후리가나 → 뜻`
- answer 기준으로 `뜻 → 한자` / `뜻 → 후리가나` 분리
- `음성 → 뜻`은 후리가나 기반 TTS 재생형

#### 영어

- `eng_word` -> `단어 → 뜻`
- `meaning` -> `뜻 → 단어`
- `음성 → 뜻`은 영어 단어 TTS 재생형

### 6.4 보기 생성

`questionRound.ts`가 정답 + distractor를 조합해 4지선다를 만든다.

적용된 보정:
- 정답 누락 방지
- 중복 보기 제거
- 같은 단어군 재사용 억제
- `뜻 -> 단어`에서 표기 계열 우선
- 정답 위치 셔플

### 6.5 저장 흐름

기본 플레이 종료 시:

1. `session.ts`가 저장 payload 생성
2. `apiClient.saveSession()` 호출
3. 실패 시 `pending session` localStorage 저장
4. 홈에서 재저장 가능

연습 모드 / 복습 모드는 통계/순위표 반영 정책이 다르다.

### 6.6 복습 상태

틀린 문제는 `reviewState`에 누적된다.

복습 모드 규칙:
- 틀린 단어 위주 출제
- 누적 정답 5회 달성 시 해당 단어 제거

### 6.7 디버그 로그

갑작스러운 페이지 이탈 추적용 로그가 `localStorage`에 저장된다.

키:
- `study-web-debug-logs`

주요 기록 이벤트:
- 인증 풀림으로 로그인 이동
- 세션 중 필수 상태 사라짐
- 세션 종료 중 상태 부족
- 전역 런타임 오류
- 처리되지 않은 Promise 오류

---

## 7. 현재 구현되지 않은 기능

현재 아직 완성되지 않았거나 후순위인 항목:

- 고급 업적/보상 시스템
- 이미지 문제
- 외부 고품질 TTS 엔진 연동
  - 현재는 브라우저 TTS 사용
- 관리자용 웹 UI
- PWA / 오프라인 모드
- 고급 통계 시각화
- 영어/일본어 외 제3언어 추가
- 실시간 멀티 사용자 경쟁 기능
- 복습 분석 대시보드 고도화

---

## 8. 현재 알려진 운영 주의사항

- `json_publish_gui.local.ini`
  - 로컬 전용 설정 파일
  - Git에 올리면 안 됨

- Google service account JSON
  - 절대 repo 안에 보관하면 안 됨
  - 로컬 비공개 경로에만 보관

- GitHub Pages 배포
  - `main` push 시 자동 배포
  - 배포 환경변수 / GitHub Actions secret 필요

- GAS 반영
  - `gas/Code.gs`를 수정해도 GitHub push만으로는 운영 반영되지 않음
  - Apps Script에 별도 붙여넣기 + 웹앱 재배포 필요

---

## 9. 다음 개발 작업

현재 가장 적절한 다음 작업은 아래 순서다.

1. **실사용 점검 기반 버그 수정**
   - 갑작스러운 게임 종료 / 페이지 전환 로그 확인
   - 실제 플레이에서 발생하는 사례별 수정

2. **영어 흐름 실사용 보정**
   - 영어 형용사/부사 출제 체감 확인
   - 영어 TTS 속도/톤 미세 조정
   - 영어 통계/순위표 저장 흐름 점검

3. **JSON 발행 도구 마감**
   - GUI 미감/배치 추가 정리
   - 일본어/영어 동시 발행 UX 마감

4. **배포/운영 안정화**
   - GitHub Actions static export 흐름 재확인
   - GAS secrets/CI 문서 정리

5. **그 이후 확장**
   - 제3언어 추가
   - 고급 복습 기능
   - 더 나은 TTS 또는 음성 에셋

---

## 10. 다른 Codex가 작업 시작할 때 우선 볼 문서

1. `AGENTS.md`
2. `TASKS.md`
3. `PROJECT_STATE.md` ← 현재 문서
4. 필요 시 `project_context.md`
5. 필요 시 `ROADMAP.md`
6. 최근 맥락이 필요하면 `CHANGELOG.md`

이 프로젝트는 현재 **구현 자체는 많이 진행된 상태**이고, 앞으로는 “대형 신규 기능”보다 “실사용 기반 정리 + 안정화 + 다국어 확장” 중심으로 이어가면 된다.
