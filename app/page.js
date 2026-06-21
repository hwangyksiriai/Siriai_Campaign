import { getCampaigns } from "@/lib/sheets";
import CampaignCard from "@/components/CampaignCard";

export const revalidate = 60;

export default async function HomePage() {
  const all = await getCampaigns();
  // draft 는 숨김. 순서: 모집중 → 모집예정 → 마감
  const visible = all.filter((c) => c.status !== "draft");
  const upcoming = visible.filter((c) => c.status === "upcoming");
  const closed = visible.filter((c) => c.status === "closed");
  const live = visible.filter(
    (c) => c.status !== "upcoming" && c.status !== "closed"
  );
  const ordered = [...live, ...upcoming, ...closed];

  return (
    <main>
      <div className="brand-header">
        <img src="/campaigns/logo.png" alt="SIRIAI" className="brand-logo-img" />
        <p className="brand-tagline">Architecture for Insight, AI</p>
      </div>

      <header className="app-header">
        <h1>캠페인</h1>
        <span className="count">{ordered.length}</span>
      </header>

      {ordered.length === 0 ? (
        <div className="empty">현재 모집 중인 캠페인이 없어요.</div>
      ) : (
        <div>
          {ordered.map((c) => (
            <CampaignCard key={c.slug} c={c} />
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
    </main>
  );
}
