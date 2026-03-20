# TASKS.md

## 2026-03-20 Phase 4 상단 카드 통합 / 시작 화면 축약 메모

- 완료:
  - `PlayPage` 시작 전 라벨을 `기본`/`연습`, `한자 뜻`/`후리 뜻`/`음성 뜻`/`뜻 단어`, `시작`/`연습`, `초기화`처럼 더 짧게 압축
  - `ResultPage` 상단 요약 카드 안에 추천 경로와 CTA를 흡수해 첫 화면 섹션 수를 줄임
  - `ReviewPage` 상단 헤더와 스냅샷/액션 묶음을 하나의 카드로 합쳐 모바일 세로 흐름을 더 단순화
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 옵션 그룹 높이와 버튼 폭을 더 줄여 첫 화면 고정 수준을 마무리
  - `ResultPage` / `ReviewPage` 상단 스냅샷 카드 안 수치/칩 밀도를 더 낮춰 첫 화면 길이를 추가 축소

## 2026-03-20 Phase 4 설명 줄/상단 문구 축소 메모

- 완료:
  - `PlayPage` 시작 전 상단 보조 문구를 제거하고 타이틀 비중을 더 축소
  - `ResultPage` 상단 저장 안내 문구와 추천 보조 칩을 줄여 첫 화면 정보량을 추가 축소
  - `ReviewPage` 상단 설명 줄과 상태 보조 문구를 걷어내고 추천 칩 수를 더 줄임
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 버튼/옵션 그룹 폭을 더 줄이거나 일부 라벨을 더 짧게 정리
  - `ResultPage` / `ReviewPage` 상단 상태 칩과 요약 카드 일부를 더 통합해 첫 화면 섹션 수를 줄이기

## 2026-03-20 Phase 4 텍스트 폭/미리보기 행 추가 축약 메모

- 완료:
  - `PlayPage` 시작 전 초기화 버튼 폭과 요약 줄 문구를 더 짧게 줄여 첫 화면 고정 흐름을 추가 압축
  - `ResultPage` 복습 미리보기 행 높이와 칩 라벨을 `우선`/`단계`/`결과` 중심으로 축약
  - `ReviewPage` 우선 복습 목록 행 높이와 칩 라벨을 더 짧게 줄이고 하단 버튼 높이도 추가 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 타이틀/모드 문구 비중을 더 줄이거나 일부 생략해 첫 화면 고정을 마무리
  - `ResultPage` / `ReviewPage` 상단 설명 줄과 상태 칩 수를 더 줄이거나 통합

## 2026-03-20 Phase 4 시작 전 최종 높이 압축 메모

- 완료:
  - `PlayPage` 시작 전 상단 여백, 옵션 버튼, 준비 문제 카드 높이를 더 줄여 첫 화면 고정에 더 가깝게 정리
  - `ResultPage` 세션 스냅샷/복습 미리보기 카드와 수치 카드 높이를 추가 축소
  - `ReviewPage` 요약 카드/다음 학습 흐름/우선 복습 목록 높이를 추가 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 남은 텍스트 비중과 버튼 폭을 더 줄여 첫 화면 고정 마무리
  - `ResultPage` / `ReviewPage` 미리보기 아이템 행 높이와 칩 문구를 더 짧게 줄이거나 일부 통합

## 2026-03-20 Phase 4 시작 전 높이/세로 CTA 추가 정리 메모

- 완료:
  - `PlayPage` 시작 전 헤더, 옵션 그룹, 준비 문제 카드 높이를 한 단계 더 축소
  - `ResultPage` CTA와 하단 액션 버튼을 세로 흐름으로 고정해 모바일 가로 분할 느낌 제거
  - `ReviewPage` CTA를 세로 흐름으로 고정하고 시작 전/결과/복습 화면의 전체 스크롤 길이를 추가 압축
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면의 남은 상단 여백과 옵션 버튼 높이를 더 줄여 첫 화면 고정 수준을 마무리
  - `ResultPage` / `ReviewPage` 세션 스냅샷과 복습 미리보기 카드 높이를 더 줄이거나 일부 통합

