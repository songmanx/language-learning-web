# AI Foreign Language Learning Game Web

모바일 게임 감성의 외국어 학습 웹앱이다.  
정적 웹(React) + Google Apps Script + Google Sheets 구조로 운영한다.

## 한 줄 설치 명령어

```bash
npm install
```

## 실행 환경

- Frontend: React + Vite + TypeScript
- State: Zustand
- UI: Tailwind CSS + Framer Motion
- Charts: Recharts
- Test: Vitest + React Testing Library
- Backend substitute: Google Apps Script Web App
- Data source / record store: Google Sheets
- Deploy: Cloudflare Pages (primary), GitHub Pages (backup)
- Local OS target: Windows 10/11

## 현재 상태

- Phase 1 MVP 기본 흐름 구현 완료
- Phase 2 안정화 / 테스트 완료
- 현재 Phase 3 핵심 기능 확장 진행 중
- 복습센터 기본 화면과 연습 모드 진입 흐름 구현 완료
- 현재 기본 운영 모드는 `정적 JSON 읽기 + GAS 로그인/저장` 구조다
- 실제 배포된 GAS Web App 기준 `login`, `getMeta`, `getWords`, `saveSession` smoke test 성공 상태다

## 프로젝트 핵심 정보

- 브라우저에서 대부분의 게임 로직, 점수 계산, 복습 계산을 처리한다.
- GAS는 인증, 원본 데이터 JSON 제공, 기록 저장만 담당한다.
- 첫 지원 언어는 일본어다.
- 앞으로 여러 언어를 추가할 수 있도록 설계한다.
- 사용자 정보는 `lang_user_sheet`라는 별도 Google Sheet에서 관리한다.
- 언어별로 Google Sheet 2개를 사용한다.
  - 원본 시트 파일 1개
  - 기록 시트 파일 1개

## 현재 구현 범위

- 로그인 화면
- 언어 선택 화면
- 홈 화면
- 기본 게임 플레이 화면
- 결과 화면
- 복습센터 기본 화면
- 연습 모드 진입 흐름
- 점수 / 하트 / 콤보 계산
- 세션 종료 payload 생성
- Review_State 계산 유틸
- Vitest + React Testing Library 테스트

## 이번 버전에서 제외 또는 후순위

- 이미지 문제 고도화
- 듣기 모드 고도화
- 자기채점 작문 완성형
- 업적 전체 구현
- 고급 통계 화면
- 다국어 추가
- 관리자 전용 웹 UI

## 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 테스트 실행
```bash
npm run test
```

### 4. 빌드
```bash
npm run build
```

## 현재 package scripts

- `dev`: vite
- `build`: tsc -b && vite build
- `preview`: vite preview
- `test`: vitest run
- `test:watch`: vitest
- `export:json`: Google Sheets master -> 정적 JSON export
- `validate:json`: 생성된 정적 JSON 최소 구조 검증
- `refresh:json`: 정적 JSON export + validate 한 번에 실행
- `smoke:gas`: 현재 `.env`의 GAS URL로 실연동 smoke test 실행
- `verify:record`: record 시트 4개 탭 최신 row 검증
- `check:live`: `smoke:gas -> verify:record -> sync` 통합 점검

## 검증 결과

- `npm install` 성공
- `npm run test` 성공
- `npm run build` 성공
- `npm run smoke:gas -- --login-id test --password 1234` 성공

## 외부 연동 정보

### GAS API

현재 연결 구조:

- 읽기: `getMeta`, `getWords`는 정적 JSON 또는 GAS
- 쓰기/인증: `login`, `saveSession`은 GAS

예상 엔드포인트:
- `login`
- `getMeta`
- `getWords`
- `saveSession`
- `getStats`

### Google Sheets
- `lang_user_sheet`: 사용자 인증 정보 저장
- `lang_ja_master_sheet`: 일본어 원본 데이터
- `lang_ja_record_sheet`: 일본어 기록 데이터

## 수정 및 확장 방법

### 새 언어 추가
1. 새 원본 시트 생성
2. 새 기록 시트 생성
3. GAS의 `Language_Config` 또는 Script Properties에 매핑 추가
4. 프론트 언어 선택 목록 갱신
5. 데이터 로더 테스트

### 새 문제 유형 추가
1. `src/features/game/`에 로직 추가
2. `questionGenerator` 확장
3. `PlayPage` UI 반영
4. 테스트 추가
5. TASKS.md / CHANGELOG.md 갱신

## 파일 구조 요약

- `src/pages/`: 화면 단위
- `src/components/`: 재사용 UI
- `src/features/`: 기능별 로직
- `src/services/`: 외부 연동 / 로컬 저장 / 로깅
- `src/stores/`: 글로벌 상태 관리
- `src/utils/`: 계산 유틸
- `gas/`: Google Apps Script 코드
- `docs/`: API, 시트 스키마, 게임 규칙 문서
- `.agents/skills/`: Codex 스킬팩

## 로그 / 설정 / 주의사항

