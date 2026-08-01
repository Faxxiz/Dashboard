/**
 * Sports API service functions
 * All API calls are defined here
 */

import api from './axios';
import { AxiosError } from 'axios';

export interface Season {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  sport: 'f1' | 'football' | 'basketball' | 'tennis';
}

interface ApiErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
}

function throwApiError(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response?.data) {
    const apiError = error.response.data as ApiErrorResponse;
    throw new Error(apiError.message || fallback, { cause: error });
  }
  throw error;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  seasonId: string;
  sport: 'f1' | 'football' | 'basketball' | 'tennis';
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface RaceResult {
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

/**
 * Get all seasons for a sport
 */
export async function getSeasons(sport: string = 'f1'): Promise<Season[]> {
  try {
    const response = await api.get<Season[]>(`/sports/${sport}/seasons`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, 'Failed to fetch seasons');
  }
}

/**
 * Get events (races) for a specific season
 */
export async function getEvents(sport: string = 'f1', seasonId: string): Promise<Event[]> {
  try {
    const response = await api.get<Event[]>(`/sports/${sport}/seasons/${seasonId}/events`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, 'Failed to fetch events');
  }
}

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

/**
 * Get upcoming events timeline across all sports
 */
export async function getTimeline(days = 60): Promise<TimelineResponse> {
  try {
    const response = await api.get<TimelineResponse>('/sports/timeline', {
      params: { days },
    });
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, 'Failed to fetch timeline');
  }
}

/**
 * Get race results for a specific event
 */
export async function getRaceResults(sport: string = 'f1', eventId: string): Promise<RaceResult[]> {
  try {
    const response = await api.get<RaceResult[]>(`/sports/${sport}/events/${eventId}/results`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, 'Failed to fetch race results');
  }
}
