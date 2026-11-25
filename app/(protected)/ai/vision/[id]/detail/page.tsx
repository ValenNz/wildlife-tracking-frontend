"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AiPredictionResult } from "../../ai-prediction-result";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { useAiPrediction } from "@/hooks/use-ai";
import { toApiErrorState } from "@/services/api";
import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { formatDate } from "@/utils/format";

export default function AiPredictionDetailPage() {
  const userRole = useUserRole();
  const canVerify = userRole ? roleHasPermission(userRole, "verify_ai") : false;
  const canDelete = userRole ? roleHasPermission(userRole, "delete_data") : false;
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const predictionId = Number(params.id);

  if (!Number.isFinite(predictionId) || predictionId <= 0) {
    notFound();
  }

  const predictionQuery = useAiPrediction(predictionId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Vision"
        title={`Detail Prediksi #${predictionId}`}
        description="Hasil analisis model AI beserta status verifikasi manusia."
        actions={
          <Link
            href="/ai/vision/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Kembali ke riwayat
          </Link>
        }
      />

      {predictionQuery.isPending ? (
        <Loading label="Memuat detail prediksi AI..." />
      ) : predictionQuery.isError ? (
        <ErrorState
          kind={toApiErrorState(predictionQuery.error).kind}
          message={toApiErrorState(predictionQuery.error).message}
          status={toApiErrorState(predictionQuery.error).status}
          errors={toApiErrorState(predictionQuery.error).errors}
          onRetry={() => void predictionQuery.refetch()}
        />
      ) : !predictionQuery.data?.data ? (
        <EmptyState
          title={`Prediksi #${predictionId} tidak ditemukan`}
          description="Data prediksi tidak tersedia di backend."
        />
      ) : (
        <>
          <AiPredictionResult
            prediction={predictionQuery.data.data}
            canVerify={canVerify}
            canDelete={canDelete}
            onVerified={() => void predictionQuery.refetch()}
            onDeleted={() => router.push("/ai/vision/history")}
          />

          <section className="ui-panel p-5">
            <h3 className="text-sm font-semibold text-ink">Informasi Unggahan</h3>
            <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <DetailField
                label="Media ID"
                value={String(predictionQuery.data.data.media_id)}
              />
              <DetailField
                label="Jenis Media"
                value={predictionQuery.data.data.media?.media_type ?? "-"}
              />
              <DetailField
                label="Diunggah Oleh"
                value={
                  predictionQuery.data.data.media?.uploader?.full_name ??
                  predictionQuery.data.data.media?.uploader?.name ??
                  predictionQuery.data.data.media?.uploader?.username ??
                  `User #${predictionQuery.data.data.media?.uploaded_by ?? "-"}`
                }
              />
              <DetailField
                label="Waktu Unggah"
                value={formatDate(predictionQuery.data.data.media?.uploaded_at)}
              />
            </dl>
          </section>
        </>
      )}
    </div>
  );
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="font-medium uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-ink">{value}</dd>
  </div>
);
