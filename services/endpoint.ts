import { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";

const buildListQuery = (params: Partial<QUERY_PARAMS_API_GET_ALL>): string => {
  const query = new URLSearchParams();

  query.set("order", params.order ?? "asc");

  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.per_page !== undefined) query.set("per_page", String(params.per_page));
  if (params.orderBy !== undefined) query.set("orderBy", params.orderBy);
  if (params.search !== undefined && params.search !== "") {
    query.set("search", params.search);
  }

  return query.toString();
};

export const API_ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/me",
  },
  WILDLIFE: {
    ANIMALS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        `/animals${params ? `?${buildListQuery(params)}` : ""}`,
      GET_BY_ID: (id: number) => `/animals/${id}`,
      CREATE: "/animals",
      UPDATE: (id: number) => `/animals/${id}`,
      DELETE: (id: number) => `/animals/${id}`,
    },
    SPECIES: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        `/species${params ? `?${buildListQuery(params)}` : ""}`,
      GET_BY_ID: (id: number) => `/species/${id}`,
      CREATE: "/species",
      UPDATE: (id: number) => `/species/${id}`,
      DELETE: (id: number) => `/species/${id}`,
    },
  },
} as const;

export const WILDLIFE_BASE_PATH = "/api/wildlife";