import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
  TYPE_SPECIES_CREATE_PAYLOAD,
  TYPE_SPECIES_DETAIL,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
  TYPE_SPECIES_LIST_PARAMS,
  TYPE_SPECIES_UPDATE_PAYLOAD,
} from "@/types/wildlife/species.type";

export type TYPE_SPECIES_QUERY_PARAMS = Partial<QUERY_PARAMS_API_GET_ALL> &
  TYPE_SPECIES_LIST_PARAMS;

const DEFAULT_PER_PAGE = 100;

const CONSERVATION_STATUSES: TYPE_CONSERVATION_STATUS[] = [
  "Critically Endangered",
  "Endangered",
  "Vulnerable",
];

const toConservationStatus = (value: unknown): TYPE_CONSERVATION_STATUS =>
  CONSERVATION_STATUSES.find((status) => status === value) ?? "Vulnerable";

type TYPE_RAW_SPECIES = {
  species_id: number;
  common_name?: string;
  scientific_name?: string;
  conservation_status?: unknown;
  animal_count?: number;
  created_at?: string | null;
};

const toSpecies = (raw: TYPE_RAW_SPECIES): TYPE_SPECIES => ({
  species_id: raw.species_id,
  common_name: raw.common_name ?? String(raw.species_id),
  scientific_name: raw.scientific_name ?? "",
  conservation_status: toConservationStatus(raw.conservation_status),
  animal_count: raw.animal_count ?? 0,
  created_at: raw.created_at ?? "",
});

const matchesSearch = (species: TYPE_SPECIES, search: string): boolean => {
  if (search.length === 0) return true;

  return (
    species.common_name.toLowerCase().includes(search) ||
    species.scientific_name.toLowerCase().includes(search)
  );
};

const applyFilters = (
  speciesList: TYPE_SPECIES[],
  params: TYPE_SPECIES_QUERY_PARAMS,
): TYPE_SPECIES[] => {
  const search = params.search?.trim().toLowerCase() ?? "";

  return speciesList.filter((item) => {
    const onSearch = matchesSearch(item, search);

    const onStatus =
      params.conservation_status === undefined ||
      item.conservation_status === params.conservation_status;

    return onSearch && onStatus;
  });
};

const sortSpecies = (
  speciesList: TYPE_SPECIES[],
  params: TYPE_SPECIES_QUERY_PARAMS,
): TYPE_SPECIES[] => {
  const direction = params.order === "desc" ? -1 : 1;

  return [...speciesList].sort((left, right) => {
    if (params.orderBy === "scientific_name") {
      return left.scientific_name.localeCompare(right.scientific_name) * direction;
    }

    if (params.orderBy === "conservation_status") {
      return (
        left.conservation_status.localeCompare(right.conservation_status) * direction
      );
    }

    return left.common_name.localeCompare(right.common_name) * direction;
  });
};

const buildMeta = (
  matched: TYPE_SPECIES[],
  params: TYPE_SPECIES_QUERY_PARAMS,
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
  speciesList: TYPE_SPECIES[],
  params: TYPE_SPECIES_QUERY_PARAMS,
): TYPE_SPECIES[] => {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? DEFAULT_PER_PAGE;
  const start = (page - 1) * perPage;

  return speciesList.slice(start, start + perPage);
};

export const SPECIES_SERVICE = {
  GET_ALL: async (
    params: TYPE_SPECIES_QUERY_PARAMS = {},
  ): Promise<ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_SPECIES[]>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_ALL(params)}`,
    );

    const rawItems = Array.isArray(response.data) ? response.data : [];
    const normalized = rawItems.map((item) => toSpecies(item as TYPE_RAW_SPECIES));

    const matched = sortSpecies(applyFilters(normalized, params), params);

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
  ): Promise<ApiResponse<TYPE_SPECIES_GET_BY_ID_RESPONSE>> => {
    const response = await api.get<ApiResponse<TYPE_RAW_SPECIES>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.GET_BY_ID(id)}`,
    );

    const payload = response.data;
    const raw = (
      Array.isArray(payload) ? payload[0] : payload
    ) as TYPE_RAW_SPECIES;

    const species = toSpecies(raw);

    return {
      success: response.success,
      message: response.message,
      data: {
        items: [
          {
            species_id: species.species_id,
            common_name: species.common_name,
            scientific_name: species.scientific_name,
            conservation_status: species.conservation_status,
            animal_count: species.animal_count ?? 0,
            recent_animals: [],
            created_at: species.created_at,
            updated_at: species.created_at,
          },
        ],
        meta: null,
      },
      errors: response.errors,
    };
  },

  CREATE: async (
    payload: TYPE_SPECIES_CREATE_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES_DETAIL>> => {
    return api.post<ApiResponse<TYPE_SPECIES_DETAIL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.CREATE}`,
      { body: payload },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_SPECIES_UPDATE_PAYLOAD,
  ): Promise<ApiResponse<TYPE_SPECIES_DETAIL>> => {
    return api.put<ApiResponse<TYPE_SPECIES_DETAIL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.UPDATE(id)}`,
      { body: payload },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.SPECIES.DELETE(id)}`,
    );
  },
} as const;