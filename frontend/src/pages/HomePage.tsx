import { useQuery } from '@tanstack/react-query'
import { getSeasons, Season } from '../api/sports.api'

function HomePage() {
  const {
    data: seasons = [],
    isLoading,
    error,
  } = useQuery<Season[]>({
    queryKey: ['seasons', 'f1'],
    queryFn: () => getSeasons('f1'),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🏎️ F1 Dashboard</h1>
          <p className="text-gray-400">Formula 1 Racing Statistics & Data</p>
        </header>

        <main>
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-gray-400">Loading seasons...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-200">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load seasons. Please try again.'}
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
              {seasons.length === 0 ? (
                <p className="text-gray-400">No seasons found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seasons.map((season: Season) => (
                    <div
                      key={season.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="text-xl font-semibold mb-2">
                        {season.name}
                      </h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Year: {season.year}</p>
                        <p>Start: {new Date(season.startDate).toLocaleDateString()}</p>
                        <p>End: {new Date(season.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default HomePage
