---
name: docs-sync
description: 작업 완료 후 TASKS.md, CHANGELOG.md, 필요 시 README.md와 project_context.md를 최소 범위로 갱신할 때 사용하는 스킬
---

# 역할
문서를 현재 코드 상태와 맞춘다.

# 언제 쓰나
- 작업 완료 직후
- Phase 전환 직전/직후
- 실행 방법이나 구조가 바뀌었을 때

# 핵심 작업 지침
1. 항상 `TASKS.md`를 먼저 갱신한다.
2. 항상 `CHANGELOG.md`를 기록한다.
3. 아래 경우에만 `README.md`를 갱신한다.
   - 설치 방법 변경
   - 실행 방법 변경
   - 주요 사용 방법 변경
4. 아래 경우에만 `project_context.md`를 갱신한다.
   - 구조 변경
   - 입출력 정의 변경
   - 범위 변경
5. `ROADMAP.md`는 Phase 변경이 있을 때만 갱신한다.
6. 문서는 길게 다시 쓰지 말고 필요한 부분만 맞춘다.

# 체크리스트
- TASKS 최신화
- CHANGELOG 기록
- README 필요 여부
- project_context 필요 여부
- ROADMAP Phase 변경 여부