## 2026-03-20 Phase 4 라벨 축약/CTA 높이 추가 압축 메모

- 완료:
  - `PlayPage` 시작 전 요약 줄 구분을 더 짧게 정리하고 첫 화면 고정 흐름을 추가 압축
  - `ResultPage` CTA 라벨을 `재도전`/`연습`/`복습` 중심으로 축약하고 버튼 높이를 추가 축소
  - `ReviewPage` CTA 라벨을 `연습`/`플레이`/`홈` 중심으로 축약하고 버튼 높이를 추가 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 옵션 그룹 높이와 상단 여백을 더 줄여 첫 화면 고정 수준을 마무리
  - `ResultPage` / `ReviewPage` 남은 보조 칩과 하단 액션 구역을 더 줄이거나 일부 통합

## 2026-03-20 Phase 4 시작 전 고정/하단 라벨 축약 메모

- 완료:
  - `PlayPage` 시작 전 화면의 카운트 블록과 요약 줄을 더 줄여 거의 완전 첫 화면 고정 수준까지 압축
  - `ResultPage` 하단 버튼 라벨을 더 짧게 줄이고 추천/세션 구성 칩 표기를 추가 축약
  - `ReviewPage` 추천/세션 구성 칩과 우선 복습 라벨을 더 짧게 줄여 세로 길이를 추가 단축
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면에서 남은 옵션 그룹 높이와 버튼 간격을 미세 조정해 완전 첫 화면 고정 수준까지 마무리
  - `ResultPage` / `ReviewPage`에서 남아 있는 보조 칩과 하단 액션 구역을 더 줄이거나 일부 통합

## 2026-03-20 Phase 4 타이틀 비중/칩 문구 추가 축소 메모

- 완료:
  - `PlayPage` 시작 전 화면의 타이틀 비중과 요약 줄 길이를 더 줄여 첫 화면 고정 수준에 더 가깝게 정리
  - `ResultPage` 추천 칩, 세션 구성 칩, CTA 버튼 타이포와 설명 문구를 더 압축
  - `ReviewPage` 추천 칩, 세션 구성 칩, CTA 버튼 타이포와 설명 문구를 더 압축
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면에서 남은 카운트 블록과 옵션 그룹 높이를 미세 조정해 완전 첫 화면 고정 수준까지 마무리
  - `ResultPage` / `ReviewPage`의 하단 버튼 라벨과 미리보기 칩 표기를 더 짧게 정리하고 필요 시 일부 보조 문구 제거

## 2026-03-20 Phase 4 여백/문구 추가 압축 메모

- 완료:
  - `PlayPage` 시작 전 화면의 상단 여백, 타이틀 블록, 그룹 간격, 요약 영역을 더 줄여 거의 첫 화면 고정 수준까지 추가 압축
  - `ResultPage`의 CTA 설명 문구와 세션 구성 칩 패딩을 더 짧게 줄이고 하단 카드 높이를 추가 축소
  - `ReviewPage`의 CTA 설명 문구, 추천 경로 칩, 세션 구성 칩, 우선 복습 목록 카드 밀도를 더 압축
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면에서 남은 상단 타이틀 비중과 요약 줄 길이를 더 줄여 완전 첫 화면 고정 수준까지 마무리
  - `ResultPage` / `ReviewPage`의 하단 액션 버튼과 미리보기 칩 문구를 더 짧게 정리하고 필요 시 일부 보조 문구 제거

## 2026-03-20 Phase 4 시작 전 화면/하단 카드 높이 추가 축소 메모

