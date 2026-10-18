import { ANIMAL_SERVICE } from "@/services/animal.service";
import { SPECIES_SERVICE } from "@/services/species.service";
import { getDeviceAlerts, getTrackingDevices } from "@/services/tracking-device.service";
import { getGpsReadings } from "@/services/gps-reading.service";
import { getUnreadNotifications } from "@/services/notification.service";
import type { DashboardSummary } from "@/types/dashboard";
import type { TYPE_ANIMAL } from "@/types/animal.type";
import type { TYPE_SPECIES } from "@/types/species.type";

const MAX_RECENT_ITEMS = 5;
const LOW_BATTERY_PERCENT = 25;

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  totalAnimals: 0,
  activeAnimals: 0,
  totalSpecies: 0,
  totalDevices: 0,
  lowBatteryDevices: 0,
  deviceAlerts: [],
  totalReadings: 0,
  latestReadings: [],
  latestNotifications: [],
  degradedSources: [],
};

const isActiveFlag = (value: boolean | number | null | undefined): boolean =>
  value === true || value === 1;

const fetchAnimals = async (): Promise<TYPE_ANIMAL[]> => {
  const response = await ANIMAL_SERVICE.GET_ALL({ page: 1, per_page: 100 });

  return response.data.items;
};

const fetchSpecies = async (): Promise<TYPE_SPECIES[]> => {
  const response = await SPECIES_SERVICE.GET_ALL({ page: 1, per_page: 100 });

  return response.data.items;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const [animals, species, devices, readings, notifications] = await Promise.all([
    fetchAnimals(),
    fetchSpecies(),
    getTrackingDevices(),
    getGpsReadings(),
    getUnreadNotifications(),
  ]);

  return {
    totalAnimals: animals.length,
    activeAnimals: animals.filter((animal) => isActiveFlag(animal.is_active)).length,
    totalSpecies: species.length,
    totalDevices: devices.filter((device) => isActiveFlag(device.is_active)).length,
    lowBatteryDevices: devices.filter(
      (device) =>
        device.battery_level !== null && device.battery_level < LOW_BATTERY_PERCENT,
    ).length,
    deviceAlerts: await getDeviceAlerts(),
    totalReadings: readings.length,
    latestReadings: readings.slice(0, MAX_RECENT_ITEMS),
    latestNotifications: notifications.slice(0, MAX_RECENT_ITEMS),
    degradedSources: [],
  };
};