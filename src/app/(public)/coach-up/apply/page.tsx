import type { Metadata } from "next";
import { ApplyForm } from "@/components/coach-up/ApplyForm";
import { MobileShell } from "@/components/pot/MobileShell";
import { TopBar } from "@/components/pot/TopBar";
import { Pill } from "@/components/ui/Pill";

export const metadata: Metadata = {
  title: "Apply — Coach Up | Link & Dink",
  description:
    "Apply for the Coach Up cohort. Three spots, hand-picked by Sam. Takes ~5 minutes; we reply within 5 days.",
};

export default function CoachUpApplyPage() {
  return (
    <MobileShell>
      <TopBar brand="link-and-dink" icon="☰" />
      <main className="flex flex-1 flex-col px-[18px] pb-12">
        <section className="pt-6">
          <Pill>
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Coach Up application
          </Pill>
          <h1 className="mt-3.5 flex flex-col text-[30px] font-black leading-[0.95] tracking-[-0.03em]">
            <span className="text-text">Play up.</span>
            <span className="text-lime">Coach up.</span>
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-text-muted">
            <strong className="text-text">Earn while you learn.</strong> Three spots, hand-picked by
            Sam. Takes ~5 minutes. We reply within 5 days.
          </p>
        </section>
        <section className="mt-6">
          <ApplyForm />
        </section>
      </main>
    </MobileShell>
  );
}
