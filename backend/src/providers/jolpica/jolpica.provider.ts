/**
 * Jolpica F1 API Provider
 * Maps Jolpica (Ergast-compatible) API responses to our domain models
 * 
 * Jolpica API: http://api.jolpi.ca/ergast/f1/
 * No API key required - free and open
 * Jolpica is the successor to the deprecated Ergast API
 */

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { SportsProvider } from '../sports-provider.interface';
import { Season, Event, Competitor, Standing, SportType } from '../../domain/sport';

// Jolpica API types (Ergast-compatible response structure)
interface JolpicaSeason {
  season: string;
  url: string;
}

interface JolpicaRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
}

interface JolpicaDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

interface JolpicaStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: JolpicaDriver;
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}

interface JolpicaResponse<T> {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    SeasonTable?: {
      Seasons?: T[];
    };
    RaceTable?: {
      season?: string;
      Races?: T[];
    };
    DriverTable?: {
      Drivers?: T[];
    };
    StandingsTable?: {
      season?: string;
      StandingsLists?: Array<{
        season: string;
        round: string;
        DriverStandings?: JolpicaStanding[];
      }>;
    };
  };
}

@Injectable()
export class JolpicaProvider implements SportsProvider {
  readonly sport: SportType = 'f1';
  private readonly baseUrl = 'http://api.jolpi.ca/ergast/f1';

  constructor(private readonly httpService: HttpService) {}

  async getSeasons(): Promise<Season[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<JolpicaResponse<JolpicaSeason>>(`${this.baseUrl}/seasons.json?limit=100`)
          .pipe(
            catchError((e) => {
              console.error('Jolpica API Error (getSeasons):', e.response?.data || e.message);
              const status = e.response?.status || 500;
              throw new HttpException(
                {
                  message: `Unable to fetch F1 seasons. ${e.response?.data?.message || 'The data provider may be experiencing issues.'}`,
                  status,
                },
                status,
              );
            }),
          ),
      );

      // Jolpica has a proper seasons endpoint that returns SeasonTable.Seasons
      const seasons = response.data.MRData.SeasonTable?.Seasons || [];

      return seasons.map((season: JolpicaSeason) => ({
        id: season.season,
        year: parseInt(season.season, 10),
        name: `F1 ${season.season} Season`,
        startDate: `${season.season}-01-01`,
        endDate: `${season.season}-12-31`,
        sport: 'f1' as SportType,
      })).reverse(); // Most recent first
    } catch (error) {
      console.error('Error in getSeasons:', error);
      throw error;
    }
  }

  async getEvents(seasonId: string): Promise<Event[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<JolpicaResponse<JolpicaRace>>(`${this.baseUrl}/${seasonId}/races.json`)
          .pipe(
            catchError((e) => {
              console.error('Jolpica API Error (getEvents):', e.response?.data || e.message);
              throw new HttpException(
                {
                  message: e.response?.data?.message || 'Failed to fetch events from Jolpica API',
                  status: e.response?.status || 500,
                },
                e.response?.status || 500,
              );
            }),
          ),
      );

      const races = response.data.MRData.RaceTable?.Races || [];

      return races.map((race: JolpicaRace) => ({
        id: `${seasonId}-${race.round}`,
        name: race.raceName,
        date: race.date,
        location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
        seasonId,
        sport: 'f1',
        status: new Date(race.date) < new Date() ? 'completed' : 'scheduled',
      }));
    } catch (error) {
      console.error('Error in getEvents:', error);
      throw error;
    }
  }

  async getStandings(seasonId: string): Promise<Standing[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<JolpicaResponse<JolpicaStanding>>(
            `${this.baseUrl}/${seasonId}/driverStandings.json`,
          )
          .pipe(
            catchError((e) => {
              console.error('Jolpica API Error (getStandings):', e.response?.data || e.message);
              throw new HttpException(
                {
                  message: e.response?.data?.message || 'Failed to fetch standings from Jolpica API',
                  status: e.response?.status || 500,
                },
                e.response?.status || 500,
              );
            }),
          ),
      );

      const standingsList =
        response.data.MRData.StandingsTable?.StandingsLists?.[0];
      const driverStandings = standingsList?.DriverStandings || [];

      return driverStandings.map((standing: JolpicaStanding) => ({
        position: parseInt(standing.position, 10),
        competitorId: standing.Driver.driverId,
        competitorName: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
        points: parseFloat(standing.points),
        seasonId,
        sport: 'f1',
        wins: parseInt(standing.wins, 10),
      }));
    } catch (error) {
      console.error('Error in getStandings:', error);
      throw error;
    }
  }

  async getCompetitor(id: string): Promise<Competitor> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<JolpicaResponse<JolpicaDriver>>(`${this.baseUrl}/drivers/${id}.json`)
          .pipe(
            catchError((e) => {
              console.error('Jolpica API Error (getCompetitor):', e.response?.data || e.message);
              throw new HttpException(
                {
                  message: e.response?.data?.message || 'Failed to fetch competitor from Jolpica API',
                  status: e.response?.status || 500,
                },
                e.response?.status || 500,
              );
            }),
          ),
      );

      const driver = response.data.MRData.DriverTable?.Drivers?.[0];
      if (!driver) {
        throw new HttpException({ message: 'Driver not found' }, 404);
      }

      return {
        id: driver.driverId,
        name: `${driver.givenName} ${driver.familyName}`,
        nationality: driver.nationality,
        sport: 'f1',
        number: driver.permanentNumber ? parseInt(driver.permanentNumber, 10) : undefined,
      };
    } catch (error) {
      console.error('Error in getCompetitor:', error);
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<Event> {
    try {
      // eventId format: "2023-1" (season-round)
      const [seasonId, round] = eventId.split('-');
      
      const response = await firstValueFrom(
        this.httpService
          .get<JolpicaResponse<JolpicaRace>>(`${this.baseUrl}/${seasonId}/${round}/races.json`)
          .pipe(
            catchError((e) => {
              console.error('Jolpica API Error (getEvent):', e.response?.data || e.message);
              throw new HttpException(
                {
                  message: e.response?.data?.message || 'Failed to fetch event from Jolpica API',
                  status: e.response?.status || 500,
                },
                e.response?.status || 500,
              );
            }),
          ),
      );

      const race = response.data.MRData.RaceTable?.Races?.[0];
      if (!race) {
        throw new HttpException({ message: 'Event not found' }, 404);
      }

      return {
        id: eventId,
        name: race.raceName,
        date: race.date,
        location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
        seasonId,
        sport: 'f1',
        status: new Date(race.date) < new Date() ? 'completed' : 'scheduled',
      };
    } catch (error) {
      console.error('Error in getEvent:', error);
      throw error;
    }
  }
}

