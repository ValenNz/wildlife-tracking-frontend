import type { DeviceAlert } from "@/types/tracking-device.type";
import type { GpsReading } from "@/types/gps-reading";
import type { Notification } from "@/types/notification";
import type { IncidentReport } from "@/types/incident-report";

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
  latestIncidentReports: IncidentReport[];
  degradedSources: string[];
};