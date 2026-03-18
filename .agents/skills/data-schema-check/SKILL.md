---
name: data-schema-check
description: Google Sheets 데이터 구조, JSON 응답, word 데이터 필드, 저장 payload 구조를 검증할 때 사용하는 스킬
---

# 역할
시트 스키마와 프론트 데이터 구조의 불일치를 줄인다.

# 언제 쓰나
- 단어 JSON 로더 구현 전후
- 저장 payload 정의 시
- API 응답 파싱 에러가 날 때
- 필드 누락/형식 오류를 점검할 때

# 핵심 작업 지침
1. 확정된 필드와 TBD 필드를 구분한다.
2. 필수 필드는 타입으로 강제한다.
3. 선택 필드는 fallback 값을 둔다.
4. `word_id`, `lang`, `pos`, `meaning`, `is_active` 등 핵심 필드를 우선 검증한다.
5. 일본어 전용 필드는 아래를 우선 확인한다.
   - `jp_kanji`
   - `jp_furigana`
   - `display_mode`
6. 저장 payload는 Game_Log / Answer_Log / Review_State / Daily_Stats 기준으로 나눈다.
7. 데이터 불완전 시 앱 전체를 깨지 말고 해당 항목을 제외하거나 기본값으로 처리한다.

# 결과 보고 형식
- 확인한 스키마:
- 누락/위험 필드:
- fallback 처리:
- 코드 수정 필요 여부:
