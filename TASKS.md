# TASKS.md

## 2026-03-26 Phase 4 GitHub Pages 배포 준비 메모

- 완료:
  - `HashRouter`로 전환해 GitHub Pages 정적 배포 환경에서도 라우팅이 안정적으로 동작하도록 정리
  - `vite.config`에 저장소 경로 기준 `base` 설정 추가
  - `.github/workflows/deploy-pages.yml`을 추가해 `main` push 시 자동 배포되도록 구성
  - `README.md`에 GitHub Pages 배포 절차를 최소 범위로 반영
- 검증:
  - `npm run build`
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/StatsPage.test.tsx`
- 다음 작업:
  - GitHub 저장소 Pages 설정을 `GitHub Actions`로 전환
  - `main` push 후 실제 배포 URL 접속 확인


## 2026-03-25 Phase 4 Google Sheets JSON 발행 GUI 메모

- 완료:
  - `export_words_json.py`를 UTF-8 기준으로 정리하고 기존 Google Sheets JSON 생성 스크립트 래퍼로 재구성
  - `json_publish_gui.py`를 추가해 `1단계 JSON 생성 + 검증`, `2단계 GitHub 반영`을 버튼으로 실행하는 로컬 Python GUI 도구 구현
  - `package.json`에 `words:gui` 실행 스크립트 추가
- 검증:
  - `python -m py_compile scripts/export_words_json.py scripts/json_publish_gui.py`
- 다음 작업:
  - 실제 서비스 계정 JSON / 스프레드시트 ID로 GUI 실행 확인
  - 필요하면 GitHub 반영 대상 경로나 커밋 메시지 정책만 추가 보정


## 2026-03-25 Phase 4 통계 순서/방식별 순위/전체순위표 메모

- 완료:
  - `StatsPage` 박스 순서를 성과 요약 → 순위표 → 바로 이동 → 누적 집계 완료 → 기록 전체삭제로 재배치
  - `StatsPage` 순위표에 출제 방식 선택을 추가하고, 방식별 개인 순위를 분리 표시
  - `HomePage`에 `전체 순위표` 진입 버튼 추가
  - `OverallLeaderboardPage`를 추가해 언어별/방식별 전체 사용자 Top 50 순위를 닉네임 기준으로 표시
  - 표준 플레이 결과 저장 시 개인 순위표와 전체 순위표를 함께 갱신하도록 연결
- 검증:
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/StatsPage.test.tsx src/pages/OverallLeaderboardPage.test.tsx src/pages/ResultPage.test.tsx src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 플레이 기준으로 통계/전체순위표 흐름 확인
  - 순위표 표기나 필터 UX는 사용자 피드백 기준으로 잔수정


## 2026-03-25 Phase 4 통계 순위표/보기 랜덤화 메모

- 완료:
  - `StatsPage`에 결과 화면과 같은 Top 10 순위표 추가
  - 보기 생성에서 길이 유사도 가중치를 제거하고, 같은 품질대 후보를 seed 기반으로 섞도록 조정
  - 통계 화면/보기 생성 회귀 테스트 정리
- 검증:
  - `npm run test -- src/pages/StatsPage.test.tsx src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 플레이에서 보기 체감 랜덤성 확인
  - 통계/결과/저장 흐름 수동 점검 후 사례 기반 잔수정

## 2026-03-25 Phase 4 복습모드 전환 메모

- 완료:
  - 기존 `ReviewPage` 복습센터 리스트 UI를 제거하고 실제 `복습 모드` 시작/플레이 흐름으로 교체
  - 복습 모드는 틀린 단어만 랜덤으로 1회씩 풀고, 누적 정답 5회 도달 시 복습 대상에서 제거되도록 구현
  - 복습 모드도 일반/연습과 같이 시작 전 출제 방식/품사/난이도 선택 화면을 거치도록 통일
  - 표준 플레이는 틀린 답만 복습 상태에 누적하고, 연습 모드는 복습 상태/통계에 영향을 주지 않도록 정리
- 검증:
  - `npm run test -- src/utils/reviewState.test.ts src/pages/ReviewPage.test.tsx src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/HomePage.test.tsx src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저에서 표준 플레이 → 복습 모드 → 결과 이동 흐름 수동 확인
  - 사용자 피드백 기준으로 남는 출제/저장/UI 사례만 수정

## 2026-03-24 Phase 4 시작 전/결과/복습 가독성 재조정 메모

- 완료:
  - PlayPage 시작 전 품사/난이도/방식 선택 버튼, 문제 블록 수치, 시작 버튼 글자 크기를 읽기 쉬운 수준으로 재상향
  - PlayPage 시작 전 숨은 보조 블록 제거
  - ResultPage 결과 요약 CTA, 상태 칩, 수치 카드, 세션 구성 칩 글자 크기 재상향
  - ReviewPage 복습 요약 CTA, 상태 칩, 수치 카드, 세션 구성/우선 복습 칩 글자 크기 재상향
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - PlayPage 시작 전 카드 최종 균형 마감
  - ResultPage / ReviewPage 라벨과 칩 표기 최종 압축

- 메모:
  - `audio_to_meaning`은 현재 데이터 부재로 비활성화 유지, UI에는 `준비 중`으로 표시
  - 세션 큐는 같은 단어군/같은 의미가 연속으로 몰리지 않도록 추가 보정 진행
  - 보기 배열은 정답이 고정 위치에 머물지 않도록 안정적인 셔플 적용

## 2026-03-24 Phase 4 시작 전/결과/복습 5개 묶음 균형 정리 메모

- 완료:
  - PlayPage 시작 전 카드 외곽, 상단 버튼, 선택 그룹 여백을 읽기 쉬운 크기 기준으로 재정렬
  - PlayPage 시작 전 `문제` 블록 수치 라인과 시작 버튼 균형 재조정
  - ResultPage 결과 요약 CTA 버튼 영역과 하단 스냅샷 카드 간격/행 높이 정리
  - ReviewPage 복습 요약 CTA 버튼 영역과 하단 스냅샷 카드 간격/행 높이 정리
  - ResultPage / ReviewPage 공통 수치 카드 패딩을 가독성 유지 기준으로 재정렬
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - PlayPage 시작 전 카드 최종 마감
  - ResultPage / ReviewPage 라벨과 칩 표기 최종 압축

## 2026-03-24 Phase 4 시작 전/결과/복습 5개 묶음 카드 마감 메모

- 완료:
  - PlayPage 시작 전 타이틀/상단 버튼 줄 간격과 카드 외곽 균형 추가 정리
  - PlayPage 시작 전 `문제` 블록의 설정 요약 줄을 수치 줄 아래로 분리해 가독성 보정
  - ResultPage 상단 상태 줄과 하단 리뷰 행 칩 문구를 더 짧게 정리
  - ReviewPage 상단/하단 카드 패딩을 가독성 유지 기준으로 재정렬
  - ResultPage / ReviewPage 하단 행 칩의 중복 라벨 일부 정리
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - PlayPage 시작 전 카드 최종 마감
  - ResultPage / ReviewPage 하단 구역 구분감 추가 축소

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 媛?낆꽦 洹좏삎 蹂듦뎄 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?좏깮 洹몃９ ?쒕ぉ/踰꾪듉, `臾몄젣` 釉붾줉 ?고듃 ?ш린瑜?媛?낆꽦 媛?ν븳 ?섏??쇰줈 蹂듦뎄
  - `ResultPage` CTA 踰꾪듉, ???硫붿떆吏, ?섏튂 移대뱶 ?고듃 ?ш린 蹂듦뎄
  - `ReviewPage` CTA 踰꾪듉, 鍮??곹깭 移대뱶, ?섏튂 移대뱶 ?고듃 ?ш린 蹂듦뎄
  - ???섏씠吏 ?좎? ?먮쫫? ?대━怨?怨쇰룄??珥덉냼????댄룷留??섎룎由?  - ?⑥? 蹂댁“ 釉붾줉? 鍮꾨끂異??곹깭 ?좎?, ?ㅼ쓬 ?뺣━ 臾띠쓬?먯꽌 ?쒓굅 ?덉젙
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??移대뱶 理쒖쥌 留덇컧
  - `PlayPage` ?⑥? 蹂댁“ 釉붾줉 ?꾩쟾 ?뺣━
  - `ResultPage` / `ReviewPage` ?쇰꺼怨?移??쒓린 理쒖쥌 ?뺤텞

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 留덇컧 ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ??移대뱶 ?멸낸, ??댄?, ?곷떒 踰꾪듉, ?듭뀡 臾띠쓬, `臾몄젣` 釉붾줉 ?믪씠瑜????④퀎 ??異뺤냼
  - `PlayPage` ?쒖옉 ??`臾몄젣` 釉붾줉 ?섏튂/?쒖옉 踰꾪듉 ??댄룷瑜?異붽?濡??뺤텞
  - `ResultPage` ?섎떒 ?ㅻ깄??移대뱶? ?섎떒 踰꾪듉 援ъ뿭 援щ텇???믪씠瑜?異붽?濡?異뺤냼
  - `ReviewPage` ?곷떒 移대뱶? ?섎떒 ?ㅻ깄??移대뱶, 鍮??곹깭 移대뱶 ?믪씠瑜?異붽?濡?異뺤냼
  - `ResultPage` / `ReviewPage` 怨듯넻 ?섏튂 移대뱶 ??댄룷瑜?異붽?濡?異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?⑥? 蹂댁“ 釉붾줉 ?꾩쟾 ?뺣━
  - `ResultPage` / `ReviewPage` ?쇰꺼怨?移??쒓린 理쒖쥌 ?뺤텞

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 ?섎떒 援ъ뿭 異붽? ?듯빀 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?듭뀡 臾띠쓬, `臾몄젣` 釉붾줉 ?믪씠瑜????④퀎 ??異뺤냼
  - `PlayPage` ?쒖옉 ??移대뱶 ?멸낸怨?`臾몄젣` 釉붾줉 ?쇱슫?쒕? ???뉕쾶 ?뺣━
  - `ResultPage` ?섎떒 ?ㅻ깄??移대뱶 ?멸낸怨??섎떒 踰꾪듉 援ъ뿭 ?믪씠 異붽? 異뺤냼
  - `ReviewPage` ?곷떒 移대뱶? ?섎떒 ?ㅻ깄??移대뱶 ?믪씠 異붽? 異뺤냼
  - `ResultPage` / `ReviewPage` 怨듯넻 ?섏튂 移대뱶 ??댄룷? 諛??異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??移대뱶 理쒖쥌 留덇컧
  - `ResultPage` / `ReviewPage` ?섎떒 援ъ뿭 援щ텇媛?異붽? 異뺤냼? ?쇰꺼 理쒖쥌 ?뺤텞

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 移대뱶 ?듯빀 留덇컧 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ??移대뱶 ?멸낸, ?곷떒 踰꾪듉, ?듭뀡 臾띠쓬, `臾몄젣` 釉붾줉 ?믪씠瑜?異붽?濡?異뺤냼
  - `PlayPage` ?쒖옉 ??`臾몄젣` 釉붾줉 ?섏튂/踰꾪듉 諛?꾨? ??以꾩뿬 泥??붾㈃ 怨좎젙??媛源앷쾶 ?뺣━
  - `ResultPage` ?곷떒 ?≪뀡 踰꾪듉, ???硫붿떆吏, ?섎떒 ?ㅻ깄??移대뱶/由щ럭 ??移?諛??異붽? 異뺤냼
  - `ReviewPage` ?곷떒 ?≪뀡 踰꾪듉, ?섎떒 ?ㅻ깄??移대뱶/?곗꽑 蹂듭뒿 ??移?諛??異붽? 異뺤냼
  - `ReviewPage` 鍮??곹깭 移대뱶 ?믪씠? 湲???ш린 異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??移대뱶 ?듯빀 留덈Т由ъ? ?곷떒 ?щ갚 理쒖쥌 ?뺣━
  - `ResultPage` / `ReviewPage` ?섎떒 移대뱶? ?≪뀡 援ъ뿭 援щ텇媛?異붽? 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 移?諛??異붽? ?뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?怨??곷떒 踰꾪듉 ?믪씠瑜????④퀎 ??異뺤냼
  - `PlayPage` ?쒖옉 ??`臾몄젣` 釉붾줉 ?멸낸 ?쇱슫?쒕? 異붽?濡?異뺤냼
  - `ResultPage` ?섎떒 ?ㅻ깄??移대뱶 ?대? 援ъ꽦 移??⑤뵫怨?湲???ш린瑜?異붽? 異뺤냼
  - `ResultPage` 由щ럭 ???곹깭 移??⑤뵫怨?湲???ш린瑜?異붽? 異뺤냼
  - `ReviewPage` ?섎떒 ?ㅻ깄??移대뱶? ?곗꽑 蹂듭뒿 ??移??⑤뵫/湲???ш린瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??移대뱶 ?듯빀 留덈Т由ъ? ?④? 蹂댁“ 以??뺣━
  - `ResultPage` / `ReviewPage` ?섎떒 ?ㅻ깄??移대뱶 ?대? ??踰꾪듉 諛??異붽? ?뺣━

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 ???믪씠 異붽? 異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ??`臾몄젣` 釉붾줉 ?멸낸 ?쇱슫?쒖? ?듭뀡 洹몃９ 臾띠쓬 ?멸낸?????뉕쾶 ?뺣━
  - `ResultPage` ?섎떒 ?ㅻ깄??移대뱶 ?멸낸 ?쇱슫?쒖? 由щ럭 ???믪씠瑜?異붽? 異뺤냼
  - `ResultPage` ?섎떒 踰꾪듉 ?믪씠? 湲???ш린瑜????④퀎 ??異뺤냼
  - `ReviewPage` ?섎떒 ?ㅻ깄??移대뱶 ?멸낸 ?쇱슫?쒖? ?곗꽑 蹂듭뒿 ???믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?곗꽑 蹂듭뒿 ??ぉ ?띿뒪???ш린瑜????④퀎 ????떠 ?몃줈 湲몄씠 異붽? ?덇컧
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??移대뱶 ?듯빀 留덈Т由ъ? ?곷떒 踰꾪듉/??댄? 以?異붽? 異뺤냼
  - `ResultPage` / `ReviewPage` ?섎떒 ?ㅻ깄??移대뱶 ?대? 移???諛??異붽? ?뺣━

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 移대뱶 寃고빀媛?蹂댁젙 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???듭뀡 洹몃９ 諛붽묑???뉗? 怨듯넻 移대뱶濡?臾띠뼱 `臾몄젣` 釉붾줉怨??????⑹뼱由ъ쿂??蹂댁씠寃??뺣━
  - `PlayPage` ?쒖옉 ???④꺼??蹂댁“ 以꾩? ?좎??섎릺 ?곷떒 ?좏깮 ?곸뿭怨??섎떒 ?섏튂 釉붾줉 媛??꾧퀎瑜????뺤텞
  - `ResultPage` ?꾩껜 ?뱀뀡 媛꾧꺽, ???硫붿떆吏 移대뱶, ?섎떒 ?ㅻ깄??移대뱶 ?멸낸 ?믪씠瑜?異붽?濡?異뺤냼
  - `ResultPage` ?섎떒 ?≪뀡 踰꾪듉 援ъ뿭???ㅻ깄??移대뱶? ??遺숈뿬 ?뱀뀡 遺꾨━媛먯쓣 異뺤냼
  - `ReviewPage` ?곷떒 移대뱶/?≪뀡 援ъ뿭/?섎떒 ?ㅻ깄??移대뱶 媛꾧꺽怨??멸낸 ?믪씠瑜?異붽?濡?異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??`臾몄젣` 釉붾줉怨??듭뀡 洹몃９ ?쒓컖 ?듯빀 留덈Т由?  - `ResultPage` / `ReviewPage` ?섎떒 ?ㅻ깄??移대뱶 ?대? ???믪씠? 踰꾪듉 援ъ뿭 異붽? ?뺣━

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 蹂댁“ 以??쒓굅 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ??`臾몄젣` 釉붾줉 ?섏튂/踰꾪듉 ?믪씠瑜????④퀎 ????땄
  - `PlayPage` ?쒖옉 ???섎떒 蹂댁“ ?붿빟 以꾩쓣 ?④꺼 泥??붾㈃ 湲몄씠 異붽? 異뺤냼
  - `ResultPage` 異붿쿇 寃쎈줈/?몄뀡 ?됯? 移⑹쓣 ??以꾨줈 ?듯빀
  - `ResultPage` ????덈궡 硫붿떆吏 移대뱶 ?믪씠瑜?異붽?濡?異뺤냼
  - `ReviewPage` 異붿쿇 寃쎈줈瑜??곷떒 ?곹깭 以꾨줈 ?≪닔??蹂꾨룄 以??쒓굅
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???듭뀡 洹몃９怨?`臾몄젣` 釉붾줉 ?쒓컖 ?듯빀 留덈Т由?  - `ResultPage` / `ReviewPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡 援ъ뿭 異붽? ?듯빀

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?듭뀡 踰꾪듉 ?믪씠瑜?異붽?濡?異뺤냼
  - `PlayPage` ?쒖옉 踰꾪듉???덈뒗 `臾몄젣` 釉붾줉 ?섏튂 ?쇱씤?????뺤텞
  - `ResultPage` ?곷떒 ?곹깭 移? CTA 踰꾪듉, ?섎떒 ?섏튂/由щ럭 ???믪씠瑜?異붽?濡?異뺤냼
  - `ReviewPage` ?곷떒 ?곹깭 移? CTA 踰꾪듉, ?곗꽑 蹂듭뒿 ??鍮??곹깭 移대뱶 ?믪씠瑜?異붽?濡?異뺤냼
  - `ResultPage` / `ReviewPage` ?붿빟 移대뱶 ?レ옄 ??댄룷瑜????④퀎 ????떠 泥??붾㈃ 湲몄씠 異붽? ?덇컧
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃ ?⑥? ?붿빟 以꾧낵 `臾몄젣` 釉붾줉????以꾩뿬 泥??붾㈃ 怨좎젙 留덈Т由?  - `ResultPage` / `ReviewPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡 援ъ뿭 異붽? ?듯빀

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 5媛?臾띠쓬 移대뱶 ?듯빀媛?蹂댁젙 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?怨??멸낸 ?щ갚????以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?곷떒 寃곌낵 移대뱶 ?⑤뵫怨??≪뀡 ?곸뿭 媛꾧꺽??以꾩뿬 移대뱶 臾띠쓬????遺숈뼱 蹂댁씠寃??뺣━
  - `ResultPage` ?섎떒 ?≪뀡 踰꾪듉??2???뺤텞 援ъ“濡?議곗젙
  - `ReviewPage` ?곷떒 由щ럭 移대뱶 ?⑤뵫怨??≪뀡 ?곸뿭 媛꾧꺽??以꾩뿬 移대뱶 臾띠쓬????遺숈뼱 蹂댁씠寃??뺣━
  - `ReviewPage` 鍮??곹깭 移대뱶? ?섏튂 移대뱶 ?⑤뵫??異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃ 泥??붾㈃ 怨좎젙 ?섏? 理쒖쥌 留덈Т由?  - `ResultPage` / `ReviewPage` ?곷떒 移대뱶? ?섎떒 ?≪뀡?????듯빀???뱀뀡 ???먯껜 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 媛꾧꺽 異붽? ?뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?怨??멸낸 ?щ갚????以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡 援ъ뿭 媛꾧꺽????遺숈뿬 ?몃줈 湲몄씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡 援ъ뿭 媛꾧꺽????遺숈뿬 ?몃줈 湲몄씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃ 泥??붾㈃ 怨좎젙 ?섏? 理쒖쥌 留덈Т由?  - `ResultPage` / `ReviewPage` 移대뱶 臾띠쓬 ???듯빀?댁꽌 ?뱀뀡 ???먯껜 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 ?덉씠?꾩썐 留덉?留??뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?붿빟 以??믪씠瑜???以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?ㅻ깄??移대뱶 ?대? 媛꾧꺽, 蹂댁“ 移? 誘몃━蹂닿린 ?? ?섎떒 ?≪뀡 媛꾧꺽??異붽? 異뺤냼
  - `ReviewPage` ?ㅻ깄??移대뱶 ?대? 媛꾧꺽, 蹂댁“ 移? ?곗꽑 蹂듭뒿 ?? ?섎떒 ?≪뀡 媛꾧꺽??異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃ 泥??붾㈃ 怨좎젙 ?섏? 理쒖쥌 留덈Т由?  - `ResultPage` / `ReviewPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡?????듯빀???뱀뀡 ???먯껜 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 ?붾㈃ ?믪씠 異붽? 異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?좏깮 踰꾪듉, 以鍮?臾몄젣 釉붾줉 ?믪씠瑜?異붽?濡???以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?곷떒 蹂댁“ 移? ?ㅻ깄???붿빟 移대뱶, 由щ럭 誘몃━蹂닿린 ?? ?섎떒 踰꾪듉 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?곷떒 蹂댁“ 移? ?ㅻ깄???붿빟 移대뱶, ?곗꽑 蹂듭뒿 ?? ?섎떒 踰꾪듉/鍮??곹깭 移대뱶 ?믪씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃??嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏??쇰줈 ??以꾩씠湲?  - `ResultPage` / `ReviewPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡 援ъ뿭?????듯빀???몃줈 湲몄씠 異붽? 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 踰꾪듉쨌移?異붽? 珥덉븬異?硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?좏깮 踰꾪듉, 以鍮?臾몄젣 釉붾줉??????떠 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?곷떒 蹂댁“ 移? 由щ럭 誘몃━蹂닿린 ?? ?섎떒 踰꾪듉 ?믪씠? 湲???ш린瑜?異붽? 異뺤냼
  - `ReviewPage` ?곷떒 蹂댁“ 移? ?곗꽑 蹂듭뒿 ?? ?섎떒 踰꾪듉怨?鍮??곹깭 移대뱶 ?믪씠? 湲???ш린瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃???ъ떎??泥??붾㈃ 怨좎젙 ?섏??쇰줈 ??以꾩씠湲?  - `ResultPage` / `ReviewPage` ?ㅻ깄??移대뱶? ?섎떒 ?≪뀡?????듯빀???몃줈 湲몄씠 異붽? 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 異붽? 珥덉븬異?硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???좏깮 洹몃９ ?쒕ぉ, ?곷떒 踰꾪듉, 以鍮?臾몄젣 釉붾줉??????텛怨??쇰꺼????吏㏐쾶 ?뺣━
  - `ResultPage` ?곷떒 蹂댁“ 移? ?ㅻ깄??蹂댁“ 移? 由щ럭 誘몃━蹂닿린 ?? ?섎떒 踰꾪듉 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?곷떒 蹂댁“ 移? ?ㅻ깄??蹂댁“ 移? ?곗꽑 蹂듭뒿 ?? 鍮??곹깭 移대뱶 ?믪씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃??嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? ??以꾩씠湲?  - `ResultPage` / `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶 ??蹂댁“ 移⑷낵 ?섎떒 ?≪뀡 ?곸뿭 ???⑥닚??
## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 蹂댁“ ?쇰꺼 異붽? ?뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ????댄?, ?곷떒 踰꾪듉, ?듭뀡 洹몃９, 以鍮?臾몄젣 釉붾줉 ?믪씠? ?쇰꺼????以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?곷떒 ?ㅻ깄??移대뱶???쒕ぉ???쇰꺼??以꾩씠怨??섏튂 移대뱶/蹂댁“ ?곸뿭 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶???쒕ぉ???쇰꺼??以꾩씠怨??섏튂 移대뱶/蹂댁“ ?곸뿭 ?믪씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???좏깮 洹몃９ ?쒕ぉ怨?以鍮?臾몄젣 釉붾줉????以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏??쇰줈 留덈Т由?  - `ResultPage` / `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶 ??蹂댁“ 移⑷낵 ?섎떒 蹂댁“ ?곸뿭?????⑥닚??
## 2026-03-24 Phase 4 ?쒖옉 ??寃곌낵/蹂듭뒿 3媛?臾띠쓬 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???곷떒 踰꾪듉, ?듭뀡 洹몃９, 以鍮?臾몄젣 釉붾줉 ?믪씠瑜????④퀎 ??以꾩씠怨??⑥? 援щЦ 源⑥쭚??蹂듦뎄
  - `ResultPage` ?곷떒 ?ㅻ깄??移대뱶? CTA/蹂댁“ ?곸뿭 ?믪씠瑜?異붽?濡?以꾩뿬 泥??붾㈃ 湲몄씠瑜????뺤텞
  - `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶? CTA/蹂댁“ ?곸뿭 ?믪씠瑜?異붽?濡?以꾩뿬 泥??붾㈃ 湲몄씠瑜????뺤텞
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???좏깮 洹몃９ ?쒕ぉ怨?以鍮?臾몄젣 釉붾줉????以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏??쇰줈 留덈Т由?  - `ResultPage` / `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶 ??蹂댁“ ?쇰꺼怨??섎떒 蹂댁“ ?곸뿭?????⑥닚??
## 2026-03-24 Phase 4 ?쒖옉 ????댄?/蹂댁“ ?쇰꺼 異붽? 異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ??紐⑤뱶 ??댄?, ?좏깮 洹몃９ ?쒕ぉ, 以鍮?臾몄젣 釉붾줉 ?レ옄/?붿빟 以꾩쓣 ??以꾩씠怨?源⑥쭊 援щ텇?먮? `/`濡??뺣━
  - `ResultPage` ?곷떒 CTA 移대뱶 ?ㅻ챸 臾멸뎄? ?ㅻ깄????蹂댁“ ?쇰꺼??以꾩뿬 泥??붾㈃ 湲몄씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?곷떒 CTA ?ㅻ챸 臾멸뎄? `?곌껐 ?몄뀡 援ъ꽦` 蹂댁“ ?쇰꺼??嫄룹뼱?닿퀬 ?곷떒 ?곹깭 以?媛꾧꺽??異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??以鍮?臾몄젣 釉붾줉怨??곷떒 踰꾪듉?????뺤텞??嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏??쇰줈 留덈Т由?  - `ResultPage` / `ReviewPage` ?ㅻ깄??移대뱶 ???섏튂 移대뱶 ?먯껜 ?믪씠? ?섎떒 蹂댁“ ?곸뿭????以꾩뿬 泥??붾㈃ 湲몄씠瑜?異붽? 異뺤냼

## 2026-03-24 Phase 4 ?쒖옉 ???듭뀡 洹몃９ / ?곷떒 ?ㅻ깄??異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???듭뀡 洹몃９ 踰꾪듉 ?믪씠, ?곷떒 ?≪뀡 踰꾪듉, 以鍮?臾몄젣 移대뱶, ?붿빟 以꾩쓣 ???④퀎 ????떠 泥??붾㈃ 怨좎젙??媛源앷쾶 ?뺤텞
  - `ResultPage` ?곷떒 寃곌낵 ?붿빟 移대뱶? ?몄뀡 ?ㅻ깄??移대뱶???⑤뵫, ?섏튂 移대뱶, CTA 踰꾪듉, 由щ럭 誘몃━蹂닿린 ???믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?곷떒 蹂듭뒿 ?붿빟 移대뱶, ?≪뀡 踰꾪듉, ?ㅼ쓬 ?숈뒿 ?먮쫫, ?곗꽑 蹂듭뒿 紐⑸줉 ???믪씠? 移??ш린瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???좏깮 洹몃９ ?쒕ぉ怨?以鍮?臾몄젣 釉붾줉????以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏??쇰줈 留덈Т由?  - `ResultPage` / `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶 ??蹂댁“ ?쇰꺼怨?踰꾪듉 援ъ꽦?????⑥닚?뷀빐 泥??붾㈃ 湲몄씠瑜?異붽?濡?異뺤냼

## 2026-03-20 Phase 4 ?곷떒 移대뱶 ?듯빀 / ?쒖옉 ?붾㈃ 異뺤빟 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???쇰꺼??`湲곕낯`/`?곗뒿`, `?쒖옄 ??/`?꾨━ ??/`?뚯꽦 ??/`???⑥뼱`, `?쒖옉`/`?곗뒿`, `珥덇린??泥섎읆 ??吏㏐쾶 ?뺤텞
  - `ResultPage` ?곷떒 ?붿빟 移대뱶 ?덉뿉 異붿쿇 寃쎈줈? CTA瑜??≪닔??泥??붾㈃ ?뱀뀡 ?섎? 以꾩엫
  - `ReviewPage` ?곷떒 ?ㅻ뜑? ?ㅻ깄???≪뀡 臾띠쓬???섎굹??移대뱶濡??⑹퀜 紐⑤컮???몃줈 ?먮쫫?????⑥닚??- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???듭뀡 洹몃９ ?믪씠? 踰꾪듉 ??쓣 ??以꾩뿬 泥??붾㈃ 怨좎젙 ?섏???留덈Т由?  - `ResultPage` / `ReviewPage` ?곷떒 ?ㅻ깄??移대뱶 ???섏튂/移?諛?꾨? ????떠 泥??붾㈃ 湲몄씠瑜?異붽? 異뺤냼

## 2026-03-20 Phase 4 ?ㅻ챸 以??곷떒 臾멸뎄 異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???곷떒 蹂댁“ 臾멸뎄瑜??쒓굅?섍퀬 ??댄? 鍮꾩쨷????異뺤냼
  - `ResultPage` ?곷떒 ????덈궡 臾멸뎄? 異붿쿇 蹂댁“ 移⑹쓣 以꾩뿬 泥??붾㈃ ?뺣낫?됱쓣 異붽? 異뺤냼
  - `ReviewPage` ?곷떒 ?ㅻ챸 以꾧낵 ?곹깭 蹂댁“ 臾멸뎄瑜?嫄룹뼱?닿퀬 異붿쿇 移??섎? ??以꾩엫
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ??踰꾪듉/?듭뀡 洹몃９ ??쓣 ??以꾩씠嫄곕굹 ?쇰? ?쇰꺼????吏㏐쾶 ?뺣━
  - `ResultPage` / `ReviewPage` ?곷떒 ?곹깭 移⑷낵 ?붿빟 移대뱶 ?쇰?瑜????듯빀??泥??붾㈃ ?뱀뀡 ?섎? 以꾩씠湲?
## 2026-03-20 Phase 4 ?띿뒪????誘몃━蹂닿린 ??異붽? 異뺤빟 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ??珥덇린??踰꾪듉 ??낵 ?붿빟 以?臾멸뎄瑜???吏㏐쾶 以꾩뿬 泥??붾㈃ 怨좎젙 ?먮쫫??異붽? ?뺤텞
  - `ResultPage` 蹂듭뒿 誘몃━蹂닿린 ???믪씠? 移??쇰꺼??`?곗꽑`/`?④퀎`/`寃곌낵` 以묒떖?쇰줈 異뺤빟
  - `ReviewPage` ?곗꽑 蹂듭뒿 紐⑸줉 ???믪씠? 移??쇰꺼????吏㏐쾶 以꾩씠怨??섎떒 踰꾪듉 ?믪씠??異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ????댄?/紐⑤뱶 臾멸뎄 鍮꾩쨷????以꾩씠嫄곕굹 ?쇰? ?앸왂??泥??붾㈃ 怨좎젙??留덈Т由?  - `ResultPage` / `ReviewPage` ?곷떒 ?ㅻ챸 以꾧낵 ?곹깭 移??섎? ??以꾩씠嫄곕굹 ?듯빀

## 2026-03-20 Phase 4 ?쒖옉 ??理쒖쥌 ?믪씠 ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???곷떒 ?щ갚, ?듭뀡 踰꾪듉, 以鍮?臾몄젣 移대뱶 ?믪씠瑜???以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺣━
  - `ResultPage` ?몄뀡 ?ㅻ깄??蹂듭뒿 誘몃━蹂닿린 移대뱶? ?섏튂 移대뱶 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` ?붿빟 移대뱶/?ㅼ쓬 ?숈뒿 ?먮쫫/?곗꽑 蹂듭뒿 紐⑸줉 ?믪씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???⑥? ?띿뒪??鍮꾩쨷怨?踰꾪듉 ??쓣 ??以꾩뿬 泥??붾㈃ 怨좎젙 留덈Т由?  - `ResultPage` / `ReviewPage` 誘몃━蹂닿린 ?꾩씠?????믪씠? 移?臾멸뎄瑜???吏㏐쾶 以꾩씠嫄곕굹 ?쇰? ?듯빀

## 2026-03-20 Phase 4 ?쒖옉 ???믪씠/?몃줈 CTA 異붽? ?뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???ㅻ뜑, ?듭뀡 洹몃９, 以鍮?臾몄젣 移대뱶 ?믪씠瑜????④퀎 ??異뺤냼
  - `ResultPage` CTA? ?섎떒 ?≪뀡 踰꾪듉???몃줈 ?먮쫫?쇰줈 怨좎젙??紐⑤컮??媛濡?遺꾪븷 ?먮굦 ?쒓굅
  - `ReviewPage` CTA瑜??몃줈 ?먮쫫?쇰줈 怨좎젙?섍퀬 ?쒖옉 ??寃곌낵/蹂듭뒿 ?붾㈃???꾩껜 ?ㅽ겕濡?湲몄씠瑜?異붽? ?뺤텞
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃???⑥? ?곷떒 ?щ갚怨??듭뀡 踰꾪듉 ?믪씠瑜???以꾩뿬 泥??붾㈃ 怨좎젙 ?섏???留덈Т由?  - `ResultPage` / `ReviewPage` ?몄뀡 ?ㅻ깄?룰낵 蹂듭뒿 誘몃━蹂닿린 移대뱶 ?믪씠瑜???以꾩씠嫄곕굹 ?쇰? ?듯빀

## 2026-03-20 Phase 4 ?쇰꺼 異뺤빟/CTA ?믪씠 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???붿빟 以?援щ텇????吏㏐쾶 ?뺣━?섍퀬 泥??붾㈃ 怨좎젙 ?먮쫫??異붽? ?뺤텞
  - `ResultPage` CTA ?쇰꺼??`?щ룄??/`?곗뒿`/`蹂듭뒿` 以묒떖?쇰줈 異뺤빟?섍퀬 踰꾪듉 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` CTA ?쇰꺼??`?곗뒿`/`?뚮젅??/`?? 以묒떖?쇰줈 異뺤빟?섍퀬 踰꾪듉 ?믪씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???듭뀡 洹몃９ ?믪씠? ?곷떒 ?щ갚????以꾩뿬 泥??붾㈃ 怨좎젙 ?섏???留덈Т由?  - `ResultPage` / `ReviewPage` ?⑥? 蹂댁“ 移⑷낵 ?섎떒 ?≪뀡 援ъ뿭????以꾩씠嫄곕굹 ?쇰? ?듯빀

## 2026-03-20 Phase 4 ?쒖옉 ??怨좎젙/?섎떒 ?쇰꺼 異뺤빟 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???붾㈃??移댁슫??釉붾줉怨??붿빟 以꾩쓣 ??以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? ?뺤텞
  - `ResultPage` ?섎떒 踰꾪듉 ?쇰꺼????吏㏐쾶 以꾩씠怨?異붿쿇/?몄뀡 援ъ꽦 移??쒓린瑜?異붽? 異뺤빟
  - `ReviewPage` 異붿쿇/?몄뀡 援ъ꽦 移⑷낵 ?곗꽑 蹂듭뒿 ?쇰꺼????吏㏐쾶 以꾩뿬 ?몃줈 湲몄씠瑜?異붽? ?⑥텞
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃?먯꽌 ?⑥? ?듭뀡 洹몃９ ?믪씠? 踰꾪듉 媛꾧꺽??誘몄꽭 議곗젙???꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage`?먯꽌 ?⑥븘 ?덈뒗 蹂댁“ 移⑷낵 ?섎떒 ?≪뀡 援ъ뿭????以꾩씠嫄곕굹 ?쇰? ?듯빀

## 2026-03-20 Phase 4 ??댄? 鍮꾩쨷/移?臾멸뎄 異붽? 異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???붾㈃????댄? 鍮꾩쨷怨??붿빟 以?湲몄씠瑜???以꾩뿬 泥??붾㈃ 怨좎젙 ?섏?????媛源앷쾶 ?뺣━
  - `ResultPage` 異붿쿇 移? ?몄뀡 援ъ꽦 移? CTA 踰꾪듉 ??댄룷? ?ㅻ챸 臾멸뎄瑜????뺤텞
  - `ReviewPage` 異붿쿇 移? ?몄뀡 援ъ꽦 移? CTA 踰꾪듉 ??댄룷? ?ㅻ챸 臾멸뎄瑜????뺤텞
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃?먯꽌 ?⑥? 移댁슫??釉붾줉怨??듭뀡 洹몃９ ?믪씠瑜?誘몄꽭 議곗젙???꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage`???섎떒 踰꾪듉 ?쇰꺼怨?誘몃━蹂닿린 移??쒓린瑜???吏㏐쾶 ?뺣━?섍퀬 ?꾩슂 ???쇰? 蹂댁“ 臾멸뎄 ?쒓굅

