# CHANGELOG.md

## 2026-03-17

- Phase 1 MVP 기본 흐름을 구현했다.
- 로그인, 언어 선택, 홈, 플레이, 결과 화면 기본 구조를 추가했다.
- mock API, 세션 payload, Review_State 계산, 기본 테스트 환경을 구성했다.
- 검증: `npm run test`, `npm run build`
- Phase 변경: Phase 1 완료, Phase 2 진행 준비

## 2026-03-17 (2)

- Phase 2 안정화 작업을 진행했다.
- 캐시, fallback, pending session, 로그, 테스트 보강을 추가했다.
- 모바일 UI와 기본 화면 흐름을 정리했다.
- 검증: `npm run test`, `npm run build`
- Phase 변경: Phase 2 완료, Phase 3 전환

## 2026-03-18

- Phase 3 핵심 기능 확장을 진행했다.
- 복습센터, 기본 통계, 연습 모드, 결과 화면 보강을 추가했다.
- `word_to_meaning`, `meaning_to_word` 문제 유형 2종을 반영했다.
- 실연동 준비를 위해 runtimeConfig, apiClient, GAS 스켈레톤, API/시트 문서를 추가했다.
- Google Sheets 설정/배포/실연동 smoke test 문서를 작성했다.
- 플레이/홈/결과/복습/통계/로그인/언어 선택 화면의 한글 문구를 정리했다.
- 주요 테스트 파일과 일부 코드 파일을 UTF-8 기준으로 정리했다.
- 세션 지표 보정, localStorage 테스트 폴리필, 연결 상태 배지, mock 모드 안내를 반영했다.
- 검증: 최근 기준 `npm run test` 34개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - TASKS.md, ROADMAP.md, PROJECT_STATE.md, PROJECT_CONTEXT.md 등 핵심 문서 인코딩 정리 마무리
  - GAS/Google Sheets 실제 구조 최종 확정
  - 실연동 smoke test 준비 유지

## 2026-03-18 (2)

