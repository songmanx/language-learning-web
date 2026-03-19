# Static JSON Ops Quick Reference

## 구분

### 1. 로컬에서 JSON만 다시 만들기

언제 쓰나:

- master 시트 값을 바로 다시 받아 보고 싶을 때
- 내 컴퓨터의 `public/data`만 갱신하면 될 때

명령:

```powershell
npm run refresh:json
```

도움말만 볼 때:

```powershell
npm run refresh:json -- --help
```

결과:

- 로컬 `public/data/languages.json` 갱신
- 로컬 `public/data/ja/words.json` 갱신
- 검증까지 같이 실행
- GitHub 업로드는 하지 않음

### 2. GitHub까지 자동 반영하기

언제 쓰나:

- GitHub 저장소의 `public/data`도 같이 갱신하고 싶을 때
- Actions가 auto commit/push 하게 두고 싶을 때

실행 위치:

- GitHub 저장소
- `Actions > Export Static JSON`

결과:

- GitHub Actions가 export 실행
- validator 실행
- 변경이 있으면 `public/data` 자동 commit/push

## 가장 빠른 기억법

- `npm run refresh:json` = 내 컴퓨터만 갱신
- `Actions > Export Static JSON` = GitHub까지 자동 반영

## 지금 프로젝트 기준 기본값

- service account JSON: 프로젝트 루트에서 자동 감지
- JA Master Sheet ID: `docs/gas-connection-values-template.md` machine-defaults 블록에서 자동 읽기
- 기본 출력 경로: `public/data`
- 기본 언어: `ja`
- 기본 언어 라벨: `일본어`

## 막히면 먼저 볼 문서

- 로컬 명령 상세: [json-export-workflow.md](D:/smx_coding_d/learning/language_learning_web/docs/json-export-workflow.md)
- 실연동 전체 점검: [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)
- 설정 값 확인: [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)
