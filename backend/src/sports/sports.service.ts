/**
 * Sports Service - Orchestration Layer
 * This service coordinates between providers and controllers
 * Provider-agnostic by design - can swap providers without changing this code
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { SportsProvider } from '../providers/sports-provider.interface';
import { JolpicaProvider } from '../providers/jolpica/jolpica.provider';
import { Season, Event, Competitor, Standing, SportType } from '../domain/sport';

@Injectable()
export class SportsService {
  private providers: Map<SportType, SportsProvider>;

  constructor(private readonly jolpicaProvider: JolpicaProvider) {
    // Register all available providers
    this.providers = new Map();
    this.providers.set('f1', jolpicaProvider);
    
    // Future providers can be added here:
    // this.providers.set('football', apiFootballProvider);
    // this.providers.set('basketball', nbaProvider);
  }

  /**
   * Get the provider for a specific sport
   */
  private getProvider(sport: SportType): SportsProvider {
    const provider = this.providers.get(sport);
    if (!provider) {
      throw new NotFoundException(`No provider available for sport: ${sport}`);
    }
    return provider;
  }

  /**
   * Get all seasons for a sport
   */
  async getSeasons(sport: SportType): Promise<Season[]> {
    const provider = this.getProvider(sport);
    return provider.getSeasons();
  }

  /**
   * Get events for a specific season
   */
  async getEvents(sport: SportType, seasonId: string): Promise<Event[]> {
    const provider = this.getProvider(sport);
    return provider.getEvents(seasonId);
  }

  /**
   * Get standings for a specific season
   */
  async getStandings(sport: SportType, seasonId: string): Promise<Standing[]> {
    const provider = this.getProvider(sport);
    return provider.getStandings(seasonId);
  }

  /**
   * Get competitor information
   */
  async getCompetitor(sport: SportType, id: string): Promise<Competitor> {
    const provider = this.getProvider(sport);
    return provider.getCompetitor(id);
  }

  /**
   * Get a specific event
   */
  async getEvent(sport: SportType, eventId: string): Promise<Event> {
    const provider = this.getProvider(sport);
    return provider.getEvent(eventId);
  }

  /**
   * Get all supported sports
   */
  getSupportedSports(): SportType[] {
    return Array.from(this.providers.keys());
  }
}

