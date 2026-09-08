"use client";

import { Clock } from "lucide-react";

/**
 * A modal rather than the quieter inline-text/toast options, deliberately —
 * "you're rate-limited" is exactly the kind of message that's easy to miss
 * as a small line of text under a form, and getting it across clearly
 * matters more here than staying unobtrusive.
 */
export function RateLimitDialog({
  retryAfterSeconds,
  onClose,
}: {
  retryAfterSeconds: number;
  onClose: () => void;
}) {
  const mins = Math.ceil(retryAfterSeconds / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-md border border-line bg-ground p-6 text-center shadow-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-accent-text">
          <Clock size={20} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-ink">One note at a time</h2>
          <p className="font-body text-sm text-ink-2">
            You can pin again in about {mins} minute{mins === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md bg-accent px-4 py-2.5 font-display text-sm font-bold text-on-accent transition-colors duration-base hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
