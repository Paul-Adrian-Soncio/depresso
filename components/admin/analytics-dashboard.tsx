import type { HourlyVolume, MostOrderedDrink, WeeklyVolume } from "@/lib/db/analytics";

const CAFE_UTC_OFFSET_HOURS = 8;

function toCafeHour(utcHour: number): number {
  return (utcHour + CAFE_UTC_OFFSET_HOURS) % 24;
}

function formatHour(hour: number): string {
  const period = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${period}`;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatWeek(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function MostOrderedList({ drinks }: { drinks: MostOrderedDrink[] }) {
  const max = Math.max(...drinks.map((d) => d.totalQuantity), 1);

  return (
    <div className="flex flex-col gap-3">
      {drinks.map((drink, index) => (
        <div key={drink.menuItemId} className="flex items-center gap-3">
          <span className="w-5 flex-none font-mono text-xs text-ink-3">{index + 1}</span>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-ink">{drink.menuItemName}</span>
              <span className="font-mono text-xs tabular-nums text-ink-3">
                {drink.totalQuantity} sold
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(drink.totalQuantity / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const HOURLY_CHART_MAX_PX = 120;

function HourlyChart({ hours }: { hours: HourlyVolume[] }) {
  const byCafeHour = new Map(hours.map((h) => [toCafeHour(h.hourOfDay), h.orderCount]));
  const max = Math.max(...hours.map((h) => h.orderCount), 1);

  // Cafe hours only (6am-9pm) — outside that range is just the handful of
  // "right now" demo orders (see docs/DECISIONS.md), not a real pattern.
  const cafeHoursRange = Array.from({ length: 16 }, (_, i) => i + 6);

  return (
    <div className="flex items-end gap-1.5" style={{ height: HOURLY_CHART_MAX_PX + 24 }}>
      {cafeHoursRange.map((hour) => {
        const count = byCafeHour.get(hour) ?? 0;
        const barHeightPx = Math.max((count / max) * HOURLY_CHART_MAX_PX, 2);
        return (
          <div key={hour} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-sm bg-accent"
              style={{ height: barHeightPx }}
              title={`${count} orders`}
            />
            <span className="font-mono text-[10px] text-ink-3">{formatHour(hour)}</span>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyTable({ weeks }: { weeks: WeeklyVolume[] }) {
  // The most recent week (by week_start, computed in the DB — see
  // weekly_volume() in supabase/migrations) is still accumulating: its
  // total will keep climbing until the week actually ends. Without calling
  // that out, its row looks identical to every finished week, and since the
  // current week's start date can be several days in the past by the time
  // you're looking at it, that read as "nothing happened since then" rather
  // than "this week isn't over yet."
  const latestWeekStart = weeks.reduce(
    (latest, week) => (week.weekStart > latest ? week.weekStart : latest),
    weeks[0]?.weekStart ?? "",
  );

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface-2">
            <th className="px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Week of</th>
            <th className="px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Orders</th>
            <th className="px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {weeks
            .slice()
            .reverse()
            .map((week) => {
              const isCurrentWeek = week.weekStart === latestWeekStart;
              return (
                <tr key={week.weekStart} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-mono text-sm text-ink">
                    {formatWeek(week.weekStart)}
                    {isCurrentWeek && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-accent-text">
                        In progress
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm tabular-nums text-ink-2">
                    {week.orderCount}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm tabular-nums text-ink-2">
                    {formatPrice(week.revenueCents)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export function AnalyticsDashboard({
  mostOrdered,
  busiestHours,
  weeklyVolume,
}: {
  mostOrdered: MostOrderedDrink[];
  busiestHours: HourlyVolume[];
  weeklyVolume: WeeklyVolume[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Most ordered
        </h2>
        <MostOrderedList drinks={mostOrdered} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Busiest hours
        </h2>
        <HourlyChart hours={busiestHours} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Weekly volume
        </h2>
        <WeeklyTable weeks={weeklyVolume} />
      </section>
    </div>
  );
}
