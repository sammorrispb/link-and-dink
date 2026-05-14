export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-2.5 mt-[22px]">
      <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-lime">
        {eyebrow}
      </div>
      <h2 className="text-[18px] font-black leading-[1.15] tracking-[-0.025em] text-text">
        {title}
      </h2>
    </div>
  );
}
