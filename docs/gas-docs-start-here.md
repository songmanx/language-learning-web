# GAS Docs Start Here

실연동 문서가 여러 개 있지만, 지금은 아래 3개만 먼저 보면 된다.

현재 가장 추천하는 시작 순서는 아래다.

1. 시트와 GAS를 처음 준비할 때: [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)
2. 배포 직전 빠른 점검: [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)
3. 실제 명령 실행과 운영 확인: [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)

현재 문서 공통 기준:

- 일본어 master workbook은 `Words` 단일 탭이 아니라 여러 source 시트를 읽는다.
- 시트 헤더는 `1행 표시명 / 2행 machine key / 3행부터 데이터` 구조를 쓴다.
- 실연동 명령은 템플릿 문서와 프로젝트 루트 기본값을 우선 사용한다.

## 1. 정적 JSON만 갱신하고 싶을 때

먼저 볼 문서:

- [static-json-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/static-json-ops-quickref.md)

이 문서에서 바로 확인할 수 있는 것:

- `npm run refresh:json`을 언제 쓰는지
- 로컬 갱신과 GitHub 자동 갱신 차이
- 지금 프로젝트에서 가장 빠른 JSON 갱신 방법

더 자세한 설명이 필요하면:

- [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md)

## 2. 실제 GAS와 Google Sheets 연결까지 확인하고 싶을 때

먼저 볼 문서:

- [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)

이 문서에서 바로 확인할 수 있는 것:

- `smoke:gas`, `verify:record`, `check:live` 중 무엇을 먼저 써야 하는지
- API만 볼지, record 시트만 볼지, 전체를 같이 볼지
- 현재 프로젝트 기본값으로 어디까지 자동으로 읽는지

더 자세한 설명이 필요하면:

- [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)
- [live-connection-order.md](D:/smx_coding_d/learning/language_learning_web/docs/live-connection-order.md)

## 3. 처음부터 시트와 GAS 설정을 다시 보고 싶을 때

먼저 볼 문서:

- [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)

그 다음 필요하면:

- [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)
- [gas-deploy-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-deploy-checklist.md)
- [gas-click-by-click-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-click-by-click-guide.md)
- [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)

## 4. API와 시트 구조를 확인하고 싶을 때

아래 문서를 본다.

- [api-spec.md](D:/smx_coding_d/learning/language_learning_web/docs/api-spec.md)
- [sheet-schema.md](D:/smx_coding_d/learning/language_learning_web/docs/sheet-schema.md)

## 5. 가장 빠른 추천 순서

지금 프로젝트 기준으로는 아래 순서가 가장 짧다.

1. [google-sheets-setup-guide.md](D:/smx_coding_d/learning/language_learning_web/docs/google-sheets-setup-guide.md)
2. [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)
3. [live-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/live-ops-quickref.md)
4. 필요할 때만 세부 문서

## 6. 같이 진행하면 좋은 단계

필요하면 아래를 이어서 같이 진행하면 된다.

- 정적 JSON 갱신
- GitHub Actions 자동 갱신 확인
- 실제 저장 결과 확인
- 시트, 배포, GAS 설정 사전 점검
