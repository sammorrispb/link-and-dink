import { SectionHeader } from "@/components/ui/SectionHeader";

const STEPS = [
  {
    title: "Round robin",
    desc: "Two pods of 4. You partner with everyone in your pod across 3 games. Game to 11, win by 2.",
  },
  {
    title: "Top 2 advance",
    desc: "Best two records from each pod move on. Tiebreaks by point differential, then head-to-head.",
  },
  {
    title: "Draft & bracket",
    desc: "Top finishers become captains and draft their partners from the rest of the field. Two semis, then one final to crown the Pot Champion pair.",
  },
  {
    title: "Pot paid · same night",
    desc: "Winner enters score, loser confirms. Organizer Venmos the pot within 15 minutes of the final.",
  },
];

export function HowItWorks() {
  return (
    <section>
      <SectionHeader eyebrow="How it works" title="From sign-up to pot, in 90 minutes." />
      <div className="border-l-2 border-[rgba(181,214,84,0.20)]">
        {STEPS.map((step, i) => (
          <div key={step.title} className="grid grid-cols-[36px_1fr] gap-3 py-2 pb-3 pl-3">
            <div className="-ml-[25px] flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] border-lime bg-surface-2 text-[13px] font-black text-lime">
              {i + 1}
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-text">{step.title}</div>
              <div className="mt-0.5 text-[12px] leading-[1.45] text-text-muted">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
