# WeatherAI

Real-time weather intelligence with AI-powered summaries and satellite tree analysis, built on the [WeatherAI API](https://weather-ai.co/docs).

## Live Demo

[https://weather-ai-ahsan.vercel.app](https://weather-ai-ahsan.vercel.app) <!-- replace with your Vercel URL after deployment -->

## Features

- **Auto location detection** — detects your city from IP on load, no prompt needed
- **AI weather summary** — natural-language forecast powered by Gemini via the WeatherAI API
- **Hourly chart** — today's temperature bar chart with rain probability
- **7-day forecast** — daily high/low with condition and rain chance
- **City search** — search any city worldwide
- **API usage badge** — live request quota from `/v1/usage`
- **AI Tree Analyzer** — upload a drone or satellite image to count trees, assess canopy health, and get agronomic recommendations

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /v1/weather-geo` | Auto-detect location by user IP |
| `GET /v1/weather` | Current conditions + 7-day forecast + AI summary |
| `GET /v1/hourly` | Hour-by-hour temperature data |
| `GET /v1/usage` | Live API quota display |
| `POST /v1/trees/analyze` | AI tree counting and canopy health from imagery |

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

## Deploy to Vercel

1. Push to a public GitHub repository
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `WEATHER_API_KEY` in Settings → Environment Variables
4. Click **Deploy**

> **Security note:** The API key lives only in Next.js Route Handlers — it is never shipped to the browser.
