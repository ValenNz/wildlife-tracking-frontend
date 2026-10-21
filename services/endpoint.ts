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
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("users", params),
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
    DEVICES: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("devices", params),
      GET_BY_ID: (id: number) => `/devices/${id}`,
      CREATE: "/devices",
      UPDATE: (id: number) => `/devices/${id}`,
      DELETE: (id: number) => `/devices/${id}`,
    },
    GPS_READINGS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("gps-readings", params),
      GET_BY_ID: (id: number) => `/gps-readings/${id}`,
      GET_BY_ANIMAL: (animalId: number) => `/gps-readings/${animalId}`,
      CREATE: "/gps-readings",
      UPDATE: (id: number) => `/gps-readings/${id}`,
      DELETE: (id: number) => `/gps-readings/${id}`,
    },
    GEO_ZONES: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("geo-zones", params),
      GET_BY_ID: (id: number) => `/geo-zones/${id}`,
      CREATE: "/geo-zones",
      UPDATE: (id: number) => `/geo-zones/${id}`,
      DELETE: (id: number) => `/geo-zones/${id}`,
    },
    INCIDENTS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("incidents", params),
      GET_BY_ID: (id: number) => `/incidents/${id}`,
      CREATE: "/incidents",
      UPDATE: (id: number) => `/incidents/${id}`,
      DELETE: (id: number) => `/incidents/${id}`,
    },
    NOTIFICATIONS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("notifications", params),
      GET_BY_ID: (id: number) => `/notifications/${id}`,
      CREATE: "/notifications",
      UPDATE: (id: number) => `/notifications/${id}`,
      DELETE: (id: number) => `/notifications/${id}`,
    },
    WEATHER_DATA: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("weather-data", params),
      GET_BY_ID: (id: number) => `/weather-data/${id}`,
    },
    AGGREGATE_REPORTS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("aggregate-reports", params),
      GET_BY_ID: (id: number) => `/aggregate-reports/${id}`,
    },
    ACTIVITY_LOG: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("activity-log", params),
      GET_BY_ID: (id: number) => `/activity-log/${id}`,
    },
    EXPORT: {
      GPS_CSV: "/export/gps/csv",
      GPS_GEOJSON: "/export/gps/geojson",
    },
  },
} as const;