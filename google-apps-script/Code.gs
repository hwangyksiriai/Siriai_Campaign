/**
 * SIRIAI 캠페인 허브 — 구글시트 연동 Apps Script
 *
 * [최초 1회]
 *   1) 구글시트에서 확장 프로그램 > Apps Script 열기
 *   2) 이 파일 내용을 전부 붙여넣고 저장
 *   3) 함수 목록에서 setup 선택 후 실행(▶) → 권한 허용
 *      → '캠페인' 탭과 제목줄, 샘플 캠페인 1개가 자동 생성됩니다.
 *      (신청 탭은 캠페인별로 신청이 처음 들어올 때 "신청 - {캠페인명}" 으로 자동 생성)
 *   4) 배포 > 새 배포 > 유형: 웹 앱
 *      - 실행: 나
 *      - 액세스 권한: 모든 사용자
 *      → 생성된 '웹 앱 URL' 복사 → 사이트의 APPS_SCRIPT_URL 환경변수에 붙여넣기
 *
 * 캠페인을 추가/수정하려면 '캠페인' 탭에 행을 추가/수정하면 됩니다.
 * 신청이 들어오면 '신청' 탭에 자동으로 한 줄씩 쌓입니다.
 */

var SHEET_CAMPAIGNS = "캠페인";
// 신청은 캠페인별로 "신청 - {캠페인명}" 탭에 따로 저장됩니다.
var APPLICATION_TAB_PREFIX = "신청 - ";
// '캠페인 추가' 기능 보안용 암호 (원하면 바꿔도 됨)
var ADMIN_TOKEN = "siriai-admin-2026";

var CAMPAIGN_HEADERS = [
  "slug",
  "title",
  "brand_name",
  "brand_logo_url",
  "brand_intro",
  "cover_image_url",
  "content_type",
  "reward_amount",
  "apply_deadline",
  "upload_start",
  "upload_end",
  "schedule_note",
  "flags",
  "guide_file_url",
  "required_notes",
  "forbidden_notes",
  "recommended_notes",
  "guide_note",
  "collab_accounts",
  "required_hashtags",
  "caption_requirements",
  "product1_name",
  "product1_url",
  "product2_name",
  "product2_url",
  "product3_name",
  "product3_url",
  "product4_name",
  "product4_url",
  "product5_name",
  "product5_url",
  "products_note",
  "consent_items",
  "status",
];

// 캠페인별 신청 탭은 탭 이름으로 캠페인이 구분되므로 캠페인 컬럼은 두지 않음
var APPLICATION_HEADERS = [
  "timestamp",
  "name",
  "email",
  "phone",
  "age_range",
  "instagram_handle",
  "address",
  "address_detail",
  "request_note",
  "agreed",
];

// resetCampaigns() 실행 시 '캠페인' 탭에 채워질 캠페인 목록.
// 캠페인을 추가하려면 아래 { ... } 블록을 복사해서 더 넣으면 됩니다.
var CAMPAIGNS_TO_LOAD = [
  {
    slug: "oddtype-musinsa-jul",
    title: "[MUSINSA] 무신사 오드타입 벌룬틴트/블러틴트/워터블러시",
    brand_name: "ODDTYPE",
    brand_intro:
      "오드타입은 무신사가 전개하는 컬러 코스메틱 PB 브랜드입니다. 트렌드를 따르기보다 자신만의 리듬으로 뷰티를 표현하는 사람들과 함께 성장합니다.",
    cover_image_url: "/campaigns/oddtype-balloon.png",
    content_type: "릴스",
    reward_amount: 50000,
    apply_deadline: "2026-06-28",
    upload_start: "2026-07-01",
    upload_end: "2026-07-02",
    schedule_note: "프로모션 상황에 따라 일정이 변경될 수 있습니다.",
    flags: "공동작업 필수, 2차활용 필수",
    required_notes: "2-3가지 색상 입술 발색 및 전색상 손목 발색",
    forbidden_notes: "어두운 조명, 저화질",
    recommended_notes: "고화질 촬영",
    guide_note: "자세한 가이드라인은 선정 시 전달드립니다.",
    collab_accounts: "@oddtype_official, @oddtype_jp",
    required_hashtags: "#무신사 #오드타입 #oddtpye",
    caption_requirements: "발색한 컬러명 언급 및 컬러에 대한 설명",
    product1_name: "벌룬틴트 4종 (랜덤)",
    product1_url: "https://www.musinsa.com/products/3882622",
    product2_name: "블러틴트 4종 (랜덤)",
    product2_url: "https://www.musinsa.com/products/3153848",
    product3_name: "워터블러시 4종 (랜덤)",
    product3_url: "https://www.musinsa.com/products/3450028",
    products_note:
      "크리에이터 개인 피드 무드 및 콘셉트에 맞춰 브랜드 측에서 최적의 제품군으로 선정 후 발송 예정.",
    consent_items:
      "선정 후 미업로드 시 제공받은 제품의 원가를 청구받는 데 동의합니다.",
    status: "open",
  },
];

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var c = ss.getSheetByName(SHEET_CAMPAIGNS) || ss.insertSheet(SHEET_CAMPAIGNS);
  if (c.getLastRow() === 0) {
    c.appendRow(CAMPAIGN_HEADERS);
    c.appendRow([
      "oddtype-jun-w2",
      "오드타입 6월 2주차 (벌룬/블로우/립라이너/립타투)",
      "무신사",
      "",
      "오드타입(ODDTYPE)은 무신사 뷰티 브랜드로, 개성 있는 컬러와 텍스처의 립 제품 라인을 선보입니다.",
      "",
      "릴스",
      50000,
      "2026-06-11",
      "2026-06-17",
      "공동작업 필수, 2차활용 필수",
      "",
      "전 색상 발색",
      "타 브랜드 언급 금지",
      "고화질 촬영",
      "@oddtype_official, @oddtype_jp",
      "#무신사 #닥시젤리틴트",
      "전색상 발색했다고 언급",
      "벌룬틴트 4종 (랜덤) | https://www.musinsa.com/products/3882622 ;; 블러틴트 4종 (랜덤) | https://www.musinsa.com/products/3153848 ;; 워터블러시 4종 (랜덤) | https://www.musinsa.com/products/3450028",
      "선정 후 미업로드 시 제공받은 제품의 원가를 청구받는 데 동의합니다.",
      "open",
    ]);
    c.setFrozenRows(1);
  }

  // 신청 탭은 캠페인별로 신청이 처음 들어올 때 자동 생성됩니다.
}

