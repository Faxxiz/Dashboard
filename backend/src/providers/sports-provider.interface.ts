/**
 * Provider Abstraction Interface
 * All sports API providers must implement this interface
 * This allows us to swap providers without changing the rest of the codebase
 */

import { Season, Event, Competitor, Standing, SportType } from '../domain/sport';

export interface SportsProvider {
  /**
   * The sport this provider supports
   */
  readonly sport: SportType;

  /**
   * Get all available seasons for this sport
   */
  getSeasons(): Promise<Season[]>;

  /**
   * Get events (races, matches, games) for a specific season
   */
  getEvents(seasonId: string): Promise<Event[]>;

  /**
   * Get standings/leaderboard for a specific season
   */
  getStandings(seasonId: string): Promise<Standing[]>;

  /**
   * Get competitor/driver/player information by ID
   */
  getCompetitor(id: string): Promise<Competitor>;

  /**
   * Get a specific event by ID
   */
  getEvent(eventId: string): Promise<Event>;
}

