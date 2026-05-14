import { Pill } from "@/components/ui/Pill";

export function HeroSection() {
  return (
    <section className="pb-3.5 pt-1.5">
      <Pill>
        <span aria-hidden="true">●</span> Pot Night · weekly in the DMV
      </Pill>
      <h1 className="my-3 text-[32px] font-black leading-none tracking-[-0.035em]">
        <span className="text-lime">Get paid</span>
        <br />
        to play.
      </h1>
      <p className="text-[14px] leading-relaxed text-text-muted">
        Pickleball&apos;s smallest bracket. Real cash, paid same night. Winner takes the pot.
      </p>
    </section>
  );
}
