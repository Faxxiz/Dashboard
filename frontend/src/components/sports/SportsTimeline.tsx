import { cn } from '@/lib/utils';
import type { SportCategory, TimelineEvent } from '@/api/sports.api';

const CATEGORY_CONFIG: Record<
  SportCategory,
  { label: string; emoji: string; color: string; dot: string }
> = {
  football: {
    label: 'Football',
    emoji: '⚽',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    dot: 'bg-emerald-500',
  },
  basketball: {
    label: 'Basketball',
    emoji: '🏀',
    color: 'border-orange-500/30 bg-orange-500/5',
    dot: 'bg-orange-500',
  },
  f1: {
    label: 'Formula 1',
    emoji: '🏎️',
    color: 'border-red-500/30 bg-red-500/5',
    dot: 'bg-red-500',
  },
  cycling: {
    label: 'Cycling',
    emoji: '🚴',
    color: 'border-yellow-500/30 bg-yellow-500/5',
    dot: 'bg-yellow-500',
  },
  rugby: {
    label: 'Rugby',
    emoji: '🏉',
    color: 'border-green-600/30 bg-green-600/5',
    dot: 'bg-green-600',
  },
  handball: {
    label: 'Handball',
    emoji: '🤾',
    color: 'border-blue-500/30 bg-blue-500/5',
    dot: 'bg-blue-500',
  },
  athletics: {
    label: 'Athletics',
    emoji: '🏃',
    color: 'border-violet-500/30 bg-violet-500/5',
    dot: 'bg-violet-500',
  },
};

function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface TimelineEventCardProps {
  event: TimelineEvent;
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const config = CATEGORY_CONFIG[event.category];

  return (
    <article
      className={cn(
        'relative ml-6 rounded-lg border p-4 transition hover:shadow-sm',
        config.color,
      )}
    >
      <span
        className={cn('absolute -left-[1.65rem] top-5 h-3 w-3 rounded-full ring-4 ring-background', config.dot)}
        aria-hidden
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">
              {config.emoji} {config.label}
            </span>
            <span>·</span>
            <span>{event.competition}</span>
          </div>
          <h3 className="text-base font-semibold leading-snug">{event.name}</h3>
          {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
        </div>
        <time className="shrink-0 text-sm font-medium tabular-nums" dateTime={event.date}>
          {formatEventTime(event.date)}
        </time>
      </div>
    </article>
  );
}

interface SportsTimelineProps {
  events: TimelineEvent[];
}

export function SportsTimeline({ events }: SportsTimelineProps) {
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const dayKey = event.date.slice(0, 10);
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(event);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).sort();

  if (sortedDays.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        No upcoming events found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sortedDays.map((dayKey) => (
        <section key={dayKey}>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            {formatEventDate(grouped[dayKey][0].date)}
          </h2>
          <div className="relative space-y-4 border-l-2 border-border pl-0">
            {grouped[dayKey].map((event) => (
              <TimelineEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export { CATEGORY_CONFIG };
