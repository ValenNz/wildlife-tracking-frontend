import { api, unwrapData } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.type";
import type {
  DeviceAlert,
  DeviceCondition,
  TrackingDevice,
  TrackingDeviceListParams,
} from "@/types/tracking-device.type";

const BASE = "/api/wildlife";
const LOW_BATTERY_THRESHOLD = 20;
const WEAK_SIGNAL_THRESHOLD = 3;

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;

  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const isActiveFlag = (value: boolean | number | null | undefined): boolean =>
  value === true || value === 1;

const filterDevices = (
  devices: TrackingDevice[],
  params?: TrackingDeviceListParams,
): TrackingDevice[] =>
  devices.filter((device) => {
    const matchesAnimal =
      params?.animalId === undefined || device.animal_id === params.animalId;

    const matchesActive =
      params?.onlyActive !== true || isActiveFlag(device.is_active);

    const matchesCondition =
      params?.deviceCondition === undefined ||
      device.device_condition === params.deviceCondition;

    return matchesAnimal && matchesActive && matchesCondition;
  });

const toAlert = (device: TrackingDevice): DeviceAlert | null => {
  const battery =
    device.battery_level === null ? null : toNumber(device.battery_level);
  const signal =
    device.signal_strength === null ? null : toNumber(device.signal_strength);

  const lowBattery = battery !== null && battery < LOW_BATTERY_THRESHOLD;
  const weakSignal = signal !== null && signal < WEAK_SIGNAL_THRESHOLD;

  if (!lowBattery && !weakSignal) return null;

  return {
    device_id: device.device_id,
    animal_id: device.animal_id,
    model: device.model,
    battery_level: battery,
    signal_strength: signal,
    device_condition: device.device_condition,
  };
};

export const getTrackingDevices = async (
  params?: TrackingDeviceListParams,
): Promise<TrackingDevice[]> => {
  const response = await api.get<ApiResponse<TrackingDevice[]>>(`${BASE}/devices`);
  const payload = unwrapData(response);
  const devices = Array.isArray(payload) ? (payload as TrackingDevice[]) : [];

  return filterDevices(devices, params).sort(
    (left, right) => left.device_id - right.device_id,
  );
};

export const getTrackingDeviceById = async (
  deviceId: number,
): Promise<TrackingDevice | null> => {
  const response = await api.get<ApiResponse<TrackingDevice>>(
    `${BASE}/devices/${deviceId}`,
  );
  const payload = unwrapData(response);

  return payload && typeof payload === "object" && "device_id" in payload
    ? (payload as TrackingDevice)
    : null;
};

export const getDeviceAlerts = async (): Promise<DeviceAlert[]> => {
  const devices = await getTrackingDevices();

  return devices
    .map(toAlert)
    .filter((alert): alert is DeviceAlert => alert !== null);
};

export const isDeviceCondition = (
  value: string,
  condition: DeviceCondition,
): boolean => value === condition;