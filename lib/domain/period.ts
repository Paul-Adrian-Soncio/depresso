export const PERIODS = ["morning", "afternoon", "dusk", "late"] as const;

export type Period = (typeof PERIODS)[number];

export function isPeriod(value: string | undefined | null): value is Period {
  return !!value && (PERIODS as readonly string[]).includes(value);
}

/**
 * Café hours, not an even split of the clock: morning 5–11, afternoon 11–17,
 * dusk 17–21, late 21–5. Matches the "Open until 11" / dusk-6:40pm examples
 * in docs/reference.
 */
export function periodFromHour(hour: number): Period {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "dusk";
  return "late";
}

export function periodFromDate(date: Date): Period {
  return periodFromHour(date.getHours());
}
