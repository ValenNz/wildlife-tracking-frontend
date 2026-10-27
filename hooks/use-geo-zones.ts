
"use client";

import { useQuery } from "@tanstack/react-query";
import { getGeoZones } from "@/services/geo-zone.service";
import type { GeoZoneListParams } from "@/types/geo-zone";

export function useGeoZones(params?: GeoZoneListParams) {
  return useQuery({
    queryKey: ["geo-zones", params],
    queryFn: () => getGeoZones(params),
  });
}
