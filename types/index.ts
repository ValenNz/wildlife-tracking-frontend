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
  TYPE_USER,
  TYPE_USER_GET_ALL_RESPONSE,
  TYPE_USER_GET_BY_ID_RESPONSE,
  TYPE_USER_PAYLOAD,
  TYPE_USER_ROLE,
  TYPE_LOGIN_PAYLOAD,
  TYPE_LOGIN_RESULT,
  TYPE_LOGIN_RESPONSE_DATA,
} from "@/types/user.type";

export { TYPE_ROLE_LABELS } from "@/types/user.type";

export type {
  TYPE_SPECIES,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_GET_BY_ID_RESPONSE,
  TYPE_SPECIES_PAYLOAD,
  TYPE_CONSERVATION_STATUS,
} from "@/types/species.type";

export {
  TYPE_CONSERVATION_STATUS_LABELS,
  TYPE_CONSERVATION_STATUSES,
} from "@/types/species.type";

export type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_PAYLOAD,
  TYPE_ANIMAL_GENDER,
} from "@/types/animal.type";

export {
  TYPE_ANIMAL_GENDER_LABELS,
  TYPE_ANIMAL_GENDER_GLYPHS,
} from "@/types/animal.type";

export type { DashboardSummary } from "@/types/dashboard";
export type { DeviceAlert, TrackingDevice } from "@/types/tracking-device.type";
export type { GpsReading } from "@/types/gps-reading";
export type { GeoZone } from "@/types/geo-zone";
export type { IncidentReport } from "@/types/incident-report";
export type { Notification } from "@/types/notification";