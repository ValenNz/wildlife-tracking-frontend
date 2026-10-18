import type { TYPE_ANIMAL } from "@/types/wildlife/animal.type";

export type DeviceCondition = "normal" | "damaged" | "lost";

export type TrackingDevice = {
  device_id: number;
  animal_id: number | null;
  model: string;
  installation_date: string | null;
  battery_life_months: number | null;
  is_active: boolean | number;
  device_condition: DeviceCondition;
  battery_level: number | null;
  signal_strength: number | null;
  last_recorded_at: string | null;
  animal?: TYPE_ANIMAL | null;
};

export type DeviceAlert = {
  device_id: number;
  animal_id: number | null;
  model: string;
  battery_level: number | null;
  signal_strength: number | null;
  device_condition: DeviceCondition;
};

export type DeviceAlertReason = "low_battery" | "weak_signal";

export type TrackingDeviceListParams = {
  animalId?: number;
  onlyActive?: boolean;
  deviceCondition?: DeviceCondition;
};