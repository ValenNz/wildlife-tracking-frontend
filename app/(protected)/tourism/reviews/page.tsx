"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { useToast } from "@/components/toast";
import { ErrorState, PageHeader } from "@/components/ui";
import { useAdminReviews, useReviewVisibility } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";

import { getReviewColumns } from "./column";

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const reviewsQuery = useAdminReviews();
  const visibilityMutation = useReviewVisibility();
  const columns = useMemo(
    () =>
      getReviewColumns({
        onToggle: (review) =>
          visibilityMutation.mutate(
            { id: review.review_id, isVisible: !review.is_visible },
            {
              onSuccess: (response) => showToast(response?.message ?? "Ulasan diperbarui.", "success"),
              onError: (error) => showToast(formatApiError(error, "Gagal memperbarui ulasan."), "error"),
            },
          ),
      }),
    [visibilityMutation, showToast],
  );

  if (reviewsQuery.error) {
    const error = toApiErrorState(reviewsQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void reviewsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title="Moderasi Ulasan"
        description="Ulasan hanya dapat ditulis pengunjung yang sudah check-in. Sembunyikan ulasan yang berisi data pribadi, SARA, atau spam."
      />
      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={reviewsQuery.data ?? []} columns={columns} loading={reviewsQuery.isLoading} getRowId={(row) => String(row.review_id)} label="ulasan" emptyTitle="Belum ada ulasan" />
      </section>
    </div>
  );
}
