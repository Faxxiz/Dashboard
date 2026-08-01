import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { SportsTimeline, CATEGORY_CONFIG } from '@/components/sports/SportsTimeline';
import { getTimeline, SportCategory } from '@/api/sports.api';
import { cn } from '@/lib/utils';

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as SportCategory[];

export default function SportsHomePage() {
  const [days, setDays] = useState(60);
  const [activeCategories, setActiveCategories] = useState<Set<SportCategory>>(
    () => new Set(ALL_CATEGORIES),
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['timeline', days],
    queryFn: () => getTimeline(days),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });

  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    return data.events.filter((event) => activeCategories.has(event.category));
  }, [data, activeCategories]);

  const toggleCategory = (category: SportCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        if (next.size > 1) {
          next.delete(category);
        }
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <AppLayout
      title="Sports Timeline"
      subtitle="Upcoming events across football, NBA, F1, cycling, rugby, handball & athletics"
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const isActive = activeCategories.has(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition',
                  isActive
                    ? 'border-primary bg-primary/10 font-medium'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {config.emoji} {config.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="days-select" className="text-muted-foreground">
            Show next
          </label>
          <select
            id="days-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md border bg-background px-3 py-1.5"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading upcoming events…</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">
            {error instanceof Error ? error.message : 'Failed to load timeline.'}
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredEvents.length} upcoming event{filteredEvents.length !== 1 ? 's' : ''}
            </span>
            {isFetching && !isLoading && <span>Refreshing…</span>}
          </div>
          <SportsTimeline events={filteredEvents} />
        </>
      )}
    </AppLayout>
  );
}
