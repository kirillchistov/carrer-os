const WORDS = ["ДОКАЗАТЬ", "FIT", "ФАКТЫ", "ДОКАЗАТЬ", "FIT", "ФАКТЫ"]

export function WordField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden
    >
      <div className="absolute -left-8 top-8 flex w-[140%] -rotate-12 flex-wrap gap-x-10 gap-y-6 font-sans text-5xl font-black tracking-tight text-primary/[0.07] sm:text-7xl md:text-8xl">
        {WORDS.map((word, i) => (
          <span key={`${word}-${i}`}>{word}</span>
        ))}
      </div>
      <div className="absolute -right-10 bottom-0 flex w-[140%] rotate-6 flex-wrap justify-end gap-x-10 gap-y-6 font-sans text-5xl font-black tracking-tight text-primary/[0.05] sm:text-7xl">
        {WORDS.map((word, i) => (
          <span key={`b-${word}-${i}`}>{word}</span>
        ))}
      </div>
      <div className="absolute right-[12%] top-[18%] size-40 rounded-full border border-primary/20 sm:size-56" />
      <div className="absolute right-[16%] top-[22%] size-28 rounded-full bg-primary/8 sm:size-36" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
    </div>
  )
}