// '캠페인' 탭을 비우고 CAMPAIGNS_TO_LOAD 의 캠페인으로 다시 채웁니다.
// (함수 목록에서 resetCampaigns 선택 후 실행)
function resetCampaigns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_CAMPAIGNS) || ss.insertSheet(SHEET_CAMPAIGNS);
  sh.clear();
  sh.appendRow(CAMPAIGN_HEADERS);
  sh.setFrozenRows(1);
  CAMPAIGNS_TO_LOAD.forEach(function (c) {
    var row = CAMPAIGN_HEADERS.map(function (h) {
      return c[h] != null ? c[h] : "";
    });
    sh.appendRow(row);
  });
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";
  if (action === "campaigns") {
    return json(getCampaigns());
  }
  return json({ ok: true, message: "SIRIAI Campaign Hub API" });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === "apply") {
      appendApplication(body);
      return json({ ok: true });
    }
    if (body.action === "addCampaign") {
      if (body.token !== ADMIN_TOKEN) {
        return json({ ok: false, error: "unauthorized" });
      }
      var list = body.campaigns || (body.campaign ? [body.campaign] : []);
      list.forEach(addCampaign);
      return json({ ok: true, added: list.length });
    }
    return json({ ok: false, error: "unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getCampaigns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_CAMPAIGNS);
  if (!sh || sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var headers = values.shift();
  var tz = ss.getSpreadsheetTimeZone();
  var titleIdx = headers.indexOf("title");

  return values
    .filter(function (row) {
      var key = titleIdx >= 0 ? row[titleIdx] : row[0];
      return String(key).trim() !== "";
    })
    .map(function (row) {
      var o = {};
      headers.forEach(function (h, i) {
        var v = row[i];
        if (v instanceof Date) {
          v = Utilities.formatDate(v, tz, "yyyy-MM-dd");
        }
        o[h] = v;
      });
      return o;
    });
}

function appendApplication(body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabName = applicationTabName(body);
  var sh = ss.getSheetByName(tabName);
  if (!sh) {
    sh = ss.insertSheet(tabName);
    sh.appendRow(APPLICATION_HEADERS);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(APPLICATION_HEADERS);
    sh.setFrozenRows(1);
  }
  var tz = ss.getSpreadsheetTimeZone();
  var now = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");
  var map = {
    timestamp: now,
    name: body.name || "",
    email: body.email || "",
    phone: body.phone || "",
    age_range: body.age_range || "",
    instagram_handle: body.instagram_handle || "",
    address: body.address || "",
    address_detail: body.address_detail || "",
    request_note: body.request_note || "",
    agreed: body.agreed || "",
  };
  var row = APPLICATION_HEADERS.map(function (h) {
    return map[h];
  });
  sh.appendRow(row);
}

// 새 캠페인 한 건을 '캠페인' 탭에 한 줄 추가 (기존 데이터는 유지).
function addCampaign(c) {
  if (!c) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_CAMPAIGNS) || ss.insertSheet(SHEET_CAMPAIGNS);
  if (sh.getLastRow() === 0) {
    sh.appendRow(CAMPAIGN_HEADERS);
    sh.setFrozenRows(1);
  }
  // 실제 시트의 제목줄 순서에 맞춰 값 배치
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) {
    return c[h] != null ? c[h] : "";
  });
  sh.appendRow(row);
}

// 캠페인별 신청 탭 이름. 구글시트 탭 이름은 : \ / ? * [ ] 사용 불가, 100자 이내.
function applicationTabName(body) {
  var base = String(body.campaign_title || body.campaign_slug || "기타").trim();
  base = base.replace(/[:\\\/\?\*\[\]]/g, " ").replace(/\s+/g, " ").trim();
  var name = APPLICATION_TAB_PREFIX + base;
  if (name.length > 99) name = name.substring(0, 99);
  return name;
}

function json(obj) {
  return ContentService.createTextOutput(
    JSON.stringify(obj)
  ).setMimeType(ContentService.MimeType.JSON);
}
