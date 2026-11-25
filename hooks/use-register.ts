"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/toast";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { formatApiMessage } from "@/services/api";
import { registerRequest } from "@/services/auth.service";
import type { TYPE_REGISTER_REQUEST } from "@/types/auth.type";

const TOAST_OPTIONS = { position: "bottom-right" } as const;

export const useRegister = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (payload: TYPE_REGISTER_REQUEST): Promise<boolean> => {
    setRegisterError(null);
    setFieldErrors({});

    try {
      const result = await registerRequest(payload);

      if (!result.ok) {
        const firstErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(result.errors ?? {})) {
          if (messages[0]) firstErrors[field] = messages[0];
        }
        setFieldErrors(firstErrors);
        const message = formatApiMessage(result.message, null, "Pendaftaran gagal.");
        setRegisterError(message);
        showToast(message, "error", TOAST_OPTIONS);
        return false;
      }

      showToast(result.message, "success", TOAST_OPTIONS);
      router.replace(getDefaultRouteForRole(result.user.role));
      router.refresh();
      return true;
    } catch {
      const message = "Tidak dapat menghubungi server aplikasi.";
      setRegisterError(message);
      showToast(message, "error", TOAST_OPTIONS);
      return false;
    }
  };

  return { submit, registerError, fieldErrors };
};
