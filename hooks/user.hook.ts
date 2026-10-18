import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { USER_SERVICE } from "@/services/user.service";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_USER_PAYLOAD } from "@/types/user.type";

export const useUser = (params?: QUERY_PARAMS_API_GET_ALL) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => USER_SERVICE.GET_ALL(params),
  });
};

export const useInfiniteUser = (
  params: Omit<QUERY_PARAMS_API_GET_ALL, "page">,
) => {
  return useInfiniteQuery({
    queryKey: ["users-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      USER_SERVICE.GET_ALL({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });
};

export const useUserById = (id: number) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => USER_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useUserCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_USER_PAYLOAD) => USER_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_USER_PAYLOAD) => USER_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
};

export const useUserDelete = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => USER_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
};