import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getServiceClient } from "@/lib/supabase-admin";
import { renderArchive } from "@/lib/email/render";

export const dynamic = "force-dynamic";

type IssueRow = {
  title: string;
  subject: string;
  slug: string;
  preview_text: string | null;
  body_markdown: string;
  sent_at: string;
};

async function getIssue(slug: string): Promise<IssueRow | null> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("issues")
    .select("title, subject, slug, preview_text, body_markdown, sent_at")
    .eq("slug", slug)
    .eq("status", "sent")
    .maybeSingle();
  return (data as IssueRow) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) {
    return { title: "Issue not found — Link & Dink" };
  }
  const description =
    issue.preview_text ?? "An issue of Link & Dink Weekly.";
  return {
    title: `${issue.title} — Link & Dink Weekly`,
    description,
    openGraph: {
      title: issue.title,
      description,
      type: "article",
    },
  };
}

export default async function WeeklyIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) {
    notFound();
  }

  // Bare, sanitized content — no tracking pixel, no per-recipient links.
  const contentHtml = renderArchive(issue);

  return (
    <>
      <Nav />
      <main className="archive-page">
        <div className="wrap">
          <Link href="/weekly" className="archive-back">
            ← All issues
          </Link>
          <article className="archive-article">
            <div className="eyebrow">Link &amp; Dink Weekly</div>
            <h1>{issue.title}</h1>
            <p className="archive-meta">
              {new Date(issue.sent_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div
              className="archive-content"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