## 2026-03-20 Phase 4 ?щ갚/臾멸뎄 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???붾㈃???곷떒 ?щ갚, ??댄? 釉붾줉, 洹몃９ 媛꾧꺽, ?붿빟 ?곸뿭????以꾩뿬 嫄곗쓽 泥??붾㈃ 怨좎젙 ?섏?源뚯? 異붽? ?뺤텞
  - `ResultPage`??CTA ?ㅻ챸 臾멸뎄? ?몄뀡 援ъ꽦 移??⑤뵫????吏㏐쾶 以꾩씠怨??섎떒 移대뱶 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage`??CTA ?ㅻ챸 臾멸뎄, 異붿쿇 寃쎈줈 移? ?몄뀡 援ъ꽦 移? ?곗꽑 蹂듭뒿 紐⑸줉 移대뱶 諛?꾨? ???뺤텞
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃?먯꽌 ?⑥? ?곷떒 ??댄? 鍮꾩쨷怨??붿빟 以?湲몄씠瑜???以꾩뿬 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage`???섎떒 ?≪뀡 踰꾪듉怨?誘몃━蹂닿린 移?臾멸뎄瑜???吏㏐쾶 ?뺣━?섍퀬 ?꾩슂 ???쇰? 蹂댁“ 臾멸뎄 ?쒓굅

## 2026-03-20 Phase 4 ?쒖옉 ???붾㈃/?섎떒 移대뱶 ?믪씠 異붽? 異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???붾㈃????댄? 釉붾줉, ?듭뀡 洹몃９, 臾몄젣 ???쒖옉 踰꾪듉 ?곸뿭?????④퀎 ??以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺣━
  - `ResultPage` CTA 踰꾪듉, 蹂듭뒿 誘몃━蹂닿린 移대뱶, ?섎떒 踰꾪듉, ?붿빟 ?섏튂 移대뱶 ?믪씠瑜?異붽? 異뺤냼
  - `ReviewPage` CTA 踰꾪듉, ?곗꽑 蹂듭뒿 紐⑸줉 移대뱶, ?붿빟 ?섏튂 移대뱶 ?믪씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃???⑥? ?곷떒 ?щ갚怨?洹몃９ 媛꾧꺽????以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage`???섎떒 ?≪뀡 踰꾪듉怨?誘몃━蹂닿린 移?臾멸뎄瑜????뺤텞???몃줈 湲몄씠瑜?異붽? ?⑥텞

## 2026-03-20 Phase 4 ?쒖옉 ?붾㈃/?붿빟 移대뱶 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???ㅼ젙 ?붾㈃ ?ㅻ뜑, ?좏깮 洹몃９, ?쒖옉 踰꾪듉, 臾몄젣 ???붿빟 ?곸뿭?????④퀎 ??異뺤냼??泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺣━
  - `ResultPage`???ㅼ쓬 ?≪뀡 ?붿빟?먯꽌 `?몄뀡 ?됯?`瑜?蹂꾨룄 移대뱶 ????곷떒 移??먮쫫???≪닔?섍퀬 CTA 踰꾪듉 ?믪씠? ?ㅻ챸?????뺤텞
  - `ReviewPage`???곷떒 ?붿빟/CTA/?ㅼ쓬 ?숈뒿 ?먮쫫 移대뱶 媛꾧꺽怨??섏튂 移대뱶 ?믪씠瑜???以꾩씠怨??곗꽑 蹂듭뒿 紐⑸줉 移대뱶?????뉕쾶 ?뺣━
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃?먯꽌 ?곷떒 ??댄? 釉붾줉怨??듭뀡 洹몃９ ?믪씠瑜????④퀎 ??以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage` ?섎떒 踰꾪듉怨?誘몃━蹂닿린 移대뱶 ?믪씠瑜???以꾩뿬 紐⑤컮???몃줈 湲몄씠瑜?異붽? ?⑥텞

## 2026-03-20 Phase 4 ?쒖옉 ?붾㈃ 異붽? ?뺤텞 / 寃곌낵쨌蹂듭뒿 ?뱀뀡 ?듯빀 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???ㅼ젙 ?붾㈃???ㅻ뜑, ?좏깮 踰꾪듉, ?붿빟 ?곸뿭????以꾩씠怨??쒖옉 踰꾪듉??移댁슫???곸뿭???듯빀??泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `PlayPage` ?덉궗 ?좏깮? 3?? ?쒖씠??諛⑹떇 ?좏깮? 2??以묒떖?쇰줈 珥섏킌?섍쾶 ?щ같移?  - `ResultPage`??`?몄뀡 ?ㅻ깄??怨?`蹂듭뒿 ?곹깭 誘몃━蹂닿린`瑜????뱀뀡?쇰줈 ?듯빀???섎떒 移대뱶 ?섎? 異뺤냼
  - `ReviewPage`??`?곗꽑 蹂듭뒿 紐⑸줉`???곷떒 ?붿빟 移대뱶 ?덉쑝濡??≪닔??蹂꾨룄 ?섎떒 ?뱀뀡???쒓굅
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ?붾㈃ ?곷떒 ?ㅻ챸怨??좏깮 洹몃９ ?믪씠瑜????④퀎 ??以꾩뿬 嫄곗쓽 ?꾩쟾 泥??붾㈃ 怨좎젙 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage` ?붿빟 移대뱶 ???섏튂 ?쒗쁽怨?CTA 諛곗튂瑜????뺤텞???ㅽ겕濡?湲몄씠瑜?異붽? ?⑥텞

## 2026-03-20 Phase 4 ?쒖옉 ?붾㈃/?섎떒 ?뱀뀡 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???ㅼ젙 ?붾㈃???ㅻ뜑, ?좏깮 洹몃９, ?붿빟 移? 移댁슫??移대뱶, ?쒖옉 踰꾪듉 ?믪씠瑜????④퀎 ??以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?뺤텞
  - `ResultPage` ?몄뀡 ?ㅻ깄?룰낵 蹂듭뒿 誘몃━蹂닿린 ?뱀뀡 ?⑤뵫, 移대뱶 ?믪씠, 踰꾪듉 媛꾧꺽????以꾩뿬 寃곌낵 ?붾㈃ ?섎떒 湲몄씠瑜?異뺤냼
  - `ReviewPage` ?곗꽑 蹂듭뒿 紐⑸줉 移대뱶 ?믪씠? 媛꾧꺽????以꾩뿬 ?꾩껜 ?몃줈 ?ㅽ겕濡?湲몄씠瑜?異붽?濡?異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃?먯꽌 ?붿빟 移??섎굹 移댁슫???쒗쁽????以꾩뿬 ?꾩쟾 泥??붾㈃ 怨좎젙??媛源뚯슫 ?섏?源뚯? 留덈Т由?  - `ResultPage` / `ReviewPage` ?섎떒 ?뱀뀡?????듯빀?섍굅???쇰? ?뺣낫瑜??곷떒 移대뱶濡??≪닔???????먯껜瑜???以꾩씠湲?
## 2026-03-20 Phase 4 ?좏깮 踰꾪듉 媛꾨왂??寃곌낵 ?몃줈 怨좎젙 硫붾え

- ?꾨즺:
  - `PlayPage` ?덉궗/?쒖씠??異쒖젣 諛⑹떇 ?좏깮 踰꾪듉????吏㏃? 臾멸뎄? 珥섏킌??2??洹몃━?쒕줈 ?뺣━???щ윭 以?源⑥쭚??以꾩엫
  - `PlayPage` 異쒖젣 諛⑹떇 臾멸뎄瑜?`?쒖옄 -> ??, `?꾨━媛??-> ??, `?뚯꽦 -> ??, `??-> ?⑥뼱`濡?異뺤빟
  - `ResultPage` / `ReviewPage` ?곷떒 ?듭떖 移대뱶 ?곸뿭???꾩쟾 ?몃줈 ?먮쫫?쇰줈 怨좎젙??醫곸? ?붾㈃?먯꽌 媛濡?諛곗뿴???앷린吏 ?딅룄濡?蹂댁젙
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???붾㈃ ?붿빟 移⑷낵 移댁슫??移대뱶 ?믪씠瑜???以꾩뿬 泥??붾㈃ 怨좎젙????媛源앷쾶 ?ㅻ벉湲?  - `ResultPage` / `ReviewPage` ?섎떒 蹂꾨룄 ?뱀뀡??怨꾩냽 以꾩뿬 ?ㅽ겕濡?湲몄씠瑜???吏㏐쾶 留뚮뱾湲?
## 2026-03-20 Phase 4 ?ㅼ젙 ?좏깮 媛꾨왂???몃줈 怨좎젙 硫붾え

- ?꾨즺:
  - `PlayPage` ?덉궗/?쒖씠??諛⑹떇 ?좏깮 踰꾪듉????吏㏃? 臾멸뎄? 2??洹몃━?쒗삎 ?좏깮 UI濡??뺣━???쒕늿??蹂닿린 ?쎄쾶 ?뺤텞
  - `PlayPage` 異쒖젣 諛⑹떇 臾멸뎄瑜?`?쒖옄 -> ??, `?꾨━媛??-> ??, `?뚯꽦 -> ??, `??-> ?⑥뼱`濡?理쒖쟻??  - `ResultPage` / `ReviewPage` ?곷떒 ?듭떖 移대뱶 ?곸뿭???몃줈 怨좎젙?쇰줈 ?뺣━??媛濡?遺꾪븷 ?놁씠 ?꾩뿉???꾨옒濡쒕쭔 ?쏀엳寃?蹂댁젙
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쒖옉 ???ㅼ젙 ?붾㈃ ?꾩껜 ?믪씠瑜????④퀎 ??以꾩뿬 泥??붾㈃ ?꾩쟾 怨좎젙??媛源앷쾶 ?ㅻ벉湲?  - 寃곌낵/蹂듭뒿 ?섎떒 ?뱀뀡??怨꾩냽 以꾩뿬 ?몃줈 ?먮쫫 ?덉뿉???ㅽ겕濡?湲몄씠瑜???異뺤냼

## 2026-03-20 Phase 4 ?뚮젅???띾룄/紐⑤컮??怨좎젙???뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?쒖옉 ???몄뀡 ?ㅼ젙 ?붾㈃????댄룷, ?⑤뵫, 踰꾪듉 ?믪씠瑜??꾨컲?곸쑝濡?異뺤냼??泥??붾㈃ ?덉뿉??理쒕????ㅽ겕濡??놁씠 蹂댁씠?꾨줉 ?뺣━
  - `PlayPage` ???좏깮 ??臾멸뎄 以묒떖 ?쇰뱶諛깆쓣 ?쒓굅?섍퀬 ?꾪솚 ?湲??쒓컙??以꾩뿬 ??鍮좊Ⅴ寃??ㅼ쓬 臾몄젣濡??섏뼱媛?꾨줉 議곗젙
  - `ResultPage` / `ReviewPage` ?곷떒 移대뱶 ?덉씠?꾩썐??紐⑤컮?쇱뿉???몃줈 怨좎젙?쇰줈 ?뺣━??醫곸? ?붾㈃?먯꽌 媛濡?2??遺꾪븷???섏삤吏 ?딅룄濡?蹂닿컯
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` 臾몄젣 移대뱶? ?좏깮吏 ?띿뒪???꾧퀎瑜????ㅻ벉怨?泥??붾㈃ ?몄텧?됱쓣 異붽? ?뺣낫
  - `ResultPage` / `ReviewPage` ?섎떒 ?뱀뀡????以꾩씠嫄곕굹 ?곷떒 移대뱶 ?덉쑝濡??≪닔???붾㈃ ???섎? ??異뺤냼