- 완료:
  - `PlayPage` 시작 전 화면의 타이틀 블록, 옵션 그룹, 문제 수/시작 버튼 영역을 한 단계 더 줄여 첫 화면 고정에 더 가깝게 정리
  - `ResultPage` CTA 버튼, 복습 미리보기 카드, 하단 버튼, 요약 수치 카드 높이를 추가 축소
  - `ReviewPage` CTA 버튼, 우선 복습 목록 카드, 요약 수치 카드 높이를 추가 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면의 남은 상단 여백과 그룹 간격을 더 줄여 거의 완전 첫 화면 고정 수준까지 마무리
  - `ResultPage` / `ReviewPage`의 하단 액션 버튼과 미리보기 칩 문구를 더 압축해 세로 길이를 추가 단축

## 2026-03-20 Phase 4 시작 화면/요약 카드 추가 압축 메모

- 완료:
  - `PlayPage` 시작 전 설정 화면 헤더, 선택 그룹, 시작 버튼, 문제 수 요약 영역을 한 단계 더 축소해 첫 화면 고정에 더 가깝게 정리
  - `ResultPage`의 다음 액션 요약에서 `세션 평가`를 별도 카드 대신 상단 칩 흐름에 흡수하고 CTA 버튼 높이와 설명을 더 압축
  - `ReviewPage`의 상단 요약/CTA/다음 학습 흐름 카드 간격과 수치 카드 높이를 더 줄이고 우선 복습 목록 카드도 더 얇게 정리
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면에서 상단 타이틀 블록과 옵션 그룹 높이를 한 단계 더 줄여 거의 완전 첫 화면 고정 수준까지 마무리
  - `ResultPage` / `ReviewPage` 하단 버튼과 미리보기 카드 높이를 더 줄여 모바일 세로 길이를 추가 단축

## 2026-03-20 Phase 4 시작 화면 추가 압축 / 결과·복습 섹션 통합 메모

- 완료:
  - `PlayPage` 시작 전 설정 화면의 헤더, 선택 버튼, 요약 영역을 더 줄이고 시작 버튼을 카운트 영역에 통합해 첫 화면 고정에 더 가깝게 압축
  - `PlayPage` 품사 선택은 3열, 난이도/방식 선택은 2열 중심으로 촘촘하게 재배치
  - `ResultPage`의 `세션 스냅샷`과 `복습 상태 미리보기`를 한 섹션으로 통합해 하단 카드 수를 축소
  - `ReviewPage`의 `우선 복습 목록`을 상단 요약 카드 안으로 흡수해 별도 하단 섹션을 제거
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 화면 상단 설명과 선택 그룹 높이를 한 단계 더 줄여 거의 완전 첫 화면 고정 수준까지 마무리
  - `ResultPage` / `ReviewPage` 요약 카드 안 수치 표현과 CTA 배치를 더 압축해 스크롤 길이를 추가 단축

## 2026-03-20 Phase 4 시작 화면/하단 섹션 추가 압축 메모

- 완료:
  - `PlayPage` 시작 전 설정 화면의 헤더, 선택 그룹, 요약 칩, 카운트 카드, 시작 버튼 높이를 한 단계 더 줄여 첫 화면 고정에 더 가깝게 압축
  - `ResultPage` 세션 스냅샷과 복습 미리보기 섹션 패딩, 카드 높이, 버튼 간격을 더 줄여 결과 화면 하단 길이를 축소
  - `ReviewPage` 우선 복습 목록 카드 높이와 간격을 더 줄여 전체 세로 스크롤 길이를 추가로 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면에서 요약 칩 수나 카운트 표현을 더 줄여 완전 첫 화면 고정에 가까운 수준까지 마무리
  - `ResultPage` / `ReviewPage` 하단 섹션을 더 통합하거나 일부 정보를 상단 카드로 흡수해 단 수 자체를 더 줄이기

## 2026-03-20 Phase 4 선택 버튼 간략화/결과 세로 고정 메모

