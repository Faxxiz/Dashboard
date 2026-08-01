import { Injectable, Logger } from '@nestjs/common';
import { TimelineEvent, TimelineResponse } from '../domain/timeline';
import { TimelineProvider } from '../providers/timeline/timeline-provider.interface';
import { F1TimelineProvider } from '../providers/timeline/f1-timeline.provider';
import { TheSportsDbTimelineProvider } from '../providers/timeline/thesportsdb/thesportsdb-timeline.provider';

interface CacheEntry {
  data: TimelineResponse;
  expiresAt: number;
}

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);
  private readonly providers: TimelineProvider[];
  private cache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs = 60 * 60 * 1000;
  private readonly staleTtlMs = 6 * 60 * 60 * 1000;
  private inFlight = new Map<string, Promise<TimelineResponse>>();

  constructor(
    private readonly f1TimelineProvider: F1TimelineProvider,
    private readonly theSportsDbTimelineProvider: TheSportsDbTimelineProvider,
  ) {
    this.providers = [this.f1TimelineProvider, this.theSportsDbTimelineProvider];
  }

  async getTimeline(days = 60): Promise<TimelineResponse> {
    const cacheKey = `timeline-${days}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    if (cached && cached.expiresAt + this.staleTtlMs > now) {
      this.refreshInBackground(cacheKey, days);
      return cached.data;
    }

    return this.fetchAndCache(cacheKey, days);
  }

  private refreshInBackground(cacheKey: string, days: number): void {
    if (this.inFlight.has(cacheKey)) {
      return;
    }

    this.logger.log(`Serving stale timeline cache — refreshing ${cacheKey} in background`);
    void this.fetchAndCache(cacheKey, days).catch((error) => {
      this.logger.warn(
        `Background timeline refresh failed: ${error instanceof Error ? error.message : error}`,
      );
    });
  }

  private fetchAndCache(cacheKey: string, days: number): Promise<TimelineResponse> {
    const existing = this.inFlight.get(cacheKey);
    if (existing) {
      return existing;
    }

    const promise = this.buildTimeline(days)
      .then((response) => {
        this.cache.set(cacheKey, {
          data: response,
          expiresAt: Date.now() + this.cacheTtlMs,
        });
        return response;
      })
      .finally(() => {
        this.inFlight.delete(cacheKey);
      });

    this.inFlight.set(cacheKey, promise);
    return promise;
  }

  private async buildTimeline(days: number): Promise<TimelineResponse> {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setDate(to.getDate() + days);
    to.setHours(23, 59, 59, 999);

    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.getUpcomingEvents(from, to)),
    );

    const events: TimelineEvent[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        events.push(...result.value);
      } else {
        this.logger.warn(`Timeline provider failed: ${result.reason}`);
      }
    }

    const deduped = this.deduplicateEvents(events);
    deduped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      events: deduped,
      from: from.toISOString(),
      to: to.toISOString(),
      fetchedAt: new Date().toISOString(),
    };
  }

  private deduplicateEvents(events: TimelineEvent[]): TimelineEvent[] {
    const seen = new Map<string, TimelineEvent>();

    for (const event of events) {
      const key = `${event.category}-${event.name}-${event.date.slice(0, 10)}`;
      if (!seen.has(key)) {
        seen.set(key, event);
      }
    }

    return Array.from(seen.values());
  }
}
