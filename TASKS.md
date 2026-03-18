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

## 이번 Phase에서 아직 남은 핵심 작업

- GAS/Google Sheets 실제 시트 구조 확정
- 실제 GAS Web App 요청/응답과 프론트 연동 검증
- Review/Stats 로컬 스냅샷 구조와 실제 시트 저장 구조 최종 대조
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
- 최근에는 실제 배포된 GAS Web App에 `login`, `getMeta`, `getWords`, 최소 `saveSession` smoke test를 보내 응답 성공까지 확인했다.
- 아직 실제 시트의 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` row 반영 여부 직접 확인은 남아 있다.
- public/data 초기 JSON 스냅샷을 현재 배포된 GAS 응답으로 생성했고, `.env`도 정적 JSON 읽기 모드로 전환했다.
- 홈 화면에 정적 JSON 읽기 모드 안내를 추가했고, `apiClient.getMeta()`의 정적 JSON 경로 테스트도 보강했다.
- GitHub Actions에서 exporter 직후 정적 JSON 구조를 검사하도록 validation 스크립트와 검증 단계를 추가했다.
- 현재 `validate_static_json.py` 실행 기준 `languages.json total_words: 94`, `words.json question_count: 377` 검증 통과 상태다.
- GitHub Actions 시작 전에 필요한 secret 2개와 workflow write 권한 설정도 문서와 workflow 초반 체크에 반영했다.
- 다음 턴부터는 GitHub Actions 자동 갱신과 실제 앱 체감 속도 확인을 같이 진행하는 작업이 가장 효율적이다.






