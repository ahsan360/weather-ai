# WeatherAI

Real-time weather intelligence with AI-powered summaries, built on the [WeatherAI API](https://weather-ai.co/docs).

## Live Demo

[https://weather-ai-ahsan.vercel.app](https://weather-ai-ahsan.vercel.app) <!-- replace with your Vercel URL after deployment -->

## Features

- **Auto location detection** — uses browser GPS; falls back to IP detection
- **Current weather** — temperature, condition, humidity, wind, feels like, UV index with live icons
- **Hourly forecast** — scrollable 24-hour chart with weather icons and rain probability
- **7-day forecast** — daily high/low, condition icons, rain chance
- **City search** — search any city worldwide
- **API usage badge** — live request quota from `/v1/usage`

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /v1/weather-geo` | Auto-detect location by user IP |
| `GET /v1/weather` | Current conditions + hourly + 7-day forecast |
| `GET /v1/usage` | Live API quota display |

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Lucide React** icons
- Deployed on **Vercel**

## Local Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-ai.git
   cd weather-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` in the project root:
   ```
   WEATHER_API_KEY=wai_your_key_here
   ```
   Get your key at [weather-ai.co](https://weather-ai.co) → Dashboard → API Keys.

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

> **Security note:** The API key lives only in Next.js Route Handlers — it is never shipped to the browser.
