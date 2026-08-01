/**
 * F1 timeline provider — uses Jolpica API for upcoming races
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../../domain/timeline';

interface JolpicaRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
}

interface JolpicaResponse {
  MRData: {
    RaceTable?: {
      Races?: JolpicaRace[];
    };
  };
}

@Injectable()
export class F1TimelineProvider implements TimelineProvider {
  readonly name = 'f1';
  private readonly logger = new Logger(F1TimelineProvider.name);
  private readonly baseUrl = 'https://api.jolpi.ca/ergast/f1';

  constructor(private readonly httpService: HttpService) {}

  async getUpcomingEvents(from: Date, to: Date): Promise<TimelineEvent[]> {
    const year = new Date().getFullYear();
    const seasons = [String(year), String(year + 1)];

    const events: TimelineEvent[] = [];

    for (const season of seasons) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<JolpicaResponse>(`${this.baseUrl}/${season}/races.json`),
        );

        const races = response.data.MRData.RaceTable?.Races ?? [];
        for (const race of races) {
          const date = this.parseRaceDate(race);
          if (!date || date < from || date > to) {
            continue;
          }

          if (date < new Date()) {
            continue;
          }

          events.push({
            id: `f1-${season}-${race.round}`,
            name: race.raceName,
            date: date.toISOString(),
            location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
            venue: race.Circuit.circuitName,
            category: 'f1',
            competition: 'Formula 1',
            status: 'scheduled',
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch F1 season ${season}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return events;
  }

  private parseRaceDate(race: JolpicaRace): Date | null {
    const time = race.time?.replace('Z', '') ?? '12:00:00';
    const parsed = new Date(`${race.date}T${time}Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
