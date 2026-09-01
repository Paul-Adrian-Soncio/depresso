/**
 * The persistent player's playlist. Placeholder tracks for now — swap `src`
 * (and `title`/`artist`) for real, properly licensed lofi tracks once
 * sourced; nothing else in the player needs to change. See
 * docs/DECISIONS.md for the ambient mixer's audio sourcing note — same bar
 * applies here (CC0 or properly licensed).
 */
export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export const PLAYLIST: PlaylistTrack[] = [
  { id: "placeholder-1", title: "Tape Deck Sunrise", artist: "bsnno", src: "/audio/lofi/placeholder-1.wav" },
  { id: "placeholder-2", title: "Loose Ends", artist: "bsnno", src: "/audio/lofi/placeholder-2.wav" },
];
