"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { USER_SERVICE } from "@/services/user.service";
import type {
  TYPE_USER_ACCOUNT_PARAMS,
  TYPE_USER_ACCOUNT_PAYLOAD,
  TYPE_USER_STATUS,
} from "@/types/user.type";

const USERS_KEY = ["users"] as const;

export const useUsers = (params?: TYPE_USER_ACCOUNT_PARAMS) =>
  useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => USER_SERVICE.GET_ALL(params),
  });

export const useUserById = (id: number) =>
  useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => USER_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useUserTokens = (id: number) =>
  useQuery({
    queryKey: [...USERS_KEY, id, "tokens"],
    queryFn: () => USER_SERVICE.GET_TOKENS(id),
    enabled: id > 0,
  });

export const useUserActivity = (id: number) =>
  useQuery({
    queryKey: [...USERS_KEY, id, "activity"],
    queryFn: () => USER_SERVICE.GET_ACTIVITY(id),
    enabled: id > 0,
  });

const useUserMutation = <TVariables,>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useUserCreate = () =>
  useUserMutation((payload: TYPE_USER_ACCOUNT_PAYLOAD) => USER_SERVICE.CREATE(payload));

export const useUserUpdate = (id: number) =>
  useUserMutation((payload: Partial<TYPE_USER_ACCOUNT_PAYLOAD>) => USER_SERVICE.UPDATE(id, payload));

export const useUserStatusUpdate = () =>
  useUserMutation(({ id, status }: { id: number; status: TYPE_USER_STATUS }) =>
    USER_SERVICE.UPDATE_STATUS(id, status),
  );

export const useUserDelete = () => useUserMutation((id: number) => USER_SERVICE.DELETE(id));

export const useUserTokenRevoke = (id: number) =>
  useUserMutation((tokenId: number) => USER_SERVICE.REVOKE_TOKEN(id, tokenId));
