import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';

const NAV_ITEMS = [
  { to: '/', label: 'Timeline' },
  { to: '/f1', label: 'F1' },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
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
        className={cn(
          'rounded-full p-2 transition',
          theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        title="Light"
        className={cn(
          'rounded-full p-2 transition',
          theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
        )}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        title="Dark"
        className={cn(
          'rounded-full p-2 transition',
          theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
        )}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-1 md:text-5xl">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            <ThemeToggle />
          </div>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'border bg-background hover:bg-muted',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
