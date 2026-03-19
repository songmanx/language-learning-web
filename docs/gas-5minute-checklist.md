# GAS 5-Minute Checklist

이 문서는 실제 연결 직전에 5분 안에 빠르게 확인하는 초간단 체크리스트다.

## 1. 시트 3개

- `lang_user_sheet`
- `lang_ja_master_sheet`
- `lang_ja_record_sheet`

## 2. 탭 이름

- 사용자 시트: `Users`
- 일본어 master 시트:
  - `명사`
  - `동사`
  - `い형용사`
  - `な형용사`
  - `부사`
  - `기타`
- 기록 시트:
  - `Game_Log`
  - `Answer_Log`
  - `Review_State`
  - `Daily_Stats`

## 2-1. 헤더 구조

- 가능하면 모든 시트를 `1행 표시명 / 2행 machine key / 3행부터 데이터`로 만든다.
- 현재 GAS는 2행 machine key를 기준으로 컬럼을 읽는다.
- 특히 master 시트는 `word_id`, `jp_kanji`가 있어야 source 시트로 인식된다.

## 3. Script Properties 3개

```text
USER_SHEET_ID
JA_MASTER_SHEET_ID
JA_RECORD_SHEET_ID
```

## 4. 프론트 `.env`

```bash
VITE_GAS_BASE_URL=배포_URL
VITE_GAS_USE_MOCK=false
```

실연동 CLI 기본값도 같이 확인:

- `smoke:gas`는 테스트 계정 문서 기본값을 읽을 수 있다.
- `verify:record`와 `check:live`는 프로젝트 루트 service account JSON과 문서 템플릿 값을 자동 감지할 수 있다.

## 5. 앱에서 바로 볼 것

- 상단 헤더에 `GAS 실연동 모드`가 보인다.
- 로그인 후 `일본어`가 보인다.
- 플레이 시작 후 문제와 보기 4개가 보인다.
- 결과 화면까지 정상 이동한다.

## 6. 시트에서 바로 볼 것

- `Game_Log`에 새 행 1개
- `Answer_Log`에 답한 수만큼 행
- `Review_State`에 최신 상태 반영
- `Daily_Stats`에 오늘 날짜 행 생성 또는 갱신
- `Game_Log.mode_type`, `quiz_type`, `total_time_sec` 값 확인
- `Answer_Log.shown_prompt`, `response_time_ms`, `difficulty_snapshot` 값 확인
- `Daily_Stats.study_minutes` 값 확인

## 7. 지금 기준 핵심 주의 3개

- 현재 master 시트에는 `choices` 컬럼이 없고, GAS가 원본 단어 풀에서 보기 4개를 자동 생성한다.
- `totalQuestions`는 실제 답변 수와 같아야 한다.
- `stat_date`는 `Asia/Seoul` 기준 날짜로 저장된다.

## 8. 막히면 먼저 알려주면 좋은 것

- 어느 단계에서 멈췄는지
- 화면 오류 문구
- 저장 안 된 시트 이름
- Apps Script 배포 URL
- master 시트가 `Words` 단일 탭인지, 다중 source 탭인지
- 2행 machine key를 문서와 같게 넣었는지