- 완료:
  - `PlayPage` 품사/난이도/출제 방식 선택 버튼을 더 짧은 문구와 촘촘한 2열 그리드로 정리해 여러 줄 깨짐을 줄임
  - `PlayPage` 출제 방식 문구를 `한자 -> 뜻`, `후리가나 -> 뜻`, `음성 -> 뜻`, `뜻 -> 단어`로 축약
  - `ResultPage` / `ReviewPage` 상단 핵심 카드 영역을 완전 세로 흐름으로 고정해 좁은 화면에서 가로 배열이 생기지 않도록 보정
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 화면 요약 칩과 카운트 카드 높이를 더 줄여 첫 화면 고정에 더 가깝게 다듬기
  - `ResultPage` / `ReviewPage` 하단 별도 섹션도 계속 줄여 스크롤 길이를 더 짧게 만들기

## 2026-03-20 Phase 4 설정 선택 간략화/세로 고정 메모

- 완료:
  - `PlayPage` 품사/난이도/방식 선택 버튼을 더 짧은 문구와 2열 그리드형 선택 UI로 정리해 한눈에 보기 쉽게 압축
  - `PlayPage` 출제 방식 문구를 `한자 -> 뜻`, `후리가나 -> 뜻`, `음성 -> 뜻`, `뜻 -> 단어`로 최적화
  - `ResultPage` / `ReviewPage` 상단 핵심 카드 영역을 세로 고정으로 정리해 가로 분할 없이 위에서 아래로만 읽히게 보정
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 시작 전 설정 화면 전체 높이를 한 단계 더 줄여 첫 화면 완전 고정에 가깝게 다듬기
  - 결과/복습 하단 섹션도 계속 줄여 세로 흐름 안에서 스크롤 길이를 더 축소

## 2026-03-20 Phase 4 플레이 속도/모바일 고정폭 정리 메모

- 완료:
  - `PlayPage` 시작 전 세션 설정 화면의 타이포, 패딩, 버튼 높이를 전반적으로 축소해 첫 화면 안에서 최대한 스크롤 없이 보이도록 정리
  - `PlayPage` 답 선택 후 문구 중심 피드백을 제거하고 전환 대기 시간을 줄여 더 빠르게 다음 문제로 넘어가도록 조정
  - `ResultPage` / `ReviewPage` 상단 카드 레이아웃을 모바일에서 세로 고정으로 정리해 좁은 화면에서 가로 2단 분할이 나오지 않도록 보강
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 문제 카드와 선택지 텍스트 위계를 더 다듬고 첫 화면 노출량을 추가 확보
  - `ResultPage` / `ReviewPage` 하단 섹션을 더 줄이거나 상단 카드 안으로 흡수해 화면 단 수를 더 축소

## 2026-03-20 Phase 4 HUD 단순화/상단 액션 통합 메모

- 완료:
  - `PlayPage` 상단 HUD를 진행 칩 + 하트/점수/페이스 카드 중심으로 더 단순화해 상단 정보 분산을 줄임
  - `ResultPage` 상단 액션 카드에 추천 행동 요약을 함께 묶고 CTA 버튼 높이와 설명 밀도를 더 낮춤
  - `ReviewPage`도 추천 경로와 액션을 상단 요약 흐름 안으로 더 붙여 섹션 수를 줄임
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 문제 카드 헤더와 선택지 카드 텍스트 위계를 더 정리해 문제 집중도를 추가 개선
  - `ResultPage` / `ReviewPage`의 별도 하단 섹션을 더 줄이거나 상단으로 흡수해 화면 단 수를 더 축소

## 2026-03-20 Phase 4 PlayPage/결과 보조 영역 추가 압축 메모

- 완료:
  - `PlayPage` 상단 수치 카드와 하단 상태 스트립 높이를 추가로 줄이고 선택지 카드 높이와 간격도 더 낮춰 첫 화면 문제 노출량을 늘림
  - `ResultPage` 복습 미리보기 카드와 하단 버튼 영역 패딩/높이를 축소
  - `ReviewPage` 우측 보조 카드와 우선 복습 목록 카드 패딩을 줄여 첫 화면 밀도를 더 낮춤
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 상단 HUD 자체를 더 단순화하고 진행/하트/점수만 남기는 수준으로 한 단계 더 정리
  - `ResultPage` / `ReviewPage` 상단 요약 카드와 하단 액션을 더 강하게 통합해 섹션 수 자체를 줄이기

