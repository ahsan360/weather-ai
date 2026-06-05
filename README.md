# WeatherAI

A real-time weather dashboard built on the [WeatherAI API](https://weather-ai.co/docs). Detects your location automatically, displays current conditions with AI-generated summaries, hourly and 7-day forecasts, and shows live API quota usage.

## Live Demo

[https://weather-ai-ahsan.vercel.app](https://weather-ai-ahsan.vercel.app)

---

## Features

- **Auto location** — requests browser GPS on load; falls back to IP detection if denied
- **Current conditions** — temperature, condition, humidity, wind speed + direction, feels like, UV index with live weather icons
- **AI summary** — natural-language forecast insight returned by the WeatherAI API
- **Hourly forecast** — scrollable 24-hour chart with weather icons and rain probability
- **7-day forecast** — daily high/low temps, condition icons, and rain chance
- **City search** — search any city worldwide; geocoded via OpenStreetMap Nominatim
- **Usage badge** — live request counter showing plan quota consumed this billing period

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Geocoding | OpenStreetMap Nominatim (free, no key needed) |
| Weather data | WeatherAI API (`api.weather-ai.co`) |
| Deployment | Vercel |

---

## Architecture

All WeatherAI API calls happen inside **Next.js Route Handlers** (server-side). The API key never reaches the browser.

```
Browser
  │
  ├── GET /api/weather?lat=&lon=    ← main weather data
  │       │
  │       ├── WeatherAI /v1/weather          (current + hourly + daily)
  │       └── Nominatim /reverse             (city + country name)
  │
  ├── GET /api/weather              ← auto IP detection
  │       │
  │       ├── WeatherAI /v1/weather-geo      (weather by IP)
  │       └── Nominatim /reverse             (city + country name)
  │
  ├── GET /api/geocode?city=        ← city name → coordinates
  │       └── Nominatim /search
  │
  └── GET /api/usage                ← live quota badge
          └── WeatherAI /v1/usage
```

---

## WeatherAI Endpoints Used

| Endpoint | Purpose | Server Cache |
|---|---|---|
| `GET /v1/weather-geo?ip=` | Detect location from user IP, returns geo headers | none |
| `GET /v1/weather?lat=&lon=&days=7&ai=true` | Full weather data — current, hourly[], daily[], AI summary | 10 min |
| `GET /v1/usage` | Billing period request count and plan limits | none |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Dashboard — geolocation, search, renders all sections
│   ├── layout.tsx                 # Root layout with Navbar
│   ├── globals.css                # Tailwind import, skeleton + fade-in animations
│   └── api/
│       ├── weather/route.ts       # Proxies WeatherAI weather endpoints + reverse geocode
│       ├── geocode/route.ts       # City name → lat/lon via Nominatim
│       └── usage/route.ts         # Proxies WeatherAI /v1/usage
│
├── components/
│   ├── Navbar.tsx                 # Sticky top bar with logo
│   ├── UsageBadge.tsx             # Live quota bar — fetches /api/usage independently
│   └── weather/
│       ├── SearchBar.tsx          # City search form with loading + error states
│       ├── CurrentWeather.tsx     # Temp, condition icon, stat grid
│       ├── AISummary.tsx          # AI-generated forecast text card
│       ├── HourlyChart.tsx        # 24-hour scrollable icon chart
│       └── DailyForecast.tsx      # 7-day forecast rows
│
├── lib/
│   ├── weather-api.ts             # WeatherAI API client — apiFetch + weatherApi object
│   ├── api-error.ts               # Shared error response helper for route handlers
│   └── utils.ts                   # formatTemp, formatDay, formatHour, wmoText, degToCompass, cn
│
└── types/
    └── index.ts                   # TypeScript interfaces for all API shapes
```

---

## Local Setup

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/weather-ai.git
cd weather-ai
```

**2. Install dependencies**
```bash
npm install
```

**3. Create `.env.local`**
```
WEATHER_API_KEY=wai_your_key_here
```
Get your key at [weather-ai.co](https://weather-ai.co) → Dashboard → API Keys.

**4. Start the dev server**
```bash
npm run dev
```

**5. Open [http://localhost:3000](http://localhost:3000)**

Allow location when the browser prompts — or search any city manually.

---

## Live demo
https://playful-cheesecake-69a2e0.netlify.app/

---

## Security

- `WEATHER_API_KEY` is read only inside Route Handlers — never bundled into client JavaScript
- External image sources restricted to `cdn.weather-ai.co` via `next.config.ts`
- All route inputs validated before use (coordinate range, empty strings, NaN)
- API responses type-guarded before rendering
