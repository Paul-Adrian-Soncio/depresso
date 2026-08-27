/**
 * Simplified favicon-scale version of the mascot: rounded body, wavy hem,
 * dash eyes and a simple smile — no hat or cup. The full Mascot's fine
 * detail blurs into illegibility below ~48px, so this trades detail for a
 * bolder stroke that still reads clearly at 16px. Same `--ink` token as
 * Mascot, so it re-lights with the rest of the site.
 */
export function MascotMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="var(--ink)"
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Depresso mascot"
    >
      <path d="M 50 100 A 50 50 0 0 1 150 100 L 150 140 A 10 10 0 0 1 140 150 A 10 10 0 0 1 130 140 A 10 10 0 0 1 120 150 A 10 10 0 0 1 110 140 A 10 10 0 0 1 100 150 A 10 10 0 0 1 90 140 A 10 10 0 0 1 80 150 A 10 10 0 0 1 70 140 A 10 10 0 0 1 60 150 A 10 10 0 0 1 50 140 Z" />
      <path d="M 76 96 A 7 7 0 0 1 90 96" strokeWidth={8} />
      <path d="M 110 96 A 7 7 0 0 1 124 96" strokeWidth={8} />
      <path d="M 88 114 A 12 7 0 0 0 112 114" strokeWidth={7} />
    </svg>
  );
}
