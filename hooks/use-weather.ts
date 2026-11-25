"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WEATHER_SERVICE } from "@/services/weather.service";
import type { TYPE_WEATHER_PARAMS } from "@/types/weather.type";

const WEATHER_KEY = ["weather-data"] as const;

export const useWeatherData = (params?: TYPE_WEATHER_PARAMS) =>
  useQuery({
    queryKey: [...WEATHER_KEY, params],
    queryFn: () => WEATHER_SERVICE.GET_ALL(params),
  });

export const useWeatherSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limit?: number) => WEATHER_SERVICE.SYNC(limit),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WEATHER_KEY });
    },
  });
};
