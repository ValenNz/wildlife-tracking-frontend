
import { SPECIES_SERVICE } from "@/services/species.service";
import { USE_MOCK_DATA } from "@/services/data-source";
import { api, unwrapData } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import { DUMMY_DEVICES } from "@/constant/dummy-devices";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_SPECIES } from "@/types/species.type";
import type {
  TrackingDevice,
  DeviceAlert,
  DeviceCondition,
  TrackingDeviceListParams,
} from "@/types/tracking-device.type";

const LOW_BATTERY_THRESHOLD = 20;
const WEAK_SIGNAL_THRESHOLD = 3;

type API_TRACKING_DEVICE = {
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
  animal?: {
    animal_id: number;
    species_id: number;
    name: string;
    birth_date: string | null;
    gender: "male" | "female" | "unknown";
    is_active: boolean;
  } | null;
};

const mapDeviceFromApi = (
  device: API_TRACKING_DEVICE,
  speciesList: TYPE_SPECIES[],
): TrackingDevice => {
  const species =
    speciesList.find(
      (item) => item.species_id === device.animal?.species_id,
    ) ?? null;

  return {
    device_id: device.device_id,
    animal_id: device.animal_id,
    model: device.model,
    installation_date: device.installation_date,
    battery_life_months: device.battery_life_months,
    is_active: device.is_active,
    device_condition: device.device_condition,
    battery_level: device.battery_level,
    signal_strength: device.signal_strength,
    last_recorded_at: device.last_recorded_at,
    animal: device.animal
      ? {
          animal_id: device.animal.animal_id,
          species_id: device.animal.species_id,
          animal_code: device.animal.name,
          birth_date: device.animal.birth_date,
          gender:
            device.animal.gender === "male"
              ? "Jantan"
              : device.animal.gender === "female"
                ? "Betina"
                : "Tidak Diketahui",
          is_active: Boolean(device.animal.is_active),
          species,
          created_at: "",
          updated_at: "",
        }
      : null,
  };
};

const toNumber = (
  value: number | string | null | undefined,
): number => {
  if (value === null || value === undefined) return 0;

  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const isActiveFlag = (
  value: boolean | number | null | undefined,
): boolean => value === true || value === 1;

const filterDevices = (
  devices: TrackingDevice[],
  params?: TrackingDeviceListParams,
): TrackingDevice[] =>
  devices.filter((device) => {
    const matchesAnimal =
      params?.animalId === undefined ||
      device.animal_id === params.animalId;

    const matchesActive =
      params?.onlyActive !== true ||
      isActiveFlag(device.is_active);

    const matchesCondition =
      params?.deviceCondition === undefined ||
      device.device_condition === params.deviceCondition;

    return matchesAnimal && matchesActive && matchesCondition;
  });

const toAlert = (device: TrackingDevice): DeviceAlert | null => {
  const battery =
    device.battery_level === null
      ? null
      : toNumber(device.battery_level);

  const signal =
    device.signal_strength === null
      ? null
      : toNumber(device.signal_strength);

  const lowBattery =
    battery !== null && battery < LOW_BATTERY_THRESHOLD;

  const weakSignal =
    signal !== null && signal < WEAK_SIGNAL_THRESHOLD;

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

const sortDevices = (devices: TrackingDevice[]) =>
  [...devices].sort((a, b) => a.device_id - b.device_id);

const getSpeciesList = async (): Promise<TYPE_SPECIES[]> => {
  const response = await SPECIES_SERVICE.GET_ALL();
  return response.data.items;
};

export const getTrackingDevices = async (
  params?: Partial<QUERY_PARAMS_API_GET_ALL> &
    TrackingDeviceListParams,
): Promise<ApiResponse<TrackingDevice[]>> => {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      message: "OK - Data simulasi perangkat",
      data: sortDevices(filterDevices(DUMMY_DEVICES, params)),
    };
  }

  const [response, speciesList] = await Promise.all([
    api.get<ApiResponse<API_TRACKING_DEVICE[]>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.DEVICES.GET_ALL(params)}`,
    ),
    getSpeciesList(),
  ]);

  const devices = unwrapData(response).map((device) =>
    mapDeviceFromApi(device, speciesList),
  );

  return {
    success: true,
    message: "OK",
    data: sortDevices(filterDevices(devices, params)),
  };
};

export const getTrackingDeviceById = async (
  deviceId: number,
): Promise<ApiResponse<TrackingDevice | null>> => {
  if (USE_MOCK_DATA) {
    const device =
      DUMMY_DEVICES.find((item) => item.device_id === deviceId) ?? null;

    return {
      success: true,
      message: "OK - Data simulasi perangkat",
      data: device,
    };
  }

  const [response, speciesList] = await Promise.all([
    api.get<ApiResponse<API_TRACKING_DEVICE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.DEVICES.GET_BY_ID(deviceId)}`,
    ),
    getSpeciesList(),
  ]);

  const device = unwrapData(response);

  return {
    success: true,
    message: "OK",
    data: mapDeviceFromApi(device, speciesList),
  };
};

export const getDeviceAlerts = async (): Promise<
  ApiResponse<DeviceAlert[]>
> => {
  if (USE_MOCK_DATA) {
    const alerts = DUMMY_DEVICES.map(toAlert).filter(
      (alert): alert is DeviceAlert => alert !== null,
    );

    return {
      success: true,
      message: "OK - Peringatan simulasi",
      data: alerts,
    };
  }

  const [response, speciesList] = await Promise.all([
    api.get<ApiResponse<API_TRACKING_DEVICE[]>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.DEVICES.GET_ALL()}`,
    ),
    getSpeciesList(),
  ]);

  const devices = unwrapData(response).map((device) =>
    mapDeviceFromApi(device, speciesList),
  );

  const alerts = devices
    .map(toAlert)
    .filter((alert): alert is DeviceAlert => alert !== null);

  return {
    success: true,
    message: "OK",
    data: alerts,
  };
};

export const isDeviceCondition = (
  value: string,
  condition: DeviceCondition,
): boolean => value === condition;
