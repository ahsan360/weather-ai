export interface CurrentWeather {
  time?: string;
  temperature?: number;
  wind_speed?: number;
  wind_direction?: number;
  condition_code?: string;
  icon?: string;
  icon_path?: string;
  // enriched from matching hourly entry in route handler
  humidity?: number;
  feels_like?: number;
  uv_index?: number;
}

export interface DayForecast {
  date: string;
  temp_max?: number;
  temp_min?: number;
  condition_code?: string;
  icon?: string;
  icon_path?: string;
  precipitation_probability?: number;
  precipitation_sum?: number;
  wind_max?: number;
  sunrise?: string;
  sunset?: string;
}

export interface HourForecast {
  time: string;
  temperature?: number;
  precipitation_probability?: number;
  wind_speed?: number;
  condition_code?: string;
  icon?: string;
  humidity?: number;
  feels_like?: number;
  wind_gust?: number;
  uv_index?: number;
  icon_path?: string;
}

export interface WeatherLocation {
  lat: number;
  lon: number;
  timezone?: string;
  country?: string;
  city?: string;
  requested_lat?: number;
  requested_lon?: number;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly?: HourForecast[];
  daily?: DayForecast[];
  ai_summary?: string | null;
  client_geo?: { country: string; ip_hash: string };
}

export interface UsageStats {
  plan: string;
  period: {
    start: string;
    end: string;
    requestCount: number;
    aiRequestCount: number;
  };
  limits: {
    requests: number;
    aiRequests: number;
  };
  remaining: {
    requests: number;
    aiRequests: number;
  };
}


export interface GeoResult {
  lat: string;
  lon: string;
  name: string;
}
