import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ApplyForm from "@/components/coach-up/ApplyForm";

export const metadata: Metadata = {
  title: "Apply — Coach Up | Link & Dink",
  description:
    "Apply for the Coach Up cohort. Three spots, hand-picked by Sam. Application takes ~5 minutes; we reply within 5 days.",
};

export default function CoachUpApplyPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="apply-section">
          <div className="wrap">
            <div className="apply-head">
              <span className="eyebrow">
                <span className="dot" /> Coach Up application
              </span>
              <h1 className="masthead-stack">
                <span className="line-1">Play up.</span>
                <span className="line-2">Coach up.</span>
              </h1>
              <p className="apply-lede">
                <strong>Earn while you learn.</strong> Three spots, hand-picked
                by Sam. Application takes ~5 minutes. We reply within 5 days.
              </p>
            </div>
            <ApplyForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
