"use client";

import { useState } from "react";
import CampaignCard from "@/components/CampaignCard";
import { dDay } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "open", label: "지원 가능" },
  { key: "soon", label: "마감 임박" },
  { key: "upcoming", label: "모집 예정" },
];

// 신청마감까지 남은 일수(숫자). 마감/없음이면 null.
function daysLeft(c) {
  const s = dDay(c.apply_deadline);
  if (!s || s === "마감") return null;
  if (s === "D-DAY") return 0;
  const m = s.match(/D-(\d+)/);
  return m ? Number(m[1]) : null;
}

export default function CampaignList({ campaigns }) {
  const [filter, setFilter] = useState("all");

  const shown = campaigns.filter((c) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return c.status === "upcoming";
    if (filter === "open")
      return c.status !== "upcoming" && c.status !== "closed";
    if (filter === "soon") {
      if (c.status === "upcoming" || c.status === "closed") return false;
      const d = daysLeft(c);
      return d !== null && d <= 3; // D-3 이내
    }
    return true;
  });

  return (
    <>
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-chip ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">해당 조건의 캠페인이 없어요.</div>
      ) : (
        <div className="card-grid">
          {shown.map((c) => (
            <CampaignCard key={c.slug} c={c} />
          ))}
        </div>
      )}
    </>
  );
}
