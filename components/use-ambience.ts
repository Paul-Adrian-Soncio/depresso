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
const MUTED_STORAGE_KEY = "depresso-ambience-muted";

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

function loadStoredMuted(): AmbienceMuted {
  if (typeof window === "undefined") return defaultMuted();
  try {
    const raw = window.localStorage.getItem(MUTED_STORAGE_KEY);
    if (!raw) return defaultMuted();
    const parsed = JSON.parse(raw);
    const muted = defaultMuted();
    for (const track of AMBIENCE_TRACKS) {
      if (typeof parsed[track.id] === "boolean") {
        muted[track.id] = parsed[track.id];
      }
    }
    return muted;
  } catch {
    return defaultMuted();
  }
}

/**
 * One AudioContext, one looping buffer source + gain node per track. Browsers
 * block audio until a user gesture, so nodes are created lazily on the first
 * level change rather than on mount — `started` reports whether that has
 * happened yet, for UI that wants to hint "click a slider to start".
 */
export function useAmbience() {
  const [mix, setMix] = useState<AmbienceMix>(loadStoredMix);
  const [muted, setMuted] = useState<AmbienceMuted>(loadStoredMuted);
  const [started, setStarted] = useState(false);
  const [loadErrors, setLoadErrors] = useState<Partial<Record<AmbienceTrackId, boolean>>>({});

  const contextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<Partial<Record<AmbienceTrackId, GainNode>>>({});
  const sourceNodesRef = useRef<Partial<Record<AmbienceTrackId, AudioBufferSourceNode>>>({});
  const buffersRef = useRef<Partial<Record<AmbienceTrackId, AudioBuffer>>>({});
  const mixRef = useRef<AmbienceMix>(mix);
  const mutedRef = useRef<AmbienceMuted>(muted);
  const startPromiseRef = useRef<Promise<AudioContext> | null>(null);

  useEffect(() => {
    mixRef.current = mix;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mix));
  }, [mix]);

  useEffect(() => {
    mutedRef.current = muted;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MUTED_STORAGE_KEY, JSON.stringify(muted));
  }, [muted]);

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

      const context = contextRef.current;
      const gain = gainNodesRef.current[id];
      if (context && gain) {
        if (!mutedRef.current[id]) {
          gain.gain.setTargetAtTime(clamped / 100, context.currentTime, 0.05);
        }
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