## 2026-03-20 Phase 4 PlayPage HUD/피드백 안정화 메모

- 완료:
  - `PlayPage` 상단 HUD와 상태 스트립 높이를 더 줄여 첫 화면에서 문제 본문이 더 빨리 보이도록 조정
  - 답 선택 뒤 잠깐 커졌다 사라지던 하단 피드백 박스를 항상 같은 높이의 얇은 스트립으로 고정해 화면 안정감을 개선
  - 문제 카드 헤더를 더 압축해 상단 중복 정보와 세로 길이를 추가 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 상단 HUD 수치 카드 자체를 더 얇게 줄이고 문제 카드/선택지 카드 높이를 추가로 조정
  - `ResultPage` / `ReviewPage` 하단 보조 카드와 버튼 영역을 더 과감하게 줄여 첫 화면 집중도 개선

## 2026-03-20 Phase 4 PlayPage 카드 결 강화 메모

- 완료:
  - `PlayPage` 상단 HUD와 문제 카드 사이에 짧은 연결 레일과 상단 톤 바를 추가해 상태 전환 흐름을 더 또렷하게 연결
  - 선택지 카드를 상태별 marker 톤, 좌측 액센트 바, 텍스트 대비 기준으로 다시 정리해 정답/오답/정답 공개 구분을 더 게임형으로 보강
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 상단 HUD와 상태 스트립 높이를 한 단계 더 얇게 줄이고 문제 카드 상단 헤더 중복 요소를 더 덜어내기
  - `ResultPage` / `ReviewPage` 하단 보조 카드와 버튼 영역 밀도를 추가로 줄여 첫 화면 집중도 개선

## 2026-03-20 Phase 4 HUD/요약 밀도 축소 메모

- 완료:
  - `PlayPage` 상단 HUD를 더 얇게 줄이고 상태 스트립 안에 출제 방식/상태/메타를 한 줄 흐름으로 정리
  - 문제 카드 상단 중복 칩을 줄이고 헤더 타이포를 조금 낮춰 첫 화면에서 문제 본문 집중도를 강화
  - `ResultPage` / `ReviewPage` 상단 요약 카드와 CTA 카드 패딩, 보조 문구, 수치 카드 크기를 함께 압축
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 상태 스트립과 문제 카드 사이 전환 시각 효과를 더 선명하게 연결하고, 선택지 카드도 한 단계 더 게임형으로 정리
  - `ResultPage` / `ReviewPage` 하단 보조 카드와 버튼 영역을 더 과감하게 줄여서 첫 화면 집중도 추가 개선

## 2026-03-20 Phase 4 피드백/CTA 압축 메모

- 완료:
  - `PlayPage` 하단 피드백 박스에서 상단 상태 스트립과 겹치던 정답/오답 문구를 제거하고, 보조 정보만 남겨 역할을 분리
  - `ResultPage` / `ReviewPage` 핵심 CTA를 상단 요약 영역 안으로 옮겨 첫 화면에서 추천 흐름을 더 빨리 읽도록 재배치
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 상단 상태 스트립 자체를 더 얇게 다듬고 문제 카드와 시각적 연결감을 더 강화
  - `ResultPage` / `ReviewPage` 상단 요약 카드의 정보 밀도도 한 단계 더 줄여서 핵심 행동만 남기기

## 2026-03-20 Phase 4 HUD/전환 연결 메모

- 완료:
  - `PlayPage`에 문제 카드 전환 상태(`enter` / `impact` / `steady`)를 추가해 답변 직후와 다음 문제 진입 시 카드/선택지 반응을 같은 템포로 정리
  - 상단 HUD 안에 상태 스트립을 통합해 보상, 상태, 진행 요약이 한 묶음으로 보이도록 연결
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 피드백 박스까지 HUD 상태 스트립과 더 자연스럽게 역할 분리해서 중복 텍스트를 줄이기
  - `ResultPage` / `ReviewPage` 핵심 CTA를 상단 요약 카드와 더 밀착시켜 첫 화면 판단 속도 개선

