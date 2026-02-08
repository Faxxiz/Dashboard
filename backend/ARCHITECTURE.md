# Backend Architecture - Provider-Agnostic Design

## Overview

This backend is designed to be **provider-agnostic**, meaning you can swap sports API providers (Jolpica, Sportradar, etc.) without changing the frontend or most of the backend code.

## Architecture Principles

1. **Domain Models** (`src/domain/`) - Pure business logic, no API-specific code
2. **Provider Abstraction** (`src/providers/`) - Interface that all providers implement
3. **Orchestration Layer** (`src/sports/`) - Coordinates between providers and controllers
4. **API Layer** - Controllers that expose provider-agnostic endpoints

## Directory Structure

```
backend/src/
├── domain/                    # Provider-agnostic domain models
│   └── sport.ts              # Season, Event, Competitor, Standing interfaces
│
├── providers/                 # External API providers
│   ├── sports-provider.interface.ts  # Abstract interface
│   └── jolpica/              # Jolpica F1 API implementation (Ergast-compatible)
│       └── jolpica.provider.ts
│
├── sports/                    # Orchestration layer
│   ├── sports.service.ts      # Coordinates providers
│   ├── sports.controller.ts  # API endpoints
│   └── dto/                   # Data Transfer Objects
│       └── sports.dto.ts
│
└── app.module.ts             # Dependency injection setup
```

## How It Works

### 1. Domain Models (Provider-Agnostic)

```typescript
// src/domain/sport.ts
export interface Season {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  sport: SportType;
}
```

These interfaces represent **what** the data is, not **where** it comes from.

### 2. Provider Interface

```typescript
// src/providers/sports-provider.interface.ts
export interface SportsProvider {
  readonly sport: SportType;
  getSeasons(): Promise<Season[]>;
  getEvents(seasonId: string): Promise<Event[]>;
  // ...
}
```

All providers must implement this interface, ensuring they return the same shape of data.

### 3. Provider Implementation

```typescript
// src/providers/jolpica/jolpica.provider.ts
@Injectable()
export class JolpicaProvider implements SportsProvider {
  readonly sport: SportType = 'f1';

  async getSeasons(): Promise<Season[]> {
    // Fetch from Jolpica API (Ergast-compatible)
    // Map Jolpica response to our domain model
    // Return normalized data
  }
}
```

Each provider:

- Fetches data from its specific API
- Maps the API response to our domain models
- Returns normalized data

### 4. Sports Service (Orchestration)

```typescript
// src/sports/sports.service.ts
@Injectable()
export class SportsService {
  private providers: Map<SportType, SportsProvider>;

  async getSeasons(sport: SportType): Promise<Season[]> {
    const provider = this.getProvider(sport);
    return provider.getSeasons();
  }
}
```

The service:

- Routes requests to the correct provider
- Doesn't know or care about API implementation details
- Can easily swap providers

### 5. Controller (API Endpoints)

```typescript
// src/sports/sports.controller.ts
@Controller('sports')
export class SportsController {
  @Get(':sport/seasons')
  async getSeasons(@Param('sport') sport: string): Promise<SeasonDto[]> {
    return await this.sportsService.getSeasons(sport as SportType);
  }
}
```

Controllers:

- Expose RESTful endpoints
- Never expose provider-specific data
- Frontend never knows which provider is used

## API Endpoints

### Get Supported Sports

```
GET /sports
Response: { sports: ['f1', 'football', ...] }
```

### Get Seasons

```
GET /sports/:sport/seasons
Example: GET /sports/f1/seasons
Response: Season[]
```

### Get Events (Races/Matches)

```
GET /sports/:sport/seasons/:seasonId/events
Example: GET /sports/f1/seasons/2023/events
Response: Event[]
```

### Get Standings

```
GET /sports/:sport/seasons/:seasonId/standings
Example: GET /sports/f1/seasons/2023/standings
Response: Standing[]
```

### Get Competitor

```
GET /sports/:sport/competitors/:id
Example: GET /sports/f1/competitors/alonso
Response: Competitor
```

### Get Event

```
GET /sports/:sport/events/:eventId
Example: GET /sports/f1/events/2023-1
Response: Event
```

## Adding a New Provider

1. **Create provider class** implementing `SportsProvider`:

   ```typescript
   @Injectable()
   export class ApiFootballProvider implements SportsProvider {
     readonly sport: SportType = 'football';
     // Implement all interface methods
   }
   ```

2. **Register in `app.module.ts`**:

   ```typescript
   providers: [
     SportsService,
     JolpicaProvider,
     ApiFootballProvider, // Add here
   ];
   ```

3. **Register in `sports.service.ts`**:
   ```typescript
   constructor(
     private readonly jolpicaProvider: JolpicaProvider,
     private readonly apiFootballProvider: ApiFootballProvider,
   ) {
     this.providers.set('f1', jolpicaProvider);
     this.providers.set('football', apiFootballProvider);  // Add here
   }
   ```

That's it! The frontend can now use `/sports/football/seasons` without any changes.

## Benefits

✅ **Frontend is provider-agnostic** - Never needs to know which API is used
✅ **Easy to swap providers** - Change one file, everything else works
✅ **Easy to add new sports** - Just implement the interface
✅ **Consistent data shape** - All sports return the same structure
✅ **Testable** - Can mock providers easily
✅ **Scalable** - Can add caching, DB, multiple providers per sport later

## Migration from Old Structure

The old `formula-one/` folder can be removed. All functionality is now in:

- `providers/jolpica/` - Provider implementation
- `sports/` - Service and controller
- `domain/` - Domain models
