import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign, getCampaigns } from "@/lib/sheets";
import { formatWon, formatPeriod } from "@/lib/format";
import CopyButton from "@/components/CopyButton";
import ApplyForm from "@/components/ApplyForm";
import CoverImage from "@/components/CoverImage";

export const revalidate = 60;

function brandInitial(name) {
  return (name || "?").trim().slice(0, 2);
}

export async function generateMetadata({ params }) {
  const c = await getCampaign(params.slug);
  if (!c) return { title: "캠페인을 찾을 수 없어요" };
  return {
    title: `${c.title} | SIRIAI 캠페인`,
    description: c.brand_intro?.slice(0, 100),
    openGraph: {
      title: c.title,
      description: c.brand_intro?.slice(0, 100),
      images: c.cover_image_url ? [c.cover_image_url] : [],
    },
  };
}

export default async function CampaignDetail({ params }) {
  const c = await getCampaign(params.slug);
  if (!c) notFound();

  const hashtags = c.required_hashtags
    ? String(c.required_hashtags).trim()
    : "";

  return (
    <main>
      <Link href="/" className="backlink">
        ← 캠페인 목록
      </Link>

      <div className="detail-cover">
        <CoverImage
          src={c.cover_image_url}
          alt={c.title}
          fallback={brandInitial(c.brand_name)}
        />
      </div>

      <div className="detail-body">
        <div className="brand-row">
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

        <div className="detail-title">{c.title}</div>
        <div className="detail-reward">{formatWon(c.reward_amount)}</div>

        <div className="tags">
          {c.content_type && <span className="tag">{c.content_type}</span>}
          {c.flags?.map((f, i) => (
            <span className="tag req" key={i}>
              {f}
            </span>
          ))}
        </div>

        {c.brand_intro && (
          <section className="section">
            <h2>브랜드 소개</h2>
            <p>{c.brand_intro}</p>
          </section>
        )}

        <section className="section">
          <h2>캠페인 개요</h2>
          <div className="info-table">
            <div className="info-row">
              <span className="k">콘텐츠 형식</span>
              <span className="v">{c.content_type || "-"}</span>
            </div>
            <div className="info-row">
              <span className="k">고료</span>
              <span className="v">{formatWon(c.reward_amount)}</span>
            </div>
            <div className="info-row">
              <span className="k">업로드 기간</span>
              <span className="v">
                {formatPeriod(c.upload_start, c.upload_end)}
              </span>
            </div>
          </div>
        </section>

        {c.products?.length > 0 && (
          <section className="section">
            <h2>제공 제품</h2>
            {c.products.map((p, i) =>
              p.url ? (
                <a
                  className="product-row"
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  key={i}
                >
                  <span className="pname">{p.name || p.url}</span>
                  <span className="plink">상품 보기 ↗</span>
                </a>
              ) : (
                <div className="product-row" key={i}>
                  <span className="pname">{p.name}</span>
                </div>
              )
            )}
          </section>
        )}

        <section className="section">
          <h2>콘텐츠 제작 가이드</h2>
          {c.guide_file_url && (
            <a
              className="guide-file"
              href={c.guide_file_url}
              target="_blank"
              rel="noreferrer"
            >
              📎 가이드 파일 보기 ↗
            </a>
          )}
          {c.required_notes && (
            <div className="note req">
              <div className="label">✅ 필수 사항</div>
              <div className="body">{c.required_notes}</div>
            </div>
          )}
          {c.forbidden_notes && (
            <div className="note forbid">
              <div className="label">⛔ 금지 사항</div>
              <div className="body">{c.forbidden_notes}</div>
            </div>
          )}
          {c.recommended_notes && (
            <div className="note tip">
              <div className="label">💡 추천 사항</div>
              <div className="body">{c.recommended_notes}</div>
            </div>
          )}
        </section>

        {(c.collab_accounts?.length > 0 ||
          c.caption_requirements ||
          hashtags) && (
          <section className="section">
            <h2>업로드 가이드</h2>

            {c.collab_accounts?.map((acc, i) => (
              <div className="copy-box" key={i}>
                <div className="cap">공동작업자 계정 {i + 1}</div>
                <div className="copy-row">
                  <span className="val">{acc}</span>
                  <CopyButton value={acc} />
                </div>
              </div>
            ))}

            {c.caption_requirements && (
              <div className="note req">
                <div className="label">✅ 캡션 필수 사항</div>
                <div className="body">{c.caption_requirements}</div>
              </div>
            )}

            {hashtags && (
              <div className="copy-box">
                <div className="cap">필수 해시태그</div>
                <div className="copy-row">
                  <span className="val">{hashtags}</span>
                  <CopyButton value={hashtags} />
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <ApplyForm campaign={c} />
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const list = await getCampaigns();
    return list.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}