## 2026-03-19 Phase 4 전환/CTA 보강 메모

- 완료:
  - `PlayPage` 답변 직후 전환 시간을 `420ms`로 늘리고 선택지 강조, 문제 카드 상태 톤, 진행 바 전환을 더 분명하게 조정
  - `ResultPage` / `ReviewPage` CTA 카드에 추천 액션별 컬러 대비와 hover 톤을 추가해 우선 액션 식별성 강화
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 답변 직후 상태 스트립과 상단 HUD를 더 자연스럽게 연결하고 문제 전환 애니메이션을 한 단계 더 게임형으로 보강
  - `ResultPage` / `ReviewPage` 핵심 CTA를 더 상단 맥락과 붙여서 첫 화면 판단 속도 개선

## 2026-03-19 Phase 4 보상/위계 보강 메모

- 완료:
  - `PlayPage` 보상 칩, 상태 카드, 문제/선택지 카드 대비 강화
  - `ResultPage` / `ReviewPage` 제목 위계와 보조 영역 패딩 추가 정리
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 답변 직후 전환 속도와 상태 변화 애니메이션을 더 뚜렷하게 조정
  - `ResultPage` / `ReviewPage` CTA 컬러 체계와 핵심 요약 대비를 더 선명하게 정리

## 2026-03-19 Phase 4 카드 톤/밀도 정리 메모

- 완료:
  - `PlayPage` 문제 카드와 선택지 카드의 시각 톤 강화
  - `ResultPage` / `ReviewPage` 남은 보조 카드 패딩과 밀도 추가 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 답변 직후 전환 효과와 보상 연출을 더 게임형으로 강화
  - `ResultPage` / `ReviewPage` 텍스트 위계와 색 톤을 더 선명하게 정리

## 2026-03-19 Phase 4 HUD 카드/섹션 통합 메모

- 완료:
  - `PlayPage` 상단 HUD를 작은 상태 카드형으로 정리
  - `ResultPage` / `ReviewPage` 액션 영역을 핵심 요약 카드와 더 가깝게 통합
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 문제 카드와 선택지 시각 톤을 더 하이엔드하게 강화
  - `ResultPage` / `ReviewPage` 남은 보조 카드 밀도도 추가로 줄이기

## 2026-03-19 Phase 4 HUD/액션 정리 메모

