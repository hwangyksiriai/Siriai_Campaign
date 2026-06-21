# 설치 & 구글시트 연결 가이드

이 가이드는 **개발 지식이 없어도** 따라 할 수 있게 단계별로 설명합니다.
크게 ① 사이트 실행 → ② 구글시트 연결 두 부분입니다.

---

## ① 사이트 실행해 보기 (5분)

1. [Node.js](https://nodejs.org) LTS 버전 설치 (이미 있으면 생략)
2. 이 폴더에서 터미널(PowerShell) 열고:
   ```powershell
   npm install
   npm run dev
   ```
3. 브라우저에서 http://localhost:3000 접속

> 이 단계에서는 **샘플 캠페인**이 보입니다. (아직 구글시트 연결 전)
> 신청 버튼도 동작하지만, 시트 연결 전에는 실제로 저장되지 않고 콘솔에만 기록됩니다.

---

## ② 구글시트 연결 (10분, 한 번만)

### 2-1. 새 구글시트 만들기
1. https://sheets.google.com 에서 **빈 스프레드시트** 새로 만들기
2. 이름은 자유롭게 (예: `SIRIAI 캠페인`)

### 2-2. Apps Script 붙여넣기
1. 시트 상단 메뉴 → **확장 프로그램 > Apps Script**
2. 기본 코드를 모두 지우고, 이 프로젝트의 [`google-apps-script/Code.gs`](google-apps-script/Code.gs) 내용을 **전부 복사해서 붙여넣기**
3. 저장(💾)

### 2-3. 탭 자동 생성 (setup 실행)
1. Apps Script 화면 상단 함수 선택 칸에서 **`setup`** 선택
2. **실행(▶)** 클릭 → 구글 계정 권한 요청이 뜨면 **허용**
3. 시트로 돌아가면 **`캠페인`** 과 **`신청`** 탭이 자동으로 생겼고,
   `캠페인` 탭에 제목줄 + 샘플 캠페인 1줄이 들어가 있습니다.

### 2-4. 웹앱으로 배포
1. Apps Script 화면 우측 상단 **배포 > 새 배포**
2. 톱니바퀴(유형 선택) → **웹 앱**
3. 설정:
   - 설명: 아무거나 (예: `v1`)
   - **실행: 나(본인 계정)**
   - **액세스 권한: 모든 사용자**
4. **배포** 클릭 → 표시되는 **웹 앱 URL** 복사
   (형식: `https://script.google.com/macros/s/.../exec`)

### 2-5. 사이트에 URL 연결
1. 프로젝트 폴더에 `.env.local` 파일을 만들고 (`.env.local.example` 복사):
   ```
   APPS_SCRIPT_URL=여기에_복사한_웹앱_URL_붙여넣기
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
2. 터미널에서 서버 재시작:
   ```powershell
   npm run dev
   ```
3. 이제 사이트는 **구글시트 `캠페인` 탭**을 읽어 화면에 보여주고,
   신청이 들어오면 **`신청` 탭**에 자동으로 쌓입니다.

---

## 캠페인 추가/수정하는 법

- `캠페인` 탭에 **한 줄 = 한 캠페인**. 새 캠페인은 행 추가, 수정은 셀 수정.
- 주요 칸 설명:
  | 칸 | 설명 |
  |---|---|
  | `slug` | 캠페인 주소용 영문 고유값 (예: `oddtype-jun-w3`) — 중복 금지 |
  | `status` | `open`(지원가능) / `negotiable`(협의) / `closed`(마감) / `draft`(숨김) |
  | `flags` | 속성 태그, 쉼표로 구분 (예: `공동작업 필수, 2차활용 필수`) |
  | `collab_accounts` | 공동작업자 계정, 쉼표로 구분 (예: `@a, @b`) |
  | `consent_items` | 필수 동의 문구. 여러 개면 셀 안에서 줄바꿈(Alt+Enter) |
  | `reward_amount` | 숫자만 (예: `50000`). `0`이면 "협의"로 표시 |
- 저장하면 사이트에 **최대 1분 내** 반영됩니다(캐시).

---

## 배포(공개 링크 만들기) — Vercel

1. https://vercel.com 가입 후 이 프로젝트를 GitHub에 올리고 Import
   (또는 `npm i -g vercel` 후 `vercel` 명령)
2. Vercel 프로젝트 **Settings > Environment Variables** 에
   `APPS_SCRIPT_URL`, `NEXT_PUBLIC_SITE_URL`(배포 도메인) 추가
3. 배포되면 생성된 주소가 **인플루언서에게 보낼 링크 1개**가 됩니다.
