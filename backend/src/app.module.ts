import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SportsController } from './sports/sports.controller';
import { SportsService } from './sports/sports.service';
import { TimelineController } from './timeline/timeline.controller';
import { TimelineService } from './timeline/timeline.service';
import { JolpicaProvider } from './providers/jolpica/jolpica.provider';
import { F1TimelineProvider } from './providers/timeline/f1-timeline.provider';
import { TheSportsDbTimelineProvider } from './providers/timeline/thesportsdb/thesportsdb-timeline.provider';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TimelineController, SportsController],
  providers: [
    SportsService,
    TimelineService,
    JolpicaProvider,
    F1TimelineProvider,
    TheSportsDbTimelineProvider,
  ],
})
export class AppModule {}
