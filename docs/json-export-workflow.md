# Static JSON Export Workflow

## 목적

Google Sheets의 일본어 master 데이터를 Python으로 읽어서 정적 JSON으로 변환하고,
프론트는 이 JSON을 직접 읽어 단어/메타 로드 속도를 줄인다.

권장 구조:

- 로그인 / 저장: GAS 유지
- 언어 메타 / 단어 읽기: 정적 JSON 사용

## 생성 파일

- `public/data/languages.json`
- `public/data/ja/words.json`

## 로컬 실행 준비

1. Google Cloud Service Account를 만들고 Sheets 읽기 권한을 준다.
2. 해당 서비스 계정에 일본어 master 시트를 공유한다.
3. 서비스 계정 JSON 키 파일을 준비한다.
4. 아래 명령으로 Python 의존성을 설치한다.

```bash
pip install -r requirements-json-export.txt
```

## 로컬 실행 예시

```bash
python scripts/export_google_sheets_json.py ^
  --credentials path\\to\\service-account.json ^
  --spreadsheet-id YOUR_JA_MASTER_SHEET_ID ^
  --output-dir public/data ^
  --language-code ja ^
  --language-label 일본어
```

## 프론트 연결 방법

`.env` 또는 배포 환경 변수에 아래 값을 넣는다.

```bash
VITE_GAS_BASE_URL=https://your-gas-web-app-url
VITE_GAS_USE_MOCK=false
VITE_STATIC_DATA_META_URL=/data/languages.json
VITE_STATIC_DATA_WORDS_BASE_PATH=/data
```

이렇게 하면:

- `login`, `saveSession`: GAS 호출
- `getMeta`, `getWords`: 정적 JSON 호출

## GitHub Actions 자동화

저장소에는 `.github/workflows/export-static-json.yml`이 포함되어 있다.

필요한 GitHub Secrets:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `JA_MASTER_SHEET_ID`

필요한 GitHub 저장소 설정:

- `Settings > Actions > General > Workflow permissions`
- 여기서 `Read and write permissions`를 켜야 workflow의 auto commit / push가 가능하다.
- 기본 브랜치 보호 규칙이 강하면 `github-actions[bot]` push 허용 여부도 같이 확인해야 한다.

동작:

1. 6시간마다 또는 수동 실행
2. 필수 GitHub secret 존재 여부 확인
3. Python exporter 실행
4. 생성된 `languages.json`, `words.json` 형식을 검증
5. `public/data` 변경이 있으면 자동 commit / push

## 현재 범위

- 일본어 `master` 시트에서 source row를 읽는다.
- 현재 GAS와 같은 기준으로 `word_to_meaning`, `meaning_to_word` 문제 DTO를 만든다.
- `jp_furigana_2`는 값이 있을 때만 `word_to_meaning`으로 추가한다.

## 주의점

- 이 구조는 읽기 성능 개선용이다.
- 로그인, 기록 저장, 복습 상태 upsert는 여전히 GAS가 담당한다.
- JSON 생성 규칙을 바꾸면 `gas/Code.gs`와 `docs/api-spec.md` 기준도 함께 맞춰야 한다.

## 검증 스크립트

정적 JSON이 프론트가 기대하는 최소 형식을 만족하는지 확인하려면 아래 명령을 쓴다.

```bash
python scripts/validate_static_json.py --data-dir public/data --language-code ja
```
