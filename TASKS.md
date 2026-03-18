# TASKS.md

## 현재 진행 Phase

Phase 3: 핵심 기능 확장

## Phase 목표

플레이 이후 학습 흐름을 끊지 않도록 복습센터, 연습 모드, 기본 통계, 결과 화면 보강을 안정적으로 제공한다.  
실제 GAS/Google Sheets 연동 전까지는 mock 기반 흐름과 문서, 화면 문구, 테스트 안정성을 먼저 정리한다.

## 이번 Phase에서 완료된 항목

- 복습센터 화면 구현 및 우선순위 정렬 표시
- 연습 모드 진입 흐름 구현
- 기본 통계 화면 구현
- 결과 화면 CTA 및 복습 상태 미리보기 보강
- `word_to_meaning`, `meaning_to_word` 2종 문제 유형 반영
- 세션 저장 실패 시 pending session 임시 저장/재저장 흐름 구현
- mock/real 런타임 분기 및 상단 연결 상태 표시 추가
- 홈, 로그인, 언어 선택, 플레이, 결과, 복습, 통계 화면의 한글 문구 정리
- 주요 테스트 파일 UTF-8 정리 및 테스트 안정화
- GAS 스켈레톤, API 문서, Google Sheets 준비 문서 초안 작성
- 실제 record 시트 열에 맞춰 세션 저장 payload의 mode/quiz/question/prompt 매핑 보강
- 실제 record 시트 열에 맞춰 세션 저장 payload의 시간 정보 매핑 보강
- 실제 record 시트 열에 맞춰 difficulty/study time 매핑 보강
- 실제 smoke test 문서를 현재 다중 품사 master / record 열 기준으로 재정렬
- 실연동 모드 로그인 UX 보강 및 테스트 환경 mock 고정
- 브라우저 실연동 요청의 GAS CORS preflight 회피 처리
- `뜻 -> 단어` 문제에서 현재 문제의 단어 보기만 쓰도록 보정
- 언어 선택 직후 홈으로 먼저 이동하고 단어 로드는 백그라운드로 돌려 진입 체감 속도 보정
- 실제 배포된 GAS Web App 기준 `login`, `getMeta`, `getWords`, `saveSession` smoke test 및 record 시트 4개 탭 row 반영 검증 완료

## 이번 Phase에서 아직 남은 핵심 작업

- GAS/Google Sheets 실제 시트 구조 확정
- Google Sheets -> 정적 JSON 자동 생성 흐름 안정화
- Phase 3 산출물 기준 문서 최신화 유지

## 바로 다음 작업 우선순위

### 1. 실연동 준비 마무리
- GAS action별 요청/응답 형식 재확인 및 예시 고정
- Google Sheets 탭/헤더 권장안 문서 기준 확정
- 프론트 payload와 시트 컬럼 매핑 운영 규칙 정리
- GAS 스켈레톤에 문서 기준 저장 규칙 반영 시작
- API 문서 예시를 현재 GAS 스켈레톤 기준으로 정렬
- 사용자 요청 기준 master/record 시트 구조 변경 사항 문서 반영
- 업로드된 실제 Excel 헤더 기준 문서/가스 매핑 대조 반영

### 2. 실연동 검증 준비
- mock 모드와 GAS 모드 전환 체크리스트 유지
- 실제 연결 후 smoke test 순서 검증
- 배포/연결 체크 문서를 현재 GAS 동작 기준으로 정렬
- 실제 설정 직전용 초간단 체크 문서 추가
- 실연동 문서 진입점 안내 문서 추가
- 실제 클릭 순서 문서 추가
- 시트 ID / 배포 URL / 테스트 계정 값 정리 템플릿 추가

### 3. 문서 최신화 유지
- 핵심 문서 UTF-8 상태 유지
- API/시트 문서와 실제 구현 차이 발생 시 바로 반영
- README에서 실연동 시작 문서 진입점 유지

## 현재 확인 기준

- `npm run test` 통과
- `npm run build` 통과
- `npm run smoke:gas -- --login-id test --password 1234` 통과
- `npm run verify:record -- --credentials ... --spreadsheet-id ...` 기준 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 모두 통과
- 로그인 → 언어 선택 → 홈 → 플레이 → 결과 → 복습/통계 흐름 동작
- pending session 재저장 동작
- 복습 상태/기본 통계 화면 표시 확인

