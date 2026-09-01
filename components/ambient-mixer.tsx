"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAmbience } from "@/components/use-ambience";

export function AmbientMixer() {
  const { tracks, mix, muted, setLevel, toggleMute, started, loadErrors } =
    useAmbience();

  return (
    <div className="flex flex-col gap-5">
      {!started && (
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Move a slider to start the room
        </p>
      )}
      <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
        {tracks.map((track) => {
          const isMuted = muted[track.id];
          const isUnavailable = loadErrors[track.id];
          const level = mix[track.id];

          return (
            <div key={track.id} className="flex items-center gap-3">
              <label
                htmlFor={`ambience-${track.id}`}
                className="flex-none font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2"
              >
                {track.label}
              </label>
              <button
                type="button"
                aria-pressed={isMuted}
                aria-label={isMuted ? `Unmute ${track.label}` : `Mute ${track.label}`}
                disabled={isUnavailable}
                onClick={() => toggleMute(track.id)}
                className="flex h-6 w-6 flex-none items-center justify-center rounded-sm text-ink-3 transition-colors duration-base hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                id={`ambience-${track.id}`}
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : level}
                disabled={isUnavailable}
                onChange={(event) => setLevel(track.id, Number(event.target.value))}
                style={{ "--fill": `${isMuted ? 0 : level}%` } as React.CSSProperties}
                className="ambience-slider min-w-0 flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="w-7 flex-none text-right font-mono text-[11px] tabular-nums text-ink-3">
                {isUnavailable ? "—" : isMuted ? "0" : level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
