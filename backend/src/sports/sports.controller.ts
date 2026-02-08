/**
 * Sports Controller - Provider-agnostic API endpoints
 * Frontend never knows which provider is being used
 */

import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SportsService } from './sports.service';
import { SportType } from '../domain/sport';
import { SeasonDto, EventDto, CompetitorDto, StandingDto, RaceResultDto } from './dto/sports.dto';

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  /**
   * Get all supported sports
   */
  @Get()
  getSupportedSports(): { sports: SportType[] } {
    return {
      sports: this.sportsService.getSupportedSports(),
    };
  }

  /**
   * Get all seasons for a sport
   * GET /sports/:sport/seasons
   */
  @Get(':sport/seasons')
  async getSeasons(@Param('sport') sport: string): Promise<SeasonDto[]> {
    this.validateSport(sport);
    return await this.sportsService.getSeasons(sport as SportType);
  }

  /**
   * Get events for a specific season
   * GET /sports/:sport/seasons/:seasonId/events
   */
  @Get(':sport/seasons/:seasonId/events')
  async getEvents(
    @Param('sport') sport: string,
    @Param('seasonId') seasonId: string,
  ): Promise<EventDto[]> {
    this.validateSport(sport);
    return await this.sportsService.getEvents(sport as SportType, seasonId);
  }

  /**
   * Get standings for a specific season
   * GET /sports/:sport/seasons/:seasonId/standings
   */
  @Get(':sport/seasons/:seasonId/standings')
  async getStandings(
    @Param('sport') sport: string,
    @Param('seasonId') seasonId: string,
  ): Promise<StandingDto[]> {
    this.validateSport(sport);
    return await this.sportsService.getStandings(sport as SportType, seasonId);
  }

  /**
   * Get competitor information
   * GET /sports/:sport/competitors/:id
   */
  @Get(':sport/competitors/:id')
  async getCompetitor(
    @Param('sport') sport: string,
    @Param('id') id: string,
  ): Promise<CompetitorDto> {
    this.validateSport(sport);
    return await this.sportsService.getCompetitor(sport as SportType, id);
  }

  /**
   * Get a specific event
   * GET /sports/:sport/events/:eventId
   */
  @Get(':sport/events/:eventId')
  async getEvent(
    @Param('sport') sport: string,
    @Param('eventId') eventId: string,
  ): Promise<EventDto> {
    this.validateSport(sport);
    return await this.sportsService.getEvent(sport as SportType, eventId);
  }

  /**
   * Get race results for a specific event
   * GET /sports/:sport/events/:eventId/results
   */
  @Get(':sport/events/:eventId/results')
  async getRaceResults(
    @Param('sport') sport: string,
    @Param('eventId') eventId: string,
  ): Promise<RaceResultDto[]> {
    this.validateSport(sport);
    return await this.sportsService.getRaceResults(sport as SportType, eventId);
  }

  /**
   * Validate that the sport is supported
   */
  private validateSport(sport: string): void {
    const validSports: SportType[] = ['f1', 'football', 'basketball', 'tennis'];
    if (!validSports.includes(sport as SportType)) {
      throw new HttpException(
        {
          message: `Unsupported sport: ${sport}. Supported sports: ${validSports.join(', ')}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
