# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build (type-checks + lint)
npm run lint     # ESLint only
```

No test suite. Verify behavior manually against the dev server.

## Environment

Copy `.env.local` and fill in:
```
WEATHER_API_KEY=          # required — Bearer token for api.weather-ai.co
UPSTASH_REDIS_REST_URL=   # optional — omit to disable rate limiting (fails open)
UPSTASH_REDIS_REST_TOKEN= # optional
```

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS 4 · Upstash Redis

All WeatherAI API calls happen server-side only inside Route Handlers — the API key never reaches the browser. The three route handlers each call `checkRateLimit` (20 req/60s sliding window per IP) before doing anything else.

### Data flow

```
Browser → /api/weather  → weatherApi.getWeather()     → api.weather-ai.co/v1/weather
                        → weatherApi.getWeatherByIp()  → api.weather-ai.co/v1/weather-geo
                        → reverseGeocode()             → nominatim.openstreetmap.org/reverse

Browser → /api/geocode  → Nominatim /search            (city name → lat/lon)
Browser → /api/usage    → weatherApi.getUsage()        → api.weather-ai.co/v1/usage
```

### Key design decisions

**`enrichCurrentFromHourly()`** — The WeatherAI `/v1/weather` response does not include `humidity`, `feels_like`, or `uv_index` in the `current` object. The route handler in `src/app/api/weather/route.ts` copies these fields from the matching hourly entry (matched by hour) into `data.current` before returning the response.

**Two geocoding paths:** When the user searches by city name, `SearchBar` calls `/api/geocode` (Nominatim forward geocode → lat/lon). The resulting lat/lon is passed to `/api/weather` with a `?city=` param, which skips the reverse geocode step since the city name is already known.
When coordinates come from the browser GPS or IP geolocation, `/api/weather` runs a Nominatim reverse geocode to get a human-readable city/country. The WeatherAI API's own `x-country` header is unreliable (returns wrong country codes), so `country` is always sourced from Nominatim's `country_code` field.

**`?city=` param pass-through:** `page.tsx` appends `&city=<name>` to the weather URL only when the user selected a search result. The route handler reads this param and skips the reverse geocode call, avoiding a redundant external request.

**Condition codes:** The WeatherAI API returns WMO weather interpretation codes as `condition_code` (a numeric string like `"63"`), not human-readable text. Convert codes to text with `wmoText()` from `src/lib/utils.ts`, which maps the full WMO table.

**AbortController:** `page.tsx` keeps a ref to the current in-flight fetch. Each new call to `load()` aborts the previous one, preventing race conditions when the user types quickly.

**Rate limiter fails open:** If Upstash Redis is down or unconfigured, `checkRateLimit` returns `{ success: true }` so users are never blocked by an infrastructure failure.

## Shared Utilities (`src/lib/`)

| File | Purpose |
|---|---|
| `weather-api.ts` | Single `apiFetch` wrapper with auth header; exports `weatherApi` object |
| `rate-limit.ts` | `checkRateLimit(ip)` — call at the top of every route handler |
| `api-error.ts` | `apiError(err, fallback)` — uniform 500 response for all route handlers |
| `utils.ts` | `formatTemp`, `formatDay`, `formatHour`, `degToCompass`, `wmoText`, `cn` |

## Types (`src/types/index.ts`)

All interfaces reflect the real WeatherAI API response shape. `CurrentWeather.humidity`, `.feels_like`, `.uv_index` are not in the raw API response — they are injected server-side by `enrichCurrentFromHourly()`. `GeoResult.lat` and `.lon` are `string` (Nominatim returns them as strings); use `parseFloat()` before passing to the weather API.

## Components

All weather display components are pure presentational (no data fetching). They receive typed props and use `formatTemp()` / `wmoText()` from utils for display. `UsageBadge` is the only component that fetches independently (calls `/api/usage`) and has a `refreshKey` prop that triggers a re-fetch when the main weather load completes.

## Security Headers

Configured in `next.config.ts` via `async headers()` — applied to all routes. `Permissions-Policy` restricts geolocation to same-origin only.

## Image Domains

Weather icons are served from `cdn.weather-ai.co`. The `remotePatterns` in `next.config.ts` restricts Next.js `<Image>` to that exact host and `/icons/**` path.

---

## Design Principles

This codebase is written to production-grade standards. Every change must follow these principles — they are not optional.

### KISS — Keep It Simple, Stupid

Prefer the simplest solution that correctly solves the problem. Complexity must justify itself.

- One route handler per concern (`/api/weather`, `/api/geocode`, `/api/usage`). Do not combine them.
- Helper functions do one thing. `reverseGeocode` only geocodes. `enrichCurrentFromHourly` only enriches. `getClientIp` only extracts an IP.
- If you need more than ~3 levels of nesting or conditional logic, the function is doing too much — split it.
- Avoid abstraction layers that exist solely to avoid typing. Thin wrappers with no logic are noise.

### DRY — Don't Repeat Yourself

Every piece of logic lives in exactly one place.

- All rate-limit checks go through `checkRateLimit(ip)`. Never inline `limiter.limit()` directly in a route.
- All upstream error responses go through `apiError(err, fallback)`. Never construct `NextResponse.json({ error: ... }, { status: 500 })` manually in a route.
- All temperature formatting uses `formatTemp()`. All WMO code-to-text uses `wmoText()`. Never format inline.
- All shared TypeScript shapes live in `src/types/index.ts`. Do not redeclare the same interface in multiple files.

### YAGNI — You Aren't Gonna Need It

Only build what the current feature requires. No speculative code.

- Do not add new API endpoints unless there is a UI that consumes them.
- Do not add optional config flags "for future use".
- Do not create base classes, abstract services, or provider patterns unless there are at least two concrete implementations right now.
- Do not add caching, retries, or queuing to a path that does not have a demonstrated performance problem.

### SOLID (applied pragmatically to a Next.js app)

**Single Responsibility:** Each module has one reason to change.
- `weather-api.ts` changes only when the upstream WeatherAI API changes.
- `rate-limit.ts` changes only when the rate-limiting strategy changes.
- `utils.ts` changes only when formatting rules change.
- Presentational components change only when the UI design changes. They never fetch data.

**Open/Closed:** Extend by adding, not by modifying stable code.
- New weather metrics: add a field to the relevant interface in `types/index.ts` and to `enrichCurrentFromHourly` if needed. Do not touch unrelated components.
- New display stat in `CurrentWeather`: add to the `buildStats()` array. Do not restructure the component.

**Dependency Inversion:** Route handlers depend on abstractions (`weatherApi`, `checkRateLimit`, `apiError`), not on implementation details (raw `fetch`, Redis client, `NextResponse` shapes). Keep it that way — do not reach past the abstraction layer.

---

## Code Style Rules

### Naming

- **Functions:** verb phrases describing what they do — `fetchWeatherGeo`, `enrichCurrentFromHourly`, `getClientIp`, `checkRateLimit`. Not `weatherData`, `helper`, `util`.
- **Booleans:** `is`/`has`/`can` prefix — `isUsageStats`, `hasHourlyData`. Not `valid`, `flag`, `check`.
- **React components:** PascalCase noun phrases — `CurrentWeather`, `HourlyChart`, `UsageBadge`. Never abbreviate.
- **Constants:** SCREAMING_SNAKE_CASE for module-level primitives — `MAX_CITY_LENGTH`, `FAIL_OPEN`, `BASE_URL`.
- **Interfaces:** PascalCase nouns matching the domain concept — `WeatherResponse`, `DayForecast`, `GeoResult`. No `I` prefix.

### Functions

- Prefer early returns to reduce nesting. Validate inputs and return errors at the top of route handlers before doing real work.
- Functions longer than ~40 lines are a signal to split, not a rule. Use judgment — `GET` in the weather route is long but coherent; splitting it further would hurt readability.
- Use named parameters (object destructuring) when a function takes more than two arguments.

### TypeScript

- All function parameters and return types must be explicitly typed. No implicit `any`.
- Use `unknown` for caught errors — always check `err instanceof Error` before reading `.message`.
- Use optional chaining (`?.`) and nullish coalescing (`??`) over ternaries for simple null guards.
- Avoid type assertions (`as SomeType`) on external data. Use a type guard function (`isUsageStats`) instead.
- Interfaces over `type` aliases for object shapes that represent domain concepts. Use `type` only for unions, intersections, and utility types.

### Components

- Presentational components must not contain `fetch`, `useEffect` with data fetching, or route handler logic. The sole exception is `UsageBadge`, which has a documented reason to self-fetch.
- Props interfaces are defined inline above the component, not exported unless another file needs them.
- Use `key={stable-id}` on all list items — never `key={index}`.
- Conditionally rendered sections use early returns or short-circuit `&&`. No nested ternary chains.

### Error Handling

- **Route handlers:** every `GET` body is wrapped in a top-level `try/catch` that calls `apiError()`. Rate limit and validation checks return early before the `try` block.
- **Client-side:** `AbortError` is silently swallowed (expected from in-flight cancellation). All other errors set `error` state and surface a message to the user.
- **External services:** failures in non-critical calls (Nominatim reverse geocode) return a neutral fallback (`{ city: null, country: null }`) — they never propagate and crash the main weather response.
- **Infrastructure:** Redis down → rate limiter returns `FAIL_OPEN`. Weather API key missing → throws immediately with a descriptive message.

### Comments

Write no comments by default. Add one only when the **why** is not obvious from reading the code:

```ts
// Nominatim returns lat/lon as strings — parseFloat required before arithmetic
// enrichCurrentFromHourly mutates data in place — WeatherAI omits these fields from current
// Fail open: Redis unavailable should not block users
```

Do not comment what the code does. Do not leave TODO/FIXME comments in committed code.

---

## System Design Constraints

- **No secrets in the browser.** `WEATHER_API_KEY` is read exclusively in `src/lib/weather-api.ts` which runs only on the server. If a new upstream API is added, its key must follow the same pattern.
- **Validate at system boundaries.** Inputs from query params (`lat`, `lon`, `city`) are validated in the route handler before being passed downstream. Internal function calls between modules do not re-validate the same inputs.
- **Partial failure isolation.** Use `Promise.allSettled` when two upstream calls are independent and a failure in one should not block the other (e.g., weather + reverse geocode). Use `Promise.all` only when both results are equally required.
- **Respect upstream rate limits.** Nominatim geocode responses are cached with `next: { revalidate: 86400 }` (24 h). Weather responses are cached with `revalidate: 600` (10 min). Do not remove caching on Nominatim calls.
- **One source of truth per data shape.** `src/types/index.ts` is the contract between the server and the client. If the upstream API changes its response shape, update the interface there first, then fix compilation errors.
