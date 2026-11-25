import { api, unwrapData } from "@/services/api";

import type { AiMediaUpload, AiPredictionUploadResult } from "@/types/ai.type";
import type { ApiResponse } from "@/types/api.type";
import type {
  DeviceAlert,
  DeviceCondition,
  TrackingDevice,
  TrackingDeviceListParams,
  TYPE_TRACKING_DEVICE_PAYLOAD,
  TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD,
  API_TRACKING_DEVICE,
} from "@/types/device.type";

const LOW_BATTERY_THRESHOLD = 20;
const WEAK_SIGNAL_THRESHOLD = 20;

type DeviceQueryParams = TrackingDeviceListParams & {
  animalId?: number;
  onlyActive?: boolean;
  deviceCondition?: DeviceCondition;
};

const toNumber = (
  value: number | string | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapDeviceFromApi = (device: API_TRACKING_DEVICE): TrackingDevice => ({
  device_id: device.device_id,
  device_type: device.device_type ?? "gps",
  animal_id: device.animal_id,
  zone_id: device.zone_id ?? null,
  model: device.model,
  serial_number: device.serial_number ?? null,
  latitude: device.latitude ?? null,
  longitude: device.longitude ?? null,
  installation_date: device.installation_date,
  battery_life_months: device.battery_life_months,
  is_active: device.is_active === true || device.is_active === 1,
  device_condition: device.device_condition,
  battery_level: toNumber(device.battery_level),
  signal_strength: toNumber(device.signal_strength),
  last_recorded_at: device.last_recorded_at,
  animal: device.animal
    ? {
        animal_id: device.animal.animal_id,
        species_id: device.animal.species_id,
        name_animal: device.animal.name_animal ?? device.animal.name ?? "",
        animal_code:
          device.animal.animal_code ??
          device.animal.name_animal ??
          device.animal.name ??
          "",
        birth_date: device.animal.birth_date,
        gender: device.animal.gender,
        distinctive_marks: device.animal.distinctive_marks ?? null,
        is_active: device.animal.is_active === true || device.animal.is_active === 1,
        species: device.animal.species ?? null,
      }
    : null,
  zone: device.zone ?? null,
  latestReading: device.latestReading ?? null,
});

const toApiParams = (params?: DeviceQueryParams) => {
  if (!params) return undefined;

  const {
    animalId,
    onlyActive,
    deviceCondition,
    device_type,
    is_active,
    device_condition,
    ...rest
  } = params;

  return {
    ...rest,
    ...(device_type !== undefined
      ? { device_type: Array.isArray(device_type) ? device_type.join(",") : device_type }
      : {}),
    ...(animalId !== undefined ? { animal_id: animalId } : {}),
    ...(onlyActive !== undefined ? { is_active: onlyActive } : {}),
    ...(deviceCondition !== undefined ? { device_condition: deviceCondition } : {}),
    ...(is_active !== undefined ? { is_active } : {}),
    ...(device_condition !== undefined ? { device_condition } : {}),
  };
};

const toAlert = (device: TrackingDevice): DeviceAlert | null => {
  const battery = device.battery_level;
  const signal = device.signal_strength;
  const lowBattery = battery !== null && battery < LOW_BATTERY_THRESHOLD;
  const weakSignal = signal !== null && signal < WEAK_SIGNAL_THRESHOLD;

  if (!lowBattery && !weakSignal) return null;

  return {
    device_id: device.device_id,
    device_type: device.device_type,
    animal_id: device.animal_id,
    model: device.model,
    battery_level: battery,
    signal_strength: signal,
    device_condition: device.device_condition,
  };
};

export const getTrackingDevices = async (
  params?: DeviceQueryParams,
): Promise<ApiResponse<TrackingDevice[]>> => {
  const result = await api.requestList<ApiResponse<API_TRACKING_DEVICE[]>>(
    "GET",
    "/devices",
    { params: toApiParams(params) },
  );

  return {
    success: result.body.success,
    message: result.body.message ?? "OK",
    data: unwrapData(result.body).map(mapDeviceFromApi),
    errors: result.body.errors,
    meta: result.meta,
  };
};

export const getTrackingDeviceById = async (
  deviceId: number,
): Promise<ApiResponse<TrackingDevice | null>> => {
  const response = await api.get<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}`,
  );

  const device = unwrapData(response);

  return {
    success: true,
    message: response.message ?? "OK",
    data: device ? mapDeviceFromApi(device) : null,
  };
};

export const createTrackingDevice = async (
  payload: TYPE_TRACKING_DEVICE_PAYLOAD,
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.post<ApiResponse<API_TRACKING_DEVICE>>("/devices", {
    body: payload,
  });

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const updateTrackingDevice = async (
  deviceId: number,
  payload: TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD,
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.put<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}`,
    { body: payload },
  );

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const deleteTrackingDevice = async (
  deviceId: number,
): Promise<ApiResponse<null>> =>
  api.delete<ApiResponse<null>>(`/devices/${deviceId}`);

export const assignAnimalToDevice = async (
  deviceId: number,
  animalId: number,
  force = false,
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.patch<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}/assign-animal`,
    { body: { animal_id: animalId, force } },
  );

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const unassignAnimalFromDevice = async (
  deviceId: number,
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.delete<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}/assign-animal`,
  );

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const updateDeviceCondition = async (
  deviceId: number,
  device_condition: DeviceCondition,
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.patch<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}/condition`,
    { body: { device_condition } },
  );

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const updateDeviceStatus = async (
  deviceId: number,
  is_active: boolean,
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.patch<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}/status`,
    { body: { is_active } },
  );

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const updateDeviceTelemetry = async (
  deviceId: number,
  payload: {
    battery_level?: number;
    signal_strength?: number;
    recorded_at?: string;
  },
): Promise<ApiResponse<TrackingDevice>> => {
  const response = await api.patch<ApiResponse<API_TRACKING_DEVICE>>(
    `/devices/${deviceId}/telemetry`,
    { body: payload },
  );

  return {
    success: true,
    message: response.message,
    data: mapDeviceFromApi(unwrapData(response)),
  };
};

export const getDeviceAlerts = async (): Promise<
  ApiResponse<DeviceAlert[]>
> => {
  const devices = await getTrackingDevices({ battery_low: true });
  const alerts = devices.data.map(toAlert).filter(
    (alert): alert is DeviceAlert => alert !== null,
  );

  return {
    success: true,
    message: "OK",
    data: alerts,
  };
};

export const getDeviceCaptures = async (
  deviceId: number,
): Promise<ApiResponse<AiMediaUpload[]>> =>
  api.get<ApiResponse<AiMediaUpload[]>>(`/devices/${deviceId}/captures`, {
    timeoutMs: 30_000,
  });

/** Rekaman kamera jebak / perekam suara; langsung dianalisis AI oleh backend. */
export const uploadDeviceCapture = async (
  deviceId: number,
  file: File,
): Promise<ApiResponse<AiPredictionUploadResult>> => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<ApiResponse<AiPredictionUploadResult>>(
    `/devices/${deviceId}/captures`,
    { formData, timeoutMs: 240_000 },
  );
};
