"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PLAYLIST } from "@/lib/domain/playlist";

const VOLUME_STORAGE_KEY = "depresso-player-volume";
const TRACK_STORAGE_KEY = "depresso-player-track";
const DEFAULT_VOLUME = 70;
const FREQUENCY_BAR_COUNT = 24;

function loadStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function loadStoredTrackIndex(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(TRACK_STORAGE_KEY);
    const index = raw ? PLAYLIST.findIndex((t) => t.id === raw) : -1;
    return index >= 0 ? index : 0;
  } catch {
    return 0;
  }
}

/**
 * The persistent player's audio engine. Manual AudioContext + a single
 * <audio> element as the source (rather than fetch-and-decode like
 * useAmbience) because the player needs real seek/duration/currentTime —
 * an HTMLAudioElement gives us that for free where an AudioBufferSourceNode
 * does not. The element feeds a MediaElementAudioSourceNode into an
 * AnalyserNode (for the visualizer) and a GainNode (for volume), same
 * "lazily create the graph on first user gesture" shape as useAmbience,
 * since browsers block audio until one occurs either way.
 */
export function usePlayer() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [frequencies, setFrequencies] = useState<number[]>(() => Array(FREQUENCY_BAR_COUNT).fill(0));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const skipVolumeWriteRef = useRef(true);

  // Server and first client paint must match (see the same pattern and
  // reasoning in useAmbience) — start at deterministic defaults, correct to
  // the stored value after mount.
  useEffect(() => {
    // Correcting SSR-safe defaults to the real localStorage value after
    // mount — the standard fix for this class of hydration mismatch, same
    // as useAmbience's identical pattern.
    setVolumeState(loadStoredVolume());
    setTrackIndex(loadStoredTrackIndex());
  }, []);

  useEffect(() => {
    if (skipVolumeWriteRef.current) {
      skipVolumeWriteRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TRACK_STORAGE_KEY, PLAYLIST[trackIndex].id);
  }, [trackIndex]);

  const ensureGraph = useCallback((audio: HTMLAudioElement) => {
    if (contextRef.current) return contextRef.current;

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextCtor();
    contextRef.current = context;

    const source = context.createMediaElementSource(audio);
    sourceRef.current = source;

    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    analyserRef.current = analyser;

    const gain = context.createGain();
    gain.gain.value = volume / 100;
    gainRef.current = gain;

    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(context.destination);

    return context;
  }, [volume]);

  // A named function declaration (not a useCallback) so the recursive
  // requestAnimationFrame call can reference `tick` via normal hoisting —
  // it reads everything through refs rather than closing over render-time
  // state/props, so there's no stale-closure risk from that.
  const tick = useCallback(function tick() {
    const analyser = analyserRef.current;
    const audio = audioRef.current;
    if (analyser && audio) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const bars = Array.from({ length: FREQUENCY_BAR_COUNT }, (_, i) => {
        const value = data[i % data.length] ?? 0;
        return Math.round((value / 255) * 100);
      });
      setFrequencies(bars);
      setCurrentTime(audio.currentTime);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const context = ensureGraph(audio);
    if (context.state === "suspended") await context.resume();

    await audio.play();
    setIsPlaying(true);
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [ensureGraph, tick]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, time));
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((level: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(level)));
    setVolumeState(clamped);
    if (gainRef.current && contextRef.current) {
      gainRef.current.gain.setTargetAtTime(clamped / 100, contextRef.current.currentTime, 0.05);
    }
  }, []);

  const skipTo = useCallback(
    (index: number) => {
      const wasPlaying = isPlaying;
      setTrackIndex(((index % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length);
      setCurrentTime(0);
      // The track effect below resets the <audio> src; re-trigger play once
      // it's ready if we were mid-playback, rather than leaving it paused.
      if (wasPlaying) {
        requestAnimationFrame(() => play());
      }
    },
    [isPlaying, play],
  );

  const next = useCallback(() => skipTo(trackIndex + 1), [skipTo, trackIndex]);
  const previous = useCallback(() => skipTo(trackIndex - 1), [skipTo, trackIndex]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      contextRef.current?.close().catch(() => {});
    };
  }, []);

  // Backstop for duration: the <audio> element starts fetching as soon as
  // it mounts with a `src`, and for a small local file the browser can fire
  // `loadedmetadata` before React finishes attaching that event handler —
  // the event is missed entirely, and `duration` state stays stuck at 0
  // forever (breaking the seek bar, since seek() computes a target time as
  // fraction * duration). Reading audio.duration directly off the DOM node
  // sidesteps that race since it isn't waiting on an event that may have
  // already fired.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.duration && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  }, [trackIndex]);

  const track = PLAYLIST[trackIndex];

  return {
    audioRef,
    track,
    trackIndex,
    playlist: PLAYLIST,
    isPlaying,
    volume,
    currentTime,
    duration,
    frequencies,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    next,
    previous,
    setDuration,
    onEnded: next,
  };
}
