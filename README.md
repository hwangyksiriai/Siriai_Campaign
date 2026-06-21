# SIRIAI 캠페인 허브

여러 인플루언서 캠페인을 **링크 1개**에 모아 보여주고, 캠페인별 가이드를 확인한 뒤
바로 신청까지 받는 모바일 우선 허브. 캠페인 등록과 신청 취합은 모두 **구글시트**에서 처리합니다.
(별도 관리자 페이지 없음)

- 제품 기획: [PRD.md](PRD.md)
- 설치 & 구글시트 연결: [SETUP.md](SETUP.md)

## 빠른 시작

```powershell
npm install
npm run dev   # http://localhost:3000 (구글시트 연결 전엔 샘플 캠페인 표시)
```

구글시트 연결은 [SETUP.md](SETUP.md) 참고. (`.env.local` 에 `APPS_SCRIPT_URL` 설정)

## 구조

```
app/
  page.js                    캠페인 목록 (홈)
  campaigns/[slug]/page.js   캠페인 상세 + 가이드
  api/apply/route.js         신청 → 구글시트 기록(프록시)
  privacy/page.js            개인정보 처리방침
components/
  CampaignCard.js  ApplyForm.js(신청 폼+우편번호)  CopyButton.js
lib/
  sheets.js   구글시트 읽기/쓰기   seed.js  샘플 데이터   format.js
google-apps-script/
  Code.gs     구글시트에 붙여넣을 연동 스크립트
```

## 동작 방식

```
구글시트 '캠페인' 탭 ──읽기──▶ 사이트(목록/상세)
인플루언서 신청 ──쓰기──▶ 구글시트 '신청' 탭
```

- 캠페인 추가/수정: 구글시트 `캠페인` 탭에서 행 편집 (최대 1분 내 반영)
- 신청 데이터: 구글시트 `신청` 탭에 자동 누적
- 주소 입력: 카카오(Daum) 우편번호 검색
- 로그인 없이 링크로 누구나 열람/신청