- `PROJECT_CONTEXT.md`, `project_context.md`를 UTF-8 기준으로 복구해 현재 설계/범위 문서를 정상 한글로 읽을 수 있게 정리했다.
- `docs/sheet-schema.md`에 프론트 저장 payload와 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`의 필드별 매핑 표를 추가했다.
- `TASKS.md`의 다음 우선순위를 문서 복구 이후 기준으로 재정렬했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - GAS action별 요청/응답과 실제 시트 탭/헤더 최종 확정
  - 프론트 payload와 시트 컬럼 매핑 실제 운영안 대조

## 2026-03-18 (3)

- `docs/api-spec.md`에 단일 GAS URL + `action` 기반 요청 규칙을 명시하고, `login`, `getMeta`, `getWords`, `saveSession`의 실제 POST JSON 예시와 응답 envelope 예시를 추가했다.
- `TASKS.md`에 API action 형식 재확인 진행 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - Google Sheets 탭 이름과 첫 행 헤더를 실제 운영안 기준으로 확정
  - 프론트 payload와 시트 컬럼 매핑을 실제 시트 구조와 대조

## 2026-03-18 (4)

- `docs/google-sheets-setup-guide.md`를 UTF-8 기준으로 다시 정리하고, `Users`, `Words`, `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`의 권장 탭 이름과 첫 행 헤더를 초보자 기준으로 바로 복사해 쓸 수 있게 정리했다.
- `gas/README.md`를 UTF-8 기준으로 다시 정리하고, GAS 쪽에서 기대하는 시트 구성과 Script Properties를 한글로 읽을 수 있게 복구했다.
- `TASKS.md`에 Google Sheets 탭/헤더 권장안 정리 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 프론트 payload와 실제 시트 컬럼 매핑을 운영안 기준으로 더 좁혀서 확정
  - 실제 연결 전 smoke test 문서와 설정 문서의 표현 차이 최소화

## 2026-03-18 (5)

- `docs/sheet-schema.md`에 `choices` 저장 형식, `Daily_Stats.stat_date` 기준, `practice_session_count` 처리, `session_id` 생성 권장안을 추가해 프론트 payload와 시트 컬럼 매핑 운영 규칙을 더 분명하게 정리했다.
- `TASKS.md`에 payload-시트 매핑 정리 진행 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 GAS 코드가 현재 문서 기준 규칙을 따르도록 차이를 줄이기
  - 실연동 전 smoke test 문서와 API/시트 문서 표현을 맞추기

## 2026-03-18 (6)

- `gas/Code.gs`를 UTF-8 기준으로 다시 정리하고, `일본어` 메타 라벨, `choices` 정규화, `Asia/Seoul` 기준 `stat_date`, `player_id + timestamp` 형태의 `session_id`, `totalQuestions === answerLog.length` 검증을 반영했다.
- GAS 오류 메시지와 시트/프로퍼티 관련 메시지를 정상 한글로 읽을 수 있게 정리했다.
- `TASKS.md`에 GAS 스켈레톤과 문서 기준 저장 규칙 정합화 진행 상태를 반영했다.
- 검증: 코드 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - GAS 코드와 `docs/api-spec.md`, `docs/sheet-schema.md` 사이의 남은 차이를 더 줄이기
  - 실제 실연동 전 smoke test 문서 표현과 현재 GAS 동작 설명 맞추기

## 2026-03-18 (7)

- `docs/api-spec.md`를 UTF-8 기준으로 다시 정리하고, 깨진 예시 문자열을 복구했다.
- API 예시를 현재 `gas/Code.gs` 기준으로 맞춰 `일본어` 라벨, `ねこ` 예시, `SAVE_FAILED` 검증 규칙, `choices` 정규화, `Asia/Seoul` 기준 `stat_date`, `session_id` 생성 규칙을 문서에 반영했다.
- `TASKS.md`에 API 문서와 GAS 스켈레톤 정렬 진행 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - smoke test 문서와 현재 GAS 동작 설명 차이 줄이기
  - 실제 설정 단계에서 필요한 최소 확인 항목을 더 짧게 정리하기

## 2026-03-18 (8)

- `docs/real-connection-smoke-test.md`를 UTF-8 기준으로 다시 정리하고, 현재 GAS 기준으로 로그인, 언어 로드, `choices` 확인, 저장 확인, `Daily_Stats` 확인 순서를 다시 맞췄다.
- `docs/gas-deploy-checklist.md`를 UTF-8 기준으로 다시 정리하고, 실제 배포 전 체크 항목을 현재 시트 구조와 설정 기준으로 읽기 쉽게 복구했다.
- `TASKS.md`에 배포/연결 체크 문서 정렬 진행 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 설정 직전 따라 하기용 짧은 체크 문서 만들기
  - 사용자가 배포 직전에 바로 확인할 최소 항목만 따로 압축 정리하기

## 2026-03-18 (9)

- `docs/gas-5minute-checklist.md`를 추가해 실제 연결 직전 꼭 필요한 시트, 탭, Script Properties, `.env`, 앱 확인 항목, 시트 확인 항목만 한 장으로 압축 정리했다.
- `TASKS.md`에 초간단 체크 문서 추가 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실연동 준비 문서들의 진입점을 한곳으로 묶는 짧은 안내 문서 만들기
  - 사용자가 설정 시작 전에 무엇부터 보면 되는지 더 단순하게 연결하기

## 2026-03-18 (10)

- `docs/gas-docs-start-here.md`를 추가해 처음 준비, 배포 직전, 연결 후 점검, API/시트 구조 확인 상황별로 어떤 문서를 먼저 봐야 하는지 한곳에서 안내하도록 정리했다.
- `TASKS.md`에 실연동 문서 진입점 안내 문서 추가 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 사용자가 설정을 시작할 때 따라야 할 순서를 더 단순하게 다듬기
  - 필요하면 README에서 새 진입 문서로 연결 추가하기

## 2026-03-18 (11)

- `README.md`를 UTF-8 기준으로 다시 정리하고, `실연동 시작 안내` 섹션을 추가해 새 `gas-docs-start-here.md`와 주요 연결 문서로 바로 들어갈 수 있게 했다.
- `TASKS.md`에 README 진입점 유지 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 연결 단계에서 시트 생성 또는 Script Properties 입력을 순서대로 같이 진행하기
  - 사용자가 설정을 시작하면 문서 대신 실제 클릭 순서 중심으로 안내하기

## 2026-03-18 (12)

- `docs/gas-click-by-click-guide.md`를 추가해 Apps Script 프로젝트 열기, `Code.gs` 붙여넣기, `appsscript.json` 맞추기, Script Properties 입력, Web App 배포, `.env` 연결까지를 클릭 순서대로 정리했다.
- `docs/gas-docs-start-here.md`에도 새 클릭 순서 문서를 연결했다.
- `TASKS.md`에 실제 클릭 순서 문서 추가 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 사용자가 원할 때 실제 시트 생성 또는 Script Properties 입력을 순서대로 같이 진행하기
  - 실연동 시작 시 문서 대신 실제 단계별 안내로 전환하기

## 2026-03-18 (13)

- `docs/gas-connection-values-template.md`를 추가해 Spreadsheet ID, Script Properties, Web App URL, `.env`, 테스트 계정, 첫 확인 결과를 한곳에 적어둘 수 있게 정리했다.
- `docs/gas-docs-start-here.md`에도 값 정리용 템플릿 문서를 연결했다.
- `TASKS.md`에 값 정리 템플릿 추가 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 사용자가 실제 설정을 시작하면 문서보다 단계별 실제 안내로 전환하기
  - 필요하면 다음 턴부터 Script Properties 입력부터 같이 진행하기

## 2026-03-18 (14)

- 사용자 요청으로 언어별 파일 구조를 `user`, `japanese_master`, `japanese_record` 방향으로 보고, `japanese_master`의 다중 품사 시트 구조와 `Game_Log`의 `language_code` 제거 방향을 [sheet-schema.md](D:/smx_coding_d/language_learning_web/docs/sheet-schema.md), [api-spec.md](D:/smx_coding_d/language_learning_web/docs/api-spec.md)에 먼저 반영했다.
- 이 세션에서는 사용자가 적어준 로컬 엑셀 경로 파일을 직접 열 수 없어, 실제 헤더 본문 검증은 아직 완료하지 못했다는 점도 문서에 메모했다.
- `TASKS.md`에 사용자 요청 기준 시트 구조 변경 반영 상태를 기록했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 엑셀 본문을 읽을 수 있게 되면 헤더와 시트 이름을 직접 대조하기
  - 문서 기준 변경 사항을 실제 GAS 코드와 문제 생성 로직에 반영할 범위를 다시 좁히기

## 2026-03-18 (15)

- 업로드된 실제 `user.xlsx`, `japanese_master.xlsx`, `japanese_record.xlsx`를 직접 읽어 시트 이름과 1행/2행 헤더 구조를 확인했다.
- [sheet-schema.md](D:/smx_coding_d/language_learning_web/docs/sheet-schema.md)를 실제 업로드본 기준으로 다시 정리해 `Users`, 다중 품사 master 시트, `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`의 실제 machine key를 반영했다.
- [Code.gs](D:/smx_coding_d/language_learning_web/gas/Code.gs)를 실제 업로드본 구조에 맞춰 2행 machine key 기반 읽기, 다중 master 시트 병합, `password_plain_or_hash` / `display_name` 로그인 매핑, record 시트 key 기반 저장 매핑으로 보강했다.
- `TASKS.md`에 실제 Excel 헤더 기준 대조 반영 상태를 기록했다.
- 검증: 업로드된 Excel 헤더 읽기, 코드/문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 프론트 문제 생성 로직이 새 master 구조와 품사/방식 선택을 반영하도록 범위를 좁히기
  - 실제 GAS 배포 전 Script Properties 입력부터 같이 진행하기

## 2026-03-18 (16)

- 프론트 세션 저장 payload에 `modeType`, `quizType`, `answerLog[].questionType`, `answerLog[].shownPrompt`를 추가해 실제 `Game_Log`, `Answer_Log` 열과 더 정확히 맞췄다.
- [Code.gs](D:/smx_coding_d/language_learning_web/gas/Code.gs)도 위 값을 기본값 대신 우선 사용하도록 보강하고, 저장 payload에 모드 정보가 없으면 `SAVE_FAILED`로 막도록 검증을 추가했다.
- [api-spec.md](D:/smx_coding_d/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/language_learning_web/docs/sheet-schema.md), [TASKS.md](D:/smx_coding_d/language_learning_web/TASKS.md)를 현재 저장 구조 기준으로 다시 맞췄다.
- 검증: 세션 payload/문서/GAS 매핑 코드 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - `response_time_ms`, `difficulty_snapshot`, `study_minutes`처럼 아직 비어 있는 record 필드를 후속 범위로 분리하기
  - 실제 GAS Web App 배포 후 첫 저장 smoke test로 row 기록 상태를 직접 확인하기

## 2026-03-18 (17)

- 프론트 플레이 흐름에서 세션 시작 시각과 문항 시작 시각을 추적해 `totalTimeSec`, `answerLog[].responseTimeMs`를 저장 payload에 포함하도록 보강했다.
- [Code.gs](D:/smx_coding_d/language_learning_web/gas/Code.gs)에서 `Game_Log.total_time_sec`, `Answer_Log.response_time_ms`에 위 값을 그대로 기록하도록 수정했다.
- [api-spec.md](D:/smx_coding_d/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/language_learning_web/docs/sheet-schema.md), [TASKS.md](D:/smx_coding_d/language_learning_web/TASKS.md)를 현재 저장 구조 기준으로 다시 맞췄다.
- 검증: `npm run test` 34개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `difficulty_snapshot`, `study_minutes`처럼 아직 기본값인 record 필드를 후속 범위로 분리하기
  - 실제 GAS Web App 배포 후 첫 저장 smoke test로 row 기록 상태를 직접 확인하기

## 2026-03-18 (18)

- `WordItem`에 `difficulty`를 추가하고, 세션 저장 payload에 `answerLog[].difficultySnapshot`을 포함해 `Answer_Log.difficulty_snapshot`에 실제 값을 기록하도록 보강했다.
- `Daily_Stats.study_minutes`는 `totalTimeSec` 기준 `Math.ceil(totalTimeSec / 60)`로 집계하도록 조정했다.
- [api-spec.md](D:/smx_coding_d/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/language_learning_web/docs/sheet-schema.md), [TASKS.md](D:/smx_coding_d/language_learning_web/TASKS.md)를 현재 저장 구조 기준으로 다시 맞췄다.
- 검증: `npm run test` 34개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 GAS Web App 배포 후 `Game_Log`, `Answer_Log`, `Daily_Stats` row가 의도대로 채워지는지 smoke test로 확인하기
  - 이후 필요하면 `difficulty_snapshot` 표현 방식과 `study_minutes` 집계 정책을 더 세밀하게 조정하기

## 2026-03-18 (19)

- [real-connection-smoke-test.md](D:/smx_coding_d/language_learning_web/docs/real-connection-smoke-test.md)를 현재 구조 기준으로 다시 맞춰 `Users.password_plain_or_hash`, `Users.is_active`, 일본어 다중 품사 master 시트, `Game_Log` / `Answer_Log` / `Daily_Stats` 실제 확인 열을 구체적으로 적었다.
- [gas-5minute-checklist.md](D:/smx_coding_d/language_learning_web/docs/gas-5minute-checklist.md)도 `Words` 단일 탭 기준에서 일본어 다중 품사 master 기준으로 고치고, `total_time_sec`, `shown_prompt`, `response_time_ms`, `difficulty_snapshot`, `study_minutes` 확인 포인트를 추가했다.
- [TASKS.md](D:/smx_coding_d/language_learning_web/TASKS.md)를 현재 smoke test 문서 정렬 상태 기준으로 갱신했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 GAS Web App 배포 후 문서 순서대로 첫 저장 smoke test를 진행하기
  - 배포가 시작되면 `Script Properties` 입력부터 실제 클릭 순서대로 같이 진행하기

## 2026-03-18 (20)

- 실제 `user.xlsx`를 다시 확인한 결과 현재 계정은 `demo / 1234`가 아니라 `songmanx / 8686`, `quilt3 / 2446` 구조임을 확인했다.
- [LoginPage.tsx](D:/smx_coding_d/language_learning_web/src/pages/LoginPage.tsx)에서 실연동 모드일 때 demo 기본값을 넣지 않도록 바꾸고, 로그인 실패 시 오류 문구를 화면에 직접 보여주도록 수정했다.
- [src/test/setup.ts](D:/smx_coding_d/language_learning_web/src/test/setup.ts)에서 테스트 환경은 항상 mock 모드로 고정해 `.env`의 실연동 값 때문에 테스트가 흔들리지 않도록 정리했다.
- [LoginPage.test.tsx](D:/smx_coding_d/language_learning_web/src/pages/LoginPage.test.tsx)에 로그인 실패 메시지 표시 테스트를 추가했다.
- 검증: `npm run test` 35개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 앱에서는 `songmanx / 8686` 또는 `quilt3 / 2446`로 로그인 성공 여부를 먼저 확인하기
  - 로그인 성공 후 `getMeta`, `getWords`, `saveSession` 순서로 실제 시트 저장 smoke test를 진행하기

## 2026-03-18 (21)

- 브라우저 실연동 모드에서 `application/json` 요청으로 인한 GAS Web App CORS preflight 문제를 피하기 위해 [apiClient.ts](D:/smx_coding_d/language_learning_web/src/services/apiClient.ts)의 전송 헤더를 `text/plain;charset=utf-8`로 변경했다.
- 실제 Web App URL에 `songmanx / 8686` 요청을 직접 보내 확인한 결과, 이 전송 방식에서는 로그인 응답이 정상적으로 돌아오는 것을 확인했다.
- [apiClient.test.ts](D:/smx_coding_d/language_learning_web/src/services/apiClient.test.ts)와 [api-spec.md](D:/smx_coding_d/language_learning_web/docs/api-spec.md)를 현재 브라우저 전송 규칙 기준으로 갱신했다.
- 검증: `npm run test` 35개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 사용자가 앱을 새로고침한 뒤 실제 계정으로 로그인 재시도하기
  - 로그인 성공 후 `getMeta`, `getWords`, `saveSession` 순서로 실제 시트 저장 smoke test를 진행하기

## 2026-03-18 (22)

- `src/features/game/questionRound.ts`에서 `meaning_to_word` 문제의 보기를 전체 단어 목록에서 다시 만들지 않고 현재 문제 DTO의 `choices`를 그대로 사용하도록 고쳤다.
- `src/pages/LanguageSelectPage.tsx`, `src/pages/HomePage.tsx` 흐름을 조정해 언어 선택 직후 홈으로 먼저 이동하고 단어 로드는 백그라운드 또는 진입 시점에 이어서 처리하도록 바꿔 버튼 클릭 후 체감 지연을 줄였다.
- `src/features/game/questionRound.test.ts`, `src/pages/LanguageSelectPage.test.tsx`, `src/pages/PlayPage.test.tsx`로 보기 정합성과 진입 흐름 회귀를 확인하도록 정리했다.
- 검증: `npm run test` 36개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 GAS 실연동 상태에서 언어 선택 후 첫 문제 진입 체감 속도와 저장 성공 여부를 한 번 더 확인하기
  - 이후에는 품사 선택/방식 선택 UI를 현재 master 구조 기준으로 단계적으로 연결하기

## 2026-03-18 (23)

- `PROJECT_STATE.md`를 현재 코드 기준으로 전면 재작성해, 다른 PC의 Codex가 현재 구현 기능, 폴더 구조, 주요 파일 역할, Google Sheets 구조, 핵심 로직, 미구현 범위, 다음 작업을 한 번에 이어받을 수 있게 정리했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 실연동 저장 검증과 출제 흐름 보강은 계속 `TASKS.md` 기준으로 진행

## 2026-03-18 (24)

- [api-spec.md](D:/smx_coding_d/learning/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/learning/language_learning_web/docs/sheet-schema.md)를 현재 [Code.gs](D:/smx_coding_d/learning/language_learning_web/gas/Code.gs) 기준으로 다시 맞춰, `choices`가 master 시트 컬럼이 아니라 GAS 생성값이라는 점과 `Daily_Stats.study_minutes`가 `Math.ceil(totalTimeSec / 60)` 누적값이라는 점을 명시했다.
- 요청 방향 문서에 남아 있던 audio 문제는 아직 구현되지 않은 범위라는 점을 현재 구현 상태 기준으로 분리해 적었다.
- [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 위 문서 정렬 상태를 작업 메모로 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 GAS Web App 기준 `login`, `getMeta`, `getWords`, `saveSession` smoke test를 실행해 문서와 실제 응답을 최종 대조하기
  - 이후 품사 선택/방식 선택 UI를 현재 master 구조 기준으로 단계적으로 연결하기

## 2026-03-18 (25)

- 실제 `.env`에 연결된 GAS Web App URL로 `text/plain;charset=utf-8` 요청을 보내 `login`, `getMeta`, `getWords`, 최소 `saveSession` smoke test를 실행했다.
- 확인 결과 `songmanx / 8686` 로그인 응답, `일본어 / total_words: 94` 메타 응답, 일본어 문제 DTO 목록 응답, 최소 practice 세션 저장 응답이 모두 정상적으로 돌아왔다.
- [PROJECT_STATE.md](D:/smx_coding_d/learning/language_learning_web/PROJECT_STATE.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 현재 확인 완료 범위와 아직 남은 실제 row 확인 범위를 반영했다.
- 검증: 실제 GAS Web App `login`, `getMeta`, `getWords`, `saveSession` 응답 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 Google Sheets에서 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` row가 의도대로 기록됐는지 직접 확인하기
  - 이후 프론트 실제 플레이 1회 기준 end-to-end 저장 흐름까지 연결해서 검증하기


