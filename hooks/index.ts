export { useAsyncResource } from "@/hooks/useAsyncResource";
export type { AsyncResource } from "@/hooks/useAsyncResource";

export {
  useAnimalById,
  useAnimals,
  useAllAnimals,
  useCreateAnimal,
  useDeleteAnimal,
  useInfiniteAnimals,
  useUpdateAnimal,
} from "@/hooks/useAnimals";

export {
  useAllSpecies,
  useCreateSpecies,
  useDeleteSpecies,
  useInfiniteSpecies,
  useSpecies,
  useSpeciesById,
  useUpdateSpecies,
} from "@/hooks/useSpecies";

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