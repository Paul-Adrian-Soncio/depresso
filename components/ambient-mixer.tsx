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
      <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
        {tracks.map((track) => {
          const isMuted = muted[track.id];
          const isUnavailable = loadErrors[track.id];

          return (
            <div key={track.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em]">
                <label htmlFor={`ambience-${track.id}`} className="text-ink-2">
                  {track.label}
                </label>
                <span className="tabular-nums text-ink-3">
                  {isUnavailable ? "unavailable" : isMuted ? "muted" : mix[track.id]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-pressed={isMuted}
                  aria-label={isMuted ? `Unmute ${track.label}` : `Mute ${track.label}`}
                  disabled={isUnavailable}
                  onClick={() => toggleMute(track.id)}
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-sm text-ink-3 transition-colors duration-base hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  id={`ambience-${track.id}`}
                  type="range"
                  min={0}
                  max={100}
                  value={mix[track.id]}
                  disabled={isUnavailable}
                  onChange={(event) => setLevel(track.id, Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-accent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
