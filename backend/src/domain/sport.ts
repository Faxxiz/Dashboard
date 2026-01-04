/**
 * Domain Models - Provider-agnostic by design
 * These interfaces represent the business domain, not any specific API
 */

export type SportType = 'f1' | 'football' | 'basketball' | 'tennis';

export interface Season {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  sport: SportType;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  seasonId: string;
  sport: SportType;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface Competitor {
  id: string;
  name: string;
  nationality?: string;
  sport: SportType;
  // Sport-specific fields can be added here as optional
  team?: string;
  number?: number; // For F1 driver numbers
}

export interface Standing {
  position: number;
  competitorId: string;
  competitorName: string;
  points: number;
  seasonId: string;
  sport: SportType;
  // Additional sport-specific metrics
  wins?: number;
  losses?: number;
  draws?: number;
}

