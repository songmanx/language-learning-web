# GAS Setup

이 폴더는 현재 프론트엔드와 맞물리는 Google Apps Script Web App 스켈레톤을 담고 있다.

## 현재 포함 내용

- `doPost(e)` 기반 단일 엔드포인트
- 지원 action
  - `login`
  - `getMeta`
  - `getWords`
  - `saveSession`
- `docs/api-spec.md`, `docs/sheet-schema.md` 기준 응답 envelope 구조
- Script Properties에서 시트 ID를 읽는 기본 구조

## Script Properties

아래 3개 값을 GAS 프로젝트의 Script Properties에 넣어야 한다.

- `USER_SHEET_ID`
- `JA_MASTER_SHEET_ID`
- `JA_RECORD_SHEET_ID`

## 권장 시트 구성

- 사용자 스프레드시트: `lang_user_sheet`
  - 탭: `Users`
- 일본어 원본 스프레드시트: `lang_ja_master_sheet`
  - source 탭:
    - `명사`
    - `동사`
    - `い형용사`
    - `な형용사`
    - `부사`
    - `기타`
- 일본어 기록 스프레드시트: `lang_ja_record_sheet`
  - 탭:
    - `Game_Log`
    - `Answer_Log`
    - `Review_State`
    - `Daily_Stats`

현재 GAS는 `1행 표시명 / 2행 machine key / 3행부터 데이터` 구조를 가장 안정적으로 읽는다.
특히 master workbook은 `word_id`, `jp_kanji` machine key가 있는 시트를 source 시트로 인식한다.
헤더 기준은 `docs/google-sheets-setup-guide.md`와 `docs/sheet-schema.md`를 우선 따른다.

## 아직 필요한 수동 작업

- 실제 Google Spreadsheet 3개 생성
- 각 Spreadsheet 안에 필요한 시트 탭 생성
- 첫 행 헤더 입력
- GAS Web App 배포
- 프론트 `.env`에 배포 URL 입력

## 초보자용 메모

지금 단계에서는 `Google Sheets API`를 따로 켤 필요가 없다.
이 구조는 Apps Script가 같은 계정 안의 스프레드시트를 직접 읽고 쓰는 방식이기 때문이다.

보통은 아래 두 가지만 먼저 준비하면 된다.

1. 스프레드시트를 만든다.
2. Apps Script 프로젝트에 Script Properties를 넣는다.

실제 연결 단계에서 필요해지면,
어디를 눌러야 하는지까지 한국어로 아주 쉽게 안내할 수 있다.
