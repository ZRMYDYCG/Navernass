export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-paper-texture opacity-60" />
      <div className="absolute -top-[20%] left-[20%] w-[60%] h-[60%] bg-yellow-100/10 dark:bg-yellow-900/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-8 bottom-0 w-px border-l border-dashed border-foreground/5 hidden lg:block" />
      <div className="absolute top-0 right-8 bottom-0 w-px border-l border-dashed border-foreground/5 hidden lg:block" />
    </div>
  )
}
