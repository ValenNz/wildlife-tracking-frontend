export { ANIMAL_SERVICE } from "@/services/animal.service";
export type { TYPE_ANIMAL_QUERY_PARAMS } from "@/services/animal.service";

export { SPECIES_SERVICE } from "@/services/species.service";
export type { TYPE_SPECIES_QUERY_PARAMS } from "@/services/species.service";

export {
  getDeviceAlerts,
  getTrackingDeviceById,
  getTrackingDevices,
} from "@/services/tracking-device.service";
export {
  getGpsReadings,
  getGpsReadingsByAnimal,
  getGpsReadingsByDevice,
} from "@/services/gps-reading.service";
export { getGeoZones, getRiskZones } from "@/services/geo-zone.service";
export {
  getIncidentReports,
  getPendingSyncReports,
} from "@/services/incident-report.service";
export {
  getNotifications,
  getUnreadNotifications,
} from "@/services/notification.service";
export {
  getDashboardSummary,
  EMPTY_DASHBOARD_SUMMARY,
} from "@/services/dashboard.service";

export { api, ApiError, toApiErrorState, unwrapData } from "@/services/api-client";
export type { HttpMethod, RequestOptions } from "@/services/api-client";
export { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";