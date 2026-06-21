export function formatWon(amount) {
  const n = Number(amount) || 0;
  if (n === 0) return "협의";
  return n.toLocaleString("ko-KR") + "원";
}

export function statusLabel(status) {
  switch (String(status).toLowerCase()) {
    case "open":
      return { text: "지원 가능", tone: "open" };
    case "negotiable":
      return { text: "협의", tone: "negotiable" };
    case "closed":
      return { text: "마감", tone: "closed" };
    default:
      return { text: "지원 가능", tone: "open" };
  }
}

// 신청마감일까지 남은 일수 → "D-2" / "D-DAY" / "마감" (한국 시간 기준)
export function dDay(dateStr) {
  if (!dateStr) return null;
  const target = new Date(String(dateStr).trim());
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const n = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const t = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate()
  );
  const days = Math.round((t - n) / 86400000);
  if (days < 0) return "마감";
  if (days === 0) return "D-DAY";
  return "D-" + days;
}

export function formatPeriod(start, end) {
  if (!start && !end) return "상시";
  return `${start || ""} ~ ${end || ""}`.trim();
}
