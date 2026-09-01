/**
 * The persistent player's playlist. Tracks sourced from Free To Use — see
 * docs/DECISIONS.md for the licensing note (their free-tier attribution
 * license is written for video platforms specifically; standard website
 * use isn't as clean-cut, and that ambiguity was accepted deliberately
 * rather than resolved by switching sources). Distinct from the ambient
 * mixer's loops (lib/domain/ambience.ts), which are sourced from Pixabay.
 * File names follow "Artist - Title.mp3"; `src` is run through encodeURI
 * since several file names contain spaces.
 */
export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export const PLAYLIST: PlaylistTrack[] = [
  {
    id: "chill-pulse-talk",
    title: "Talk",
    artist: "Chill Pulse",
    src: encodeURI("/audio/lofi/Chill Pulse - Talk.mp3"),
  },
  {
    id: "pufino-charmed",
    title: "Charmed",
    artist: "Pufino",
    src: encodeURI("/audio/lofi/Pufino - Charmed.mp3"),
  },
  {
    id: "pufino-fantasy",
    title: "Fantasy",
    artist: "Pufino",
    src: encodeURI("/audio/lofi/Pufino - Fantasy.mp3"),
  },
  {
    id: "massobeats-aromatic",
    title: "Aromatic",
    artist: "massobeats",
    src: encodeURI("/audio/lofi/massobeats - aromatic.mp3"),
  },
  {
    id: "massobeats-peach-prosecco",
    title: "Peach Prosecco",
    artist: "massobeats",
    src: encodeURI("/audio/lofi/massobeats - peach prosecco.mp3"),
  },
];
