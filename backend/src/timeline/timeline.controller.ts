import { Controller, Get, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineResponse } from '../domain/timeline';

@Controller('sports')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  /**
   * Get upcoming events across all sports
   * GET /sports/timeline?days=60
   */
  @Get('timeline')
  async getTimeline(@Query('days') days?: string): Promise<TimelineResponse> {
    const parsedDays = days ? parseInt(days, 10) : 60;
    const safeDays = Number.isNaN(parsedDays) ? 60 : Math.min(Math.max(parsedDays, 7), 180);
    return this.timelineService.getTimeline(safeDays);
  }
}
