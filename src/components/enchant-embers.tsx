/** Soft rising gold embers — CSS-only, decorative. */
export function EnchantEmbers({ className = "" }: { className?: string }) {
  return (
    <div className={`enchant-embers ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
