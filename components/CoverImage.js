"use client";

import { useState } from "react";

// 이미지가 없거나 깨지면 브랜드 이니셜 플레이스홀더로 대체
export default function CoverImage({ src, alt, fallback }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return <span className="watermark">{fallback}</span>;
  }
  return <img src={src} alt={alt} onError={() => setErr(true)} />;
}