## 2026-03-18 (26)

- [scripts/export_google_sheets_json.py](D:/smx_coding_d/learning/language_learning_web/scripts/export_google_sheets_json.py)를 추가해 Google Sheets master 데이터를 현재 GAS와 비슷한 문제 DTO 규칙으로 public/data/languages.json, public/data/ja/words.json에 내보낼 수 있게 했다.
- [.github/workflows/export-static-json.yml](D:/smx_coding_d/learning/language_learning_web/.github/workflows/export-static-json.yml)을 추가해 GitHub Actions에서 서비스 계정 JSON과 master sheet id secret을 받아 정적 JSON을 주기적으로 갱신하고, 변경 시 자동 commit/push 하도록 구성했다.
- [src/services/apiClient.ts](D:/smx_coding_d/learning/language_learning_web/src/services/apiClient.ts), [src/services/runtimeConfig.ts](D:/smx_coding_d/learning/language_learning_web/src/services/runtimeConfig.ts), [src/components/AppShell.tsx](D:/smx_coding_d/learning/language_learning_web/src/components/AppShell.tsx)을 수정해 로그인/저장은 GAS를 유지하면서 getMeta, getWords는 정적 JSON을 선택적으로 읽을 수 있게 했다.
- [.env.example](D:/smx_coding_d/learning/language_learning_web/.env.example), [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [docs/json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [PROJECT_STATE.md](D:/smx_coding_d/learning/language_learning_web/PROJECT_STATE.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 운영 흐름과 사용 방법을 반영했다.
- 검증: `npm run test` 38개 통과, `npm run build` 통과, Python 런타임 미설치로 exporter 직접 실행 검증은 미실시
- Phase 변경: 없음
- 다음 작업 메모:
  - Python exporter 문법 확인 후 프론트 테스트와 빌드를 다시 돌리기
  - GitHub Secrets 설정 후 Actions 첫 실행으로 public/data 생성 여부를 확인하기




## 2026-03-18 (27)

- 현재 배포된 GAS Web App의 getMeta, getWords 응답으로 [public/data/languages.json](D:/smx_coding_d/learning/language_learning_web/public/data/languages.json), [public/data/ja/words.json](D:/smx_coding_d/learning/language_learning_web/public/data/ja/words.json) 초기 정적 JSON 스냅샷을 생성했다.
- [.env](D:/smx_coding_d/learning/language_learning_web/.env)를 정적 JSON 읽기 모드로 전환해 로그인/저장은 GAS를 유지하고, 메타/단어 읽기는 /data 정적 파일을 우선 사용하도록 맞췄다.
- [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md), [PROJECT_STATE.md](D:/smx_coding_d/learning/language_learning_web/PROJECT_STATE.md)에 현재 초기 스냅샷 생성 상태를 반영했다.
- 검증: `npm run test` 38개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - GitHub Actions 자동 갱신이 같은 JSON 구조를 계속 덮어쓰는지 확인하기
  - 실제 앱에서 첫 로드 체감 속도와 저장 동작을 함께 확인하기




## 2026-03-18 (28)

- [src/pages/HomePage.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/HomePage.tsx)에 정적 JSON 읽기 + GAS 저장 모드 안내 문구를 추가해 현재 데이터 읽기 방식을 홈에서 바로 알 수 있게 했다.
- [src/services/apiClient.test.ts](D:/smx_coding_d/learning/language_learning_web/src/services/apiClient.test.ts)에 getMeta()의 정적 JSON 경로 테스트를 추가해 /data/languages.json 회귀를 막았다.
- [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 위 진행 상태를 작업 메모로 반영했다.
- 검증: `npm run test` 39개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 브라우저에서 첫 로드 체감 속도와 저장 동작을 함께 확인하기
  - GitHub Actions 자동 갱신이 현재 JSON 구조를 그대로 유지하는지 확인하기




## 2026-03-18 (29)

- [src/pages/PlayPage.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/PlayPage.tsx)에서 마지막 문제 이후 saveSession 완료를 기다리지 않고 [ResultPage](D:/smx_coding_d/learning/language_learning_web/src/pages/ResultPage.tsx)로 먼저 이동하도록 바꿨다.
- 저장 상태는 saving -> saved/pending으로 결과 화면에서 갱신되도록 조정해 마지막 클릭 뒤 멈춰 보이던 구간을 줄였다.
- [src/features/game/resultState.ts](D:/smx_coding_d/learning/language_learning_web/src/features/game/resultState.ts), [src/pages/PlayPage.test.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/PlayPage.test.tsx)도 현재 흐름 기준으로 맞췄다.
- 검증: 
pm run test 39개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 브라우저에서 마지막 문제 클릭 후 결과 전환 체감이 개선됐는지 확인하기
  - GitHub Actions 자동 갱신이 현재 JSON 구조를 그대로 유지하는지 확인하기

## 2026-03-18 (30)

- [scripts/validate_static_json.py](D:/smx_coding_d/learning/language_learning_web/scripts/validate_static_json.py)를 추가해 `public/data/languages.json`, `public/data/ja/words.json`의 최소 구조를 검증할 수 있게 했다.
- [.github/workflows/export-static-json.yml](D:/smx_coding_d/learning/language_learning_web/.github/workflows/export-static-json.yml)에 exporter 다음 단계로 JSON 검증을 추가해 깨진 정적 파일이 자동 commit 되지 않도록 보강했다.
- [docs/json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 검증 흐름을 반영했다.
- 검증: `validate_static_json.py` 로컬 실행 통과 (`total_words: 94`, `question_count: 377`)
- Phase 변경: 없음
- 다음 작업 메모:
  - GitHub Actions 수동 실행 후 exporter + validator + auto commit 흐름을 확인하기
  - 실제 브라우저에서 현재 정적 JSON 모드의 첫 로드 체감과 저장 흐름을 다시 확인하기

## 2026-03-18 (31)

- [.github/workflows/export-static-json.yml](D:/smx_coding_d/learning/language_learning_web/.github/workflows/export-static-json.yml)에 `GOOGLE_SERVICE_ACCOUNT_JSON`, `JA_MASTER_SHEET_ID` 누락 시 초반에 명확히 실패하는 secret 체크 단계를 추가했다.
- [docs/json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [README.md](D:/smx_coding_d/learning/language_learning_web/README.md)에 GitHub Actions 자동 갱신에 필요한 secret 이름과 `Workflow permissions > Read and write permissions` 설정을 명시했다.
- [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 위 GitHub 설정 준비 상태를 반영했다.
- 검증: workflow/doc 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 사용자가 GitHub secret 2개와 workflow write 권한을 설정한 뒤 workflow를 수동 실행하기
  - 실행 결과에서 exporter -> validator -> auto commit 흐름이 모두 통과하는지 확인하기



## 2026-03-18 (32)

- [src/services/apiClient.ts](D:/smx_coding_d/learning/language_learning_web/src/services/apiClient.ts)에 GAS 연결 warm-up GET 요청을 추가해 로그인 전에 연결을 미리 깨우도록 했다.
- [src/pages/LoginPage.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/LoginPage.tsx)에서 로그인 화면 진입 시 `apiClient.warmupConnection()`을 호출하도록 연결했다.
- [src/services/apiClient.test.ts](D:/smx_coding_d/learning/language_learning_web/src/services/apiClient.test.ts)에 warm-up GET 회귀 테스트를 추가했다.
- 검증: `npm run test` 40개 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 브라우저에서 로그인 버튼 이후 대기 시간이 줄었는지 확인하기
  - GitHub Actions 자동 갱신이 현재 JSON 구조를 그대로 유지하는지 확인하기

## 2026-03-18 (33)

- [src/pages/LoginPage.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/LoginPage.tsx)에서 로그인 성공 직후 `loadMeta()`를 바로 시작해 언어 선택 화면 진입 전에 메타 선로딩이 시작되도록 조정했다.
- [src/stores/languageStore.ts](D:/smx_coding_d/learning/language_learning_web/src/stores/languageStore.ts)에 언어 메타 in-flight promise 재사용과 중복 로드 방지를 추가해 로그인 직후와 언어 선택 화면 진입 시 같은 요청이 두 번 가지 않도록 보강했다.
- [src/pages/LoginPage.test.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/LoginPage.test.tsx), [src/stores/languageStore.test.ts](D:/smx_coding_d/learning/language_learning_web/src/stores/languageStore.test.ts)에 선로딩/중복 방지 회귀 테스트를 추가했다.
- 검증: `npm run test -- src/pages/LoginPage.test.tsx src/stores/languageStore.test.ts` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 브라우저에서 로그인 버튼 이후 언어 선택 화면 전환 대기 시간이 더 줄었는지 확인하기
  - GitHub Actions 자동 갱신이 현재 JSON 구조를 그대로 유지하는지 확인하기

## 2026-03-18 (34)

- [.github/workflows/export-static-json.yml](D:/smx_coding_d/learning/language_learning_web/.github/workflows/export-static-json.yml)의 GitHub Actions 버전을 `actions/checkout@v5`, `actions/setup-python@v6`로 올려 Node 20 deprecation 경고 대응 기반을 맞췄다.
- 같은 workflow의 `--language-label` 값을 다시 정리해 export 단계에서 한글 라벨이 깨진 상태로 남지 않도록 보강했다.
- 검증: workflow 파일 내용 확인 (`actions/checkout@v5`, `actions/setup-python@v6`, `일본어` 포함 여부 확인)
- Phase 변경: 없음
- 다음 작업 메모:
  - GitHub Actions를 다시 한 번 수동 실행해 경고/실패 없이 exporter -> validator -> auto commit 흐름이 유지되는지 확인하기
  - 실제 시트 row 반영과 JSON 자동 갱신 주기 운영 방식을 점검하기

## 2026-03-18 (35)

- [scripts/run_gas_smoke_test.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_gas_smoke_test.mjs)를 추가해 현재 `.env`의 `VITE_GAS_BASE_URL`과 CLI 계정값으로 `login -> getMeta -> getWords -> saveSession` smoke test를 한 번에 실행할 수 있게 했다.
- [package.json](D:/smx_coding_d/learning/language_learning_web/package.json)에 `npm run smoke:gas -- --login-id ... --password ...` 실행 스크립트를 추가했다.
- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 새 smoke test 명령 진입점을 연결했다.
- 검증: `npm run smoke:gas -- --help` 사용법 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 계정으로 `npm run smoke:gas -- --login-id ... --password ...`를 실행해 시트 row 반영 전 단계까지 한 번에 확인하기
  - 그 다음 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 시트 row 반영 여부를 직접 대조하기

## 2026-03-18 (36)

- [run_gas_smoke_test.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_gas_smoke_test.mjs)를 문서의 테스트 계정(`test` / `1234`)으로 실제 실행해 현재 배포된 GAS Web App 실연동 상태를 다시 확인했다.
- smoke 결과는 `login ok (u001)`, `getMeta ok (일본어 / 94)`, `getWords ok (377)`, `saveSession ok (saved: true)`였다.
- 검증: `npm run smoke:gas -- --login-id test --password 1234` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 시트에 이번 smoke 실행 row가 실제로 기록됐는지 직접 확인하기
  - 기록 row가 맞으면 실연동 검증 준비 항목의 시트 반영 확인 범위를 문서에 더 좁혀 반영하기

## 2026-03-18 (37)

- [live-connection-order.md](D:/smx_coding_d/learning/language_learning_web/docs/live-connection-order.md)를 현재 실연동 순서와 smoke test 기준으로 다시 작성해 깨진 인코딩 상태를 정리했다.
- [gas-click-by-click-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-click-by-click-guide.md)의 오래된 필드명(`password`, `active`, `Words`, `choices`)과 잘못된 문서 링크를 현재 구조 기준으로 수정했다.
- [README.md](D:/smx_coding_d/learning/language_learning_web/README.md)에 현재 운영 모드, smoke test 성공 상태, `smoke:gas` 스크립트, 실연동 문서 링크 최신화를 반영했다.
- 검증: 문서 파일 내용 및 링크 문자열 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 시트의 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` row 반영 여부를 직접 확인하고 문서의 확인 포인트를 더 좁혀 적기
  - 필요하면 시트 확인 결과를 템플릿 문서에 바로 기록해 이후 재검증 시간을 줄이기

## 2026-03-18 (38)

- [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)에 현재 `.env` 값과 smoke test 성공 결과를 기록하고, 시트에서 바로 찾을 기대값(`u001`, `ja`, `94`, `377`, `practice`, `10`, `JA_N_0001`)을 추가했다.
- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 현재 smoke 예시 결과와 각 시트 탭별 구체적인 확인 값 예시를 보강했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 실제 시트 4개 탭에서 위 기대값과 맞는 row가 들어갔는지 확인하기
  - 확인 결과를 템플릿 문서의 저장 여부 항목에 실제 값으로 채워 넣기

## 2026-03-18 (39)

- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)를 추가해 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`의 최신 row가 smoke 기대값과 맞는지 CLI로 검증할 수 있게 했다.
- [package.json](D:/smx_coding_d/learning/language_learning_web/package.json)에 `npm run verify:record` 명령을 추가했고, [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 실행 예시를 연결했다.
- 검증: `python -m py_compile scripts/verify_record_sheet_state.py` 통과, `npm run verify:record -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 서비스 계정 JSON 파일 경로와 `JA_RECORD_SHEET_ID`로 `npm run verify:record -- --credentials ... --spreadsheet-id ...`를 실행해 실제 시트 최신 row를 확인하기
  - 확인 결과를 템플릿 문서의 저장 여부 메모에 실제 값으로 기록하기

## 2026-03-18 (40)

- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)를 추가해 `smoke:gas`와 `verify:record`를 한 번에 실행하는 통합 실연동 점검 흐름을 만들었다.
- [package.json](D:/smx_coding_d/learning/language_learning_web/package.json)에 `npm run check:live`를 추가했고, [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 실행 예시를 연결했다.
- 검증: `npm run check:live -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 서비스 계정 JSON 경로와 record 시트 ID를 넣어 `npm run check:live -- --login-id test --password 1234 --credentials ... --spreadsheet-id ...`를 실행하기
  - 시트 확인 결과를 템플릿 문서에 실제 값으로 채워 넣기

## 2026-03-18 (41)

- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)가 `docs/gas-connection-values-template.md`의 기본 테스트 계정/record 시트 ID와 `GOOGLE_SERVICE_ACCOUNT_PATH`, `JA_RECORD_SHEET_ID` 환경변수를 읽도록 보강했다.
- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)도 `GOOGLE_SERVICE_ACCOUNT_PATH`, `JA_RECORD_SHEET_ID`, `VERIFY_*` 환경변수를 읽도록 바꿔 매번 긴 인자를 덜 치게 했다.
- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 환경변수 기반 짧은 실행 예시를 추가했다.
- 검증: `npm run check:live -- --help` 출력 확인, `npm run verify:record -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `GOOGLE_SERVICE_ACCOUNT_PATH`만 잡고 `npm run check:live`로 실제 row 검증까지 한 번에 실행하기
  - 검증 결과를 템플릿 문서의 저장 여부 메모에 채워 넣기

## 2026-03-18 (42)

- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)에 `--report-file` 옵션과 기본 출력 경로 `docs/live-check-latest.json`을 추가해 실제 row 검증 결과를 JSON 파일로 저장할 수 있게 했다.
- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)가 통합 점검 시 `verify:record`에 같은 report 경로를 넘기도록 연결했다.
- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 결과 저장 파일 위치를 안내했다.
- 검증: `python -m py_compile scripts/verify_record_sheet_state.py` 통과, `npm run verify:record -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `GOOGLE_SERVICE_ACCOUNT_PATH` 설정 후 `npm run check:live`를 실제 실행해 `docs/live-check-latest.json` 생성 여부와 검증 결과를 확인하기
  - 그 결과를 템플릿 문서 저장 여부 메모에 반영하기

## 2026-03-18 (43)

- [sync_live_check_report.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/sync_live_check_report.mjs)를 추가해 `docs/live-check-latest.json` 검증 결과를 [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)의 저장 여부 메모로 자동 반영할 수 있게 했다.
- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)가 `smoke -> verify -> sync` 3단계 흐름을 순서대로 실행하도록 확장됐다.
- [package.json](D:/smx_coding_d/learning/language_learning_web/package.json)에 `sync:live-report`를 추가했고, [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 자동 반영 결과를 안내했다.
- 검증: `npm run sync:live-report -- --help` 출력 확인, `npm run check:live -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `GOOGLE_SERVICE_ACCOUNT_PATH`만 설정하고 `npm run check:live`를 실제 실행해 row 검증과 문서 자동 반영까지 끝내기
  - 자동 반영된 문서 메모를 기준으로 실제 시트 상태를 확정하기

## 2026-03-18 (44)

- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)가 중간 단계 실패 시에도 `docs/live-check-latest.json`에 `failed_stage`, `error_message`를 기록하고, 가능한 경우 템플릿 메모 동기화까지 시도하도록 보강했다.
- 검증: `npm run check:live -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `npm run check:live`를 다시 실제 실행해 실패/성공 어떤 경우든 `docs/live-check-latest.json`이 남는지 확인하기
  - 생성된 결과 파일 기준으로 실연동 상태를 확정하기

## 2026-03-19 (45)

- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)가 Windows에서 `npm` 실행 시 `npm.cmd`를 사용하도록 바꿔 PowerShell의 `spawn npm ENOENT` 문제를 해결했다.
- 검증: `npm run check:live -- --help` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - PowerShell에서 `npm run check:live`를 다시 실행해 실제 smoke -> verify -> sync 단계가 이어지는지 확인하기
  - 생성된 `docs/live-check-latest.json` 기준으로 실연동 상태를 확정하기

## 2026-03-19 (46)

- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)와 [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)가 프로젝트 루트의 service account JSON 파일을 자동 감지하도록 보강했다.
- 검증: `npm run check:live -- --help` 통과, `python -m py_compile scripts/verify_record_sheet_state.py` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 루트의 JSON 파일을 그대로 둔 상태에서 `npm run check:live`를 다시 실행해 실제 row 검증과 문서 반영이 이어지는지 확인하기
  - 생성된 `docs/live-check-latest.json` 기준으로 실연동 상태를 확정하기

## 2026-03-19 (47)

- [run_full_connection_check.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_full_connection_check.mjs)의 하위 프로세스 실행을 Windows에서 셸 기반으로 바꿔 `spawn EINVAL` 문제를 줄였다.
- 검증: `npm run check:live -- --help` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - PowerShell에서 `npm run check:live`를 다시 실행해 실제 smoke -> verify -> sync 단계가 이어지는지 확인하기
  - 생성된 `docs/live-check-latest.json` 기준으로 실연동 상태를 확정하기

## 2026-03-19 (48)

- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)가 `googleapiclient` 계열 패키지가 없을 때 `requirements-json-export.txt`를 자동 설치한 뒤 계속 진행하도록 보강했다.
- 검증: `python -m py_compile scripts/verify_record_sheet_state.py` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - PowerShell에서 `npm run check:live`를 다시 실행해 `verify:record` 자동 설치 후 실제 row 검증까지 이어지는지 확인하기
  - 생성된 `docs/live-check-latest.json` 기준으로 실연동 상태를 확정하기

## 2026-03-19 (49)

- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)의 403 권한 오류를 `japanese_record` 시트를 서비스 계정 이메일과 공유해야 한다는 더 직접적인 안내 메시지로 바꿨다.
- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)에 `verify:record`는 `japanese_record`도 서비스 계정과 공유되어야 한다는 점을 명시했다.
- 검증: `python -m py_compile scripts/verify_record_sheet_state.py` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - `japanese_record` 시트를 서비스 계정 이메일과 공유한 뒤 `npm run check:live`를 다시 실행하기
  - 생성된 `docs/live-check-latest.json` 기준으로 실연동 상태를 확정하기

## 2026-03-19 (50)

- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)의 `Review_State` 검증 기준을 실제 시트 스키마에 맞게 `status`와 `priority_score` 중심으로 조정했고, 콘솔 UTF-8 출력도 보강했다.
- [sync_live_check_report.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/sync_live_check_report.mjs)를 깨끗하게 다시 작성해 `docs/live-check-latest.json` 결과를 [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)에 정확히 반영하도록 정리했다.
- 실제 검증 결과: `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 모두 기대값 기준 통과, 템플릿 메모도 모두 `성공`으로 갱신됐다.
- 검증: `npm run verify:record -- --credentials language-learning-web-490613-24f6ee1e065d.json --spreadsheet-id 1hhQxfszQD3ZdZnYuoNjWrRMymktaJ0ctgXp54aFIFF0 --player-id u001 --word-id JA_N_0001 --mode-type practice --score 10 --language-code ja --report-file docs/live-check-latest.json` 통과, `npm run sync:live-report -- --report-file docs/live-check-latest.json --template-file docs/gas-connection-values-template.md` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - Phase 3 남은 항목인 `Review/Stats 로컬 스냅샷 구조와 실제 시트 저장 구조 최종 대조`를 문서 기준으로 마무리하기
  - Google Sheets -> 정적 JSON 자동 생성 흐름 안정화 범위에서 운영 문서와 검증 절차를 더 간단하게 정리하기

## 2026-03-19 (51)

- [sheet-schema.md](D:/smx_coding_d/learning/language_learning_web/docs/sheet-schema.md)에 `Local Snapshot vs Record Sheet` 섹션을 추가해 `ReviewPage`, `StatsPage`가 현재 실제 record 시트 재조회가 아니라 localStorage snapshot을 기준으로 동작한다는 점을 명시했다.
- `ReviewSnapshot.reviewState[].lastResult`는 현재 `Review_State` 시트에 직접 저장되지 않는 UI 미리보기용 필드이고, `DailyStatsSnapshot.practiceSessionCount`, `totalScore`, `averageAccuracy`, `lastPlayedAt`도 현재 `Daily_Stats`와 1:1 매핑되지 않는 로컬 집계 필드라는 점을 문서에 정리했다.
- [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에서 `Review/Stats 로컬 스냅샷 구조와 실제 시트 저장 구조 최종 대조` 항목을 완료 처리하고 현재 작업 메모를 갱신했다.
- 검증: 관련 코드(`src/pages/PlayPage.tsx`, `src/services/sessionRecovery.ts`, `src/pages/ReviewPage.tsx`, `src/pages/StatsPage.tsx`)와 문서 대조
- Phase 변경: 없음
- 다음 작업 메모:
  - Google Sheets -> 정적 JSON 자동 생성 흐름 안정화 범위에서 운영 문서와 검증 절차를 더 단순하게 정리하기
  - Phase 3 문서들에서 실제 운영 기준과 UI 로컬 snapshot 기준을 계속 분리해 유지하기

## 2026-03-19 (52)

- [package.json](D:/smx_coding_d/learning/language_learning_web/package.json)에 `npm run export:json`, `npm run validate:json` 스크립트를 추가해 정적 JSON export/검증을 더 짧게 실행할 수 있게 했다.
- [export-static-json.yml](D:/smx_coding_d/learning/language_learning_web/.github/workflows/export-static-json.yml)의 일본어 라벨 값을 다시 `일본어`로 고쳐 workflow 한글 인코딩 흔들림을 줄였다.
- [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md)를 준비물, 로컬 실행, 프론트 연결, GitHub Actions 자동화 순서로 다시 정리해 정적 JSON 운영 절차를 더 짧고 초보자 기준으로 읽기 쉽게 만들었다.
- [README.md](D:/smx_coding_d/learning/language_learning_web/README.md)에 새 스크립트와 정적 JSON 운영 문서 진입점을 반영했다.
- 검증: `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - GitHub Actions 기준 정적 JSON 자동 갱신이 계속 안정적으로 유지되는지만 주기적으로 확인하기
  - Phase 3 문서 중 실제 운영 절차와 테스트 절차를 더 짧게 줄일 수 있는 부분을 이어서 정리하기

