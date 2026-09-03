"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { postNote } from "@/app/(site)/corkboard/actions";

const MAX_LENGTH = 280;

/**
 * Posting is genuinely rate-limited server-side (lib/db/corkboard.ts), not
 * just here — this form's own submit-disabled-while-pending is a courtesy,
 * not the actual guard. A "rate-limited" response shows the real
 * server-computed wait rather than a client-guessed cooldown.
 */
export function CorkboardForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  // router.refresh() re-renders the server tree this form lives inside,
  // which can unmount this component instance before the state updates
  // below get a chance to run — clearing the message field only matters if
  // there's still a component here to see it cleared.
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function submit() {
    if (message.trim().length === 0) return;
    setError(null);

    startTransition(async () => {
      const result = await postNote(name, message);
      if (!isMountedRef.current) return;

      if (result.status === "posted") {
        setMessage("");
        router.refresh();
        return;
      }

      if (result.status === "rate-limited") {
        const mins = Math.ceil(result.retryAfterSeconds / 60);
        setError(`One note at a time — try again in about ${mins} minute${mins === 1 ? "" : "s"}.`);
        return;
      }

      setError(result.reason);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Name (optional)
        </span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Anonymous"
          disabled={isPending}
          className="rounded-sm border border-line-strong bg-ground px-3 py-2 font-mono text-sm text-ink outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Leave a note
        </span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
          rows={3}
          placeholder="Pin something to the board…"
          disabled={isPending}
          className="resize-none rounded-sm border border-line-strong bg-ground px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="self-end font-mono text-[10px] tabular-nums text-ink-3">
          {message.length}/{MAX_LENGTH}
        </span>
      </label>

      {error && <p className="font-mono text-xs text-accent-text">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={message.trim().length === 0 || isPending}
        className="flex items-center justify-center rounded-md bg-accent px-4 py-2.5 font-display text-sm font-bold text-on-accent transition-colors duration-base hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Pinning…" : "Pin it"}
      </button>
    </div>
  );
}
