
import type { GpsReading } from "@/types/gps-reading";

export const DUMMY_GPS_READINGS: GpsReading[] = [
  {
    reading_id: 1,
    device_id: 1,
    latitude: 3.55,
    longitude: 97.35,
    recorded_at: "2026-10-27T10:00:00",
    altitude_meters: 850,
    accuracy_meters: 5,
    checksum: "SIM-GPS-001",
    trackingDevice: {
      device_id: 1,
      model: "GPS Collar V2",
      animal: {
        animal_id: 1,
        name: "Orangutan Sumatra",
      },
    },
  },
  {
    reading_id: 2,
    device_id: 2,
    latitude: 3.6,
    longitude: 97.4,
    recorded_at: "2026-10-27T10:05:00",
    altitude_meters: 920,
    accuracy_meters: 8,
    checksum: "SIM-GPS-002",
    trackingDevice: {
      device_id: 2,
      model: "GPS Collar V2",
      animal: {
        animal_id: 2,
        name: "Harimau Sumatra",
      },
    },
  },
  {
    reading_id: 3,
    device_id: 3,
    latitude: 3.5,
    longitude: 97.3,
    recorded_at: "2026-10-27T10:10:00",
    altitude_meters: 780,
    accuracy_meters: 6,
    checksum: "SIM-GPS-003",
    trackingDevice: {
      device_id: 3,
      model: "GPS Collar V1",
      animal: {
        animal_id: 3,
        name: "Badak Sumatra",
      },
    },
  },
  {
    reading_id: 4,
    device_id: 1,
    latitude: 3.551,
    longitude: 97.351,
    recorded_at: "2026-10-27T10:15:00",
    altitude_meters: 852,
    accuracy_meters: 5,
    checksum: "SIM-GPS-004",
    trackingDevice: {
      device_id: 1,
      model: "GPS Collar V2",
      animal: {
        animal_id: 1,
        name: "Orangutan Sumatra",
      },
    },
  },
  {
    reading_id: 5,
    device_id: 2,
    latitude: 3.602,
    longitude: 97.402,
    recorded_at: "2026-10-27T10:20:00",
    altitude_meters: 922,
    accuracy_meters: 7,
    checksum: "SIM-GPS-005",
    trackingDevice: {
      device_id: 2,
      model: "GPS Collar V2",
      animal: {
        animal_id: 2,
        name: "Harimau Sumatra",
      },
    },
  },
];

export const getDummyGpsReadings = (): GpsReading[] =>
  [...DUMMY_GPS_READINGS].sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() -
      new Date(a.recorded_at).getTime(),
  );
