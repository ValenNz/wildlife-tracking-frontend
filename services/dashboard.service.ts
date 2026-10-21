import { ANIMAL_SERVICE } from "@/services/animal.service";
import { SPECIES_SERVICE } from "@/services/species.service";
import { getDeviceAlerts, getTrackingDevices } from "@/services/tracking-device.service";
import { getGpsReadings } from "@/services/gps-reading.service";
import { getUnreadNotifications } from "@/services/notification.service";
import type { DashboardSummary } from "@/types/dashboard";
import type { TYPE_ANIMAL } from "@/types/animal.type";
import type { TYPE_SPECIES } from "@/types/species.type";
import type { ApiResponse } from "@/types/api.type";
import type { TrackingDevice } from "@/types/tracking-device.type";

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

const unwrap = <T>(response: ApiResponse<T>): T => response.data;

export const getDashboardSummary = async (): Promise<ApiResponse<DashboardSummary>> => {
  const [animals, species, devicesResponse, readingsResponse, notificationsResponse] = await Promise.all([
    fetchAnimals(),
    fetchSpecies(),
    getTrackingDevices(),
    getGpsReadings(),
    getUnreadNotifications(),
  ]);

  const devices = unwrap(devicesResponse);
  const readings = unwrap(readingsResponse);
  const notifications = unwrap(notificationsResponse);
  const alerts = unwrap(await getDeviceAlerts());

  return {
    success: true,
    message: "OK",
    data: {
      totalAnimals: animals.length,
      activeAnimals: animals.filter((animal) => isActiveFlag(animal.is_active)).length,
      totalSpecies: species.length,
      totalDevices: devices.filter((device: TrackingDevice) => isActiveFlag(device.is_active)).length,
      lowBatteryDevices: devices.filter(
        (device: TrackingDevice) =>
          device.battery_level !== null && device.battery_level < LOW_BATTERY_PERCENT,
      ).length,
      deviceAlerts: alerts,
      totalReadings: readings.length,
      latestReadings: readings.slice(0, MAX_RECENT_ITEMS),
      latestNotifications: notifications.slice(0, MAX_RECENT_ITEMS),
      degradedSources: [],
    },
  };
};