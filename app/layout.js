import "./globals.css";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function toMetadataBase(u) {
  try {
    return new URL(u);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata = {
  metadataBase: toMetadataBase(siteUrl),
  title: "SIRIAI 캠페인 | 인플루언서 모집",
  description:
    "진행 중인 인플루언서 캠페인을 한 곳에서 확인하고 바로 신청하세요.",
  openGraph: {
    title: "SIRIAI 캠페인",
    description: "진행 중인 인플루언서 캠페인을 한 곳에서 확인하고 신청하세요.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