## 2026-03-19 (53)

- [run_static_json_refresh.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_static_json_refresh.mjs)를 추가해 `export:json -> validate:json`를 한 번에 실행하는 로컬 정적 JSON 갱신 흐름을 만들었다.
- [package.json](D:/smx_coding_d/learning/language_learning_web/package.json)에 `npm run refresh:json` 스크립트를 추가했다.
- [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 통합 명령을 반영했다.
- 검증: `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 정적 JSON 갱신은 앞으로 `refresh:json` 기준으로 반복 실행하고, GitHub Actions 자동 갱신과 결과 일치만 계속 확인하기

## 2026-03-19 (54)

- [run_static_json_refresh.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_static_json_refresh.mjs)가 프로젝트 루트의 service account JSON 파일과 [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)의 JA Master Sheet ID를 자동 감지하도록 보강했다.
- 현재 작업 환경에서는 별도 인자 없이도 `npm run refresh:json`만으로 `export:json -> validate:json`를 이어서 실행할 수 있게 됐다.
- [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 기본 실행 방식 반영.
- 검증: `npm run build` 통과, `npm run refresh:json -- --help` 출력 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 정적 JSON 갱신은 `npm run refresh:json` 한 줄 기준으로 운영하고, 이후에는 GitHub Actions 자동 갱신 결과와 로컬 결과가 같은지만 유지 확인하기

## 2026-03-19 (55)

- [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 `npm run refresh:json`은 로컬 `public/data` 갱신 전용이고, GitHub auto commit/push는 `Export Static JSON` workflow가 담당한다는 점을 명확히 적었다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 정적 JSON 로컬 갱신과 GitHub Actions 자동 갱신의 역할을 계속 분리해 유지하기

## 2026-03-19 (56)

- [static-json-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/static-json-ops-quickref.md)를 추가해 `npm run refresh:json`과 `Actions > Export Static JSON`의 역할 차이를 한 장으로 바로 볼 수 있게 정리했다.
- [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 quick reference 진입점을 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 남은 Phase 3 범위에서는 실제 운영 문서를 계속 짧게 줄이되, 기능 추가보다 운영 혼동 제거를 우선하기

## 2026-03-19 (57)

- [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)를 추가해 `smoke:gas`, `verify:record`, `check:live`의 역할 차이를 한 장으로 바로 볼 수 있게 정리했다.
- [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 quick reference 진입점을 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 남은 Phase 3 범위에서는 실제 운영 명령과 문서 진입점을 더 줄이는 방향으로 계속 정리하기

## 2026-03-19 (58)

- [gas-docs-start-here.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-docs-start-here.md)를 현재 운영 기준으로 다시 작성해 문서 진입점을 `정적 JSON`, `실연동`, `상세 설정` 3갈래로 줄였다.
- 예전의 잘못된 절대 경로 표기와 과도한 단계 나열을 정리하고, quick reference 문서 중심으로 시작할 수 있게 바꿨다.
- [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 위 정리 상태를 반영했다.
- 검증: 문서 내용 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - 남은 Phase 3 범위에서는 실제로 자주 쓰는 문서만 남기고, 나머지는 상세 참고 문서 역할로 더 분리하기

## 2026-03-19 (59)

- [run_static_json_refresh.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_static_json_refresh.mjs)에 실제 help 모드를 추가해 `npm run refresh:json -- --help` 실행 시 export/validate를 돌리지 않고 사용법만 출력하도록 정리했다.
- [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md), [static-json-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/static-json-ops-quickref.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 help 사용 예시를 반영했다.
- 검증: `npm run refresh:json -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - Phase 3 남은 범위에서는 실제로 자주 쓰는 운영 명령의 기본 동작과 도움말을 계속 다듬되, 기능 추가보다 사용 흐름 단순화를 우선하기

## 2026-03-19 (60)

- [run_gas_smoke_test.mjs](D:/smx_coding_d/learning/language_learning_web/scripts/run_gas_smoke_test.mjs)가 `docs/gas-connection-values-template.md`의 테스트 계정 기본값을 읽도록 보강해 현재 작업 환경에서는 `npm run smoke:gas` 한 줄만으로 API smoke를 바로 실행할 수 있게 했다.
- [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md), [README.md](D:/smx_coding_d/learning/language_learning_web/README.md), [TASKS.md](D:/smx_coding_d/learning/language_learning_web/TASKS.md)에 새 기본 실행 방식을 반영했다.
- 검증: `npm run smoke:gas -- --help` 출력 확인, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실연동 운영 명령 3개(`smoke:gas`, `verify:record`, `check:live`)를 현재처럼 기본값 기반으로 유지하면서, 이후에는 기능 범위 쪽 다음 작은 작업을 다시 잡기

## 2026-03-19 (61)

- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)의 `Review_State` 확인 기준을 예전 `last_result`, `review_stage` 중심 설명에서 실제 시트 스키마의 `status`, `priority_score`, count 계열 중심 설명으로 수정했다.
- 기본값 기반 `npm run smoke:gas`를 실제로 다시 실행해 `player_id=u001`, `일본어 94`, `377문항`, `saveSession saved:true`까지 재확인했다.
- 검증: `npm run smoke:gas` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 남은 Phase 3 범위에서는 실제 문서 기준과 실연동 명령 기본값이 계속 어긋나지 않게 유지하면서, 이후 기능 범위의 다음 작은 작업을 다시 잡기