## 2026-03-20 Phase 4 HUD ?⑥닚???곷떒 ?≪뀡 ?듯빀 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD瑜?吏꾪뻾 移?+ ?섑듃/?먯닔/?섏씠??移대뱶 以묒떖?쇰줈 ???⑥닚?뷀빐 ?곷떒 ?뺣낫 遺꾩궛??以꾩엫
  - `ResultPage` ?곷떒 ?≪뀡 移대뱶??異붿쿇 ?됰룞 ?붿빟???④퍡 臾띔퀬 CTA 踰꾪듉 ?믪씠? ?ㅻ챸 諛?꾨? ????땄
  - `ReviewPage`??異붿쿇 寃쎈줈? ?≪뀡???곷떒 ?붿빟 ?먮쫫 ?덉쑝濡???遺숈뿬 ?뱀뀡 ?섎? 以꾩엫
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` 臾몄젣 移대뱶 ?ㅻ뜑? ?좏깮吏 移대뱶 ?띿뒪???꾧퀎瑜????뺣━??臾몄젣 吏묒쨷?꾨? 異붽? 媛쒖꽑
  - `ResultPage` / `ReviewPage`??蹂꾨룄 ?섎떒 ?뱀뀡????以꾩씠嫄곕굹 ?곷떒?쇰줈 ?≪닔???붾㈃ ???섎? ??異뺤냼

## 2026-03-20 Phase 4 PlayPage/寃곌낵 蹂댁“ ?곸뿭 異붽? ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 ?섏튂 移대뱶? ?섎떒 ?곹깭 ?ㅽ듃由??믪씠瑜?異붽?濡?以꾩씠怨??좏깮吏 移대뱶 ?믪씠? 媛꾧꺽??????떠 泥??붾㈃ 臾몄젣 ?몄텧?됱쓣 ?섎┝
  - `ResultPage` 蹂듭뒿 誘몃━蹂닿린 移대뱶? ?섎떒 踰꾪듉 ?곸뿭 ?⑤뵫/?믪씠瑜?異뺤냼
  - `ReviewPage` ?곗륫 蹂댁“ 移대뱶? ?곗꽑 蹂듭뒿 紐⑸줉 移대뱶 ?⑤뵫??以꾩뿬 泥??붾㈃ 諛?꾨? ????땄
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?곷떒 HUD ?먯껜瑜????⑥닚?뷀븯怨?吏꾪뻾/?섑듃/?먯닔留??④린???섏??쇰줈 ???④퀎 ???뺣━
  - `ResultPage` / `ReviewPage` ?곷떒 ?붿빟 移대뱶? ?섎떒 ?≪뀡????媛뺥븯寃??듯빀???뱀뀡 ???먯껜瑜?以꾩씠湲?
## 2026-03-20 Phase 4 PlayPage HUD/?쇰뱶諛??덉젙??硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD? ?곹깭 ?ㅽ듃由??믪씠瑜???以꾩뿬 泥??붾㈃?먯꽌 臾몄젣 蹂몃Ц????鍮⑤━ 蹂댁씠?꾨줉 議곗젙
  - ???좏깮 ???좉퉸 而ㅼ죱???щ씪吏???섎떒 ?쇰뱶諛?諛뺤뒪瑜???긽 媛숈? ?믪씠???뉗? ?ㅽ듃由쎌쑝濡?怨좎젙???붾㈃ ?덉젙媛먯쓣 媛쒖꽑
  - 臾몄젣 移대뱶 ?ㅻ뜑瑜????뺤텞???곷떒 以묐났 ?뺣낫? ?몃줈 湲몄씠瑜?異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?곷떒 HUD ?섏튂 移대뱶 ?먯껜瑜????뉕쾶 以꾩씠怨?臾몄젣 移대뱶/?좏깮吏 移대뱶 ?믪씠瑜?異붽?濡?議곗젙
  - `ResultPage` / `ReviewPage` ?섎떒 蹂댁“ 移대뱶? 踰꾪듉 ?곸뿭????怨쇨컧?섍쾶 以꾩뿬 泥??붾㈃ 吏묒쨷??媛쒖꽑

## 2026-03-20 Phase 4 PlayPage 移대뱶 寃?媛뺥솕 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD? 臾몄젣 移대뱶 ?ъ씠??吏㏃? ?곌껐 ?덉씪怨??곷떒 ??諛붾? 異붽????곹깭 ?꾪솚 ?먮쫫?????먮졆?섍쾶 ?곌껐
  - ?좏깮吏 移대뱶瑜??곹깭蹂?marker ?? 醫뚯륫 ?≪꽱??諛? ?띿뒪???鍮?湲곗??쇰줈 ?ㅼ떆 ?뺣━???뺣떟/?ㅻ떟/?뺣떟 怨듦컻 援щ텇????寃뚯엫?뺤쑝濡?蹂닿컯
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?곷떒 HUD? ?곹깭 ?ㅽ듃由??믪씠瑜????④퀎 ???뉕쾶 以꾩씠怨?臾몄젣 移대뱶 ?곷떒 ?ㅻ뜑 以묐났 ?붿냼瑜????쒖뼱?닿린
  - `ResultPage` / `ReviewPage` ?섎떒 蹂댁“ 移대뱶? 踰꾪듉 ?곸뿭 諛?꾨? 異붽?濡?以꾩뿬 泥??붾㈃ 吏묒쨷??媛쒖꽑

## 2026-03-20 Phase 4 HUD/?붿빟 諛??異뺤냼 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD瑜????뉕쾶 以꾩씠怨??곹깭 ?ㅽ듃由??덉뿉 異쒖젣 諛⑹떇/?곹깭/硫뷀?瑜???以??먮쫫?쇰줈 ?뺣━
  - 臾몄젣 移대뱶 ?곷떒 以묐났 移⑹쓣 以꾩씠怨??ㅻ뜑 ??댄룷瑜?議곌툑 ??떠 泥??붾㈃?먯꽌 臾몄젣 蹂몃Ц 吏묒쨷?꾨? 媛뺥솕
  - `ResultPage` / `ReviewPage` ?곷떒 ?붿빟 移대뱶? CTA 移대뱶 ?⑤뵫, 蹂댁“ 臾멸뎄, ?섏튂 移대뱶 ?ш린瑜??④퍡 ?뺤텞
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?곹깭 ?ㅽ듃由쎄낵 臾몄젣 移대뱶 ?ъ씠 ?꾪솚 ?쒓컖 ?④낵瑜????좊챸?섍쾶 ?곌껐?섍퀬, ?좏깮吏 移대뱶?????④퀎 ??寃뚯엫?뺤쑝濡??뺣━
  - `ResultPage` / `ReviewPage` ?섎떒 蹂댁“ 移대뱶? 踰꾪듉 ?곸뿭????怨쇨컧?섍쾶 以꾩뿬??泥??붾㈃ 吏묒쨷??異붽? 媛쒖꽑

## 2026-03-20 Phase 4 ?쇰뱶諛?CTA ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?섎떒 ?쇰뱶諛?諛뺤뒪?먯꽌 ?곷떒 ?곹깭 ?ㅽ듃由쎄낵 寃뱀튂???뺣떟/?ㅻ떟 臾멸뎄瑜??쒓굅?섍퀬, 蹂댁“ ?뺣낫留??④꺼 ??븷??遺꾨━
  - `ResultPage` / `ReviewPage` ?듭떖 CTA瑜??곷떒 ?붿빟 ?곸뿭 ?덉쑝濡???꺼 泥??붾㈃?먯꽌 異붿쿇 ?먮쫫????鍮⑤━ ?쎈룄濡??щ같移?- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?곷떒 ?곹깭 ?ㅽ듃由??먯껜瑜????뉕쾶 ?ㅻ벉怨?臾몄젣 移대뱶? ?쒓컖???곌껐媛먯쓣 ??媛뺥솕
  - `ResultPage` / `ReviewPage` ?곷떒 ?붿빟 移대뱶???뺣낫 諛?꾨룄 ???④퀎 ??以꾩뿬???듭떖 ?됰룞留??④린湲?
## 2026-03-20 Phase 4 HUD/?꾪솚 ?곌껐 硫붾え

- ?꾨즺:
  - `PlayPage`??臾몄젣 移대뱶 ?꾪솚 ?곹깭(`enter` / `impact` / `steady`)瑜?異붽????듬? 吏곹썑? ?ㅼ쓬 臾몄젣 吏꾩엯 ??移대뱶/?좏깮吏 諛섏쓳??媛숈? ?쒗룷濡??뺣━
  - ?곷떒 HUD ?덉뿉 ?곹깭 ?ㅽ듃由쎌쓣 ?듯빀??蹂댁긽, ?곹깭, 吏꾪뻾 ?붿빟????臾띠쓬?쇰줈 蹂댁씠?꾨줉 ?곌껐
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쇰뱶諛?諛뺤뒪源뚯? HUD ?곹깭 ?ㅽ듃由쎄낵 ???먯뿰?ㅻ읇寃???븷 遺꾨━?댁꽌 以묐났 ?띿뒪?몃? 以꾩씠湲?  - `ResultPage` / `ReviewPage` ?듭떖 CTA瑜??곷떒 ?붿빟 移대뱶? ??諛李⑹떆耳?泥??붾㈃ ?먮떒 ?띾룄 媛쒖꽑

## 2026-03-19 Phase 4 ?꾪솚/CTA 蹂닿컯 硫붾え

- ?꾨즺:
  - `PlayPage` ?듬? 吏곹썑 ?꾪솚 ?쒓컙??`420ms`濡??섎━怨??좏깮吏 媛뺤“, 臾몄젣 移대뱶 ?곹깭 ?? 吏꾪뻾 諛??꾪솚????遺꾨챸?섍쾶 議곗젙
  - `ResultPage` / `ReviewPage` CTA 移대뱶??異붿쿇 ?≪뀡蹂?而щ윭 ?鍮꾩? hover ?ㅼ쓣 異붽????곗꽑 ?≪뀡 ?앸퀎??媛뺥솕
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?듬? 吏곹썑 ?곹깭 ?ㅽ듃由쎄낵 ?곷떒 HUD瑜????먯뿰?ㅻ읇寃??곌껐?섍퀬 臾몄젣 ?꾪솚 ?좊땲硫붿씠?섏쓣 ???④퀎 ??寃뚯엫?뺤쑝濡?蹂닿컯
  - `ResultPage` / `ReviewPage` ?듭떖 CTA瑜????곷떒 留λ씫怨?遺숈뿬??泥??붾㈃ ?먮떒 ?띾룄 媛쒖꽑

## 2026-03-19 Phase 4 蹂댁긽/?꾧퀎 蹂닿컯 硫붾え

- ?꾨즺:
  - `PlayPage` 蹂댁긽 移? ?곹깭 移대뱶, 臾몄젣/?좏깮吏 移대뱶 ?鍮?媛뺥솕
  - `ResultPage` / `ReviewPage` ?쒕ぉ ?꾧퀎? 蹂댁“ ?곸뿭 ?⑤뵫 異붽? ?뺣━
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?듬? 吏곹썑 ?꾪솚 ?띾룄? ?곹깭 蹂???좊땲硫붿씠?섏쓣 ???쒕졆?섍쾶 議곗젙
  - `ResultPage` / `ReviewPage` CTA 而щ윭 泥닿퀎? ?듭떖 ?붿빟 ?鍮꾨? ???좊챸?섍쾶 ?뺣━

## 2026-03-19 Phase 4 移대뱶 ??諛???뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` 臾몄젣 移대뱶? ?좏깮吏 移대뱶???쒓컖 ??媛뺥솕
  - `ResultPage` / `ReviewPage` ?⑥? 蹂댁“ 移대뱶 ?⑤뵫怨?諛??異붽? 異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?듬? 吏곹썑 ?꾪솚 ?④낵? 蹂댁긽 ?곗텧????寃뚯엫?뺤쑝濡?媛뺥솕
  - `ResultPage` / `ReviewPage` ?띿뒪???꾧퀎? ???ㅼ쓣 ???좊챸?섍쾶 ?뺣━

