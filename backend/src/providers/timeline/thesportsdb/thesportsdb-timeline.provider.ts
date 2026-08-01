/**
 * TheSportsDB timeline provider
 * Fetches upcoming events from curated men's leagues
 * API: https://www.thesportsdb.com/api/v1/json/{key}/
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { TimelineProvider } from '../timeline-provider.interface';
import { TimelineEvent } from '../../../domain/timeline';
import { shouldIncludeEvent } from '../filters';
import {
  THESPORTSDB_LEAGUES,
  TheSportsDbLeagueConfig,
  getSeasonCandidates,
} from './thesportsdb.config';
import { TheSportsDbRateLimiter } from './thesportsdb-rate-limiter';

interface TheSportsDbEvent {
  idEvent: string;
  idLeague?: string;
  strEvent: string;
  strLeague: string;
  strSport: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strTimestamp?: string;
  dateEvent: string;
  strTime?: string;
  strVenue?: string;
  strCountry?: string;
  strStatus?: string;
  strPostponed?: string;
  strFilename?: string;
}

interface TheSportsDbEventsResponse {
  events: TheSportsDbEvent[] | null;
}

@Injectable()
export class TheSportsDbTimelineProvider implements TimelineProvider {
  readonly name = 'thesportsdb';
  private readonly logger = new Logger(TheSportsDbTimelineProvider.name);
  private readonly apiKey = process.env.THESPORTSDB_API_KEY ?? '3';
  private readonly baseUrl = `https://www.thesportsdb.com/api/v1/json/${this.apiKey}`;
  private readonly rateLimiter = new TheSportsDbRateLimiter(2500);
  private readonly leagueById = new Map(
    THESPORTSDB_LEAGUES.map((league) => [league.id, league]),
  );

  constructor(private readonly httpService: HttpService) {}

  async getUpcomingEvents(from: Date, to: Date): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];
    const seenIds = new Set<string>();
    let rateLimitHits = 0;

    for (const league of THESPORTSDB_LEAGUES) {
      if (rateLimitHits >= 3) {
        this.logger.warn(
          'TheSportsDB rate limit threshold reached — skipping remaining leagues this refresh',
        );
        break;
      }

      try {
        const leagueEvents = await this.fetchLeagueEvents(league, from, to);
        for (const event of leagueEvents) {
          if (!seenIds.has(event.id)) {
            seenIds.add(event.id);
            events.push(event);
          }
        }
      } catch (error) {
        if (this.isRateLimitError(error)) {
          rateLimitHits += 1;
        }
        this.logger.warn(
          `Failed to fetch events for ${league.competition}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return events;
  }

  private async fetchLeagueEvents(
    league: TheSportsDbLeagueConfig,
    from: Date,
    to: Date,
  ): Promise<TimelineEvent[]> {
    const response = await this.request<TheSportsDbEventsResponse>(
      `${this.baseUrl}/eventsnextleague.php`,
      { id: league.id },
    );

    const rawEvents = response.events ?? [];
    const events: TimelineEvent[] = [];

    for (const raw of rawEvents) {
      const mapped = this.mapEvent(raw, league, from, to);
      if (mapped) {
        events.push(mapped);
      }
    }

    if (events.length === 0) {
      return this.fetchSeasonEvents(league, from, to);
    }

    return events;
  }

  private async fetchSeasonEvents(
    league: TheSportsDbLeagueConfig,
    from: Date,
    to: Date,
  ): Promise<TimelineEvent[]> {
    const now = new Date();
    const seasons = getSeasonCandidates(league.seasonFormat, now);
    const events: TimelineEvent[] = [];

    for (const season of seasons) {
      const response = await this.request<TheSportsDbEventsResponse>(
        `${this.baseUrl}/eventsseason.php`,
        { id: league.id, s: season },
      );

      const rawEvents = response.events ?? [];
      for (const raw of rawEvents) {
        const mapped = this.mapEvent(raw, league, from, to);
        if (mapped) {
          events.push(mapped);
        }
      }

      if (events.length > 0) {
        break;
      }
    }

    return events;
  }

  private async request<T>(url: string, params: Record<string, string>): Promise<T> {
    return this.rateLimiter.schedule(async () => {
      try {
        const response = await firstValueFrom(this.httpService.get<T>(url, { params }));
        return response.data;
      } catch (error) {
        if (this.isRateLimitError(error)) {
          this.logger.debug('TheSportsDB rate limited — waiting 10s before one retry');
          await this.delay(10_000);
          const response = await firstValueFrom(this.httpService.get<T>(url, { params }));
          return response.data;
        }
        throw error;
      }
    });
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 429;
    }
    if (error instanceof Error) {
      return error.message.includes('429') || error.message.includes('1015');
    }
    return false;
  }

  private mapEvent(
    raw: TheSportsDbEvent,
    league: TheSportsDbLeagueConfig,
    from: Date,
    to: Date,
  ): TimelineEvent | null {
    const resolvedLeague =
      (raw.idLeague && this.leagueById.get(raw.idLeague)) || league;

    if (
      !shouldIncludeEvent([
        raw.strEvent,
        raw.strLeague,
        raw.strHomeTeam,
        raw.strAwayTeam,
        raw.strFilename,
      ])
    ) {
      return null;
    }

    if (raw.strPostponed === 'yes') {
      return null;
    }

    const date = this.parseEventDate(raw);
    if (!date || date < from || date > to) {
      return null;
    }

    const status = this.mapStatus(raw.strStatus, date);
    if (status === 'completed' || status === 'cancelled') {
      return null;
    }

    const name = this.buildEventName(raw, resolvedLeague);
    const location = [raw.strVenue, raw.strCountry].filter(Boolean).join(', ') || undefined;

    return {
      id: `tsdb-${raw.idEvent}`,
      name,
      date: date.toISOString(),
      location,
      venue: raw.strVenue || undefined,
      category: resolvedLeague.category,
      competition: resolvedLeague.competition,
      status,
      homeTeam: raw.strHomeTeam || undefined,
      awayTeam: raw.strAwayTeam || undefined,
    };
  }

  private parseEventDate(raw: TheSportsDbEvent): Date | null {
    if (raw.strTimestamp) {
      const parsed = new Date(raw.strTimestamp);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    if (raw.dateEvent) {
      const time = raw.strTime && raw.strTime !== '00:00:00' ? raw.strTime : '12:00:00';
      const parsed = new Date(`${raw.dateEvent}T${time}Z`);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  }

  private mapStatus(
    strStatus: string | undefined,
    date: Date,
  ): TimelineEvent['status'] {
    if (strStatus === 'NS' || strStatus === 'TBD' || !strStatus) {
      return date <= new Date() ? 'live' : 'scheduled';
    }
    if (strStatus === 'CANC' || strStatus === 'PST') {
      return 'cancelled';
    }
    if (strStatus === 'FT' || strStatus === 'AET' || strStatus === 'PEN') {
      return 'completed';
    }
    if (strStatus === 'LIVE' || strStatus === 'HT' || strStatus === '1H' || strStatus === '2H') {
      return 'live';
    }
    return 'scheduled';
  }

  private buildEventName(raw: TheSportsDbEvent, league: TheSportsDbLeagueConfig): string {
    if (raw.strHomeTeam && raw.strAwayTeam) {
      return `${raw.strHomeTeam} vs ${raw.strAwayTeam}`;
    }
    return raw.strEvent || league.competition;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