## 2026-03-19 (62)

- [verify_record_sheet_state.py](D:/smx_coding_d/learning/language_learning_web/scripts/verify_record_sheet_state.py)가 [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)의 JA Record Sheet ID와 기대 기본값을 읽도록 보강해 현재 작업 환경에서는 `npm run verify:record` 한 줄만으로 record 시트 4개 탭 검증을 바로 실행할 수 있게 했다.
- 기본값 기반 `npm run verify:record`를 실제로 다시 실행해 Game_Log, Answer_Log, Review_State, Daily_Stats가 모두 ok: true로 통과하는 것을 재확인했다.
- 검증: `npm run verify:record` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 실연동 운영 명령 3개(`smoke:gas`, `verify:record`, `check:live`)를 현재처럼 기본값 기반으로 유지하면서, 이후에는 기능 범위의 다음 작은 작업을 다시 잡기

## 2026-03-19 (63)

- [PlayPage.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/PlayPage.tsx)에 답안 입력 잠금을 추가해 답안을 빠르게 여러 번 눌러도 중복 처리되지 않도록 보강했다.
- [PlayPage.test.tsx](D:/smx_coding_d/learning/language_learning_web/src/pages/PlayPage.test.tsx)에 연타 시 `saveSession`이 한 번만 호출되는 테스트를 추가했다.
- 검증: `npm run test -- src/pages/PlayPage.test.tsx` 통과, `npm run build` 통과
- Phase 변경: 없음
- 다음 작업 메모:
  - 남은 Phase 3 범위에서는 출제/플레이 흐름의 작은 안정화 작업을 계속 쪼개서 진행하고, 큰 게임성 개편은 다음 범위로 넘기기

