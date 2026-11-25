import {
  api,
  buildFallbackMeta,
  unwrapData,
} from "@/services/api";

import type { ApiIncidentReport } from "@/types/incident.type";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import {
  fromApiAnimalGender,
  toApiAnimalGender,
} from "@/types/animal.type";
import type {
  API_ANIMAL,
  ApiTrackingDeviceSummary,
  TYPE_ANIMAL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_PAYLOAD,
  TYPE_TRACKING_DEVICE,
} from "@/types/animal.type";

const mapTrackingDevice = (
  device: ApiTrackingDeviceSummary | null | undefined,
): TYPE_TRACKING_DEVICE | null => {
  if (!device) return null;

  return {
    device_id: device.device_id,
    animal_id: device.animal_id ?? null,
    device_type: device.device_type ?? "gps",
    model: device.model ?? "",
    serial_number: device.serial_number ?? null,
    zone_id: device.zone_id ?? 0,
    latitude: device.latitude ?? null,
    longitude: device.longitude ?? null,
    installation_date: device.installation_date ?? null,
    battery_life_months: device.battery_life_months ?? 0,
    is_active: device.is_active === true || device.is_active === 1,
    device_condition: device.device_condition ?? "normal",
    battery_level:
      typeof device.battery_level === "string"
        ? Number(device.battery_level)
        : (device.battery_level ?? null),
    signal_strength:
      typeof device.signal_strength === "string"
        ? Number(device.signal_strength)
        : (device.signal_strength ?? null),
    last_recorded_at: device.last_recorded_at ?? null,
  };
};

const mapAnimalFromApi = (animal: API_ANIMAL): TYPE_ANIMAL => ({
  animal_id: animal.animal_id,
  species_id: animal.species_id,
  animal_code: animal.name_animal ?? animal.name ?? "",
  birth_date: animal.birth_date,
  gender: fromApiAnimalGender(animal.gender),
  distinctive_marks: animal.distinctive_marks ?? null,
  is_active: animal.is_active === true || animal.is_active === 1,
  species: animal.species ?? null,
  trackingDevice: mapTrackingDevice(animal.trackingDevice),
  latest_ai_observation: animal.latest_ai_observation ?? null,
  created_at: animal.created_at ?? "",
  updated_at: animal.updated_at ?? "",
});

const mapAnimalPayloadToApi = (payload: TYPE_ANIMAL_PAYLOAD) => ({
  name_animal: payload.animal_code.trim(),
  species_id: payload.species_id,
  gender: toApiAnimalGender(payload.gender),
  birth_date: payload.birth_date || null,
  distinctive_marks: payload.distinctive_marks?.trim() || null,
  is_active: payload.is_active,
});

const buildGetAllResponse = (
  items: TYPE_ANIMAL[],
  meta: TYPE_META_PAGGINATION | null,
): ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items,
    meta: meta ?? buildFallbackMeta(items.length),
  },
});

const buildGetByIdResponse = (
  item: TYPE_ANIMAL | null,
): ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items: item,
    meta: null,
  },
});

export const ANIMAL_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>> => {
    const result = await api.requestList<ApiResponse<API_ANIMAL[]>>(
      "GET",
      "/animals",
      { params },
    );

    return buildGetAllResponse(
      unwrapData(result.body).map(mapAnimalFromApi),
      result.meta,
    );
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<API_ANIMAL>>(
      `/animals/${id}`,
    );

    const animal = unwrapData(response);

    return buildGetByIdResponse(
      animal ? mapAnimalFromApi(animal) : null,
    );
  },

  CREATE: async (
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const response = await api.post<ApiResponse<API_ANIMAL>>("/animals", {
      body: mapAnimalPayloadToApi(payload),
    });

    const animal = unwrapData(response);

    return {
      success: true,
      message: response.message,
      data: mapAnimalFromApi(animal),
    };
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const response = await api.put<ApiResponse<API_ANIMAL>>(
      `/animals/${id}`,
      {
        body: mapAnimalPayloadToApi(payload),
      },
    );

    const animal = unwrapData(response);

    return {
      success: true,
      message: response.message,
      data: mapAnimalFromApi(animal),
    };
  },

  UPDATE_STATUS: async (
    id: number,
    isActive: boolean,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const response = await api.patch<ApiResponse<API_ANIMAL>>(
      `/animals/${id}/status`,
      { body: { is_active: isActive } },
    );

    return {
      success: true,
      message: response.message,
      data: mapAnimalFromApi(unwrapData(response)),
    };
  },

  GET_INCIDENTS: async (
    id: number,
  ): Promise<ApiResponse<ApiIncidentReport[]>> =>
    api.get<ApiResponse<ApiIncidentReport[]>>(`/animals/${id}/incidents`),

  DELETE: async (id: number): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>(`/animals/${id}`),
} as const;
