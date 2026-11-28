"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/services/api";
import { logoutAction } from "@/services/backend-actions";

type QueryProviderProps = {
  children: ReactNode;
};

let redirecting = false;

const handleUnauthorized = (error: unknown) => {
  if (!(error instanceof ApiError) || error.status !== 401 || redirecting) return;
  redirecting = true;
  void logoutAction()
    .catch(() => undefined)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- muat ulang penuh agar cache data pengguna ikut terhapus
    .finally(() => window.location.assign("/login?reason=expired"));
};

const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 1 && !(error instanceof ApiError && error.status >= 400 && error.status < 500);

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleUnauthorized }),
        mutationCache: new MutationCache({ onError: handleUnauthorized }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: shouldRetry,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
