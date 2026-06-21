"use client";

import { useState } from "react";

export default function CopyButton({ value }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // 클립보드 API 미지원 환경 폴백
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button type="button" className={`copy-btn ${done ? "done" : ""}`} onClick={copy}>
      {done ? "복사됨" : "복사"}
    </button>
  );
}
