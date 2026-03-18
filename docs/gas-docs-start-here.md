# GAS Docs Start Here

실제 Google Sheets + GAS 연결 준비 문서가 여러 개라서,
지금 상황에 따라 어디부터 보면 되는지 먼저 안내하는 문서다.

## 1. 처음부터 준비할 때

이 문서부터 본다:

- [google-sheets-setup-guide.md](/D:/smx_coding_d/language_learning_web/docs/google-sheets-setup-guide.md)

이 문서는 아래를 처음부터 설명한다.

- 시트 3개 만들기
- 탭 이름 맞추기
- 첫 행 헤더 넣기
- Script Properties에 넣을 값 확인하기

## 2. 배포 직전에 빠르게 확인할 때

이 문서부터 본다:

- [gas-5minute-checklist.md](/D:/smx_coding_d/language_learning_web/docs/gas-5minute-checklist.md)

이 문서는 아래만 아주 짧게 확인한다.

- 시트 3개
- 탭 이름
- Script Properties 3개
- `.env`
- 앱과 시트에서 바로 볼 것

## 3. 배포 전에 조금 더 자세히 점검할 때

이 문서부터 본다:

- [gas-deploy-checklist.md](/D:/smx_coding_d/language_learning_web/docs/gas-deploy-checklist.md)
- [gas-click-by-click-guide.md](/D:/smx_coding_d/language_learning_web/docs/gas-click-by-click-guide.md)
- [gas-connection-values-template.md](/D:/smx_coding_d/language_learning_web/docs/gas-connection-values-template.md)

이 문서는 아래를 더 자세히 본다.

- 헤더 전체
- 데이터 입력 상태
- Apps Script 프로젝트 준비
- Web App 배포 전 체크
- 실제 클릭 순서
- 복사해 둘 값 정리

## 4. 연결 후 실제 동작을 확인할 때

이 문서부터 본다:

- [real-connection-smoke-test.md](/D:/smx_coding_d/language_learning_web/docs/real-connection-smoke-test.md)

이 문서는 아래를 순서대로 확인한다.

- 로그인
- 언어 목록
- 단어 로드
- 플레이 저장
- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats`

## 5. API와 시트 구조를 확인할 때

이 문서들을 본다:

- [api-spec.md](/D:/smx_coding_d/language_learning_web/docs/api-spec.md)
- [sheet-schema.md](/D:/smx_coding_d/language_learning_web/docs/sheet-schema.md)

이 문서들은 아래를 정리한다.

- action 요청 형식
- 응답 envelope
- 저장 payload 구조
- 시트 컬럼 매핑 규칙

## 6. 제일 쉬운 추천 순서

처음이면 아래 순서가 가장 쉽다.

1. [google-sheets-setup-guide.md](/D:/smx_coding_d/language_learning_web/docs/google-sheets-setup-guide.md)
2. [gas-5minute-checklist.md](/D:/smx_coding_d/language_learning_web/docs/gas-5minute-checklist.md)
3. [gas-deploy-checklist.md](/D:/smx_coding_d/language_learning_web/docs/gas-deploy-checklist.md)
4. [gas-click-by-click-guide.md](/D:/smx_coding_d/language_learning_web/docs/gas-click-by-click-guide.md)
5. [real-connection-smoke-test.md](/D:/smx_coding_d/language_learning_web/docs/real-connection-smoke-test.md)

## 7. 나중에 제가 같이 도와드릴 수 있는 단계

설정 시작 전에 말씀해 주시면 아래를 한국어로 아주 쉽게 같이 진행할 수 있다.

- 시트 만들기
- Script Properties 넣기
- Web App 배포
- `.env` 연결
- 첫 저장 확인
