# Live Ops Quick Reference

## 한눈에 구분

### 1. API만 빨리 확인

언제 쓰나:

- GAS Web App 응답만 먼저 확인하고 싶을 때
- 로그인, 메타, 단어, 저장 응답만 짧게 보고 싶을 때

명령:

```powershell
npm run smoke:gas -- --login-id test --password 1234
```

현재 프로젝트 기본값으로는 아래 한 줄도 가능하다.

```powershell
npm run smoke:gas
```

확인 범위:

- `login`
- `getMeta`
- `getWords`
- `saveSession`

시트 row까지는 직접 확인하지 않는다.

### 2. record 시트 4개 탭만 확인

언제 쓰나:

- `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 저장 상태만 보고 싶을 때

명령:

```powershell
npm run verify:record
```

현재 프로젝트 기본 동작:

- 프로젝트 루트의 service account JSON 자동 감지
- `docs/gas-connection-values-template.md`의 JA Record Sheet ID 자동 사용
- 결과는 `docs/live-check-latest.json`에도 저장

중요:

- `japanese_record` 시트를 service account 이메일과 공유해야 한다.

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

## 가장 짧은 기억법

- `smoke:gas` = API만 확인
- `verify:record` = 시트 저장만 확인
- `check:live` = 둘 다 한 번에 확인

## 지금 프로젝트 기준 기본값

- 테스트 계정: `test / 1234`
- 기대 `player_id`: `u001`
- service account JSON: 프로젝트 루트 자동 감지
- JA Record Sheet ID: 템플릿 문서에서 자동 읽기
- `smoke:gas`의 로그인 계정도 템플릿 문서에서 자동 읽기

## 막혔을 때 먼저 볼 것

- 전체 실연동 순서: [real-connection-smoke-test.md](D:/smx_coding_d/learning/language_learning_web/docs/real-connection-smoke-test.md)
- 설정 값 정리: [gas-connection-values-template.md](D:/smx_coding_d/learning/language_learning_web/docs/gas-connection-values-template.md)
- API/시트 기준: [api-spec.md](D:/smx_coding_d/learning/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/learning/language_learning_web/docs/sheet-schema.md)
