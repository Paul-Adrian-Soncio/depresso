import { getBusiestHours, getMostOrderedDrinks, getWeeklyVolume } from "@/lib/db/analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AdminAnalyticsPage() {
  const [mostOrdered, busiestHours, weeklyVolume] = await Promise.all([
    getMostOrderedDrinks(5),
    getBusiestHours(),
    getWeeklyVolume(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Analytics</h1>
        <p className="font-body text-sm text-ink-2">
          Computed in SQL from the seeded order history. Cancelled orders don&apos;t
          count toward any of these.
        </p>
      </div>
      <AnalyticsDashboard
        mostOrdered={mostOrdered}
        busiestHours={busiestHours}
        weeklyVolume={weeklyVolume}
      />
    </div>
  );
}
