# Live Connection Order

이 문서는 실제 Google Apps Script + Google Sheets 연결을 할 때
"무엇을 먼저 해야 하는지"를 아주 짧게 정리한 순서표다.

## 결론 먼저

현재 프로젝트 기준으로는 아래 순서가 가장 안전하다.

1. Google Sheets 3개 만들기
2. 시트 탭 이름과 첫 행 헤더 맞추기
3. Apps Script 프로젝트에 `gas/Code.gs` 넣기
4. Script Properties에 시트 ID 3개 넣기
5. Apps Script를 Web App으로 배포하기
6. 프론트 `.env`에 배포 URL 넣기
7. `VITE_GAS_USE_MOCK=false`로 바꾸기
8. 로그인부터 저장까지 실제 테스트하기

## 지금 당장 필요한 설정

지금 바로 필요한 것은 아래뿐이다.

- Google Sheets 만들기
- Apps Script 만들기
- Script Properties 입력
- Web App 배포
- 프론트 `.env` 연결

## 아직 필요 없는 설정

초보자가 가장 많이 헷갈리는 부분이라 먼저 적어둔다.

현재 단계에서는 아래를 보통 따로 하지 않아도 된다.

- Google Sheets API 별도 활성화
- Google Cloud에서 서비스 계정 만들기
- OAuth 동의 화면 설정
- 복잡한 API 키 발급

이유:

- 이 프로젝트는 Apps Script가 같은 계정 안의 스프레드시트를 직접 읽고 쓰는 구조이기 때문이다.

## 각 단계에서 필요한 준비물

### 1. Google Sheets 만들기

필요한 것:

- 구글 계정

결과물:

- `lang_user_sheet`
- `lang_ja_master_sheet`
- `lang_ja_record_sheet`

### 2. 헤더 입력

필요한 것:

- [google-sheets-setup-guide.md](D:/smx_coding_d/language_learning_web/docs/google-sheets-setup-guide.md)

결과물:

- 시트 탭 이름과 첫 행 헤더 완성

### 3. Apps Script 코드 넣기

필요한 것:

- [Code.gs](D:/smx_coding_d/language_learning_web/gas/Code.gs)

결과물:

- `login`, `getMeta`, `getWords`, `saveSession` 액션 처리 준비

### 4. Script Properties 입력

필요한 것:

- 사용자 시트 ID
- 일본어 원본 시트 ID
- 일본어 기록 시트 ID

넣어야 하는 키:

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

### 5. Web App 배포

필요한 것:

- Apps Script 프로젝트

결과물:

- 배포 URL 1개

### 6. 프론트 `.env` 연결

넣어야 하는 값:

```bash
VITE_GAS_BASE_URL=배포_URL
VITE_GAS_USE_MOCK=false
```

## 설정이 필요한 순간에 내가 어떻게 도와줄 수 있는지

아래 순간이 오면 제가 아주 쉽게 설명드릴 수 있다.

### Script Properties 넣을 때

제가 설명해드릴 수 있는 것:

- Script Properties 메뉴가 어디 있는지
- 어떤 키에 어떤 값을 넣는지
- 시트 ID를 주소에서 어디서 복사하는지

### Web App 배포할 때

제가 설명해드릴 수 있는 것:

- 배포 버튼을 어디서 누르는지
- 실행 사용자를 무엇으로 해야 하는지
- 접근 권한을 어떻게 고르는지
- 복사해야 할 URL이 무엇인지

### `.env` 연결할 때

제가 설명해드릴 수 있는 것:

- `.env` 파일에 정확히 무엇을 써야 하는지
- mock 모드를 어떻게 끄는지
- 연결 후 무엇부터 테스트하면 되는지

## 가장 추천하는 진행 방식

가장 덜 헷갈리는 방식은 이렇다.

1. 먼저 시트 3개와 탭/헤더를 만든다.
2. 그 다음 Apps Script에 코드와 Script Properties를 넣는다.
3. 마지막에 Web App 배포 URL을 프론트에 연결한다.

즉, URL 연결보다 먼저 시트 구조를 끝내는 쪽이 좋다.
