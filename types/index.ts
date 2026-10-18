export type {
  ApiResponse,
  ApiValidationErrorResponse,
  ApiErrorKind,
  ApiErrorState,
} from "@/types/api.type";

export { resolveErrorKind, isApiErrorState } from "@/types/api.type";

export type {
  QUERY_PARAMS_API_GET_ALL,
  QUERY_PARAMS_API_GET_ALL_FILTERS,
  TYPE_ORDER_DIRECTION,
  TYPE_MUTATION_RESULT,
} from "@/types/endpoint.type";

export type { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_CREATE_PAYLOAD,
  TYPE_ANIMAL_DETAIL,
  TYPE_ANIMAL_GENDER,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_LIST_PARAMS,
  TYPE_ANIMAL_UPDATE_PAYLOAD,
} from "@/types/wildlife/animal.type";

export type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
  TYPE_SPECIES_CREATE_PAYLOAD,
  TYPE_SPECIES_DETAIL,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
  TYPE_SPECIES_LIST_PARAMS,
  TYPE_SPECIES_SUMMARY,
  TYPE_SPECIES_UPDATE_PAYLOAD,
} from "@/types/wildlife/species.type";

export type { DashboardSummary } from "@/types/dashboard";
export type { TYPE_META_PAGGINATION as TYPE_META } from "@/types/meta.type";

export type { DeviceAlert, TrackingDevice } from "@/types/tracking-device";
export type { GpsReading } from "@/types/gps-reading";
export type { GeoZone } from "@/types/geo-zone";
export type { IncidentReport } from "@/types/incident-report";
export type { Notification } from "@/types/notification";
export type { User, UserRole } from "@/types/user";
export { ROLE_LABELS } from "@/types/user";