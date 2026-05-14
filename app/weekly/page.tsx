import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getServiceClient } from "@/lib/supabase-admin";

// Always reflects the current set of sent issues.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Weekly — Link & Dink",
  description:
    "Every past issue of Link & Dink Weekly — curated DMV pickleball, one drill, one rule, one local pick.",
};

type ArchiveRow = {
  title: string;
  slug: string;
  preview_text: string | null;
  sent_at: string;
};

export default async function WeeklyArchive() {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("issues")
    .select("title, slug, preview_text, sent_at")
    .eq("status", "sent")
    .order("sent_at", { ascending: false });

  const issues = (data ?? []) as ArchiveRow[];

  return (
    <>
      <Nav />
      <main className="archive-page">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">The Weekly</div>
            <h1>Link &amp; Dink Weekly</h1>
            <p>
              Every issue, in one place. Curated DMV pickleball — one drill, one
              rule, one local pick.
            </p>
          </div>

          {issues.length > 0 ? (
            <ul className="archive-list">
              {issues.map((issue) => (
                <li key={issue.slug} className="archive-item">
                  <Link href={`/weekly/${issue.slug}`} className="archive-link">
                    <span className="archive-item-date">
                      {new Date(issue.sent_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="archive-item-title">{issue.title}</span>
                    {issue.preview_text && (
                      <span className="archive-item-preview">
                        {issue.preview_text}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="archive-empty">
              No issues yet — the first one&apos;s coming soon.{" "}
              <Link href="/#newsletter">Subscribe</Link> and you won&apos;t miss
              it.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
