export type TYPE_WEATHER = {
  weather_id: number;
  reading_id: number | null;
  latitude: number | string;
  longitude: number | string;
  observed_at: string;
  temperature_c: number | string | null;
  rainfall_mm: number | string | null;
  humidity_percent: number | string | null;
  pressure_hpa: number | string | null;
  source: string;
};

export type TYPE_WEATHER_PARAMS = {
  source?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};

export type TYPE_WEATHER_SYNC_RESULT = {
  synced: number;
  failed: { reading_id: number; error: string }[];
};