- 완료:
  - `PlayPage` 상단 HUD 정보량을 더 줄이고 점수/콤보를 한 줄로 압축
  - `ResultPage` / `ReviewPage` 하단 액션 버튼 영역을 더 단순한 흐름으로 재배치
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` HUD 시각 스타일을 더 게임형으로 다듬기
  - `ResultPage` / `ReviewPage` 남은 카드 묶음도 더 과감하게 통합하기

## 2026-03-19 Phase 4 화면 압축 메모

- 완료:
  - `PlayPage` 답변 직후 피드백 박스를 축소하고 HUD 중심 흐름으로 정리
  - `ResultPage` 다음 액션/세션 평가 카드 통합
  - `ReviewPage` 복습 스냅샷/다음 액션 카드 통합
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 상단 HUD 정보량을 한 번 더 줄이고 상태 표현을 더 게임형으로 정리
  - `ResultPage` / `ReviewPage` 하단 액션 버튼 영역도 더 단순하게 재배치

## 2026-03-19 Phase 4 UI 정리 메모

- 완료:
  - `PlayPage` 상단 HUD를 더 얇게 압축하고 답변 직후 보상 칩만 짧게 노출
  - 문제 카드 / 선택지 카드 높이를 줄여 첫 화면 문제 가시성 개선
  - `ResultPage`, `ReviewPage` 상태 문구와 CTA 설명 밀도 축소
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 피드백 박스 자체를 더 작게 줄이고 HUD와 자연스럽게 합치기
  - `ResultPage` / `ReviewPage` 카드 수와 레이아웃을 한 번 더 줄여 모바일 첫 화면 집중도 높이기

## 현재 진행 Phase

Phase 4: 고급 기능 추가

## 현재 판단

- Phase 3 종료 조건은 충족된 상태다.
- 확인 완료:
  - `npm run test`
  - `npm run build`
  - `npm run refresh:json`
  - `npm run check:live`
- 이제 우선순위는 문서 미세 수정이 아니라 게임 경험 전면 개편이다.

## Phase 4 목표

현재 학습 루프를 유지한 채, 플레이 감각과 선택 흐름을 전면 개편해 실제 게임다운 체감으로 끌어올린다.

## 이번 Phase 핵심 범위

- 하이엔드 게임 감성 UI 전면 개편
- 플레이 HUD / 전환 / 이펙트 / 보상감 강화
- 품사 / 난이도 / 출제 방식 선택 플로우 재구성
- 문제 생성 로직 / distractor 품질 / 출제 규칙 재설계
- 업적 시스템 기초
- 이미지 문제 / 듣기 모드 / 자기채점 작문 준비 구조

## 바로 다음 큰 작업 우선순위

### 1. 플레이 구조 재설계

- 품사 선택 UI
- 난이도 선택 UI
- 출제 방식 선택 UI
- 선택값을 세션 설정과 결과 화면까지 이어주는 구조 정리

### 2. 플레이 화면 전면 개편

- 현재 `PlayPage`를 하이엔드 게임 감성 기준으로 재구성
- 상단 HUD, 진행도, 피드백, 결과 직전 전환을 전면 정리
- 모바일 우선 레이아웃 유지

### 3. 문제 생성 품질 개선

- 랜덤 출제 규칙 재점검
- 오답 보기 품질 개선
- 문제 유형별 prompt / answer / choices 생성 규칙 재설계
- 품사 / 난이도 / 출제 방식과 문제 풀 연결

## 이번 Phase에서 먼저 보류할 것

- 관리자 UI 완성형
- 다국어 추가
- PWA 마무리
- Cloudflare 운영 정리

## 현재 리스크 메모

- 터미널 출력에서는 일부 한글이 깨져 보일 수 있지만, 실제 파일 UTF-8 내용과 검증 결과는 정상이다.
- Node child process의 `shell: true` 경고는 남아 있지만 현재 검증 흐름의 blocker는 아니다.
- Phase 4는 소문구 보정보다 화면 구조와 게임 UX를 크게 바꾸는 작업 단위로 진행해야 한다.

## 다음 작업 메모

- 다음 턴부터는 `PlayPage` 중심 Phase 4 첫 묶음으로 바로 들어간다.
- 작업 단위는 작게 쪼개지 말고, 선택 플로우 + HUD 뼈대 + 문제 세션 설정 연결처럼 체감 큰 범위로 묶는다.
## 2026-03-19 Phase 4 진행 메모

- `PlayPage` 1차 묶음 완료:
  - 품사 / 난이도 / 출제 방식 세션 설정 UI 추가
  - 선택값 기준 문제 풀 필터링 적용
  - 결과 화면으로 세션 설정 상태 전달 및 재도전/연습 재사용 연결
- 검증 완료:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- `PlayPage` 2차 묶음 완료:
  - Mission Control 상단 HUD, 진행 바, 상태 칩, 피드백 콘솔 중심의 전면 레이아웃 개편
  - 질문 카드, A/B/C/D 선택 카드, loadout 카드, 우측 세션 설정 패널 구조로 플레이 몰입감 강화
  - 개편된 HUD 구조 기준으로 `PlayPage.test.tsx` 검증식 정리
- 검증 완료:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 문제 생성 품질 1차 묶음 완료:
  - `questionRound`에서 중복/빈 choice 제거, 정답 보장, 같은 난이도/품사 distractor 우선 선택 적용
  - 유효한 데이터 풀로 먼저 보기를 구성하고, 부족할 때만 기존 DTO choice를 fallback으로 보강
  - `questionRound.test.ts`와 `PlayPage.test.tsx`를 새 출제 규칙 기준으로 정리
- 검증 완료:
  - `npm run test -- src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 세션 설정 흐름 연결 1차 묶음 완료:
  - `questionOrder` 설정을 추가해 `균형 흐름 / 단어 우선 / 뜻 우선` 세션 순서 제어 지원
  - 마지막 세션 설정을 저장해 홈/결과/복습에서 같은 구성으로 다시 플레이/연습 진입 가능
  - 홈/복습/결과 화면에 최근 세션 구성 요약 표시
