import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import {
  getSeasons,
  getEvents,
  getRaceResults,
  Season,
  Event,
  RaceResult,
} from '../api/sports.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTheme } from '../providers/ThemeProvider';
import { Monitor, Moon, Sun } from 'lucide-react';

function HomePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedYear = searchParams.get('year');
  const [defaultSeasonId, setDefaultSeasonId] = useState<string | null>(null);

  const {
    data: seasons = [],
    isLoading: seasonsLoading,
    error: seasonsError,
  } = useQuery<Season[]>({
    queryKey: ['seasons', 'f1'],
    queryFn: () => getSeasons('f1'),
  });

  // Find the latest season with completed races
  useEffect(() => {
    if (!selectedYear && seasons.length > 0 && !defaultSeasonId) {
      const findLatestWithResults = async () => {
        // Check seasons from most recent to oldest
        for (const season of seasons) {
          try {
            const events = await getEvents('f1', season.id);
            const hasCompleted = events.some((e) => e.status === 'completed');
            if (hasCompleted) {
              setDefaultSeasonId(season.id);
              return;
            }
          } catch {
            // Continue to next season
            continue;
          }
        }
        // Fallback to most recent season
        if (seasons.length > 0) {
          setDefaultSeasonId(seasons[0].id);
        }
      };
      findLatestWithResults();
    } else if (selectedYear) {
      setDefaultSeasonId(selectedYear);
    }
  }, [seasons, selectedYear, defaultSeasonId]);

  const activeSeasonId = selectedYear || defaultSeasonId;

  // Get events for the active season
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery<Event[]>({
    queryKey: ['events', 'f1', activeSeasonId],
    queryFn: () => getEvents('f1', activeSeasonId || ''),
    enabled: !!activeSeasonId,
  });

  // Find the latest completed race
  const latestRace = useMemo(() => {
    return events
      .filter((event) => event.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [events]);

  // Get race results for the latest race
  const {
    data: raceResults = [],
    isLoading: resultsLoading,
    error: resultsError,
  } = useQuery<RaceResult[]>({
    queryKey: ['raceResults', 'f1', latestRace?.id],
    queryFn: () => getRaceResults('f1', latestRace!.id),
    enabled: !!latestRace,
  });

  const isLoading = seasonsLoading || eventsLoading || resultsLoading;
  const error = seasonsError || eventsError || resultsError;

  const handleYearChange = (year: string) => {
    navigate(`/?year=${year}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-5xl font-bold mb-2">🏎️ F1 Dashboard</h1>
              <p className="text-muted-foreground">Formula 1 Racing Statistics & Data</p>
            </div>
            <div
              className="inline-flex items-center gap-1 rounded-full border bg-background p-1"
              role="group"
              aria-label="Theme preference"
            >
              <button
                type="button"
                onClick={() => setTheme('system')}
                aria-pressed={theme === 'system'}
                title={`System (${resolvedTheme})`}
                className={`rounded-full p-2 transition ${
                  theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                title="Light"
                className={`rounded-full p-2 transition ${
                  theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                title="Dark"
                className={`rounded-full p-2 transition ${
                  theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Year Selector - Always visible */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <label htmlFor="year-select" className="text-sm font-medium">
              Select Season:
            </label>
            <Select value={activeSeasonId || ''} onValueChange={handleYearChange}>
              <SelectTrigger id="year-select" className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <main>
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading race data...</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
              <p className="text-destructive">
                {error instanceof Error ? error.message : 'Failed to load data. Please try again.'}
              </p>
            </div>
          )}

          {!isLoading && !error && latestRace && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Latest Race: {latestRace.name}</h2>
              <div className="mb-4 text-sm text-muted-foreground">
                <p>Date: {new Date(latestRace.date).toLocaleDateString()}</p>
                <p>Location: {latestRace.location}</p>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pos</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Constructor</TableHead>
                      <TableHead>Laps</TableHead>
                      <TableHead>Time/Status</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {raceResults.length > 0 ? (
                      raceResults.map((result) => (
                        <TableRow key={result.driverId}>
                          <TableCell className="font-medium">{result.positionText}</TableCell>
                          <TableCell>
                            {result.driverNumber && (
                              <span className="text-muted-foreground mr-2">
                                #{result.driverNumber}
                              </span>
                            )}
                            {result.driverName}
                          </TableCell>
                          <TableCell>{result.constructorName}</TableCell>
                          <TableCell>{result.laps || '-'}</TableCell>
                          <TableCell>{result.time || result.status}</TableCell>
                          <TableCell>{result.points}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No results available yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!isLoading && !error && activeSeasonId && (!latestRace || raceResults.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {!latestRace
                  ? 'No completed races found for this season.'
                  : 'No race results available yet.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