## 2026-03-19 Phase 4 HUD 移대뱶/?뱀뀡 ?듯빀 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD瑜??묒? ?곹깭 移대뱶?뺤쑝濡??뺣━
  - `ResultPage` / `ReviewPage` ?≪뀡 ?곸뿭???듭떖 ?붿빟 移대뱶? ??媛源앷쾶 ?듯빀
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` 臾몄젣 移대뱶? ?좏깮吏 ?쒓컖 ?ㅼ쓣 ???섏씠?붾뱶?섍쾶 媛뺥솕
  - `ResultPage` / `ReviewPage` ?⑥? 蹂댁“ 移대뱶 諛?꾨룄 異붽?濡?以꾩씠湲?
## 2026-03-19 Phase 4 HUD/?≪뀡 ?뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD ?뺣낫?됱쓣 ??以꾩씠怨??먯닔/肄ㅻ낫瑜???以꾨줈 ?뺤텞
  - `ResultPage` / `ReviewPage` ?섎떒 ?≪뀡 踰꾪듉 ?곸뿭?????⑥닚???먮쫫?쇰줈 ?щ같移?- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` HUD ?쒓컖 ?ㅽ??쇱쓣 ??寃뚯엫?뺤쑝濡??ㅻ벉湲?  - `ResultPage` / `ReviewPage` ?⑥? 移대뱶 臾띠쓬????怨쇨컧?섍쾶 ?듯빀?섍린

## 2026-03-19 Phase 4 ?붾㈃ ?뺤텞 硫붾え

- ?꾨즺:
  - `PlayPage` ?듬? 吏곹썑 ?쇰뱶諛?諛뺤뒪瑜?異뺤냼?섍퀬 HUD 以묒떖 ?먮쫫?쇰줈 ?뺣━
  - `ResultPage` ?ㅼ쓬 ?≪뀡/?몄뀡 ?됯? 移대뱶 ?듯빀
  - `ReviewPage` 蹂듭뒿 ?ㅻ깄???ㅼ쓬 ?≪뀡 移대뱶 ?듯빀
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?곷떒 HUD ?뺣낫?됱쓣 ??踰???以꾩씠怨??곹깭 ?쒗쁽????寃뚯엫?뺤쑝濡??뺣━
  - `ResultPage` / `ReviewPage` ?섎떒 ?≪뀡 踰꾪듉 ?곸뿭?????⑥닚?섍쾶 ?щ같移?
## 2026-03-19 Phase 4 UI ?뺣━ 硫붾え

- ?꾨즺:
  - `PlayPage` ?곷떒 HUD瑜????뉕쾶 ?뺤텞?섍퀬 ?듬? 吏곹썑 蹂댁긽 移⑸쭔 吏㏐쾶 ?몄텧
  - 臾몄젣 移대뱶 / ?좏깮吏 移대뱶 ?믪씠瑜?以꾩뿬 泥??붾㈃ 臾몄젣 媛?쒖꽦 媛쒖꽑
  - `ResultPage`, `ReviewPage` ?곹깭 臾멸뎄? CTA ?ㅻ챸 諛??異뺤냼
- 寃利?
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?쇰뱶諛?諛뺤뒪 ?먯껜瑜????묎쾶 以꾩씠怨?HUD? ?먯뿰?ㅻ읇寃??⑹튂湲?  - `ResultPage` / `ReviewPage` 移대뱶 ?섏? ?덉씠?꾩썐????踰???以꾩뿬 紐⑤컮??泥??붾㈃ 吏묒쨷???믪씠湲?
## ?꾩옱 吏꾪뻾 Phase

Phase 4: 怨좉툒 湲곕뒫 異붽?

## ?꾩옱 ?먮떒

- Phase 3 醫낅즺 議곌굔? 異⑹”???곹깭??
- ?뺤씤 ?꾨즺:
  - `npm run test`
  - `npm run build`
  - `npm run refresh:json`
  - `npm run check:live`
- ?댁젣 ?곗꽑?쒖쐞??臾몄꽌 誘몄꽭 ?섏젙???꾨땲??寃뚯엫 寃쏀뿕 ?꾨㈃ 媛쒗렪?대떎.

## Phase 4 紐⑺몴

?꾩옱 ?숈뒿 猷⑦봽瑜??좎???梨? ?뚮젅??媛먭컖怨??좏깮 ?먮쫫???꾨㈃ 媛쒗렪???ㅼ젣 寃뚯엫?ㅼ슫 泥닿컧?쇰줈 ?뚯뼱?щ┛??

## ?대쾲 Phase ?듭떖 踰붿쐞

- ?섏씠?붾뱶 寃뚯엫 媛먯꽦 UI ?꾨㈃ 媛쒗렪
- ?뚮젅??HUD / ?꾪솚 / ?댄럺??/ 蹂댁긽媛?媛뺥솕
- ?덉궗 / ?쒖씠??/ 異쒖젣 諛⑹떇 ?좏깮 ?뚮줈???ш뎄??- 臾몄젣 ?앹꽦 濡쒖쭅 / distractor ?덉쭏 / 異쒖젣 洹쒖튃 ?ъ꽕怨?- ?낆쟻 ?쒖뒪??湲곗큹
- ?대?吏 臾몄젣 / ?ｊ린 紐⑤뱶 / ?먭린梨꾩젏 ?묐Ц 以鍮?援ъ“

## 諛붾줈 ?ㅼ쓬 ???묒뾽 ?곗꽑?쒖쐞

### 1. ?뚮젅??援ъ“ ?ъ꽕怨?
- ?덉궗 ?좏깮 UI
- ?쒖씠???좏깮 UI
- 異쒖젣 諛⑹떇 ?좏깮 UI
- ?좏깮媛믪쓣 ?몄뀡 ?ㅼ젙怨?寃곌낵 ?붾㈃源뚯? ?댁뼱二쇰뒗 援ъ“ ?뺣━

### 2. ?뚮젅???붾㈃ ?꾨㈃ 媛쒗렪

- ?꾩옱 `PlayPage`瑜??섏씠?붾뱶 寃뚯엫 媛먯꽦 湲곗??쇰줈 ?ш뎄??- ?곷떒 HUD, 吏꾪뻾?? ?쇰뱶諛? 寃곌낵 吏곸쟾 ?꾪솚???꾨㈃ ?뺣━
- 紐⑤컮???곗꽑 ?덉씠?꾩썐 ?좎?

### 3. 臾몄젣 ?앹꽦 ?덉쭏 媛쒖꽑

- ?쒕뜡 異쒖젣 洹쒖튃 ?ъ젏寃
- ?ㅻ떟 蹂닿린 ?덉쭏 媛쒖꽑
- 臾몄젣 ?좏삎蹂?prompt / answer / choices ?앹꽦 洹쒖튃 ?ъ꽕怨?- ?덉궗 / ?쒖씠??/ 異쒖젣 諛⑹떇怨?臾몄젣 ? ?곌껐

## ?대쾲 Phase?먯꽌 癒쇱? 蹂대쪟??寃?
- 愿由ъ옄 UI ?꾩꽦??- ?ㅺ뎅??異붽?
- PWA 留덈Т由?- Cloudflare ?댁쁺 ?뺣━

## ?꾩옱 由ъ뒪??硫붾え

- ?곕???異쒕젰?먯꽌???쇰? ?쒓???源⑥졇 蹂댁씪 ???덉?留? ?ㅼ젣 ?뚯씪 UTF-8 ?댁슜怨?寃利?寃곌낵???뺤긽?대떎.
- Node child process??`shell: true` 寃쎄퀬???⑥븘 ?덉?留??꾩옱 寃利??먮쫫??blocker???꾨땲??
- Phase 4???뚮Ц援?蹂댁젙蹂대떎 ?붾㈃ 援ъ“? 寃뚯엫 UX瑜??ш쾶 諛붽씀???묒뾽 ?⑥쐞濡?吏꾪뻾?댁빞 ?쒕떎.

## ?ㅼ쓬 ?묒뾽 硫붾え

- ?ㅼ쓬 ?대??곕뒗 `PlayPage` 以묒떖 Phase 4 泥?臾띠쓬?쇰줈 諛붾줈 ?ㅼ뼱媛꾨떎.
- ?묒뾽 ?⑥쐞???묎쾶 履쇨컻吏 留먭퀬, ?좏깮 ?뚮줈??+ HUD 堉덈? + 臾몄젣 ?몄뀡 ?ㅼ젙 ?곌껐泥섎읆 泥닿컧 ??踰붿쐞濡?臾띕뒗??
## 2026-03-19 Phase 4 吏꾪뻾 硫붾え

- `PlayPage` 1李?臾띠쓬 ?꾨즺:
  - ?덉궗 / ?쒖씠??/ 異쒖젣 諛⑹떇 ?몄뀡 ?ㅼ젙 UI 異붽?
  - ?좏깮媛?湲곗? 臾몄젣 ? ?꾪꽣留??곸슜
  - 寃곌낵 ?붾㈃?쇰줈 ?몄뀡 ?ㅼ젙 ?곹깭 ?꾨떖 諛??щ룄???곗뒿 ?ъ궗???곌껐
- 寃利??꾨즺:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- `PlayPage` 2李?臾띠쓬 ?꾨즺:
  - Mission Control ?곷떒 HUD, 吏꾪뻾 諛? ?곹깭 移? ?쇰뱶諛?肄섏넄 以묒떖???꾨㈃ ?덉씠?꾩썐 媛쒗렪
  - 吏덈Ц 移대뱶, A/B/C/D ?좏깮 移대뱶, loadout 移대뱶, ?곗륫 ?몄뀡 ?ㅼ젙 ?⑤꼸 援ъ“濡??뚮젅??紐곗엯媛?媛뺥솕
  - 媛쒗렪??HUD 援ъ“ 湲곗??쇰줈 `PlayPage.test.tsx` 寃利앹떇 ?뺣━
- 寃利??꾨즺:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 臾몄젣 ?앹꽦 ?덉쭏 1李?臾띠쓬 ?꾨즺:
  - `questionRound`?먯꽌 以묐났/鍮?choice ?쒓굅, ?뺣떟 蹂댁옣, 媛숈? ?쒖씠???덉궗 distractor ?곗꽑 ?좏깮 ?곸슜
  - ?좏슚???곗씠???濡?癒쇱? 蹂닿린瑜?援ъ꽦?섍퀬, 遺議깊븷 ?뚮쭔 湲곗〈 DTO choice瑜?fallback?쇰줈 蹂닿컯
  - `questionRound.test.ts`? `PlayPage.test.tsx`瑜???異쒖젣 洹쒖튃 湲곗??쇰줈 ?뺣━
