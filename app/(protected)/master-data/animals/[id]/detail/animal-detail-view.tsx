"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAnimalById } from "@/hooks/useAnimals";
import { useGPSReadingsByAnimal } from "@/hooks/useGPSReadings";
import { useIncidentReports } from "@/hooks/useIncidentReports";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { toApiErrorState } from "@/services/api-client";
import { formatDate } from "@/utils/format";

type AnimalDetailViewProps = {
  animalId: number;
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-zinc-900">{value}</dd>
  </div>
);

export function AnimalDetailView({ animalId }: AnimalDetailViewProps) {
  const router = useRouter();
  const animalQuery = useAnimalById(animalId);
  const readings = useGPSReadingsByAnimal(animalId);
  const incidents = useIncidentReports();

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

  const record = animalQuery.data?.data.items[0];

  if (record === undefined) {
    return (
      <EmptyState
        title={`Satwa dengan ID ${animalId} tidak ditemukan`}
        description="Data tidak tersedia di backend."
        action={{
          label: "Kembali ke daftar",
          onClick: () => router.push("/master-data/animals"),
        }}
      />
    );
  }

  const relatedIncidents = incidents.data.filter(
    (report) => report.location === record.animal_code,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/master-data/animals"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline"
          >
            Kembali ke daftar
          </Link>
          <h2 className="text-2xl font-semibold text-zinc-900">
            {record.animal_code}
          </h2>
          <p className="text-sm text-zinc-600">
            ID {record.animal_id}
            {record.species ? ` · ${record.species.scientific_name}` : ""}
          </p>
        </div>

        <StatusBadge
          label={record.is_active ? "Aktif" : "Tidak Aktif"}
          variant={record.is_active ? "success" : "danger"}
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
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
          value={readings.isEmpty ? "0" : String(readings.data.length)}
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
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Posisi Terakhir
        </h3>

        {readings.error ? (
          <ErrorState
            kind={readings.error.kind}
            message={readings.error.message}
            status={readings.error.status}
            errors={readings.error.errors}
            onRetry={readings.refetch}
          />
        ) : readings.isEmpty ? (
          <EmptyState
            title="Belum ada pembacaan GPS"
            description="Collar untuk satwa ini belum mengirim posisi."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {readings.data.slice(0, 5).map((reading) => (
              <li
                key={reading.reading_id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="tabular-nums text-zinc-800">
                  {Number(reading.latitude).toFixed(5)},{" "}
                  {Number(reading.longitude).toFixed(5)}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDate(reading.recorded_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}