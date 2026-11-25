"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PROFILE_SERVICE } from "@/services/profile.service";
import type { TYPE_PASSWORD_PAYLOAD, TYPE_PROFILE_PAYLOAD } from "@/types/user.type";

const PROFILE_KEY = ["profile"] as const;

export const useProfile = () =>
  useQuery({ queryKey: PROFILE_KEY, queryFn: () => PROFILE_SERVICE.GET() });

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_PROFILE_PAYLOAD) => PROFILE_SERVICE.UPDATE(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
};

export const usePasswordChange = () =>
  useMutation({
    mutationFn: (payload: TYPE_PASSWORD_PAYLOAD) => PROFILE_SERVICE.CHANGE_PASSWORD(payload),
  });