- 寃利??꾨즺:
  - `npm run test -- src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- ?몄뀡 ?ㅼ젙 ?먮쫫 ?곌껐 1李?臾띠쓬 ?꾨즺:
  - `questionOrder` ?ㅼ젙??異붽???`洹좏삎 ?먮쫫 / ?⑥뼱 ?곗꽑 / ???곗꽑` ?몄뀡 ?쒖꽌 ?쒖뼱 吏??  - 留덉?留??몄뀡 ?ㅼ젙????ν빐 ??寃곌낵/蹂듭뒿?먯꽌 媛숈? 援ъ꽦?쇰줈 ?ㅼ떆 ?뚮젅???곗뒿 吏꾩엯 媛??  - ??蹂듭뒿/寃곌낵 ?붾㈃??理쒓렐 ?몄뀡 援ъ꽦 ?붿빟 ?쒖떆
- 寃利??꾨즺:
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx src/pages/PlayPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ???묒뾽:
  - 寃뚯엫 以??꾪솚 ?④낵, 蹂댁긽媛? 紐⑤컮??HUD 諛??異붽? 蹂닿컯
  - 異쒖젣 諛⑹떇蹂?臾몄젣 ?쒖꽌? ?쒖씠??泥닿컧 ?먮쫫?????몃??섍쾶 怨좊룄??  - 寃뚯엫 以??꾪솚 ?④낵, 蹂댁긽媛? 紐⑤컮??HUD 諛??異붽? 蹂닿컯
  - 蹂듭뒿?쇳꽣?먯꽌 ?몄뀡 ?ㅼ젙 湲곕컲 異붿쿇 ?≪뀡????吏곸젒?곸쑝濡??곌껐
## 2026-03-19 Phase 4 異붽? 硫붾え

- 異쒖젣 ?먮쫫 2李?臾띠쓬 ?꾨즺:
  - `buildSessionWordQueue`??蹂듭뒿 ?ㅻ깄???곗꽑?쒖쐞瑜??곌껐??湲곕낯 ?뚮젅?대뒗 媛숈? ?쒖씠???덉뿉??蹂듭뒿 ??곸씠 ?욎そ?쇰줈 ?ㅺ퀬, ?곗뒿 紐⑤뱶??蹂듭뒿 ??곷???癒쇱? ?щ뒗 ?먮줈 蹂닿컯
  - `PlayPage`??蹂듭뒿 ?곗꽑 / ?ㅽ봽??/ ?쒖씠???먮쫫 釉뚮━?묒쓣 異붽????몄뀡 ?ㅼ젙???ㅼ젣 異쒖젣 ?먯뿉 ?대뼸寃?諛섏쁺?섎뒗吏 蹂댁씠?꾨줉 ?뺣━
  - `sessionConfig.test.ts`, `PlayPage.test.tsx`??standard/practice ???먮쫫 ?뚭? ?뚯뒪??異붽?
- 寃利??꾨즺:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/pages/PlayPage.test.tsx src/pages/HomePage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ???묒뾽:
  - ?꾪솚 ?④낵, 蹂댁긽媛? 紐⑤컮??HUD 諛??蹂닿컯
  - 蹂듭뒿?쇳꽣 異붿쿇 ?≪뀡???몄뀡 ?ㅼ젙/蹂듭뒿 ?곗꽑 ?먯? ??吏곸젒?곸쑝濡??곌껐
## 2026-03-19 Phase 4 ?쒖옉 UX 硫붾え

- `PlayPage` ?쒖옉 吏꾩엯 ?뺣━:
  - ?뚮젅??吏꾩엯 吏곹썑?먮뒗 臾몄젣瑜?諛붾줈 蹂댁뿬二쇱? ?딄퀬 ?몄뀡 ?ㅼ젙 ?붾㈃??癒쇱? ?몄텧
  - `寃뚯엫 ?쒖옉` / `?곗뒿 ?쒖옉`???뚮????뚮쭔 ?ㅼ젣 臾몄젣 ?쇱슫???쒖옉
- `PlayPage` ?쒖옉 ?붾㈃ 諛??異뺤냼:
  - ?쒖옉 ???붾㈃? ?좏깮 洹몃９ + ?꾩옱 ?ㅼ젙 移?+ 以鍮?臾몄젣 ??以묒떖?쇰줈 ?⑥닚??  - 踰꾪듉 ?ㅻ챸??臾멸뎄? 怨쇳븳 ?붿빟 移대뱶 ?쒓굅
- `PlayPage` 寃뚯엫 ?붾㈃ ?덉씠?꾩썐 ?뺣━:
  - ?쒖옉 ???쒖옉 ??紐⑤몢 ???뱀뀡 諛곗튂瑜??몃줈 ?⑥씪 ?먮쫫?쇰줈 ?뺣━
  - 寃뚯엫 ?쒖옉 ???곗륫 `?몄뀡 ?ㅼ젙` ?⑤꼸 ?쒓굅
- 寃利??꾨즺:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/HomePage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ???묒뾽:
  - ?꾪솚 ?④낵, 蹂댁긽媛? 紐⑤컮??HUD 諛??蹂닿컯
  - 蹂듭뒿?쇳꽣 異붿쿇 ?≪뀡???몄뀡 ?ㅼ젙/蹂듭뒿 ?곗꽑 ?먯? ??吏곸젒?곸쑝濡??곌껐
## 2026-03-19 Phase 4 ?뚮젅???뺤텞 硫붾え

- `PlayPage` ?ㅼ젙 ?붾㈃?먯꽌 `臾몄젣 ?먮쫫`???쒓굅?섍퀬 異쒖젣 諛⑹떇??`?⑥뼱(?쒖옄) -> ??, `?⑥뼱(?꾨━媛?? -> ??, `?⑥뼱(?뚯꽦) -> ??, `??-> ?⑥뼱` 4媛쒕줈 怨좎젙
- 寃뚯엫 ?쒖옉 ?꾩뿉???몄뀡 ?ㅼ젙 ?뱀뀡???④린怨? ?곷떒 HUD瑜?吏꾪뻾???섑듃/?먯닔/肄ㅻ낫/?곹깭 移?以묒떖???뺤텞?뺤쑝濡??뺣━
- 臾몄젣 移대뱶? 蹂닿린 移대뱶媛 泥??붾㈃ ?덉뿉 諛붾줈 蹂댁씠?꾨줉 遺덊븘?뷀븳 ?ㅻ챸 臾멸뎄? 蹂댁“ 移대뱶 ?쒓굅
- 愿???뚯뒪?몃? ???ㅼ젙 援ъ“ 湲곗??쇰줈 ?ъ젙由?- 寃利??꾨즺:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/pages/PlayPage.test.tsx src/pages/HomePage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- ?ㅼ쓬 ?묒뾽:
  - `PlayPage` ?꾪솚 ?④낵? 蹂댁긽媛??곗텧 蹂닿컯
  - 寃곌낵/蹂듭뒿 ?붾㈃??CTA ?ㅻ챸 諛??異붽? 異뺤냼

## 2026-03-24 Phase 4 시작 전/결과/복습 5개 묶음 세로 흐름 정리 메모

- 완료:
  - PlayPage 시작 전 카드 외곽, 상단 버튼, 옵션 묶음 여백을 폰트 유지 기준으로 추가 압축
  - PlayPage 시작 전 `문제` 블록 수치 줄과 시작 버튼 간격을 더 붙여 카드 흐름 정리
  - ResultPage 저장 메시지와 하단 스냅샷 카드 패딩 추가 축소
  - ResultPage 하단 버튼 구역을 모바일 세로 흐름 우선으로 정리
  - ReviewPage 상단/하단 카드 패딩과 빈 상태 카드 여백을 가독성 유지 기준으로 추가 정리
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - PlayPage 시작 전 카드 최종 마감
  - ResultPage / ReviewPage 하단 구역 구분감 최종 축소
  - ResultPage / ReviewPage 라벨과 칩 표기 최종 압축
## 2026-03-24 Phase 4 시작 전/결과/복습 5개 묶음 카드 마감 보정 메모

- 완료:
  - PlayPage 시작 전 옵션 묶음 간격과 `문제` 블록 외곽 패딩을 추가 축소해 카드 흐름 정리
  - ResultPage 상단 요약 카드 패딩과 CTA 간격을 추가 축소
  - ResultPage 하단 세션 구성 카드와 버튼 구역 간격을 추가 축소
  - ReviewPage 상단 액션 구역 구분선/간격을 추가 축소
  - ReviewPage 하단 스냅샷 카드 구분선/간격을 추가 축소
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - PlayPage 시작 전 카드 최종 마감
  - ResultPage / ReviewPage 하단 구역 구분감 최종 축소
  - ResultPage / ReviewPage 라벨과 칩 표기 최종 압축
## 2026-03-24 Phase 4 시작 전/결과/복습 5개 묶음 최종 리듬 보정 메모

- 완료:
  - PlayPage 시작 전 카드 헤더 줄 정렬과 타이틀 줄높이 정리
  - PlayPage 시작 전 `문제` 블록 설정 요약 줄 줄높이 추가 보정
  - ResultPage 하단 리뷰 목록 구분선/행 높이 추가 축소
  - ReviewPage 상단/하단 카드 사이 간격 추가 축소
  - ReviewPage 우선 복습 목록 행 높이 추가 축소
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - PlayPage 시작 전 카드 최종 마감
  - ResultPage / ReviewPage 하단 구역 구분감 최종 축소
  - ResultPage / ReviewPage 라벨과 칩 표기 최종 압축
## 2026-03-24 Phase 4 시작 전/결과/복습 마감 1차 메모

- 완료:
  - PlayPage 시작 전 옵션 묶음 안쪽 패딩과 `문제` 블록 정렬을 최종 보정
  - PlayPage 시작 전 설정 요약 줄의 리듬을 더 자연스럽게 정리
  - ResultPage 전체 섹션 간격과 하단 목록 구분 간격을 한 단계 더 축소
  - ReviewPage 전체 섹션 간격을 한 단계 더 축소
  - ReviewPage 빈 상태 카드 높이를 추가 축소
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - UI 압축/정리 마감 2차
  - PlayPage/ResultPage/ReviewPage 전체 화면 최종 통일감 점검
## 2026-03-24 Phase 4 시작 전/결과/복습 마감 2차 메모

- 완료:
  - PlayPage 시작 전 상단 버튼과 옵션 버튼 높이를 시작 버튼 기준으로 최종 통일
  - PlayPage 시작 전 설정 카드 전체 리듬을 최종 통일
  - ResultPage 저장 메시지, 하단 버튼, 수치 카드 패딩을 공통 리듬으로 최종 정리
  - ReviewPage 상단 액션 버튼과 수치 카드 패딩을 ResultPage 기준으로 최종 정리
  - 세 화면 공통 버튼/칩/요약 카드 높이의 최종 균형 조정
- 검증:
  - npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - Phase 4 UI 압축/정리 작업 종료
  - 다음 큰 기능 작업으로 전환
## 2026-03-24 Phase 4 출제 규칙 재설계 1차 메모

- 완료:
  - `sessionConfig.ts`의 출제 방식 필터를 실제 prompt 타입 기준으로 정확히 분기하도록 수정
  - `audio_to_meaning`이 모든 `word_to_meaning`를 포함하던 문제를 수정
  - `questionRound.ts`에서 같은 단어군 재사용, prompt/answer 중복, 낮은 품질 distractor를 더 강하게 제거하도록 재설계
  - `sessionConfig.ts`, `questionRound.ts`의 깨진 한국어 라벨을 정상 문자열로 복구
  - `sessionConfig.test.ts`, `questionRound.test.ts`를 새 규칙 기준으로 재작성
- 검증:
  - npm run test -- src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx
  - npm run build
- 다음 작업:
  - 출제 규칙 재설계 2차
  - 보기 오답 품질과 세션 큐 다양성 추가 개선
## 2026-03-24 Phase 4 기본 출제 안정화 메모

- 완료:
  - `sessionConfig`를 실제 prompt 타입 기준으로 재정리해 출제 방식 선택 후 해당 타입 문제만 더 정확히 필터링되도록 수정
  - `buildSessionWordQueue`에 seed 기반 셔플과 같은 단어군/같은 의미 연속 완화 로직 추가
  - `PlayPage`에서 현재 필터 조합 기준 사용 가능한 출제 방식만 계산하고, 불가능한 방식은 버튼 비활성화로 처리
  - 현재 일본어 데이터에는 `audio_to_meaning` 항목이 없어 오디오 방식이 준비 중 상태처럼 비활성화되도록 반영
- 검증:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 세션 큐 랜덤화 품질 추가 점검
  - 같은 단어/같은 의미가 연속으로 몰리는 케이스 추가 보정
  - 실제 데이터 기준 출제 방식별 커버리지 점검
## 2026-03-24 Phase 4 기본 기능 안정화 메모

- 완료:
  - `PlayPage` 저장 실패 시 raw fetch 오류(`Failed to fetch`)를 사용자용 안내 문구로 정규화해 pending session reason에 저장
  - `HomePage` 임시 저장 배너가 기존 raw reason과 새 저장 reason 모두를 사람 읽을 수 있는 문구로 표시하도록 유지
  - `HomePage.test.tsx`의 pending reason 검증을 안정적인 매처로 보정
- 검증:
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/PlayPage.test.tsx src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts`
  - `npm run build`
- 다음 작업:
  - 실제 데이터 기준 출제 방식별 커버리지 점검
  - 같은 단어/같은 의미 연속 출제 추가 보정
  - `meaning_to_word` distractor 품질 추가 보정
## 2026-03-24 Phase 4 출제 안정화 1차 메모

- 완료:
  - `sessionConfig.ts`를 정리해 출제 방식 필터, 사용 가능 방식 계산, 세션 큐 다양화 규칙을 재작성
  - `questionRound.ts`를 정리해 `meaning_to_word` / `word_to_meaning` distractor 품질과 보기 셔플 규칙을 재작성
  - 같은 단어군/같은 의미/같은 prompt가 최근 문항에 연속으로 몰리지 않도록 큐 충돌 점수 로직 보강
  - 세션 구성 라벨을 읽기 쉬운 한국어로 복구
  - `sessionConfig.test.ts`, `questionRound.test.ts`를 현재 규칙 기준으로 재작성
- 검증:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/ReviewPage.test.tsx src/pages/HomePage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 데이터 기준 출제 방식별 커버리지 점검
  - `meaning_to_word` 실제 데이터 distractor 품질 샘플 점검
  - 플레이 로그 기준 랜덤 체감 약한 케이스 추가 보정
## 2026-03-24 Phase 4 출제 안정화 2차 메모

- 완료:
  - 실제 `words.json`을 기준으로 출제 방식 커버리지를 점검해 `audio_to_meaning` 데이터 부재와 `meaning_to_word` 중복 변형 구조를 확인
  - `sessionConfig.ts`에서 `meaning_to_word`가 같은 의미의 한자/후리가나 변형을 함께 유지하지 않고 대표 답 하나만 남기도록 정리
  - `sessionConfig.test.ts`에 대표 답 선택 케이스를 추가해 실데이터 중복 구조를 직접 검증
- 검증:
  - `npm run test -- src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 데이터 기준 `meaning_to_word` distractor 샘플 점검
  - 품사/난이도 필터 조합별 남는 문제 수 점검
  - 플레이 로그 기준 랜덤 체감 약한 케이스 추가 보정
