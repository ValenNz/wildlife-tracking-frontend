"use client";

import { useCallback, useEffect, useState } from "react";
import { toApiErrorState } from "@/services/api-client";
import type { ApiErrorState } from "@/types/api.type";

export type AsyncResource<T> = {
  data: T;
  error: ApiErrorState | null;
  isLoading: boolean;
  isEmpty: boolean;
  refetch: () => void;
};

type ResourceState<T> = {
  requestId: number;
  data: T;
  error: ApiErrorState | null;
  isSettled: boolean;
};

const isEmptyCollection = (value: unknown): boolean =>
  Array.isArray(value) && value.length === 0;

export const useAsyncResource = <T>(
  load: () => Promise<T>,
  initialData: T,
  isEmpty?: (data: T) => boolean,
): AsyncResource<T> => {
  const [requestId, setRequestId] = useState<number>(0);
  const [state, setState] = useState<ResourceState<T>>({
    requestId: 0,
    data: initialData,
    error: null,
    isSettled: false,
  });

  const refetch = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    load().then(
      (result) => {
        if (!isActive) return;
        setState({ requestId, data: result, error: null, isSettled: true });
      },
      (reason: unknown) => {
        if (!isActive) return;
        setState({
          requestId,
          data: initialData,
          error: toApiErrorState(reason),
          isSettled: true,
        });
      },
    );

    return () => {
      isActive = false;
    };
  }, [load, initialData, requestId]);

  const isCurrent = state.requestId === requestId;
  const data = isCurrent ? state.data : initialData;
  const isSettled = isCurrent && state.isSettled;
  const isEmptyData = isEmptyCollection(data) || (isEmpty?.(data) ?? false);

  return {
    data,
    error: isCurrent ? state.error : null,
    isLoading: !isSettled,
    isEmpty: isSettled && isEmptyData,
    refetch,
  };
};