## 보류 또는 다음 Phase로 넘길 항목

- 고급 통계 시각화
- 이미지 문제
- 듣기 모드 고도화
- 자기채점 작문 완성형
- 업적 시스템
- 다국어 실제 확장
- 관리자 UI
- PWA

## 현재 작업 메모

- 현재 앱 동작과 테스트는 안정적이다.
- 최근 작업은 사용자 노출 한글 문구, 테스트 인코딩, 핵심 문서 UTF-8 복구에 집중했다.
- 최근에는 API action 형식과 시트 매핑 문서도 실제 프론트 기준으로 더 구체화했다.
- 최근에는 Google Sheets 탭 이름과 첫 행 헤더 권장안도 문서 기준으로 다시 정리했다.
- 최근에는 `choices`, `Daily_Stats`, `session_id` 운영 규칙도 문서 기준으로 더 좁혀 정리했다.
- 최근에는 GAS 스켈레톤에도 `Asia/Seoul` 날짜 규칙, `session_id`, `choices` 정규화, payload 검증을 반영하기 시작했다.
- 최근에는 API 문서 예시도 현재 GAS 스켈레톤 기준으로 다시 정리했다.
- 최근에는 smoke test 문서와 배포 체크 문서도 현재 GAS 동작 기준으로 다시 정리했다.
- 최근에는 실제 설정 직전용 `5분 체크리스트`도 추가했다.
- 최근에는 실연동 문서들의 진입점을 한곳으로 묶는 안내 문서도 추가했다.
- 최근에는 README에서도 실연동 시작 문서로 바로 들어갈 수 있게 연결을 추가했다.
- 최근에는 실제 클릭 순서대로 따라 하는 문서도 추가했다.
- 최근에는 시트 ID, 배포 URL, 테스트 계정 값을 적어둘 템플릿도 추가했다.
- 최근에는 사용자 요청 기준으로 다중 품사 master 시트 구조와 `Game_Log` 열 변경 방향도 문서에 반영했다.
- 최근에는 업로드된 실제 Excel 헤더를 직접 읽어 user/master/record 구조를 문서와 GAS에 반영했다.
- 최근에는 세션 저장 payload에도 `modeType`, `quizType`, `questionType`, `shownPrompt`를 실어 실제 record 시트와 더 정확히 맞추기 시작했다.
- 최근에는 `totalTimeSec`, `responseTimeMs`도 세션 저장 payload와 GAS 기록에 연결해 `total_time_sec`, `response_time_ms` 기본값 의존을 줄였다.
- 최근에는 `difficulty`, `difficultySnapshot`, `study_minutes`도 실제 값 기반으로 연결해 `difficulty_snapshot`, `study_minutes` 기본값 의존을 더 줄였다.
- 최근에는 API/시트 문서에서 `choices` 생성 방식, `study_minutes` 집계, 미구현 audio 방향 설명을 현재 `gas/Code.gs` 동작 기준으로 다시 맞췄다.
- 최근에는 smoke test 문서도 `password_plain_or_hash`, `is_active`, 다중 품사 master 시트, 실제 record 열 확인 기준으로 다시 맞췄다.
- 최근에는 실연동 모드 로그인 화면이 demo 기본값에 묶이지 않도록 수정했고, 로그인 실패 시 오류 문구가 화면에 보이게 정리했다.
- 최근에는 GAS Web App 브라우저 요청이 `Failed to fetch`로 막히지 않도록 `text/plain;charset=utf-8` 전송 방식으로 조정했다.
- 최근에는 `뜻 -> 단어` 문제의 보기 생성이 뜻/단어를 섞지 않도록 현재 DTO의 `choices`만 쓰게 고쳤다.
- 최근에는 언어 선택 직후 홈으로 먼저 이동하고 단어를 백그라운드로 불러오도록 바꿔 버튼 클릭 후 체감 지연을 줄였다.
- 최근에는 로그인 화면 진입 시 GAS warm-up 요청을 먼저 보내고, 로그인 성공 직후 언어 메타도 선로딩해 로그인 버튼 이후 대기 체감을 더 줄이도록 보강했다.
- 최근에는 정적 JSON 자동 갱신 workflow의 액션 버전을 `actions/checkout@v5`, `actions/setup-python@v6`로 올리고, export 단계의 언어 라벨 인코딩도 다시 정리했다.
- 최근에는 `.env`의 GAS URL과 테스트 계정으로 `login -> getMeta -> getWords -> saveSession`를 한 번에 확인하는 로컬 smoke test 스크립트도 추가했다.
- 최근에는 실제 배포된 GAS Web App에 `login`, `getMeta`, `getWords`, 최소 `saveSession` smoke test를 보내 응답 성공까지 확인했다.
- 최근에는 문서에 적어 둔 테스트 계정(`test` / `1234`)으로 새 smoke script를 실제 실행해 `u001`, `일본어 94`, `377문항`, `saveSession saved:true`까지 다시 확인했다.
- 최근에는 깨진 [live-connection-order.md](D:/smx_coding_d/learning/language_learning_web/docs/live-connection-order.md)를 현재 구조 기준으로 다시 썼고, `gas-click-by-click-guide.md`, `README.md`의 오래된 필드명/문서 링크도 정리했다.
- 최근에는 `gas-connection-values-template.md`, `real-connection-smoke-test.md`에도 현재 smoke 결과 기대값(`u001`, `94`, `377`, `practice`, `10`, `JA_N_0001`)을 적어 실제 시트 row 대조 기준을 더 구체화했다.
- 최근에는 `verify_record_sheet_state.py`와 `npm run verify:record`를 추가해 record 시트 4개 탭 최신 row를 CLI로 바로 검증할 수 있게 했다.
- 최근에는 `check:live` 통합 명령도 추가해 `smoke:gas -> verify:record`를 한 번에 실행할 수 있게 했다.
- 최근에는 `check:live`와 `verify:record`가 문서 템플릿 기본값과 `GOOGLE_SERVICE_ACCOUNT_PATH`, `JA_RECORD_SHEET_ID` 환경변수를 읽도록 보강해 실제 실행 입력량을 더 줄였다.
- 최근에는 `verify:record` 결과를 `docs/live-check-latest.json`에도 저장하도록 보강해 실제 row 검증 결과를 파일로 남길 수 있게 했다.
- 최근에는 `sync:live-report`를 추가하고 `check:live` 마지막 단계에서 자동 실행되게 해서, 검증 결과가 `gas-connection-values-template.md` 저장 여부 메모에도 자동 반영되도록 만들었다.
- 최근에는 `check:live`가 중간 단계에서 실패해도 `live-check-latest.json`에 실패 단계와 오류 메시지를 남기고, 템플릿 메모도 가능한 범위까지 갱신하도록 보강했다.
- 최근에는 Windows PowerShell에서 `spawn npm ENOENT`로 막히지 않도록 `check:live` 내부 실행기를 `npm.cmd` 대응으로 보강했다.
- 최근에는 프로젝트 루트의 service account JSON 파일도 자동 감지하게 해서 `GOOGLE_SERVICE_ACCOUNT_PATH` 없이도 `check:live`, `verify:record`가 바로 실행될 수 있게 보강했다.
- 최근에는 Windows 환경에서 `spawn EINVAL`로 막히지 않도록 `check:live` 내부 프로세스 실행을 셸 기반으로 보강했다.
- 최근에는 `verify:record` 실행 시 `googleapiclient`가 없으면 `requirements-json-export.txt`를 자동 설치한 뒤 계속 진행하도록 보강했다.
- 최근에는 `verify:record`의 403 권한 오류를 `japanese_record` 시트를 서비스 계정 이메일과 공유해야 한다는 안내 문구로 더 직접적으로 바꿨다.
- 최근에는 실제 `japanese_record` 시트 공유 후 `verify:record`를 다시 실행해 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`가 모두 기대값 기준으로 통과하는 것을 확인했다.
- 최근에는 `ReviewPage`, `StatsPage`가 실제 record 시트 재조회 대신 로컬 snapshot을 읽는 구조라는 점과, `lastResult`, `practiceSessionCount`, `totalScore`, `averageAccuracy`, `lastPlayedAt`가 현재 UI 보조 필드라는 점을 `docs/sheet-schema.md`에 정리했다.
- public/data 초기 JSON 스냅샷을 현재 배포된 GAS 응답으로 생성했고, `.env`도 정적 JSON 읽기 모드로 전환했다.
- 홈 화면에 정적 JSON 읽기 모드 안내를 추가했고, `apiClient.getMeta()`의 정적 JSON 경로 테스트도 보강했다.
- GitHub Actions에서 exporter 직후 정적 JSON 구조를 검사하도록 validation 스크립트와 검증 단계를 추가했다.
- 최근에는 `npm run export:json`, `npm run validate:json` 스크립트를 추가하고 `json-export-workflow.md`를 더 짧은 운영 절차 중심으로 다시 정리해 정적 JSON 갱신 흐름을 단순화했다.
- 최근에는 `npm run refresh:json` 통합 명령도 추가해 로컬에서는 export와 validate를 한 번에 끝낼 수 있게 정리했다.
- 최근에는 `refresh:json`이 프로젝트 루트의 service account JSON과 템플릿 문서의 JA Master Sheet ID를 자동으로 읽도록 보강해 현재 작업 환경에서는 `npm run refresh:json` 한 줄만으로 갱신/검증이 가능해졌다.
- 최근에는 `refresh:json`은 로컬 `public/data` 갱신 전용이고, GitHub auto commit/push는 `Export Static JSON` workflow가 담당한다는 점도 문서와 README에 명확히 적었다.
- 최근에는 로컬 갱신과 GitHub 자동 갱신의 차이를 한 장으로 보는 `static-json-ops-quickref.md`도 추가해 운영 기준을 더 빠르게 확인할 수 있게 했다.
- 최근에는 `refresh:json -- --help`가 실제 도움말만 출력하고 export/validate를 돌리지 않도록 정리해 운영 명령 동작도 더 직관적으로 맞췄다.
- 최근에는 `smoke:gas`, `verify:record`, `check:live`의 역할 차이를 한 장으로 보는 `live-ops-quickref.md`도 추가해 실연동 운영 기준을 더 빠르게 확인할 수 있게 했다.
- 최근에는 `smoke:gas`도 템플릿 문서의 테스트 계정 기본값을 자동으로 읽도록 보강해 현재 작업 환경에서는 `npm run smoke:gas` 한 줄만으로 API smoke를 바로 돌릴 수 있게 했다.
- 최근에는 `verify:record`도 템플릿 문서의 JA Record Sheet ID와 기대값을 자동으로 읽도록 보강했고, 실제로 `npm run verify:record` 기본 실행이 record 시트 4개 탭 모두 ok: true로 통과하는 것도 다시 확인했다.
- 최근에는 `real-connection-smoke-test.md`의 `Review_State` 확인 기준도 실제 시트 스키마(`status`, `priority_score`, count 계열) 기준으로 다시 맞췄고, `npm run smoke:gas` 기본 실행이 실제로 `u001`, `94`, `377`, `saved:true`까지 다시 통과하는 것도 확인했다.
- 최근에는 `gas-docs-start-here.md`도 현재 기준으로 다시 정리해 이제는 `정적 JSON`, `실연동`, `상세 설정` 3갈래로만 문서 진입점을 보게 줄였다.
- 최근에는 `PlayPage`에서 답안 클릭 직후 즉시 입력 잠금을 걸어 빠른 연타가 중복 처리되지 않도록 보강했고, `saveSession`이 한 번만 호출되는 테스트도 추가했다.
- 현재 `validate_static_json.py` 실행 기준 `languages.json total_words: 94`, `words.json question_count: 377` 검증 통과 상태다.
- GitHub Actions 시작 전에 필요한 secret 2개와 workflow write 권한 설정도 문서와 workflow 초반 체크에 반영했다.
- 다음 턴부터는 GitHub Actions 자동 갱신과 실제 앱 체감 속도 확인을 같이 진행하는 작업이 가장 효율적이다.








