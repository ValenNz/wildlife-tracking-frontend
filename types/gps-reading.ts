export type GpsReading = {
  reading_id: number;
  device_id: number;
  latitude: number | string;
  longitude: number | string;
  recorded_at: string;
  altitude_meters: number | string | null;
  accuracy_meters: number | string | null;
  checksum: string | null;
  trackingDevice?: {
    device_id: number;
    model: string;
    animal?: {
      animal_id: number;
      name: string;
    } | null;
  } | null;
};

export type GpsCoordinate = {
  latitude: number;
  longitude: number;
};

export type GpsReadingListParams = {
  animalId?: number;
  deviceId?: number;
  limit?: number;
};