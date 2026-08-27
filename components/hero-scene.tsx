/**
 * The hero window scene: a room, a rain-streaked window onto a lit
 * apartment building, a pendant lamp, a cup on the table, a plant. Rebuilt
 * from docs/reference/homepage-*.html using only the documented design
 * tokens (--ground/--surface/--ink/--accent/etc.) rather than that
 * mockup's bespoke per-period hex values — see DECISIONS.md. Re-lights
 * automatically across all four periods.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 700 460" className={className} role="img" aria-label="A rainy window with a lit pendant lamp over a table">
      <defs>
        <radialGradient id="hero-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.42} />
          <stop offset="60%" stopColor="var(--accent)" stopOpacity={0.1} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </radialGradient>
        <clipPath id="hero-window-clip">
          <rect x={92} y={52} width={376} height={250} rx={3} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={700} height={460} fill="var(--surface)" />

      {/* window: sky is --ground */}
      <rect x={92} y={52} width={376} height={250} rx={3} fill="var(--ground)" />
      <g clipPath="url(#hero-window-clip)">
        {/* building windows: unlit vs lit, drawn a shade off the sky for separation */}
        <rect x={100} y={212} width={58} height={90} fill="var(--line-strong)" />
        <rect x={168} y={178} width={44} height={124} fill="var(--ink-3)" />
        <rect x={222} y={232} width={70} height={70} fill="var(--line-strong)" />
        <rect x={302} y={196} width={52} height={106} fill="var(--ink-3)" />
        <rect x={364} y={242} width={66} height={60} fill="var(--line-strong)" />
        <rect x={436} y={206} width={40} height={96} fill="var(--ink-3)" />
        {/* lit window squares */}
        <rect x={176} y={192} width={8} height={10} fill="var(--accent)" opacity={0.55} />
        <rect x={192} y={214} width={8} height={10} fill="var(--accent)" opacity={0.3} />
        <rect x={314} y={210} width={8} height={10} fill="var(--accent)" opacity={0.45} />
        <rect x={330} y={242} width={8} height={10} fill="var(--accent)" opacity={0.25} />
        <rect x={446} y={220} width={8} height={10} fill="var(--accent)" opacity={0.35} />
        <rect x={112} y={238} width={8} height={10} fill="var(--accent)" opacity={0.28} />
        {/* rain */}
        <g stroke="var(--ink-3)" strokeWidth={1.6} strokeLinecap="round" opacity={0.55}>
          <line x1={120} y1={60} x2={106} y2={98} />
          <line x1={176} y1={48} x2={162} y2={86} />
          <line x1={238} y1={72} x2={224} y2={110} />
          <line x1={292} y1={52} x2={278} y2={90} />
          <line x1={348} y1={80} x2={334} y2={118} />
          <line x1={402} y1={58} x2={388} y2={96} />
          <line x1={446} y1={92} x2={432} y2={130} />
          <line x1={150} y1={140} x2={136} y2={178} />
          <line x1={268} y1={150} x2={254} y2={188} />
          <line x1={380} y1={160} x2={366} y2={198} />
          <line x1={212} y1={212} x2={198} y2={250} />
          <line x1={424} y1={196} x2={410} y2={234} />
        </g>
      </g>
      <rect x={92} y={52} width={376} height={250} rx={3} fill="none" stroke="var(--line-strong)" strokeWidth={7} />
      <line x1={280} y1={52} x2={280} y2={302} stroke="var(--line-strong)" strokeWidth={5} />
      <line x1={92} y1={177} x2={468} y2={177} stroke="var(--line-strong)" strokeWidth={5} />

      {/* pendant lamp */}
      <circle cx={566} cy={150} r={130} fill="url(#hero-lamp-glow)" />
      <line x1={566} y1={0} x2={566} y2={104} stroke="var(--line-strong)" strokeWidth={3} />
      <path d="M 530 138 L 566 104 L 602 138 Z" fill="var(--line-strong)" />
      <ellipse cx={566} cy={138} rx={36} ry={7} fill="var(--accent)" opacity={0.85} />

      {/* table */}
      <rect x={0} y={368} width={700} height={92} fill="var(--surface-2)" />
      <rect x={0} y={368} width={700} height={4} fill="var(--line-strong)" />

      {/* cup */}
      <ellipse cx={566} cy={370} rx={54} ry={11} fill="var(--surface-2)" />
      <path d="M 538 330 L 594 330 L 588 366 Q 566 372 544 366 Z" fill="var(--ink)" />
      <path
        d="M 594 338 Q 612 342 606 356 Q 602 364 590 362"
        fill="none"
        stroke="var(--ink)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M 552 316 Q 546 302 556 292 Q 564 282 558 270"
        fill="none"
        stroke="var(--ink-3)"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M 574 318 Q 580 304 570 294 Q 562 284 570 274"
        fill="none"
        stroke="var(--ink-3)"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.35}
      />

      {/* plant */}
      <path d="M 70 368 L 78 320 L 116 320 L 124 368 Z" fill="var(--line-strong)" />
      <path d="M 97 320 Q 74 296 78 262" fill="none" stroke="var(--ok)" strokeWidth={4} strokeLinecap="round" />
      <path d="M 97 320 Q 118 300 120 272" fill="none" stroke="var(--ok)" strokeWidth={4} strokeLinecap="round" />
      <path d="M 97 320 Q 98 304 99 286" fill="none" stroke="var(--ok)" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={76} cy={256} rx={15} ry={9} fill="var(--ok)" transform="rotate(-32 76 256)" />
      <ellipse cx={122} cy={266} rx={15} ry={9} fill="var(--ok)" transform="rotate(28 122 266)" />
      <ellipse cx={99} cy={286} rx={14} ry={8} fill="var(--ok)" transform="rotate(-6 99 286)" />
    </svg>
  );
}
