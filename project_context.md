# project_context.md

## 프로젝트 정의

정적 웹 프론트엔드(React)와 Google Apps Script, Google Sheets를 조합한 모바일 우선 외국어 학습 웹앱이다.  
게임처럼 반복 학습이 이어지도록 점수, 하트, 콤보, 복습 상태, 통계 흐름을 프론트 중심으로 처리한다.

## 해결하려는 문제

일반적인 단어 학습은 반복 동기가 약해지기 쉽다.  
이 프로젝트는 짧은 문제 풀이, 즉시 피드백, 세션 결과 요약, 복습 우선순위, 기본 통계 화면을 통해 반복 학습을 더 자연스럽게 이어가도록 설계한다.

## 핵심 목표 요약

- 일본어를 첫 언어로 지원하는 학습 게임형 웹앱 구축
- 브라우저에서 대부분의 게임 로직과 학습 흐름 처리
- GAS와 Google Sheets를 활용한 저비용 운영 구조 유지
- 이후 다국어 확장과 실제 운영 전환이 가능한 구조 확보

## 사용자와 운영 방식

- 주요 사용자: 학습자 본인 또는 소규모 사용자
- 운영 방식: 관리자 전용 웹 UI보다 Google Sheets와 GAS 중심 관리
- 데이터 관리: 사용자 시트와 언어별 원본/기록 시트를 분리하는 구조 지향

## 입력과 출력

### 사용자 입력

- `login_id`
- `password`
- 선택 언어
- 문제 답변
- 플레이 / 연습 모드 선택

### 외부 입력 데이터

- `lang_user_sheet`의 사용자 인증 정보
- 언어별 원본 단어 데이터
- 언어별 기록 시트 구조
- GAS API 응답 데이터

### 사용자 출력 결과

- 로그인 화면
- 언어 선택 화면
- 홈 화면
- 플레이 화면
- 결과 화면
- 복습센터 화면
- 통계 화면
- 세션 저장 payload
- 브라우저 cache / pending session / snapshot 데이터

## 현재 처리 흐름

1. 로그인
2. 언어 선택
3. 메타/단어 데이터 로드
4. localStorage cache 확인 및 fallback 적용
5. 플레이 중 점수 / 하트 / 콤보 / 복습 상태 계산
6. 세션 종료 시 `Game_Log`, `Answer_Log`, `Review_State`, `Daily_Stats` 기준 payload 생성
7. 결과 / 복습 / 통계 화면으로 흐름 연결

## 현재 포함된 기능 범위

- 로그인
- 언어 선택
- 일본어 단어 데이터 로드
- 기본 플레이
- 연습 모드
- 점수 / 하트 / 콤보 계산
- 복습 우선순위 계산
- 세션 저장 payload 생성
- `Review_State` 반영
- `Daily_Stats` 로컬 누적
- 복습센터 화면
- 기본 통계 화면
- mock/real API 런타임 분기
- 연결 상태 표시
- 테스트 환경과 주요 화면 테스트

## 현재 제외 또는 후순위 기능

- 업적 시스템
- 이미지 문제
- 듣기 모드 고도화
- 자기채점 작문 완성형
- 다국어 실제 확장
- 관리자 UI
- PWA
- 고급 통계 시각화

## 데이터 처리 원칙

- 점수, 하트, 콤보, 복습 계산은 프론트에서 처리한다.
- GAS는 인증, 원본 제공, 기록 저장 범위 안에서만 다룬다.
- 저장 실패 시 pending session으로 임시 복구 경로를 제공한다.
- localStorage는 계정 + 언어 기준 namespace로 분리한다.
- 모바일 우선 UI를 기본으로 유지한다.

## 사용 기술 스택

- React + Vite + TypeScript
- Zustand
- React Router
- Tailwind CSS
- Framer Motion
- Vitest + React Testing Library
- Google Apps Script Web App
- Google Sheets
- localStorage

## 폴더 구조 개요

- `src/pages/`: 화면 단위 구성
- `src/components/`: 공통 UI 컴포넌트
- `src/features/game/`: 게임 세션, 문제 라운드, mock 단어 로직
- `src/services/`: API, 저장소, 로깅, 복구 로직
- `src/stores/`: 전역 상태 관리
- `src/utils/`: 계산 유틸
- `docs/`: API, 시트 스키마, 설정 문서
- `gas/`: Apps Script 코드
- `.agents/skills/`: Codex 작업 스킬

## 현재 실연동 상태

- 프론트는 `apiClient.ts` 기준으로 mock 모드와 GAS Web App 모드를 분기한다.
- GAS 스켈레톤은 존재하지만, 실제 배포 URL과 실제 시트 구조는 아직 확정되지 않았다.
- 관련 준비 문서는 `docs/api-spec.md`, `docs/sheet-schema.md`, `docs/google-sheets-setup-guide.md`, `docs/gas-deploy-checklist.md`, `docs/real-connection-smoke-test.md`에 정리되어 있다.

## Google Sheets 구조 가정

현재 코드가 기대하는 최소 구조:

- 사용자 시트 파일: `lang_user_sheet`
- 사용자 인증 탭: `Users`
- 기록 탭:
  - `Game_Log`
  - `Answer_Log`
  - `Review_State`
  - `Daily_Stats`

아직 미확정:

- 실제 Google Sheet ID
- 실제 탭별 헤더 순서
- 실제 GAS URL
- 실제 응답 envelope 최종 형식

## 자동 처리 범위

- 로그인 이후 데이터 로드
- 세션 payload 생성
- `Review_State` 계산
- `Daily_Stats` 누적
- cache / pending session 관리
- 테스트 실행
- 문서 초안 정리

## 수동 확인이 필요한 범위

- 단어 데이터 정확성
- 실제 Google Sheets 구조 확정
- 실제 GAS 배포와 권한 설정
- 모바일 UI 최종 사용성 확인
- 실연동 후 smoke test 확인

## 현재 버전과 최종 프로그램의 차이

### 현재 버전

- 일본어 1개 언어
- 기본 플레이 루프
- 문제 유형 2종
- 로컬 복구 및 통계
- 실연동 준비 문서와 스켈레톤까지 완료

### 최종 프로그램

- 다국어 확장
- 고급 문제 유형
- 업적/고급 통계/UX polish
- 실제 운영 문서와 배포 체계 정리

## 다음 개발 기준

- Phase 기준은 `ROADMAP.md`
- 즉시 작업 범위는 `TASKS.md`
- 구현 상태 확인은 `PROJECT_STATE.md`
- 실제 작업은 프로젝트 문서를 기준으로 진행
