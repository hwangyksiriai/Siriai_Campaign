import { getCampaigns } from "@/lib/sheets";
import CampaignList from "@/components/CampaignList";

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
    <main className="home">
      <div className="brand-header">
        <div className="brand-wordmark">Siriai</div>
        <p className="brand-tagline">Architecture for Insight, AI</p>
      </div>

      <header className="app-header">
        <h1>Campaigns</h1>
        <span className="count">{ordered.length}</span>
      </header>

      {ordered.length === 0 ? (
        <div className="empty">현재 모집 중인 캠페인이 없어요.</div>
      ) : (
        <CampaignList campaigns={ordered} />
      )}

      <div style={{ height: 24 }} />
    </main>
  );
}