- 이 프로젝트는 `setting.ini`를 기본 설정 파일로 사용하지 않는다.
- 프론트 설정은 `.env` 또는 Vite 환경변수로 처리한다.
- 로그는 프론트 `logger.ts`와 브라우저 콘솔 기준으로 관리한다.
- 가능하면 아래 이벤트를 남긴다.
  - 실행 시작
  - 주요 데이터 로드
  - 저장 요청
  - 오류 발생
  - 작업 완료

## 외부 수정 요청 시 전달해야 할 핵심 정보

외부 개발자 또는 AI에게 요청할 때 아래 정보를 함께 전달한다.

- 현재 Phase
- 현재 TASKS.md의 다음 작업
- 사용 기술 스택
- 브라우저 계산 중심 구조
- GAS는 인증/원본 제공/기록 저장만 담당
- `lang_user_sheet` 별도 운영
- 첫 언어는 일본어
- 모바일 우선 UI
- 문서 우선순위: AGENTS.md > TASKS.md > ROADMAP.md > project_context.md > README.md

## API 연결 설정

실제 GAS Web App을 붙일 때는 `.env.example`을 참고해 `.env` 파일을 만들고 아래 값을 설정한다.

```bash
VITE_GAS_BASE_URL=https://your-gas-web-app-url
VITE_GAS_USE_MOCK=false
VITE_STATIC_DATA_META_URL=
VITE_STATIC_DATA_WORDS_BASE_PATH=
```

현재 프론트 구현 기준:
- 단일 Web App URL로 `POST` 요청을 보낸다.
- 요청 body에 `action` 필드를 포함한다.
- 현재 사용 action: `login`, `getMeta`, `getWords`, `saveSession`
- 상세 DTO와 응답 envelope은 `docs/api-spec.md`를 기준으로 맞춘다.

정적 JSON 읽기 가속 모드를 쓰려면:

```bash
VITE_GAS_BASE_URL=https://your-gas-web-app-url
VITE_GAS_USE_MOCK=false
VITE_STATIC_DATA_META_URL=/data/languages.json
VITE_STATIC_DATA_WORDS_BASE_PATH=/data
```

이 모드에서는 로그인/저장은 GAS를 쓰고, 언어 메타/단어 읽기는 `public/data`의 JSON을 직접 읽는다.

## 실연동 시작 안내

처음이면 아래 문서부터 보면 가장 쉽다.

- [gas-docs-start-here.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-docs-start-here.md)

현재 기준 가장 짧은 시작 순서:

1. 시트/GAS를 처음 준비할 때: [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)
2. 배포 직전 빠른 점검: [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)
3. 배포 후 실제 저장 확인: [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)

현재 문서 기준 핵심 운영 원칙:

- 일본어 master workbook은 `Words` 단일 탭이 아니라 `명사`, `동사`, `い형용사`, `な형용사`, `부사`, `기타` 같은 source 시트를 묶어 읽는다.
- GAS는 `word_id`, `jp_kanji` machine key가 있는 시트를 source 시트로 인식한다.
- 시트 헤더는 가능하면 `1행 표시명 / 2행 machine key / 3행부터 데이터` 구조로 맞추는 것이 현재 구현과 가장 잘 맞는다.

상황별 추천 문서:

- 시트부터 준비할 때: [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)
- 배포 직전 5분 체크: [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)
- 배포 전 상세 체크: [gas-deploy-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-deploy-checklist.md)
- 연결 순서 빠르게 보기: [live-connection-order.md](D:/smx_coding_d/learning/language_learning_web/docs/live-connection-order.md)
- 연결 후 동작 확인: [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)
- 실연동 운영 요약표: [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)
- 정적 JSON 자동 생성: [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md)

정적 JSON 갱신만 빠르게 다시 볼 때는 이 문서 하나만 보면 된다.

- [static-json-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/static-json-ops-quickref.md)

실연동 명령만 빠르게 다시 볼 때는 이 문서 하나만 보면 된다.

- [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)

GitHub Actions 자동 갱신을 쓰려면 저장소 설정에서 아래 두 가지가 필요하다.

- Repository secret: `GOOGLE_SERVICE_ACCOUNT_JSON`
- Repository secret: `JA_MASTER_SHEET_ID`
- `Settings > Actions > General > Workflow permissions > Read and write permissions`

PowerShell에서 실연동 통합 점검을 실행할 때는 아래처럼 환경변수를 잡는다.

```bash
$env:GOOGLE_SERVICE_ACCOUNT_PATH="D:\smx_coding_d\learning\language_learning_web\language-learning-web-490613-24f6ee1e065d.json"
npm run check:live
```

정적 JSON만 다시 갱신할 때는 현재 프로젝트 기준으로 아래 한 줄이면 된다.

```bash
npm run refresh:json
```

이 명령은 로컬의 `public/data`만 갱신한다.
GitHub 자동 업로드까지 하려면 `Actions > Export Static JSON` workflow를 써야 한다.

현재 프로젝트 기본값으로 실연동 API만 빠르게 확인할 때는 아래 한 줄이면 된다.

```bash
npm run smoke:gas
```



