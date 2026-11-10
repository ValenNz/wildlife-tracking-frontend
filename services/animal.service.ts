
import { USE_MOCK_DATA } from "@/services/data-source";
import { ANIMAL_MOCK_SERVICE } from "@/services/animal-mock.service";

import { api, unwrapData } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";

import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_PAYLOAD,
  TYPE_TRACKING_DEVICE,
} from "@/types/animal.type";

type API_ANIMAL = {
  animal_id: number;
  species_id: number;
  name: string;
  birth_date: string | null;
  gender: "male" | "female" | "unknown";
  is_active: boolean;
  species?: TYPE_ANIMAL["species"];
  tracking_device?: TYPE_TRACKING_DEVICE | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const mapAnimalFromApi = (animal: API_ANIMAL): TYPE_ANIMAL => ({
  animal_id: animal.animal_id,
  species_id: animal.species_id,
  animal_code: animal.name,
  birth_date: animal.birth_date,
  gender:
    animal.gender === "male"
      ? "Jantan"
      : animal.gender === "female"
        ? "Betina"
        : "Tidak Diketahui",
  is_active: animal.is_active,
  species: animal.species ?? null,
  tracking_device: animal.tracking_device ?? null,
  created_at: animal.created_at ?? "",
  updated_at: animal.updated_at ?? "",
});

const buildGetAllResponse = (
  items: TYPE_ANIMAL[],
): ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE> => ({
  success: true,
  message: "OK",
  data: {
    items,
    meta: {
      total: items.length,
      page: 1,
      per_page: items.length,
      total_pages: 1,
      total_items: items.length,
    },
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
    if (USE_MOCK_DATA) {
      return ANIMAL_MOCK_SERVICE.GET_ALL(params);
    }

    const response = await api.get<ApiResponse<API_ANIMAL[]>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_ALL(params)}`,
    );

    const animals = unwrapData(response);
    const items = animals.map(mapAnimalFromApi);

    return buildGetAllResponse(items);
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    if (USE_MOCK_DATA) {
      return ANIMAL_MOCK_SERVICE.GET_BY_ID(id);
    }

    const response = await api.get<ApiResponse<API_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_BY_ID(id)}`,
    );

    const animal = unwrapData(response);

    return buildGetByIdResponse(mapAnimalFromApi(animal));
  },

  CREATE: async (
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    if (USE_MOCK_DATA) {
      return ANIMAL_MOCK_SERVICE.CREATE(payload);
    }

    return api.post<ApiResponse<TYPE_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.CREATE}`,
      {
        body: payload,
      },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    if (USE_MOCK_DATA) {
      return ANIMAL_MOCK_SERVICE.UPDATE(id, payload);
    }

    return api.put<ApiResponse<TYPE_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.UPDATE(id)}`,
      {
        body: payload,
      },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    if (USE_MOCK_DATA) {
      return ANIMAL_MOCK_SERVICE.DELETE(id);
    }

    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.DELETE(id)}`,
    );
  },
} as const;
