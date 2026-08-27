import type { Period } from "@/lib/domain/period";

export interface PeriodCopy {
  eyebrow: string;
  headline: string;
  subhead: string;
}

/**
 * Hero copy per period. Morning and dusk lines are the ones already drafted
 * in docs/reference/homepage-*.html; afternoon and late are new, written to
 * match — present-tense, weather-aware, melancholic but not bleak.
 */
export const PERIOD_COPY: Record<Period, PeriodCopy> = {
  morning: {
    eyebrow: "Morning",
    headline: "Start slow. It's allowed.",
    subhead:
      "The machine is warm and the room is quiet. Order ahead, or find a table and stay a while.",
  },
  afternoon: {
    eyebrow: "Afternoon",
    headline: "The light does what it can.",
    subhead:
      "Not much happens here in the middle of the day, and that is the point. Stay as long as the table is free.",
  },
  dusk: {
    eyebrow: "Dusk",
    headline: "Nothing here is urgent.",
    subhead:
      "A small room with bad lighting and good coffee. Order ahead, or just sit for a while.",
  },
  late: {
    eyebrow: "Late",
    headline: "Still up?",
    subhead:
      "So is the espresso machine. Nobody here is going to ask why, or when you're leaving.",
  },
};
