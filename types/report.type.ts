export type TYPE_REPORT_TYPE = "daily" | "weekly" | "monthly";

export type TYPE_AGGREGATE_REPORT = {
  report_id: number;
  report_type: TYPE_REPORT_TYPE;
  period_start: string;
  period_end: string;
  generated_at: string;
  report_data?: { statistics?: Record<string, number | string | null> } | null;
  generator?: { user_id: number; full_name?: string; username?: string } | null;
};

export type TYPE_AGGREGATE_REPORT_PAYLOAD = {
  report_type: TYPE_REPORT_TYPE;
  period_start?: string;
  period_end?: string;
  overwrite?: boolean;
};

export const TYPE_REPORT_TYPE_LABELS: Record<TYPE_REPORT_TYPE, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

export const REPORT_STATISTIC_LABELS: Record<string, string> = {
  total_animals: "Satwa",
  active_animals: "Satwa aktif",
  total_species: "Spesies",
  total_readings: "Titik GPS",
  total_incidents: "Insiden",
  critical_incidents: "Insiden kritis",
  ai_generated_incidents: "Insiden dari AI",
  total_devices: "Perangkat",
  active_devices: "Perangkat aktif",
  low_battery_devices: "Baterai lemah",
  total_predictions: "Prediksi AI",
};

export type TYPE_EXPORT_ITEM = {
  path: string;
  filename: string;
  title: string;
  description: string;
  dated: boolean;
};
