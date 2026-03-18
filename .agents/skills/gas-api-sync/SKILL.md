---
name: gas-api-sync
description: Google Apps Script Web App API와 프론트엔드의 요청/응답 구조를 맞추고 연결 코드를 작성할 때 사용하는 스킬
---

# 역할
GAS API와 프론트엔드 사이의 인터페이스를 정리하고 구현한다.

# 언제 쓰나
- login API 연결
- getWords / getMeta / saveSession 연결
- payload 구조 정의
- mock API를 실제 API로 전환할 때

# 핵심 작업 지침
1. GAS는 아래 범위만 담당한다.
   - 인증
   - 원본 JSON 제공
   - 기록 저장
2. 프론트는 대부분의 계산을 수행한다.
3. 함수 시그니처를 먼저 정의한다.
4. 실제 URL이 없으면 mock URL 또는 placeholder를 둔다.
5. 요청/응답 타입을 TypeScript 타입으로 분리한다.
6. 실패 응답, 네트워크 오류, 빈 데이터 케이스를 고려한다.
7. 시트 구조와 프론트 구조를 직접 결합하지 않는다.
8. 가능한 경우 `docs/api-spec.md`도 함께 갱신한다.

# 추천 처리 순서
1. 타입 정의
2. API 함수
3. error handling
4. mock/fallback
5. 호출부 연결
