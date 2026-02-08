import { useParams } from 'react-router-dom';

function SeasonResultsPage() {
  const { year } = useParams<{ year: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Season {year}</h1>
          <p className="text-muted-foreground">Formula 1 {year} Season Results</p>
        </header>

        <main>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Season results for {year} will be displayed here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SeasonResultsPage;