## 2026-03-24 Phase 4 출제 안정화 3차 메모

- 완료:
  - 실제 `meaning_to_word` 샘플을 점검해 distractor 후보가 한국어 `prompt`를 잘못 읽는 문제를 확인
  - `questionRound.ts`에서 `meaning_to_word` distractor 후보를 `answer` 기준으로 고치고, 정답과 같은 표기 계열(한자/가나)을 더 강하게 우선하도록 보강
  - `questionRound.test.ts`에 표기 계열 우선 케이스를 추가해 실제 데이터 성격을 검증
- 검증:
  - `npm run test -- src/features/game/questionRound.test.ts src/features/game/sessionConfig.test.ts src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 품사/난이도 필터 조합별 남는 문제 수 점검
  - 실제 플레이 샘플 기준 랜덤 체감 약한 케이스 추가 보정
  - 필요 시 `word_to_meaning` 쪽도 표기/길이 기준 추가 보강
## 2026-03-24 Phase 4 기본 기능 안정화 4차 메모

- 완료:
  - 실제 데이터 기준으로 품사/난이도/방식 조합을 점검해 현재 일본어 데이터에는 조합별 문제 공백이 없음을 확인
  - `PlayPage`에서 품사/난이도 버튼도 실제 가능한 조합 기준으로 비활성화되도록 보강
  - `apiClient.test.ts`를 warmup GET + saveSession POST 현재 흐름 기준으로 수정해 전체 테스트 안정화
- 검증:
  - `npm run test`
  - `npm run build`
- 다음 작업:
  - 실제 플레이 샘플 기준 랜덤 체감 약한 케이스 추가 보정
  - 필요 시 `word_to_meaning` 표기/길이 기준 추가 보강
  - 새 기능보다 기존 핵심 흐름 수동 점검
## 2026-03-24 Phase 4 기본 기능 안정화 5차 메모

- 완료:
  - `sessionConfig`와 `questionRound`가 `id/questionType`뿐 아니라 `word_id/question_type` 형태의 raw 데이터도 안전하게 처리하도록 보강
  - 실제 `public/data/ja/words.json` 전수 기준으로 라운드 품질과 필터 조합을 검증하는 회귀 테스트 추가
  - 실데이터 기준 `정답 누락`, `보기 중복`, `보기 수 부족`, `meaning_to_word` 한글 보기 혼입이 없음을 확인
- 검증:
  - `npm run test -- src/features/game/gameDataRegression.test.ts src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 플레이 샘플 기준 수동 점검으로 체감 랜덤성 확인
  - 필요 시 `word_to_meaning` distractor 길이/난이도 기준 추가 보강
  - 새 기능 추가보다 현재 플레이/결과/저장 흐름 수동 확인 우선
## 2026-03-24 Phase 4 기본 기능 안정화 6차 메모

- 완료:
  - 실제 데이터 점검 결과 `word_to_meaning`에 일본어 뜻이 남아 있는 4건이 다른 문제 보기 품질까지 오염시키는 문제를 확인
  - `sessionConfig`에서 한국어 뜻이 없는 `word_to_meaning` 항목은 플레이 큐에서 제외하도록 보강
  - `questionRound`에서 `word_to_meaning` 보기는 한국어 의미만 사용하도록 정리하고, 실데이터 회귀 테스트에 해당 규칙을 추가
- 검증:
  - `npm run test -- src/features/game/gameDataRegression.test.ts src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/pages/PlayPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 플레이 샘플 기준 수동 점검으로 랜덤 체감과 저장 흐름 확인
  - 필요 시 `word_to_meaning` distractor 길이/난이도 기준 마지막 보강
  - 새 기능보다 현재 플레이/결과/저장 흐름 수동 확인 우선
## 2026-03-24 Phase 4 기본 기능 안정화 7차 메모

- 완료:
  - `PlayPage` 테스트에 `audio_to_meaning` 준비 중/비활성화와 불가능한 난이도 비활성화 회귀 케이스를 추가
  - `HomePage` 테스트에 pending session 재저장 실패 시 네트워크 오류 문구가 사용자용 안내로 노출되는 케이스를 추가
  - 핵심 화면/출제 로직/실데이터 회귀 테스트를 다시 돌려 현재 플레이/결과/재저장 흐름이 모두 통과함을 확인
- 검증:
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/PlayPage.test.tsx src/features/game/gameDataRegression.test.ts src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저 수동 플레이로 랜덤 체감과 결과 저장 흐름 최종 확인
  - 필요 시 남는 체감 이슈만 마지막 보정
  - 새 기능 추가보다 현재 플레이/결과/저장 흐름 마감 우선
## 2026-03-24 Phase 4 기본 기능 안정화 8차 메모

- 완료:
  - `StatsPage`에서 다시 플레이로 이동할 때도 마지막 세션 구성이 유지되도록 보강
  - `StatsPage.test.tsx`에 통계 화면에서 플레이 이동 시 세션 구성 전달 검증 추가
  - 홈/플레이/결과/복습/통계 기준 핵심 회귀 테스트를 다시 돌려 세션 구성 전달 흐름을 재검증
- 검증:
  - `npm run test -- src/pages/StatsPage.test.tsx src/pages/ReviewPage.test.tsx src/pages/ResultPage.test.tsx src/pages/HomePage.test.tsx src/pages/PlayPage.test.tsx src/features/game/gameDataRegression.test.ts src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저 수동 플레이로 랜덤 체감과 저장 흐름 최종 확인
  - 사용자 피드백 기준 잔여 체감 이슈만 수정
  - 새 기능 추가보다 현재 플레이/결과/저장 흐름 마감 우선

## 2026-03-25 Phase 4 화면 단순화 + JSON 변환 도구 정리 메모

- 완료:
  - 공통 상단 헤더를 `YANG 언어공부 연습장` 단일 제목 중심으로 축소하고, 언어 선택 화면에서는 우측에 언어 라벨만 1줄로 표시
  - `LoginPage`, `LanguageSelectPage`, `HomePage`에서 불필요한 설명/정적 JSON 안내 박스를 제거해 시작 흐름을 단순화
  - `PlayPage` 설정 화면의 선택 버튼/시작 버튼을 키우고, 게임 중 중복 방식 표시와 `문제 남음` 표시를 정리
  - `ResultPage`, `StatsPage`에서 선택 언어/설명 문구/다음 학습 제안 같은 보조 박스를 제거하고 CTA 라벨을 짧게 정리
  - `scripts/export_words_json.py`와 `npm run words:json`을 추가해 Google Sheets 단어 시트를 JSON으로 내보내는 별도 실행 경로를 마련
- 검증:
  - `npm run test -- src/pages/LoginPage.test.tsx src/pages/LanguageSelectPage.test.tsx src/pages/HomePage.test.tsx src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/StatsPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저에서 로그인 → 언어 선택 → 플레이 → 결과 → 통계 흐름 수동 확인
  - 실제 플레이 중 어색한 문제/보기/저장 흐름을 사용자 피드백 기준으로 수정
  - 신규 기능 추가보다 현재 기본 게임/결과/오답 흐름 안정화 우선

## 2026-03-25 Phase 4 사용자 피드백 UI 재보정 메모

- 완료:
  - `AppShell` 상단 고정 헤더를 귀엽고 세련된 하이엔드 톤으로 재디자인하고 언어 선택 화면에서만 언어 라벨을 유지
  - `LanguageSelectPage` 일본어 선택 버튼을 고급 카드형 버튼과 애니메이션 톤으로 재구성
  - `PlayPage` 게임 HUD 폰트를 키우고 중복 정보(`하트/점수` 요약, 하단 진행도 줄)를 제거
  - `ResultPage` 결과 요약 폰트와 하단 `통계`/`홈` 버튼 타이포를 상향
  - `StatsPage`의 `통계 스냅샷`, 설명 배너, 추천 경로 설명을 제거해 더 단순한 통계 흐름으로 정리
- 검증:
  - `npm run test -- src/pages/LanguageSelectPage.test.tsx src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/StatsPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저에서 화면 체감과 플레이 흐름을 확인
  - 남는 UI/출제/저장 이슈만 사용자 피드백 기준으로 수정

## 2026-03-25 Phase 4 플레이 테스트 정리 메모

- 완료:
  - `PlayPage.test.tsx`를 현재 20문항 고정 세션, 10초 페이스 타이머, 세션 종료 저장 흐름 기준으로 재작성
  - 테스트 fixture를 한자 prompt 기준으로 정리해 `kanji_to_meaning` 추론과 실제 플레이 큐 조건이 맞도록 수정
  - 저장 실패 시 pending session 저장, 결과 이동, `audio_to_meaning` 준비 중/비활성화, 불가능한 난이도 비활성화까지 현재 구조 기준으로 회귀 고정
- 검증:
  - `npm run test -- src/pages/HomePage.test.tsx src/pages/LanguageSelectPage.test.tsx src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/StatsPage.test.tsx src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/features/game/gameDataRegression.test.ts`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저 플레이 피드백 기준으로 남은 UI/출제/저장 이슈만 수정
  - 신규 기능 추가보다 현재 게임/결과/임시 저장 흐름 안정화 유지

## 2026-03-25 Phase 4 플레이/결과/통계 안정화 보강 메모

- 완료:
  - `PlayPage` 표준 모드를 20문항 고정, 10초 페이스, 10하트 구조로 유지하면서 진행도를 20개 원형으로 고정 정리
  - `PlayPage` 연습 모드를 하트/타이머/누적 통계 제외, 필터 일치 문제 1회 랜덤 풀이, `연습 중단` 지원 구조로 분리
  - `ResultPage`에 조기 종료 시 `탈락` 표시와 표준 모드 Top 10 순위표 추가
  - `StatsPage`에 기록 전체삭제 버튼과 현재 구조 기준 단순화된 액션 흐름 추가
  - `LanguageSelectPage` 타이틀/로그아웃 버튼 크기 재조정
- 검증:
  - `npm run test -- src/pages/LanguageSelectPage.test.tsx src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx src/pages/StatsPage.test.tsx src/features/game/sessionConfig.test.ts src/features/game/questionRound.test.ts src/features/game/gameDataRegression.test.ts`
  - `npm run build`
- 다음 작업:
  - 실제 브라우저에서 표준/연습 모드 각각 1~2세션씩 수동 확인
  - 결과 순위표, 기록 전체삭제, 저장 실패 재저장 흐름 체감 확인
  - 사용자 피드백 기준 잔여 UI/출제/저장 이슈만 수정

## 2026-03-25 Phase 4 사용자 피드백 소조정 메모

- 완료:
  - `PlayPage` 연습 모드에서는 원형 진행도를 숨기고 표준 모드에만 진행도 표시를 유지
  - `ResultPage` 하단 단어별 복습 상태 목록을 제거해 결과 요약과 순위표 중심으로 정리
- 검증:
  - `npm run test -- src/pages/PlayPage.test.tsx src/pages/ResultPage.test.tsx`
  - `npm run build`
- 다음 작업:
  - 실제 플레이 기준으로 남는 UI/출제/저장 흐름 이슈만 사례별 수정


- 보완:
  - `json_publish_gui.local.ini` 로컬 설정 파일 자동 저장/복원 지원
  - GUI에서 서비스 계정 경로/시트 ID/출력 폴더/언어 정보/커밋 메시지를 재입력하지 않도록 개선
- 검증:
  - `python -m py_compile scripts/json_publish_gui.py scripts/export_words_json.py`


