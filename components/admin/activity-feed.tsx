"use client";

export interface FeedEntry {
  id: string;
  text: string;
  tone: "placed" | "cancelled" | "advanced";
}

const TONE_CLASS: Record<FeedEntry["tone"], string> = {
  placed: "text-ink",
  cancelled: "text-accent-text",
  advanced: "text-ink-2",
};

/**
 * A small fixed corner ticker — the glanceable half of simulation mode.
 * OrderQueue proves the data is real by animating in the table; this is for
 * someone who doesn't want to read a table to see the same thing happening.
 * Newest entry on top, capped by however many the caller passes in.
 */
export function ActivityFeed({ entries }: { entries: FeedEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-40 flex w-72 flex-col gap-1.5"
    >
      {entries.map((entry) => (
        <p
          key={entry.id}
          className={`animate-feed-in rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs ${TONE_CLASS[entry.tone]}`}
        >
          {entry.text}
        </p>
      ))}
    </div>
  );
}
