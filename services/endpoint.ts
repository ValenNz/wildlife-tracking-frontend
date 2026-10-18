import { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";

const buildListQuery = (params?: Partial<QUERY_PARAMS_API_GET_ALL>): string => {
  if (!params) return "";

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

const listPath = (
  resource: string,
  params?: Partial<QUERY_PARAMS_API_GET_ALL>,
): string => {
  const query = buildListQuery(params);

  return `/${resource}${query ? `?${query}` : ""}`;
};

export const WILDLIFE_BASE_PATH = "/api/wildlife";

export const API_ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/me",
  },
  WILDLIFE: {
    USER: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) => listPath("users", params),
      GET_BY_ID: (id: number) => `/users/${id}`,
      CREATE: "/users",
      UPDATE: (id: number) => `/users/${id}`,
      DELETE: (id: number) => `/users/${id}`,
    },
    SPECIES: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("species", params),
      GET_BY_ID: (id: number) => `/species/${id}`,
      CREATE: "/species",
      UPDATE: (id: number) => `/species/${id}`,
      DELETE: (id: number) => `/species/${id}`,
    },
    ANIMALS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("animals", params),
      GET_BY_ID: (id: number) => `/animals/${id}`,
      CREATE: "/animals",
      UPDATE: (id: number) => `/animals/${id}`,
      DELETE: (id: number) => `/animals/${id}`,
    },
  },
} as const;