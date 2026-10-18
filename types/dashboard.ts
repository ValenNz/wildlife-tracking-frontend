import type { DeviceAlert } from "@/types/tracking-device";
import type { GpsReading } from "@/types/gps-reading";
import type { Notification } from "@/types/notification";

export type DashboardSummary = {
  totalAnimals: number;
  activeAnimals: number;
  totalSpecies: number;
  totalDevices: number;
  lowBatteryDevices: number;
  deviceAlerts: DeviceAlert[];
  totalReadings: number;
  latestReadings: GpsReading[];
  latestNotifications: Notification[];
  degradedSources: string[];
};