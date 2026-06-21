"use client";

import { useEffect, useState } from "react";

const DAUM_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function ensureDaum() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    if (window.daum && window.daum.Postcode) return resolve();
    const existing = document.querySelector(`script[src="${DAUM_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = DAUM_SRC;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const empty = {
  name: "",
  instagram_handle: "",
  phone: "",
  email: "",
  age_range: "",
  address: "",
  address_detail: "",
  request_note: "",
};

export default function ApplyForm({ campaign }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [already, setAlready] = useState(false);

  const appliedKey = `applied_${campaign.slug}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(appliedKey)) setAlready(true);
    } catch {}
  }, [appliedKey]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closed = campaign.status === "closed";

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function searchAddress() {
    try {
      await ensureDaum();
      new window.daum.Postcode({
        oncomplete: (data) => {
          const addr =
            data.userSelectedType === "R"
              ? data.roadAddress
              : data.jibunAddress;
          set("address", addr);
        },
      }).open();
    } catch {
      setError("주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  const valid =
    form.name.trim() &&
    form.instagram_handle.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.address_detail.trim() &&
    agreed;

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_slug: campaign.slug,
          campaign_title: campaign.title,
          ...form,
          agreed: agreed ? "Y" : "N",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "submit failed");
      try {
        localStorage.setItem(appliedKey, "1");
      } catch {}
      setSubmitted(true);
    } catch (e) {
      setError("신청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="cta-bar">
        <div className="cta-inner">
          <button
            className="btn primary"
            disabled={closed || already}
            onClick={() => setOpen(true)}
          >
            {closed ? "모집 마감" : already ? "신청 완료" : "신청하기"}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setOpen(false);
          }}
        >
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="grabber" />

            {submitted ? (
              <div className="success">
                <div className="check">✓</div>
                <h3>신청이 접수되었어요!</h3>
                <p>{campaign.title}</p>
                <p>선정 결과와 다음 안내는 입력하신 연락처로 전달됩니다.</p>
                <div style={{ height: 18 }} />
                <button className="btn primary" onClick={() => setOpen(false)}>
                  확인
                </button>
              </div>
            ) : (
              <>
                <h3>캠페인 지원</h3>

                <div className="field">
                  <label>
                    이름 <span className="req-star">*</span>
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="실명"
                  />
                </div>

                <div className="field">
                  <label>
                    인스타그램 링크 <span className="req-star">*</span>
                  </label>
                  <input
                    className="input"
                    type="url"
                    inputMode="url"
                    value={form.instagram_handle}
                    onChange={(e) => set("instagram_handle", e.target.value)}
                    placeholder="https://instagram.com/내아이디"
                  />
                </div>

                <div className="field">
                  <label>
                    휴대폰 <span className="req-star">*</span>
                  </label>
                  <input
                    className="input"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="010-0000-0000"
                  />
                </div>

                <div className="field">
                  <label>이메일 (선택)</label>
                  <input
                    className="input"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="field">
                  <label>
                    배송지 주소 <span className="req-star">*</span>
                  </label>
                  <div className="addr-row">
                    <input
                      className="input"
                      value={form.address}
                      readOnly
                      placeholder="주소 검색을 눌러주세요"
                      onClick={searchAddress}
                    />
                    <button
                      type="button"
                      className="btn-dark-sm"
                      onClick={searchAddress}
                    >
                      주소 검색
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>
                    상세 주소 <span className="req-star">*</span>
                  </label>
                  <input
                    className="input"
                    value={form.address_detail}
                    onChange={(e) => set("address_detail", e.target.value)}
                    placeholder="상세 주소 (동, 호수 등)"
                  />
                </div>

                <div className="field">
                  <label>요청사항 (선택)</label>
                  <textarea
                    className="textarea"
                    value={form.request_note}
                    onChange={(e) => set("request_note", e.target.value)}
                    placeholder="요청사항 (선택)"
                  />
                </div>

                <div className="notice">
                  ⚠ 배송지는 매 캠페인마다 새로 확인합니다. 정확히 입력해 주세요.
                  <br />
                  <br />
                  📌 <strong>업로드·정산 안내</strong>
                  <br />· 안내된 업로드 마감일까지 업로드 시 정산이 진행됩니다.
                  <br />· 정산은 매월 5일 일괄 지급됩니다.
                </div>

                {campaign.consent_items?.map((item, i) => (
                  <label className="consent" key={i}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      {item} <span className="opt">(필수)</span>
                    </span>
                  </label>
                ))}
                {(!campaign.consent_items ||
                  campaign.consent_items.length === 0) && (
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      개인정보 수집·이용에 동의합니다.{" "}
                      <span className="opt">(필수)</span>
                    </span>
                  </label>
                )}

                {error && <div className="err">{error}</div>}

                <button
                  className="btn primary"
                  disabled={!valid || submitting}
                  onClick={submit}
                >
                  {submitting
                    ? "제출 중…"
                    : valid
                      ? "신청 완료"
                      : "주소를 입력해 주세요"}
                </button>
                <div style={{ height: 8 }} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
