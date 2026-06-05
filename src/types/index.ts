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
  requests_used: number;
  requests_limit: number;
  ai_requests_used: number;
  ai_requests_limit: number;
  period_start: string;
  period_end: string;
}

export interface TreeHealth {
  healthy: number;
  needs_care: number;
  needs_replacement: number;
}

export interface TreeAnalysisResult {
  analysis_id: string;
  timestamp: string;
  total_tree_count: number;
  tree_density_per_acre: number;
  confidence_score: number;
  canopy_coverage_pct: number;
  tree_health: TreeHealth;
  tree_species_guess: string;
  observations: string[];
  recommendations: string[];
  original_image_url: string;
  overlay_image_url: string;
  farmer_id?: string;
  county?: string;
  location?: string;
  land_acres?: number;
  low_confidence?: boolean;
}

export interface TreeQuota {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  resets_at: string;
}

export interface GeoResult {
  lat: string;
  lon: string;
  name: string;
}
