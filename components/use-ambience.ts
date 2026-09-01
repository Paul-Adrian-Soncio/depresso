"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AMBIENCE_TRACKS,
  clampLevel,
  defaultMix,
  defaultMuted,
  type AmbienceMix,
  type AmbienceMuted,
  type AmbienceTrackId,
} from "@/lib/domain/ambience";

const STORAGE_KEY = "depresso-ambience-mix";

function loadStoredMix(): AmbienceMix {
  if (typeof window === "undefined") return defaultMix();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMix();
    const parsed = JSON.parse(raw);
    const mix = defaultMix();
    for (const track of AMBIENCE_TRACKS) {
      if (typeof parsed[track.id] === "number") {
        mix[track.id] = clampLevel(parsed[track.id]);
      }
    }
    return mix;
  } catch {
    return defaultMix();
  }
}

/**
 * One AudioContext, one looping buffer source + gain node per track. Browsers
 * block audio until a user gesture, so nodes are created lazily on the first
 * level change rather than on mount — `started` reports whether that has
 * happened yet, for UI that wants to hint "click a slider to start".
 */
export function useAmbience() {
  // Server and first client paint must match, so state starts at the
  // deterministic defaults (never localStorage) and is corrected to the
  // stored mix in an effect once mounted. Reading localStorage in the
  // initializer caused a hydration mismatch whenever a saved mix differed
  // from the defaults.
  const [mix, setMix] = useState<AmbienceMix>(defaultMix);
  const [muted, setMuted] = useState<AmbienceMuted>(defaultMuted);
  const [started, setStarted] = useState(false);
  const [loadErrors, setLoadErrors] = useState<Partial<Record<AmbienceTrackId, boolean>>>({});

  const contextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<Partial<Record<AmbienceTrackId, GainNode>>>({});
  const sourceNodesRef = useRef<Partial<Record<AmbienceTrackId, AudioBufferSourceNode>>>({});
  const buffersRef = useRef<Partial<Record<AmbienceTrackId, AudioBuffer>>>({});
  const mixRef = useRef<AmbienceMix>(mix);
  const mutedRef = useRef<AmbienceMuted>(muted);
  const startPromiseRef = useRef<Promise<AudioContext> | null>(null);
  // The mix-persistence effect below must not write back to localStorage
  // until after the hydration-correction effect has applied the stored
  // value — otherwise the mount render's default state overwrites it.
  const skipMixWriteRef = useRef(true);

  useEffect(() => {
    const storedMix = loadStoredMix();
    mixRef.current = storedMix;
    // Correcting SSR-safe defaults to the real localStorage value after
    // mount, not deriving state from props — the one-time setState here is
    // the standard fix for this class of hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMix(storedMix);
  }, []);

  useEffect(() => {
    mixRef.current = mix;
    if (skipMixWriteRef.current) {
      skipMixWriteRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mix));
  }, [mix]);

  useEffect(() => {
    return () => {
      contextRef.current?.close().catch(() => {});
    };
  }, []);

  const ensureStarted = useCallback(() => {
    if (startPromiseRef.current) return startPromiseRef.current;

    const promise = (async () => {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      const context = new AudioContextCtor();
      contextRef.current = context;

      await Promise.all(
        AMBIENCE_TRACKS.map(async (track) => {
          try {
            const response = await fetch(track.src);
            if (!response.ok) throw new Error(`${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await context.decodeAudioData(arrayBuffer);
            buffersRef.current[track.id] = buffer;

            const gain = context.createGain();
            gain.gain.value = mutedRef.current[track.id]
              ? 0
              : mixRef.current[track.id] / 100;
            gain.connect(context.destination);
            gainNodesRef.current[track.id] = gain;

            const source = context.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gain);
            source.start();
            sourceNodesRef.current[track.id] = source;
          } catch {
            setLoadErrors((prev) => ({ ...prev, [track.id]: true }));
          }
        }),
      );

      setStarted(true);
      return context;
    })();

    startPromiseRef.current = promise;
    return promise;
  }, []);

  const setLevel = useCallback(
    (id: AmbienceTrackId, level: number) => {
      const clamped = clampLevel(level);
      mixRef.current = { ...mixRef.current, [id]: clamped };
      setMix(mixRef.current);

      // Dragging above 0 implies wanting to hear the track — unmute it,
      // same as any conventional volume control, rather than leaving the
      // level updated but silent (the slider would feel unresponsive while
      // muted, since moving it wouldn't audibly do anything). Dragging all
      // the way to 0 is treated as muting: a slider at the far left with an
      // "unmuted" icon would be a level with no way to tell it's silent.
      const shouldBeMuted = clamped === 0;
      if (mutedRef.current[id] !== shouldBeMuted) {
        mutedRef.current = { ...mutedRef.current, [id]: shouldBeMuted };
        setMuted(mutedRef.current);
      }

      const context = contextRef.current;
      const gain = gainNodesRef.current[id];
      if (context && gain) {
        gain.gain.setTargetAtTime(shouldBeMuted ? 0 : clamped / 100, context.currentTime, 0.05);
      } else {
        ensureStarted();
      }
    },
    [ensureStarted],
  );

  const toggleMute = useCallback(
    (id: AmbienceTrackId) => {
      const next = !mutedRef.current[id];
      mutedRef.current = { ...mutedRef.current, [id]: next };
      setMuted(mutedRef.current);

      // Unmuting a track whose level is 0 would otherwise show "unmuted"
      // while staying silent (0 volume either way) — bump it to the
      // quietest audible level instead, so the mute button always produces
      // sound rather than needing the slider dragged up separately.
      if (!next && mixRef.current[id] === 0) {
        mixRef.current = { ...mixRef.current, [id]: 1 };
        setMix(mixRef.current);
      }

      const context = contextRef.current;
      const gain = gainNodesRef.current[id];
      if (context && gain) {
        const target = next ? 0 : mixRef.current[id] / 100;
        gain.gain.setTargetAtTime(target, context.currentTime, 0.05);
      } else {
        ensureStarted();
      }
    },
    [ensureStarted],
  );

  return { tracks: AMBIENCE_TRACKS, mix, muted, setLevel, toggleMute, started, loadErrors };
}
