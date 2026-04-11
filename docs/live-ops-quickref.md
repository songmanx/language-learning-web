# Live Ops Quick Reference

## 시작 순서 추천

처음이면 아래 순서가 가장 빠르다.

1. 문서 진입: [gas-docs-start-here.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-docs-start-here.md)
2. 빠른 설정 점검: [gas-5minute-checklist.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-5minute-checklist.md)
3. 실제 실행 명령: 이 문서

## 세 명령의 차이

### 1. API만 빠르게 확인

언제 쓰나:

- GAS Web App 응답만 먼저 확인하고 싶을 때
- 로그인, 메타, 단어, 저장 응답만 짧게 보고 싶을 때

명령:

```powershell
npm run smoke:gas
```

명시적으로 값을 넣고 싶으면:

```powershell
npm run smoke:gas -- --login-id YOUR_LOGIN_ID --password YOUR_PASSWORD
```

확인 범위:

- `login`
- `getMeta`
- `getWords`
- `saveSession`

시트 row까지 직접 확인하지는 않는다.

### 2. record 시트 4개만 확인

언제 쓰나:

- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 저장 상태만 보고 싶을 때

명령:

```powershell
npm run verify:record
```

현재 프로젝트 기본 동작:

- 프로젝트 루트의 service account JSON 자동 감지
- `docs/gas-connection-values-template.md`의 JA Record Sheet ID 자동 사용
- 기대 `player_id`, `word_id`, `mode_type`, `score`, `language_code`를 템플릿 문서 기본값에서 우선 사용
- 결과를 `docs/live-check-latest.json`에도 저장

중요:

- `japanese_record` 시트는 service account 메일과 공유되어 있어야 한다.

### 3. 전체를 한 번에 확인

언제 쓰나:

- API 응답도 보고
- record 시트 저장도 같이 확인하고 싶을 때

명령:

```powershell
npm run check:live
```

확인 순서:

1. `smoke:gas`
2. `verify:record`
3. 결과를 `docs/live-check-latest.json`, `docs/gas-connection-values-template.md`에 반영

## 가장 빠른 기억법

- `smoke:gas` = API만 확인
- `verify:record` = 시트 저장만 확인
- `check:live` = 둘 다 한 번에 확인

## 지금 프로젝트 기준 기본값

- 테스트 계정: `YOUR_LOGIN_ID / YOUR_PASSWORD`
- 기대 `player_id`: `u001`
- service account JSON: 프로젝트 루트에서 자동 감지
- JA Record Sheet ID: 템플릿 문서에서 자동 읽기
- `smoke:gas` 로그인 계정도 템플릿 문서에서 자동 읽기 가능
- `check:live` 검증 기대값도 템플릿 문서에서 자동 읽기 가능
- master workbook은 `Words` 단일 탭이 아니라 source 시트를 읽는 현재 구조가 기준이다.

## 막히면 먼저 볼 문서

- 전체 실연동 순서: [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)
- 설정 값 정리: [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)
- API와 시트 기준: [api-spec.md](D:/smx_coding_d/learning/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/learning/language_learning_web/docs/sheet-schema.md)
