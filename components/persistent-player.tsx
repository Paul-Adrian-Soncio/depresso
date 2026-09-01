"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/components/use-player";
import { PlayerBars } from "@/components/player-bars";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Mounted once in the footer (components/site-footer.tsx), itself rendered
 * from app/(site)/layout.tsx, so it survives navigation between public
 * pages — the <audio> element and its AudioContext graph
 * (components/use-player.ts) live at that scope, not per-page, which is
 * what "persistent" actually requires. Deliberately not mounted in the
 * admin section, matching how the live period system is scoped (see
 * ForceDusk) — the admin section is meant to be isolated from the public
 * site's live systems, not have music bleed into it.
 */
export function PersistentPlayer() {
  const {
    audioRef,
    track,
    isPlaying,
    volume,
    currentTime,
    duration,
    frequencies,
    toggle,
    seek,
    setVolume,
    setDuration,
    onEnded,
    next,
    previous,
  } = usePlayer();

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-md border border-line bg-ground px-3 py-2.5">
      <audio
        ref={audioRef}
        src={track.src}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onEnded={onEnded}
        preload="metadata"
      />

      <div className="flex flex-none items-center gap-0.5">
        <button
          type="button"
          onClick={previous}
          aria-label="Previous track"
          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          <SkipBack size={13} fill="currentColor" />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent transition-colors duration-base hover:opacity-90"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next track"
          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          <SkipForward size={13} fill="currentColor" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <p className="truncate text-xs font-bold text-ink">{track.title}</p>
            <p className="flex-none font-mono text-[10px] text-ink-3">— {track.artist}</p>
          </div>
          <p className="flex-none font-mono text-[10px] tabular-nums text-ink-3">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        <PlayerBars
          frequencies={frequencies}
          progress={progress}
          isPlaying={isPlaying}
          onSeek={(fraction) => seek(fraction * duration)}
        />
      </div>

      <label className="sr-only" htmlFor="player-volume">
        Volume
      </label>
      <input
        id="player-volume"
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        style={{ "--fill": `${volume}%` } as React.CSSProperties}
        className="ambience-slider hidden w-14 flex-none lg:block"
      />
    </div>
  );
}
