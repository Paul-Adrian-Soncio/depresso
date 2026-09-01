export const AMBIENCE_TRACKS = [
  { id: "rain", label: "Rain", src: "/audio/rain.mp3", defaultLevel: 70 },
  { id: "chatter", label: "Café chatter", src: "/audio/chatter.mp3", defaultLevel: 35 },
  { id: "vinyl", label: "Vinyl crackle", src: "/audio/vinyl.mp3", defaultLevel: 55 },
  { id: "espresso", label: "Espresso machine", src: "/audio/espresso.mp3", defaultLevel: 20 },
] as const;

export type AmbienceTrackId = (typeof AMBIENCE_TRACKS)[number]["id"];

export type AmbienceMix = Record<AmbienceTrackId, number>;
export type AmbienceMuted = Record<AmbienceTrackId, boolean>;

export function defaultMix(): AmbienceMix {
  return Object.fromEntries(
    AMBIENCE_TRACKS.map((track) => [track.id, track.defaultLevel]),
  ) as AmbienceMix;
}

export function defaultMuted(): AmbienceMuted {
  return Object.fromEntries(
    AMBIENCE_TRACKS.map((track) => [track.id, true]),
  ) as AmbienceMuted;
}

export function clampLevel(level: number): number {
  return Math.min(100, Math.max(0, Math.round(level)));
}
