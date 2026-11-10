
import { DUMMY_ANIMALS } from "@/constant/animal/animal";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_PAYLOAD,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
} from "@/types/animal.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { ApiResponse } from "@/types/api.type";

let animals: TYPE_ANIMAL[] = [...DUMMY_ANIMALS];

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
  data: { items: item, meta: null },
});

export const ANIMAL_MOCK_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>> => {
    const page = Math.max(1, Number(params?.page) || 1);
    const perPage = Math.max(1, Number(params?.per_page) || 10);

    const start = (page - 1) * perPage;
    const items = animals.slice(start, start + perPage);

    return {
      success: true,
      message: "OK",
      data: {
        items,
        meta: {
          total: animals.length,
          page,
          per_page: perPage,
          total_pages: Math.max(1, Math.ceil(animals.length / perPage)),
          total_items: animals.length,
        },
      },
    };
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    const item = animals.find((animal) => animal.animal_id === id) ?? null;
    return buildGetByIdResponse(item);
  },

  CREATE: async (
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const nextId = Math.max(0, ...animals.map((animal) => animal.animal_id)) + 1;
    const now = new Date().toISOString();

    const item: TYPE_ANIMAL = {
      ...payload,
      animal_id: nextId,
      created_at: now,
      updated_at: now,
    };

    animals = [...animals, item];

    return { success: true, message: "Satwa berhasil ditambahkan", data: item };
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    const existing = animals.find((animal) => animal.animal_id === id);

    if (!existing) {
      throw new Error("Satwa tidak ditemukan");
    }

    const item: TYPE_ANIMAL = {
      ...existing,
      ...payload,
      updated_at: new Date().toISOString(),
    };

    animals = animals.map((animal) =>
      animal.animal_id === id ? item : animal,
    );

    return { success: true, message: "Satwa berhasil diperbarui", data: item };
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    const exists = animals.some((animal) => animal.animal_id === id);

    if (!exists) {
      throw new Error("Satwa tidak ditemukan");
    }

    animals = animals.filter((animal) => animal.animal_id !== id);

    return { success: true, message: "Satwa berhasil dihapus", data: null };
  },
};
