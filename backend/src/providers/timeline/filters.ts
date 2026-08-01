/**
 * Filters for excluding women's competitions and unwanted US sports
 */

const WOMENS_PATTERN =
  /\b(women|woman|womens|women's|feminine|femmes|frauen|femenino|feminino|ladies|féminin|feminin)\b/i;

const EXCLUDED_US_LEAGUES =
  /\b(nfl|mlb|nhl|mls|ncaa|wnba|college football|college basketball|major league baseball|national hockey league|national football league)\b/i;

export function isWomensEvent(parts: (string | undefined | null)[]): boolean {
  return parts.filter(Boolean).some((part) => WOMENS_PATTERN.test(part as string));
}

export function isExcludedUsSport(parts: (string | undefined | null)[]): boolean {
  return parts.filter(Boolean).some((part) => EXCLUDED_US_LEAGUES.test(part as string));
}

export function shouldIncludeEvent(parts: (string | undefined | null)[]): boolean {
  return !isWomensEvent(parts) && !isExcludedUsSport(parts);
}
