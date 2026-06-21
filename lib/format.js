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

export function formatPeriod(start, end) {
  if (!start && !end) return "상시";
  return `${start || ""} ~ ${end || ""}`.trim();
}
