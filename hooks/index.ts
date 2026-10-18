export {
  useAnimal,
  useAnimalById,
  useAnimalCreate,
  useAnimalDelete,
  useInfiniteAnimal,
  useAnimalUpdate,
} from "@/hooks/animal.hook";

export {
  useSpecies,
  useSpeciesById,
  useSpeciesCreate,
  useSpeciesDelete,
  useInfiniteSpecies,
  useSpeciesUpdate,
} from "@/hooks/species.hook";

export {
  useUser,
  useUserById,
  useUserCreate,
  useUserDelete,
  useInfiniteUser,
  useUserUpdate,
} from "@/hooks/user.hook";

export { useAsyncResource } from "@/hooks/useAsyncResource";
export type { AsyncResource } from "@/hooks/useAsyncResource";
export { useTrackingDevice, useTrackingDevices } from "@/hooks/useTrackingDevices";
export {
  useGPSReadings,
  useGPSReadingsByAnimal,
  useGPSReadingsByDevice,
} from "@/hooks/useGPSReadings";
export { useGeoZones } from "@/hooks/useGeoZones";
export { useIncidentReports } from "@/hooks/useIncidentReports";
export { useNotifications } from "@/hooks/useNotifications";
export { useDashboardSummary } from "@/hooks/useDashboardSummary";