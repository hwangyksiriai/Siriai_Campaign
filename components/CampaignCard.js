import Link from "next/link";
import { formatWon, statusLabel } from "@/lib/format";
import CoverImage from "@/components/CoverImage";

function brandInitial(name) {
  return (name || "?").trim().slice(0, 2);
}

export default function CampaignCard({ c }) {
  const status = statusLabel(c.status);
  return (
    <Link href={`/campaigns/${c.slug}`} className="card" aria-label={c.title}>
      <div className="card-top">
        <div className="brand-logo">
          {c.brand_logo_url ? (
            <img src={c.brand_logo_url} alt={c.brand_name} />
          ) : (
            brandInitial(c.brand_name)
          )}
        </div>
        <div className="brand-meta">
          <div className="name">{c.brand_name}</div>
        </div>
      </div>

      <div className="cover">
        <CoverImage
          src={c.cover_image_url}
          alt={c.title}
          fallback={brandInitial(c.brand_name)}
        />
        {c.flags?.[0] && <span className="badge cat">{c.flags[0]}</span>}
        <span className={`badge status ${status.tone}`}>{status.text}</span>
      </div>

      <div className="card-title">{c.title}</div>
      <div className="card-foot">
        <span className="won">{formatWon(c.reward_amount)}</span>
      </div>
    </Link>
  );
}
