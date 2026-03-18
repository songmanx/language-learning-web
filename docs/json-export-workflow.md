# Static JSON Export Workflow

## 한 줄 목적

Google Sheets의 일본어 master 데이터를 정적 JSON으로 변환해서,
앱은 단어/메타를 더 빠르게 읽고 로그인/저장은 계속 GAS를 사용한다.

빠른 운영 구분표만 보려면:

- [static-json-ops-quickref.md](D:/smx_coding_d/learning/language_learning_web/docs/static-json-ops-quickref.md)

현재 운영 구조:

- `login`, `saveSession`: GAS
- `getMeta`, `getWords`: `public/data` 정적 JSON

## 생성 파일

- `public/data/languages.json`
- `public/data/ja/words.json`

## 가장 쉬운 전체 흐름

1. 일본어 master 시트를 service account와 공유한다.
2. JSON exporter를 실행한다.
3. validator로 생성 결과를 검사한다.
4. 앱은 `/data` JSON을 읽는다.
5. GitHub Actions로 이 과정을 자동화한다.

## 1. 준비물

필수 준비물은 3개다.

- service account JSON 파일 1개
- 일본어 master 시트 ID 1개
- `requirements-json-export.txt` 의존성 설치

설치:

```bash
pip install -r requirements-json-export.txt
```

중요:

- service account 이메일을 일본어 master 시트에 `뷰어` 이상으로 공유해야 한다.
- 공유하지 않으면 exporter가 시트를 읽지 못한다.

## 2. 로컬에서 바로 실행

PowerShell 기준:

가장 짧은 실행:

```powershell
npm run refresh:json
```

위 명령은 아래 두 단계를 한 번에 실행한다.

- `export:json`
- `validate:json`

중요:

- 이 명령은 로컬 파일만 갱신한다.
- 즉 `public/data` 아래 JSON만 내 컴퓨터에서 바뀐다.
- GitHub 업로드까지 자동으로 하지는 않는다.
- GitHub에 반영하려면 직접 `commit + push` 하거나 GitHub Actions workflow를 실행해야 한다.

기본 동작:

- 프로젝트 루트의 service account JSON 파일 자동 감지
- `docs/gas-connection-values-template.md`의 JA Master Sheet ID 자동 사용
- 기본 출력 경로 `public/data`
- 기본 언어 `ja / 일본어`

직접 나눠서 실행하려면:

```powershell
npm run export:json -- `
  --credentials "C:\path\to\service-account.json" `
  --spreadsheet-id "YOUR_JA_MASTER_SHEET_ID" `
  --output-dir public/data `
  --language-code ja `
  --language-label "일본어"
```

검증:

```powershell
npm run validate:json -- --data-dir public/data --language-code ja
```

성공하면:

- `public/data/languages.json`
- `public/data/ja/words.json`

이 두 파일이 갱신된다.

## 3. 프론트 연결

`.env` 또는 배포 환경 변수:

```bash
VITE_GAS_BASE_URL=https://your-gas-web-app-url
VITE_GAS_USE_MOCK=false
VITE_STATIC_DATA_META_URL=/data/languages.json
VITE_STATIC_DATA_WORDS_BASE_PATH=/data
```

이 모드에서는:

- 로그인/저장: GAS
- 언어 메타/단어 읽기: 정적 JSON

## 4. GitHub Actions 자동화

저장소에는 [export-static-json.yml](D:/smx_coding_d/learning/language_learning_web/.github/workflows/export-static-json.yml)이 들어 있다.

필요한 GitHub Secrets:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `JA_MASTER_SHEET_ID`

필요한 GitHub 설정:

- `Settings > Actions > General > Workflow permissions`
- `Read and write permissions`

동작 순서:

1. 필수 secret 존재 여부 확인
2. service account JSON 임시 파일 생성
3. exporter 실행
4. validator 실행
5. `public/data` 변경 시 자동 commit / push

실행 시점:

- 수동 실행 가능
- 6시간마다 자동 실행

정리:

- `npm run refresh:json`: 로컬 갱신 전용
- GitHub Actions `Export Static JSON`: GitHub에서 자동 갱신 + auto commit/push 전용

## 5. 지금 기억할 핵심

- 읽기 속도 개선용 구조다.
- 로그인, 기록 저장, 복습 상태 upsert는 여전히 GAS가 담당한다.
- JSON 생성 규칙을 바꾸면 `gas/Code.gs`, [api-spec.md](D:/smx_coding_d/learning/language_learning_web/docs/api-spec.md), [sheet-schema.md](D:/smx_coding_d/learning/language_learning_web/docs/sheet-schema.md)도 같이 봐야 한다.

## 6. 자주 쓰는 명령

```powershell
npm run refresh:json
```

명시적으로 값을 넘기려면:

```powershell
npm run refresh:json -- --credentials "C:\path\to\service-account.json" --spreadsheet-id "YOUR_JA_MASTER_SHEET_ID"
```

도움말만 보려면:

```powershell
npm run refresh:json -- --help
```

```powershell
npm run export:json -- --credentials "C:\path\to\service-account.json" --spreadsheet-id "YOUR_JA_MASTER_SHEET_ID" --output-dir public/data --language-code ja --language-label "일본어"
```

```powershell
npm run validate:json -- --data-dir public/data --language-code ja
```

```powershell
npm run build
```
