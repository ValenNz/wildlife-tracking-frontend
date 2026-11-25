"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAnimalById } from "@/hooks/use-animals";
import { useGpsReadingsByAnimal } from "@/hooks/use-tracking";
import { useIncidentReports } from "@/hooks/use-incidents";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/status";
import { toApiErrorState } from "@/services/api";
import { formatDate } from "@/utils/format";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { AnimalInsights } from "./animal-insights";

export default function AnimalDetailPage() {
  const userRole = useUserRole();
  const canManage = userRole ? roleHasPermission(userRole, "manage_master_data") : false;
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const animalId = typeof rawId === "string" ? Number(rawId) : Number.NaN;

  if (!Number.isInteger(animalId) || animalId <= 0) notFound();

  const router = useRouter();
  const animalQuery = useAnimalById(animalId);
  const { data: readingsData, error: readingsError, refetch: readingsRefetch } = useGpsReadingsByAnimal(animalId);
  const { data: incidentsData } = useIncidentReports();

  if (animalQuery.isPending) {
    return <Loading label="Memuat detail satwa..." />;
  }

  if (animalQuery.isError) {
    const error = toApiErrorState(animalQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void animalQuery.refetch()}
      />
    );
  }

  const record = animalQuery.data?.data?.items;

  if (record === undefined || record === null) {
    return (
      <EmptyState
        title={`Satwa dengan ID ${animalId} tidak ditemukan`}
        description="Data tidak tersedia di backend."
        action={{
          label: "Kembali ke daftar",
          onClick: () => router.push("/animals"),
        }}
      />
    );
  }

  const relatedIncidents = (incidentsData?.data ?? []).filter(
    (report) => report.animal_code === record.animal_code,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/animals"
            className="text-xs font-medium text-muted underline-offset-2 hover:underline"
          >
            Kembali ke daftar
          </Link>
          <h2 className="text-2xl font-semibold text-ink">
            {record.animal_code}
          </h2>
          <p className="text-sm text-ink-soft">
            ID {record.animal_id}
            {record.species ? ` · ${record.species.scientific_name}` : ""}
          </p>
        </div>

        <StatusBadge
          label={record.is_active ? "Aktif" : "Tidak Aktif"}
          variant={record.is_active ? "success" : "danger"}
        />
      </div>

      <section className="ui-panel p-5">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <DetailField label="Kode Satwa" value={record.animal_code} />
          <DetailField
            label="Spesies"
            value={record.species?.common_name ?? `Spesies #${record.species_id}`}
          />
          <DetailField label="Jenis Kelamin" value={record.gender} />
          <DetailField
            label="Tanggal Lahir"
            value={record.birth_date ? formatDate(record.birth_date) : "-"}
          />
        </dl>
      </section>

      <section aria-label="Data terkait" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Pembacaan GPS"
          value={readingsData?.data?.length === 0 ? "0" : String(readingsData?.data?.length ?? 0)}
          hint="Total posisi tercatat"
        />
        <StatCard
          label="Laporan Insiden"
          value={String(relatedIncidents.length)}
          hint="Dilaporkan untuk satwa ini"
        />
        <StatCard
          label="Status Konservasi"
          value={record.species?.conservation_status ?? "-"}
          hint={record.species?.common_name ?? "Data spesies tidak tersedia"}
          tone={
            record.species?.conservation_status === "Critically Endangered"
              ? "warning"
              : "neutral"
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Posisi Terakhir
        </h3>

        {readingsError ? (
          <ErrorState
            kind={toApiErrorState(readingsError).kind}
            message={toApiErrorState(readingsError).message}
            status={toApiErrorState(readingsError).status}
            errors={toApiErrorState(readingsError).errors}
            onRetry={readingsRefetch}
          />
        ) : !readingsData?.data?.length ? (
          <EmptyState
            title="Belum ada pembacaan GPS"
            description="Collar untuk satwa ini belum mengirim posisi."
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden ui-panel">
            {readingsData?.data?.slice(0, 5).map((reading) => (
              <li
                key={reading.reading_id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="tabular-nums text-ink-soft">
                  {Number(reading.latitude).toFixed(5)},{" "}
                  {Number(reading.longitude).toFixed(5)}
                </span>
                <span className="text-xs text-muted">
                  {formatDate(reading.recorded_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AnimalInsights animalId={animalId} canManage={canManage} />
    </div>
  );
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-0.5 text-sm text-ink">{value}</dd>
  </div>
);
