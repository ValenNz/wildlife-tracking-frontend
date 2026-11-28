"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ROLE_SERVICE } from "@/services/role.service";
import type { TYPE_ROLE_PAYLOAD } from "@/types/role.type";

const ROLES_KEY = ["roles"] as const;

export const useRoles = () =>
  useQuery({ queryKey: ROLES_KEY, queryFn: () => ROLE_SERVICE.GET_ALL() });

export const usePermissions = () =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: () => ROLE_SERVICE.GET_PERMISSIONS(),
    staleTime: Infinity,
  });

export const useRoleCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ROLE_PAYLOAD) => ROLE_SERVICE.CREATE(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};

export const useRoleDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ROLE_SERVICE.DELETE(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};

export const useRolePermissionToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
      enabled,
    }: {
      roleId: number;
      permissionId: number;
      enabled: boolean;
    }) =>
      enabled
        ? ROLE_SERVICE.ATTACH_PERMISSION(roleId, permissionId)
        : ROLE_SERVICE.DETACH_PERMISSION(roleId, permissionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};
