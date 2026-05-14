import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Email confirmed — Link & Dink",
  robots: { index: false },
};

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let heading = "Something went wrong";
  let body =
    "We couldn't confirm your email. Try the link again, or sign up once more.";
  if (status === "ok") {
    heading = "You're confirmed.";
    body =
      "First issue hits your inbox Thursday at 7am. See you on the court.";
  } else if (status === "invalid") {
    heading = "Link expired";
    body =
      "That confirmation link isn't valid anymore. Sign up again and we'll send a fresh one.";
  }

  return (
    <>
      <Nav />
      <main className="notice-page">
        <div className="wrap">
          <div className="notice-card">
            <div className="eyebrow">Link &amp; Dink Weekly</div>
            <h1>{heading}</h1>
            <p className="notice-body">{body}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
