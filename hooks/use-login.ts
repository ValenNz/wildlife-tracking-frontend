"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/toast";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { loginRequest } from "@/services/auth.service";
import type { TYPE_LOGIN_REQUEST } from "@/types/auth.type";

const LOGIN_TOAST_OPTIONS = { position: "bottom-right" } as const;

export const useLogin = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

  const submit = async (payload: TYPE_LOGIN_REQUEST): Promise<boolean> => {
    setLoginError(null);

    try {
      const result = await loginRequest(payload);

      if (!result.ok) {
        const firstFieldError = Object.values(result.errors ?? {})
          .flat()
          .find((item) => item.trim() !== "");
        const message =
          result.message?.trim() || firstFieldError || "Email atau password salah.";

        setLoginError(message);
        showToast(message, "error", LOGIN_TOAST_OPTIONS);
        return false;
      }

      showToast(result.message, "success", LOGIN_TOAST_OPTIONS);
      router.replace(getDefaultRouteForRole(result.user.role));
      router.refresh();
      return true;
    } catch {
      const message = "Tidak dapat menghubungi server aplikasi.";

      setLoginError(message);
      showToast(message, "error", LOGIN_TOAST_OPTIONS);
      return false;
    }
  };

  return { submit, loginError, setLoginError };
};
