export interface WeatherCondition {
  text: string;
  icon?: string;
  code?: number;
}

export interface CurrentWeather {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  wind_kph: number;
  wind_dir?: string;
  uv: number;
  pressure_mb?: number;
  vis_km?: number;
  precip_mm?: number;
  condition: WeatherCondition;
}

export interface DayForecast {
  date: string;
  max_temp_c: number;
  min_temp_c: number;
  condition: WeatherCondition;
  daily_chance_of_rain?: number;
  totalprecip_mm?: number;
}

export interface HourForecast {
  time: string;
  temp_c: number;
  condition: WeatherCondition;
  chance_of_rain?: number;
}

export interface WeatherLocation {
  name?: string;
  city?: string;
  country?: string;
  region?: string;
  lat: number;
  lon: number;
  timezone?: string;
  localtime?: string;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast?: { days: DayForecast[] };
  ai_summary?: string;
}

export interface HourlyResponse {
  location: WeatherLocation;
  forecast: {
    days: Array<{ date: string; hour: HourForecast[] }>;
  };
}

export interface DailyResponse {
  location: WeatherLocation;
  forecast: { days: DayForecast[] };
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
