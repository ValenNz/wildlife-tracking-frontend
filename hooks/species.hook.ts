import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SPECIES_SERVICE } from "@/services/species.service";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_SPECIES_PAYLOAD } from "@/types/species.type";

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

export const useSpeciesCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_SPECIES_PAYLOAD) => SPECIES_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
    },
  });
};

export const useSpeciesUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_SPECIES_PAYLOAD) =>
      SPECIES_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
      queryClient.invalidateQueries({ queryKey: ["species", id] });
    },
  });
};

export const useSpeciesDelete = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SPECIES_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["species"] });
      queryClient.invalidateQueries({ queryKey: ["species", id] });
    },
  });
};