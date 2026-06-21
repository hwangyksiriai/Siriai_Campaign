// 구글시트(Apps Script 웹앱) 연동 레이어.
// - 캠페인 읽기: GET  {APPS_SCRIPT_URL}?action=campaigns
// - 신청 쓰기:  POST {APPS_SCRIPT_URL}  body={ action:'apply', ... }
// APPS_SCRIPT_URL 이 없으면 SEED_CAMPAIGNS 로 동작(미리보기).

import { SEED_CAMPAIGNS } from "./seed";

const URL = process.env.APPS_SCRIPT_URL;

// 제목 등에서 URL용 슬러그 생성 (한글 유지, 공백/기호 정리)
function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 제공 제품 파싱. 셀 형식: "제품명 | 링크 ;; 제품명 | 링크" (또는 줄바꿈으로 구분)
function parseProducts(v) {
  if (Array.isArray(v)) {
    return v
      .map((p) => ({ name: (p.name || "").trim(), url: (p.url || "").trim() }))
      .filter((p) => p.name || p.url);
  }
  if (typeof v === "string") {
    return v
      .split(/;;|\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s*\|\s*|\t/);
        return { name: (parts[0] || "").trim(), url: (parts[1] || "").trim() };
      })
      .filter((p) => p.name || p.url);
  }
  return [];
}

// 제품을 따로따로 칸(product1_name/product1_url … product5_name/product5_url)에서 수집.
// 없으면 기존 한 칸(products) 형식도 지원.
function collectProducts(c) {
  const list = [];
  for (let i = 1; i <= 5; i++) {
    const name = c["product" + i + "_name"];
    const url = c["product" + i + "_url"];
    if ((name && String(name).trim()) || (url && String(url).trim())) {
      list.push({ name: String(name || "").trim(), url: String(url || "").trim() });
    }
  }
  if (list.length === 0 && c.products) return parseProducts(c.products);
  return list;
}

// 시트에서 문자열로 올 수 있는 배열형 필드를 정규화
function normalize(c) {
  const toList = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
  const toLines = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
        : [];
  return {
    ...c,
    slug: String(c.slug || "").trim() || slugify(c.title),
    reward_amount: c.reward_amount ? Number(c.reward_amount) : 0,
    applicant_count: c.applicant_count ? Number(c.applicant_count) : 0,
    flags: toList(c.flags),
    collab_accounts: toList(c.collab_accounts),
    products: collectProducts(c),
    consent_items: toLines(c.consent_items),
    status: String(c.status || "open").toLowerCase(),
  };
}

// 슬러그가 비었거나 중복이면 정리(중복은 -2, -3 … 부여)
function finalize(list) {
  const seen = {};
  return list
    .map(normalize)
    .filter((c) => c.slug)
    .map((c) => {
      let s = c.slug;
      if (seen[s]) {
        seen[s] += 1;
        s = `${c.slug}-${seen[s]}`;
      } else {
        seen[s] = 1;
      }
      return { ...c, slug: s };
    });
}

export async function getCampaigns() {
  if (!URL) return finalize(SEED_CAMPAIGNS);
  try {
    const res = await fetch(`${URL}?action=campaigns`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`sheet fetch ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("unexpected sheet response");
    return finalize(data);
  } catch (e) {
    console.error("[sheets] getCampaigns failed, falling back to seed:", e);
    return finalize(SEED_CAMPAIGNS);
  }
}

export async function getCampaign(slug) {
  const list = await getCampaigns();
  let target = String(slug);
  try {
    target = decodeURIComponent(target);
  } catch {
    // 이미 디코딩된 값이면 그대로 사용
  }
  return (
    list.find((c) => c.slug === target || c.slug === String(slug)) || null
  );
}

export async function submitApplication(payload) {
  if (!URL) {
    console.log("[sheets] APPS_SCRIPT_URL 미설정 — 신청 데이터(미저장):", payload);
    return { ok: true, dev: true };
  }
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply", ...payload }),
      redirect: "follow",
    });
    const data = await res.json().catch(() => ({ ok: false, error: "bad response" }));
    return data;
  } catch (e) {
    console.error("[sheets] submitApplication failed:", e);
    return { ok: false, error: String(e) };
  }
}
