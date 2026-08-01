import { TimelineEvent } from '../../domain/timeline';

export interface TimelineProvider {
  readonly name: string;

  getUpcomingEvents(from: Date, to: Date): Promise<TimelineEvent[]>;
}
