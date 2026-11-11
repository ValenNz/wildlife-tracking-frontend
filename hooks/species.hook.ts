
import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { SPECIES_SERVICE } from "@/services/species.service";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";

export const useSpecies = (params?: QUERY_PARAMS_API_GET_ALL) => {
  return useQuery({
    queryKey: ["species", params],
    queryFn: () => SPECIES_SERVICE.GET_ALL(params),
  });
};

export const useInfiniteSpecies = (
  params: Omit<QUERY_PARAMS_API_GET_ALL, "page">,
) => {
  return useInfiniteQuery({
    queryKey: ["species-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      SPECIES_SERVICE.GET_ALL({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });
};

export const useSpeciesById = (id: number) => {
  return useQuery({
    queryKey: ["species", id],
    queryFn: () => SPECIES_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};
