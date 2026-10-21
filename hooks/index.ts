export {
  useAnimals,
  useAnimalById,
  useAnimalCreate,
  useAnimalDelete,
  useInfiniteAnimals,
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

export {
  useTrackingDevices,
  useTrackingDeviceById,
  useInfiniteTrackingDevices,
  useDeviceAlerts,
} from "@/hooks/tracking-device.hook";

export {
  useNotifications,
  useNotificationById,
  useInfiniteNotifications,
  useUnreadNotifications,
} from "@/hooks/notification.hook";

export {
  useGpsReadings,
  useGpsReadingsByAnimal,
  useGpsReadingsByDevice,
  useInfiniteGpsReadings,
} from "@/hooks/gps-reading.hook";

export {
  useIncidentReports,
  useIncidentReportById,
  useInfiniteIncidentReports,
  usePendingSyncReports,
} from "@/hooks/incident-report.hook";

export { useDashboardSummary } from "@/hooks/dashboard.hook";

export { useDebounce } from "@/hooks/use-debounce";