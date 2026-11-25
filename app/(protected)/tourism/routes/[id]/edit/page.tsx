"use client";

import { useParams } from "next/navigation";

import { ErrorState, Loading } from "@/components/ui";
import { useAdminTourRoute } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";

import { RouteForm } from "../../form";

export default function RouteEditPage() {
  const params = useParams<{ id: string }>();
  const routeQuery = useAdminTourRoute(Number(params.id ?? 0));

  if (routeQuery.isLoading) return <Loading />;
  if (routeQuery.error || !routeQuery.data) {
    const error = toApiErrorState(routeQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void routeQuery.refetch()} />;
  }

  return <RouteForm route={routeQuery.data} />;
}
