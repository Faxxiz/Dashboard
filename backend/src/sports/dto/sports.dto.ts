/**
 * DTOs - Data Transfer Objects
 * These define the shape of data sent to/from the API
 * Provider-agnostic by design
 */

import { Season, Event, Competitor, Standing, RaceResult } from '../../domain/sport';

export class SeasonDto implements Season {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  sport: 'f1' | 'football' | 'basketball' | 'tennis';
}

export class EventDto implements Event {
  id: string;
  name: string;
  date: string;
  location: string;
  seasonId: string;
  sport: 'f1' | 'football' | 'basketball' | 'tennis';
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export class CompetitorDto implements Competitor {
  id: string;
  name: string;
  nationality?: string;
  sport: 'f1' | 'football' | 'basketball' | 'tennis';
  team?: string;
  number?: number;
}

export class StandingDto implements Standing {
  position: number;
  competitorId: string;
  competitorName: string;
  points: number;
  seasonId: string;
  sport: 'f1' | 'football' | 'basketball' | 'tennis';
  wins?: number;
  losses?: number;
  draws?: number;
}

export class RaceResultDto implements RaceResult {
  position: number;
  positionText: string;
  points: number;
  driverId: string;
  driverName: string;
  driverNumber?: number;
  constructorId: string;
  constructorName: string;
  laps?: number;
  status: string;
  time?: string;
}
