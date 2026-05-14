import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import UnsubscribeForm from "@/components/UnsubscribeForm";

export const metadata = {
  title: "Unsubscribe — Link & Dink",
  robots: { index: false },
};

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { token } = await params;
  const { i } = await searchParams;

  return (
    <>
      <Nav />
      <main className="notice-page">
        <div className="wrap">
          <div className="notice-card">
            <div className="eyebrow">Link &amp; Dink Weekly</div>
            <h1>Unsubscribe</h1>
            <UnsubscribeForm token={token} issueId={i} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
