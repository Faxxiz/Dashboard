import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SportsController } from './sports/sports.controller';
import { SportsService } from './sports/sports.service';
import { JolpicaProvider } from './providers/jolpica/jolpica.provider';

@Module({
  imports: [HttpModule],
  controllers: [SportsController],
  providers: [
    SportsService,
    JolpicaProvider,
    // Future providers can be added here:
    // ApiFootballProvider,
    // NbaProvider,
  ],
})
export class AppModule {}
