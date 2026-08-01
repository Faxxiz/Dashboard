/**
 * Timeline domain models - unified upcoming events across sports
 */

export type SportCategory =
  | 'football'
  | 'basketball'
  | 'f1'
  | 'cycling'
  | 'rugby'
  | 'handball'
  | 'athletics';

export interface TimelineEvent {
  id: string;
  name: string;
  date: string;
  location?: string;
  venue?: string;
  category: SportCategory;
  competition: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'live';
  homeTeam?: string;
  awayTeam?: string;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  from: string;
  to: string;
  fetchedAt: string;
}