- 검증 완료:
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 큰 작업:
  - 게임 중 전환 효과, 보상감, 모바일 HUD 밀도 추가 보강
  - 출제 방식별 문제 순서와 난이도 체감 흐름을 더 세밀하게 고도화
  - 게임 중 전환 효과, 보상감, 모바일 HUD 밀도 추가 보강
  - 복습센터에서 세션 설정 기반 추천 액션을 더 직접적으로 연결
## 2026-03-19 Phase 4 추가 메모

- 출제 흐름 2차 묶음 완료:
  - `buildSessionWordQueue`에 복습 스냅샷 우선순위를 연결해 기본 플레이는 같은 난이도 안에서 복습 대상이 앞쪽으로 오고, 연습 모드는 복습 대상부터 먼저 여는 큐로 보강
  - `PlayPage`에 복습 우선 / 오프닝 / 난이도 흐름 브리핑을 추가해 세션 설정이 실제 출제 큐에 어떻게 반영되는지 보이도록 정리
  - `sessionConfig.test.ts`, `PlayPage.test.tsx`에 standard/practice 큐 흐름 회귀 테스트 추가
- 검증 완료:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/pages/PlayPage.test.tsx src/pages/HomePage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 다음 큰 작업:
  - 전환 효과, 보상감, 모바일 HUD 밀도 보강
  - 복습센터 추천 액션을 세션 설정/복습 우선 큐와 더 직접적으로 연결
## 2026-03-19 Phase 4 시작 UX 메모

- `PlayPage` 시작 진입 정리:
  - 플레이 진입 직후에는 문제를 바로 보여주지 않고 세션 설정 화면을 먼저 노출
  - `게임 시작` / `연습 시작`을 눌렀을 때만 실제 문제 라운드 시작
- `PlayPage` 시작 화면 밀도 축소:
  - 시작 전 화면은 선택 그룹 + 현재 설정 칩 + 준비 문제 수 중심으로 단순화
  - 버튼 설명성 문구와 과한 요약 카드 제거
- `PlayPage` 게임 화면 레이아웃 정리:
  - 시작 전/시작 후 모두 큰 섹션 배치를 세로 단일 흐름으로 정리
  - 게임 시작 후 우측 `세션 설정` 패널 제거
- 검증 완료:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/HomePage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 다음 큰 작업:
  - 전환 효과, 보상감, 모바일 HUD 밀도 보강
  - 복습센터 추천 액션을 세션 설정/복습 우선 큐와 더 직접적으로 연결
## 2026-03-19 Phase 4 플레이 압축 메모

- `PlayPage` 설정 화면에서 `문제 흐름`을 제거하고 출제 방식을 `단어(한자) -> 뜻`, `단어(후리가나) -> 뜻`, `단어(음성) -> 뜻`, `뜻 -> 단어` 4개로 고정
- 게임 시작 후에는 세션 설정 섹션을 숨기고, 상단 HUD를 진행도/하트/점수/콤보/상태 칩 중심의 압축형으로 정리
- 문제 카드와 보기 카드가 첫 화면 안에 바로 보이도록 불필요한 설명 문구와 보조 카드 제거
- 관련 테스트를 새 설정 구조 기준으로 재정리
- 검증 완료:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/pages/PlayPage.test.tsx src/pages/HomePage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - `PlayPage` 전환 효과와 보상감 연출 보강
  - 결과/복습 화면의 CTA 설명 밀도 추가 축소
