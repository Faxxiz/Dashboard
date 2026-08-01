import { SportCategory } from '../../../domain/timeline';

export type SeasonFormat = 'academic' | 'nba' | 'calendar' | 'tournament';

export interface TheSportsDbLeagueConfig {
  id: string;
  competition: string;
  category: SportCategory;
  sport: string;
  seasonFormat: SeasonFormat;
}

/**
 * Curated leagues — men's competitions only, no US sports except NBA.
 */
export const THESPORTSDB_LEAGUES: TheSportsDbLeagueConfig[] = [
  // Football — top 5 leagues
  { id: '4328', competition: 'Premier League', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  { id: '4335', competition: 'La Liga', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  { id: '4331', competition: 'Bundesliga', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  { id: '4332', competition: 'Serie A', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  { id: '4334', competition: 'Ligue 1', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  // European cups
  { id: '4480', competition: 'Champions League', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  { id: '4481', competition: 'Europa League', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  { id: '5071', competition: 'Conference League', category: 'football', sport: 'Soccer', seasonFormat: 'academic' },
  // International football
  { id: '4429', competition: 'World Cup', category: 'football', sport: 'Soccer', seasonFormat: 'tournament' },
  { id: '4502', competition: 'Euro', category: 'football', sport: 'Soccer', seasonFormat: 'tournament' },
  { id: '4499', competition: 'Copa America', category: 'football', sport: 'Soccer', seasonFormat: 'tournament' },
  // Basketball — NBA only (US exception)
  { id: '4387', competition: 'NBA', category: 'basketball', sport: 'Basketball', seasonFormat: 'nba' },
  // Cycling
  { id: '4465', competition: 'UCI World Tour', category: 'cycling', sport: 'Cycling', seasonFormat: 'calendar' },
  // Rugby
  { id: '4430', competition: 'Top 14', category: 'rugby', sport: 'Rugby', seasonFormat: 'academic' },
  { id: '4714', competition: 'Six Nations', category: 'rugby', sport: 'Rugby', seasonFormat: 'calendar' },
  { id: '4550', competition: 'European Rugby Champions Cup', category: 'rugby', sport: 'Rugby', seasonFormat: 'academic' },
  { id: '4574', competition: 'Rugby World Cup', category: 'rugby', sport: 'Rugby', seasonFormat: 'tournament' },
  // Handball
  { id: '4980', competition: 'EHF Champions League', category: 'handball', sport: 'Handball', seasonFormat: 'academic' },
  { id: '4894', competition: 'European Handball Championship', category: 'handball', sport: 'Handball', seasonFormat: 'tournament' },
  { id: '4895', competition: 'World Handball Championship', category: 'handball', sport: 'Handball', seasonFormat: 'tournament' },
  // Athletics
  { id: '5282', competition: 'Diamond League', category: 'athletics', sport: 'Athletics', seasonFormat: 'calendar' },
];

export function getSeasonCandidates(format: SeasonFormat, now: Date): string[] {
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (format) {
    case 'academic':
      if (month >= 7) {
        return [`${year}-${year + 1}`, `${year - 1}-${year}`];
      }
      return [`${year - 1}-${year}`, `${year}-${year + 1}`];
    case 'nba':
      if (month >= 9) {
        return [`${year}-${year + 1}`];
      }
      return [`${year - 1}-${year}`, `${year}-${year + 1}`];
    case 'tournament':
      return [`${year}`, `${year + 1}`, `${year - 1}`];
    case 'calendar':
    default:
      return [`${year}`, `${year + 1}`];
  }
}