## 2026-03-19 (64)

- [.gitignore](D:/smx_coding_d/learning/language_learning_web/.gitignore)를 추가해 `node_modules`, `dist`, `.env`, service account JSON, Python cache, 로컬 temp 결과 파일이 Git 추적 대상에 섞이지 않도록 정리했다.
- 검증: 파일 작성 확인
- Phase 변경: 없음
- 다음 작업 메모:
  - push 전에 이미 추적 중인 민감 파일이 있는지 확인하고, 필요하면 `cached`에서 제거한 뒤 동기화 진행
## 2026-03-19 (65)

- Git 인덱스에서 `.env`, service account JSON, `docs/live-check-latest.json`, `dist/`, `node_modules/`를 `git rm --cached`로 정리해 `.gitignore` 규칙이 실제로 적용되도록 맞췄다.
- 로컬 파일은 유지한 채 추적만 해제했으며, staged 변경 수 기준으로 기존에 잘못 추적되던 파일 약 9,196건이 정리 대상으로 잡힌 것을 확인했다.
- 검증 `git ls-files` 확인, `git status --short | Measure-Object`
- Phase 변경 없음
- 다음 작업 메모:
  - staged 삭제 목록을 한 번 더 확인한 뒤 커밋 단위를 정리하고 push 전에 민감 파일이 다시 추적되지 않는지 재확인
