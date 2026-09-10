"use client";

import { usePeriodContext } from "@/components/period-provider";

/**
 * The hero window scene: a room, a window onto a lit apartment building
 * (blurred, sitting back from the glass for depth), a pendant lamp, a cup
 * on the table, a plant. Rebuilt from docs/reference/homepage-*.html using
 * only the documented design tokens rather than that mockup's bespoke
 * per-period hex values — see DECISIONS.md. Re-lights automatically across
 * all four periods.
 *
 * The lamp is only lit at dusk/late — during the day there's no reason for
 * a pendant lamp over a table to be on, so its cord and shade stay present
 * as objects but the warm glow, bulb, and lit-window squares switch off.
 * This needs the *current* period as data (not just CSS reacting to
 * `[data-period]`), so unlike most presentational components this one is a
 * Client Component reading `usePeriodContext()`, the same pattern
 * `HeroCopy` already uses for period-dependent copy.
 *
 * Animated rain (looping SVG line offsets) and cup steam were both tried
 * and dropped: a dozen individual streaks re-looping on a short cycle read
 * as an obvious, juddery repeat rather than real rain, and the steam
 * competed with the lamp for attention. The lamp's own glow is left to
 * carry the scene's one bit of motion.
 */
export function HeroScene({ className }: { className?: string }) {
  const { period } = usePeriodContext();
  const lampOn = period === "dusk" || period === "late";

  return (
    <svg
      viewBox="0 0 700 460"
      className={className}
      role="img"
      aria-label="A window looking out on the street, with a pendant lamp over a table"
    >
      <defs>
        <radialGradient id="hero-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
          <stop offset="55%" stopColor="var(--accent)" stopOpacity={0.14} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </radialGradient>
        <clipPath id="hero-window-clip">
          <rect x={60} y={40} width={460} height={272} rx={4} />
        </clipPath>
        <filter id="hero-street-blur">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <style>
        {`
          @media (prefers-reduced-motion: no-preference) {
            .hero-lamp-glow { animation: hero-breathe 4.2s ease-in-out infinite; transform-origin: 596px 132px; }
          }
          @keyframes hero-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        `}
      </style>

      <rect x={0} y={0} width={700} height={460} fill="var(--surface)" />

      {/* window: sky is --ground */}
      <rect x={60} y={40} width={460} height={272} rx={4} fill="var(--ground)" />
      <g clipPath="url(#hero-window-clip)">
        {/* street, blurred and set back from the glass for depth */}
        <g filter="url(#hero-street-blur)" opacity={0.8}>
          <rect x={70} y={216} width={64} height={96} fill="var(--line-strong)" />
          <rect x={148} y={180} width={48} height={132} fill="var(--ink-3)" />
          <rect x={210} y={238} width={76} height={74} fill="var(--line-strong)" />
          <rect x={300} y={198} width={56} height={114} fill="var(--ink-3)" />
          <rect x={370} y={248} width={70} height={64} fill="var(--line-strong)" />
          <rect x={450} y={208} width={44} height={104} fill="var(--ink-3)" />
        </g>
        {/* lit windows across the street: dark (unlit look) during the day.
            `transition` set inline since the global `*` cross-fade rule
            (globals.css) covers fill/color/border-color/stroke but not
            opacity, and this opacity swap should ease with the same
            --duration-period timing as everything else on a period
            change, not cut instantly. */}
        <g
          opacity={lampOn ? 1 : 0}
          style={{ transition: "opacity var(--duration-period) var(--ease-quiet)" }}
        >
          <rect x={160} y={196} width={9} height={11} fill="var(--accent)" opacity={0.6} />
          <rect x={178} y={220} width={9} height={11} fill="var(--accent)" opacity={0.32} />
          <rect x={316} y={212} width={9} height={11} fill="var(--accent)" opacity={0.5} />
          <rect x={336} y={248} width={9} height={11} fill="var(--accent)" opacity={0.26} />
          <rect x={466} y={224} width={9} height={11} fill="var(--accent)" opacity={0.38} />
          <rect x={84} y={244} width={9} height={11} fill="var(--accent)" opacity={0.3} />
          <rect x={404} y={272} width={9} height={11} fill="var(--accent)" opacity={0.42} />
        </g>
      </g>
      <rect x={60} y={40} width={460} height={272} rx={4} fill="none" stroke="var(--line-strong)" strokeWidth={7} />
      <line x1={290} y1={40} x2={290} y2={312} stroke="var(--line-strong)" strokeWidth={5} />
      <line x1={60} y1={176} x2={520} y2={176} stroke="var(--line-strong)" strokeWidth={5} />

      {/* pendant lamp: glow and bulb opacity ease with --duration-period
          the same way the lit windows above do */}
      <circle
        className="hero-lamp-glow"
        cx={596}
        cy={132}
        r={152}
        fill="url(#hero-lamp-glow)"
        opacity={lampOn ? 1 : 0}
        style={{ transition: "opacity var(--duration-period) var(--ease-quiet)" }}
      />
      <line x1={596} y1={0} x2={596} y2={88} stroke="var(--line-strong)" strokeWidth={3} />
      <path d="M 556 124 L 596 88 L 636 124 Z" fill="var(--line-strong)" />
      <ellipse
        cx={596}
        cy={124}
        rx={40}
        ry={7.5}
        fill="var(--accent)"
        opacity={lampOn ? 0.9 : 0.25}
        style={{ transition: "opacity var(--duration-period) var(--ease-quiet)" }}
      />

      {/* table */}
      <rect x={0} y={368} width={700} height={92} fill="var(--surface-2)" />
      <rect x={0} y={368} width={700} height={4} fill="var(--line-strong)" />

      {/* cup */}
      <ellipse cx={596} cy={372} rx={56} ry={11} fill="var(--surface-2)" />
      <path d="M 566 330 L 626 330 L 620 368 Q 596 374 572 368 Z" fill="var(--ink)" />
      <path
        d="M 626 338 Q 646 342 640 358 Q 636 366 622 364"
        fill="none"
        stroke="var(--ink)"
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* plant */}
      <path d="M 40 368 L 48 320 L 86 320 L 94 368 Z" fill="var(--line-strong)" />
      <path d="M 67 320 Q 44 296 48 262" fill="none" stroke="var(--ok)" strokeWidth={4} strokeLinecap="round" />
      <path d="M 67 320 Q 88 300 90 272" fill="none" stroke="var(--ok)" strokeWidth={4} strokeLinecap="round" />
      <path d="M 67 320 Q 68 304 69 286" fill="none" stroke="var(--ok)" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={46} cy={256} rx={15} ry={9} fill="var(--ok)" transform="rotate(-32 46 256)" />
      <ellipse cx={92} cy={266} rx={15} ry={9} fill="var(--ok)" transform="rotate(28 92 266)" />
      <ellipse cx={69} cy={286} rx={14} ry={8} fill="var(--ok)" transform="rotate(-6 69 286)" />
    </svg>
  );
}
