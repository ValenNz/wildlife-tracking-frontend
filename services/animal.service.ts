import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_CREATE_PAYLOAD,
  TYPE_ANIMAL_DETAIL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_LIST_PARAMS,
  TYPE_ANIMAL_UPDATE_PAYLOAD,
} from "@/types/wildlife/animal.type";
import type { TYPE_SPECIES_SUMMARY } from "@/types/wildlife/species.type";

export type TYPE_ANIMAL_QUERY_PARAMS = Partial<QUERY_PARAMS_API_GET_ALL> &
  TYPE_ANIMAL_LIST_PARAMS;

const DEFAULT_PER_PAGE = 100;

const isActiveFlag = (value: boolean | number | null | undefined): boolean =>
  value === true || value === 1;

const toGender = (value: unknown): TYPE_ANIMAL["gender"] => {
  if (value === "Jantan" || value === "Betina" || value === "Tidak Diketahui") {
    return value;
  }

  return "Tidak Diketahui";
};

type TYPE_RAW_ANIMAL = {
  animal_id: number;
  species_id: number;
  animal_code?: string;
  name?: string;
  birth_date: string | null;
  gender?: unknown;
  is_active?: boolean | number;
  created_at?: string | null;
  species?: TYPE_SPECIES_SUMMARY | null;
};

const toAnimal = (raw: TYPE_RAW_ANIMAL): TYPE_ANIMAL => ({
  animal_id: raw.animal_id,
  species_id: raw.species_id,
  animal_code: raw.animal_code ?? raw.name ?? String(raw.animal_id),
  birth_date: raw.birth_date ?? null,
  gender: toGender(raw.gender),
  is_active: isActiveFlag(raw.is_active),
  species_name: raw.species?.common_name,
  species_scientific_name: raw.species?.scientific_name,
  conservation_status: raw.species?.conservation_status,
  created_at: raw.created_at ?? "",
});

const matchesSearch = (animal: TYPE_ANIMAL, search: string): boolean => {
  if (search.length === 0) return true;

  return (
    animal.animal_code.toLowerCase().includes(search) ||
    (animal.species_name ?? "").toLowerCase().includes(search) ||
    (animal.species_scientific_name ?? "").toLowerCase().includes(search)
  );
};

const applyFilters = (
  animals: TYPE_ANIMAL[],
  params: TYPE_ANIMAL_QUERY_PARAMS,
): TYPE_ANIMAL[] => {
  const search = params.search?.trim().toLowerCase() ?? "";

  return animals.filter((animal) => {
    const onSearch = matchesSearch(animal, search);

    const onSpecies =
      params.species_id === undefined || animal.species_id === params.species_id;

    const onActive =
      params.is_active === undefined || animal.is_active === params.is_active;

    const onGender = params.gender === undefined || animal.gender === params.gender;

    return onSearch && onSpecies && onActive && onGender;
  });
};

const sortAnimals = (
  animals: TYPE_ANIMAL[],
  params: TYPE_ANIMAL_QUERY_PARAMS,
): TYPE_ANIMAL[] => {
  const direction = params.order === "desc" ? -1 : 1;

  return [...animals].sort((left, right) => {
    if (params.orderBy === "animal_code") {
      return left.animal_code.localeCompare(right.animal_code) * direction;
    }

    if (params.orderBy === "birth_date") {
      return (
        new Date(left.birth_date ?? 0).getTime() -
        new Date(right.birth_date ?? 0).getTime()
      ) * direction;
    }

    return (left.animal_id - right.animal_id) * direction;
  });
};

const buildMeta = (
  matched: TYPE_ANIMAL[],
  params: TYPE_ANIMAL_QUERY_PARAMS,
  sourceTotal: number,
): TYPE_META_PAGGINATION => {
  const perPage = params.per_page ?? DEFAULT_PER_PAGE;
  const total = matched.length;

  return {
    total,
    page: params.page ?? 1,
    per_page: perPage,
    total_pages: Math.max(Math.ceil(total / perPage), 1),
    total_items: sourceTotal,
  };
};

const paginate = (
  animals: TYPE_ANIMAL[],
  params: TYPE_ANIMAL_QUERY_PARAMS,
): TYPE_ANIMAL[] => {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? DEFAULT_PER_PAGE;
  const start = (page - 1) * perPage;

  return animals.slice(start, start + perPage);
};

export const ANIMAL_SERVICE = {
  GET_ALL: async (
    params: TYPE_ANIMAL_QUERY_PARAMS = {},
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_ANIMAL[]>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_ALL(params)}`,
    );

    const rawItems = Array.isArray(response.data) ? response.data : [];
    const normalized = rawItems.map((item) => toAnimal(item as TYPE_RAW_ANIMAL));

    const matched = sortAnimals(applyFilters(normalized, params), params);

    return {
      success: response.success,
      message: response.message,
      data: {
        items: paginate(matched, params),
        meta: buildMeta(matched, params, normalized.length),
      },
      errors: response.errors,
    };
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_RAW_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_BY_ID(id)}`,
    );

    const payload = response.data;
    const raw = (
      Array.isArray(payload) ? payload[0] : payload
    ) as TYPE_RAW_ANIMAL;

    const animal = toAnimal(raw);

    return {
      success: response.success,
      message: response.message,
      data: {
        items: [
          {
            animal_id: animal.animal_id,
            species_id: animal.species_id,
            animal_code: animal.animal_code,
            birth_date: animal.birth_date,
            gender: animal.gender,
            is_active: animal.is_active,
            species: raw?.species ?? null,
            gps_reading_count: 0,
            incident_report_count: 0,
            created_at: animal.created_at,
            updated_at: animal.created_at,
          },
        ],
        meta: null,
      },
      errors: response.errors,
    };
  },

  CREATE: async (
    payload: TYPE_ANIMAL_CREATE_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL_DETAIL>> => {
    return api.post<ApiResponse<TYPE_ANIMAL_DETAIL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.CREATE}`,
      { body: payload },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_UPDATE_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL_DETAIL>> => {
    return api.put<ApiResponse<TYPE_ANIMAL_DETAIL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.UPDATE(id)}`,
      { body: payload },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.DELETE(id)}`,
    );
  },
} as const;