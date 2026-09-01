"use client";

/**
 * The bar row doubles as both the visualizer (heights driven by real
 * frequency data while playing) and the scrubber (click/drag anywhere in
 * the row to seek) — the same combined pattern the mockup and the Framer
 * reference component both use, rather than a separate waveform plus a
 * separate progress line.
 */
export function PlayerBars({
  frequencies,
  progress,
  isPlaying,
  onSeek,
}: {
  frequencies: number[];
  /** 0–1 */
  progress: number;
  isPlaying: boolean;
  onSeek: (fraction: number) => void;
}) {
  function handlePointer(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(fraction);
  }

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onPointerDown={(event) => {
        handlePointer(event);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) handlePointer(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") onSeek(Math.min(1, progress + 0.02));
        if (event.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.02));
      }}
      className="flex h-5 w-full flex-none cursor-pointer items-center justify-between outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      {frequencies.map((value, i) => {
        const barFraction = i / frequencies.length;
        const isPast = barFraction <= progress;
        // Idle (paused) state falls back to a calm, static shape instead of
        // flatlining at zero — reads as "ready", not "broken". Rounded so
        // the rendered value can't drift by float-precision fractions
        // between the server and client render of this "use client" tree,
        // which was tripping React's hydration-mismatch check.
        const height = isPlaying ? Math.max(15, value) : Math.round(20 + Math.sin(i * 0.9) * 8);

        return (
          <span
            key={i}
            style={{ height: `${height}%` }}
            className={`w-[2px] rounded-full transition-[height] duration-100 ${
              isPast ? "bg-accent" : "bg-line-strong"
            }`}
          />
        );
      })}
    </div>
  );
}
