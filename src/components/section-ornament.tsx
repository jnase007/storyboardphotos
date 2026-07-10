export function SectionOrnament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament-line mb-3 ${className}`} aria-hidden="true">
      <span className="text-royal-gold/70 text-[10px] tracking-[0.35em]">✦</span>
    </div>
  );
}
