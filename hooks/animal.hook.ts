import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ANIMAL_SERVICE } from "@/services/animal.service";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_ANIMAL_PAYLOAD } from "@/types/animal.type";

export const useAnimal = (params?: QUERY_PARAMS_API_GET_ALL) => {
  return useQuery({
    queryKey: ["animals", params],
    queryFn: () => ANIMAL_SERVICE.GET_ALL(params),
  });
};

export const useInfiniteAnimal = (
  params: Omit<QUERY_PARAMS_API_GET_ALL, "page">,
) => {
  return useInfiniteQuery({
    queryKey: ["animals-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      ANIMAL_SERVICE.GET_ALL({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });
};

export const useAnimalById = (id: number) => {
  return useQuery({
    queryKey: ["animals", id],
    queryFn: () => ANIMAL_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useAnimalCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_PAYLOAD) => ANIMAL_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
};

export const useAnimalUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_PAYLOAD) =>
      ANIMAL_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", id] });
    },
  });
};

export const useAnimalDelete = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ANIMAL_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", id] });
    },
  });
};