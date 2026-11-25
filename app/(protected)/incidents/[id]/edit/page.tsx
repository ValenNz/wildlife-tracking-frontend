"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { useToast } from "@/components/toast";
import { Button } from "@/components/button";
import {
  FormActions,
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  TextArea,
  SelectInput,
  TextInput,
} from "@/components/form";
import {
  useIncidentReportById,
  useIncidentReportUpdate,
} from "@/hooks/use-incidents";
import { useAnimals } from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import {
  firstIssueMessage,
  issuesToFieldErrors,
  stringOrEmpty,
  toOptionalNumber,
  type FormErrors,
} from "@/lib/form";
import {
  formatApiError,
  getApiFieldErrors,
  toApiErrorState,
} from "@/services/api";
import {
  INCIDENT_STATUSES, INCIDENT_STATUS_LABELS,
  INCIDENT_TYPES,
  INCIDENT_TYPE_LABELS,
  type UpdateIncidentReportPayload,
} from "@/types/incident.type";

import { IncidentAttachments } from "./incident-attachments";

type IncidentFormState = {
  incident_type: string;
  description: string;
  timestamp: string;
  latitude: string;
  longitude: string;
  location: string;
  animal_id: string;
  species_id: string;
  status: string;
};

type FieldName = keyof IncidentFormState;

const INCIDENT_FIELDS: FieldName[] = [
  "incident_type",
  "description",
  "timestamp",
  "latitude",
  "longitude",
  "location",
  "animal_id",
  "species_id",
  "status",
];

const INCIDENT_TYPE_OPTIONS = INCIDENT_TYPES.map((value) => ({
  label: INCIDENT_TYPE_LABELS[value],
  value,
}));

const STATUS_OPTIONS = INCIDENT_STATUSES;

const defaultTimestamp = (): string =>
  new Date().toISOString().slice(0, 16);

const incidentSchema = z.object({
  incident_type: z
    .string()
    .trim()
    .min(1, "Jenis insiden wajib diisi.")
    .max(100, "Jenis insiden maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi insiden wajib diisi.")
    .max(5000, "Deskripsi maksimal 5000 karakter."),
  timestamp: z
    .string()
    .min(1, "Waktu kejadian wajib diisi.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Format waktu kejadian tidak valid.")
    .refine(
      (value) => new Date(value).getTime() <= Date.now() + 5 * 60 * 1000,
      "Waktu kejadian tidak boleh lebih dari 5 menit ke depan.",
    ),
  latitude: z
    .string()
    .trim()
    .min(1, "Latitude wajib diisi.")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= -90 && parsed <= 90;
    }, "Latitude harus antara -90 dan 90."),
  longitude: z
    .string()
    .trim()
    .min(1, "Longitude wajib diisi.")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= -180 && parsed <= 180;
    }, "Longitude harus antara -180 dan 180."),
  location: z
    .string()
    .trim()
    .max(200, "Lokasi maksimal 200 karakter."),
  animal_id: z.string(),
  species_id: z.string(),
  status: z
    .string()
    .trim()
    .min(1, "Status insiden wajib diisi.")
    .max(50, "Status maksimal 50 karakter."),
});

export default function IncidentEditPage() {
  const userRole = useUserRole();
  const canUpload = userRole ? roleHasPermission(userRole, "create_data") : false;
  const canSync = userRole ? roleHasPermission(userRole, "delete_data") : false;
  const params = useParams<{ id: string }>();
  const recordId = Number(params.id);

  if (!Number.isInteger(recordId) || recordId <= 0) notFound();

  const router = useRouter();
  const detailQuery = useIncidentReportById(recordId);
  const record = detailQuery.data?.data ?? null;
  const queryError = detailQuery.isError
    ? toApiErrorState(detailQuery.error)
    : null;
  const { showToast } = useToast();
  const updateMutation = useIncidentReportUpdate(recordId);
  const animalsQuery = useAnimals();
  const speciesQuery = useSpecies();

  const animals = animalsQuery.data?.data?.items ?? [];
  const species = speciesQuery.data?.data?.items ?? [];

  const initialForm = useMemo<IncidentFormState>(
    () => ({
      incident_type: record?.incident_type ?? "observasi",
      description: record?.description ?? "",
      timestamp: record
        ? stringOrEmpty(record.timestamp).slice(0, 16)
        : defaultTimestamp(),
      latitude: stringOrEmpty(record?.latitude),
      longitude: stringOrEmpty(record?.longitude),
      location: stringOrEmpty(record?.location),
      animal_id: stringOrEmpty(record?.animal_id),
      species_id: stringOrEmpty(record?.species_id),
      status: stringOrEmpty(record?.status) || "pending",
    }),
    [record],
  );
  const [overrides, setOverrides] = useState<Partial<IncidentFormState>>({});
  const form = useMemo(
    () => ({ ...initialForm, ...overrides }),
    [initialForm, overrides],
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors<FieldName>>({});

  const isPending = updateMutation.isPending;
  const relatedPending = animalsQuery.isPending || speciesQuery.isPending;
  const relatedError =
    animalsQuery.isError || speciesQuery.isError
      ? "Data satwa atau spesies tidak dapat dimuat."
      : undefined;
  const summaryMessage =
    validationError ??
    (updateMutation.error
      ? formatApiError(
          updateMutation.error,
          "Gagal menyimpan laporan insiden. Silakan coba lagi.",
        )
      : null);

  const setField = <K extends FieldName>(
    key: K,
    value: IncidentFormState[K],
  ) => {
    setOverrides((previous) => ({ ...previous, [key]: value }));
    setValidationError(null);
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    setValidationError(null);
    setFieldErrors({});

    if (relatedPending || relatedError) {
      setValidationError(
        relatedError ?? "Data pendukung masih dimuat. Silakan tunggu.",
      );
      return;
    }

    const parsed = incidentSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, INCIDENT_FIELDS));
      setValidationError(
        firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."),
      );
      return;
    }

    const animalId = toOptionalNumber(parsed.data.animal_id);
    const speciesId = toOptionalNumber(parsed.data.species_id);

    if (animalId !== undefined && !animals.some((item) => item.animal_id === animalId)) {
      setValidationError("Satwa yang dipilih tidak valid.");
      return;
    }

    if (
      speciesId !== undefined &&
      !species.some((item) => item.species_id === speciesId)
    ) {
      setValidationError("Spesies yang dipilih tidak valid.");
      return;
    }

    const payload: UpdateIncidentReportPayload = {
      incident_type: parsed.data.incident_type,
      description: parsed.data.description,
      timestamp: parsed.data.timestamp,
      latitude: Number(parsed.data.latitude),
      longitude: Number(parsed.data.longitude),
      location: parsed.data.location || null,
      status: parsed.data.status,
      ...(animalId !== undefined ? { animal_id: animalId } : {}),
      ...(speciesId !== undefined ? { species_id: speciesId } : {}),
    };

    try {
      await updateMutation.mutateAsync(payload);
      showToast("Laporan insiden berhasil diperbarui.", "success");

      router.push("/incidents");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
      showToast(
        formatApiError(
          error,
          "Gagal menyimpan laporan insiden. Silakan coba lagi.",
        ),
        "error",
      );
    }
  };

  const relatedDisabled = relatedPending || relatedError !== undefined || isPending;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operasional"
        title="Ubah Laporan Insiden"
        description="Dokumentasikan insiden lapangan dan hubungkan dengan data satwa terkait."
        className="mb-4"
        actions={
          <Link
            href="/incidents"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        }
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">
        {queryError ? (
          <ErrorState
            kind={queryError.kind}
            message={queryError.message}
            status={queryError.status}
            errors={queryError.errors}
            onRetry={() => void detailQuery.refetch()}
          />
        ) : !detailQuery.isPending && !detailQuery.isError && record === null ? (
          <EmptyState
            title="Laporan insiden tidak ditemukan"
            description="Data tidak tersedia di backend."
          />
        ) : detailQuery.isPending ? (
          <Loading label="Memuat laporan insiden..." />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
        <FormSection
          title="Detail Insiden"
          description="Catat waktu, jenis, status, dan lokasi kejadian di lapangan."
        >
          <FormGrid>
            <FormField
              label="Jenis Insiden"
              htmlFor="incident-type"
              required
              error={fieldErrors.incident_type}
              hint="Pilih salah satu atau ketik jenis insiden lain yang sesuai."
            >
              <TextInput
                id="incident-type"
                required
                list="incident-type-options"
                maxLength={100}
                value={form.incident_type}
                onChange={(event) =>
                  setField("incident_type", event.target.value)
                }
                placeholder="Contoh: konflik"
                invalid={fieldErrors.incident_type !== undefined}
                disabled={isPending}
              />
              <datalist id="incident-type-options">
                {INCIDENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </datalist>
            </FormField>

            <FormField
              label="Waktu Kejadian"
              htmlFor="incident-timestamp"
              required
              error={fieldErrors.timestamp}
            >
              <TextInput
                id="incident-timestamp"
                type="datetime-local"
                required
                value={form.timestamp}
                onChange={(event) => setField("timestamp", event.target.value)}
                invalid={fieldErrors.timestamp !== undefined}
                disabled={isPending}
              />
            </FormField>

            <FormField
              label="Status Insiden"
              htmlFor="incident-status"
              required
              error={fieldErrors.status}
              hint="Status baku: Menunggu, Diselidiki, Selesai, atau Ditolak."
            >
              <SelectInput
                id="incident-status"
                value={form.status}
                onChange={(event) => setField("status", event.target.value)}
                invalid={fieldErrors.status !== undefined}
                disabled={isPending}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {INCIDENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField
              label="Lokasi Kejadian"
              htmlFor="incident-location"
              required
              error={fieldErrors.location}
            >
              <TextInput
                id="incident-location"
                required
                maxLength={200}
                value={form.location}
                onChange={(event) => setField("location", event.target.value)}
                placeholder="Contoh: Desa Bukit Lawang"
                invalid={fieldErrors.location !== undefined}
                disabled={isPending}
              />
            </FormField>

            <FormField
              label="Latitude"
              htmlFor="incident-latitude"
              required
              error={fieldErrors.latitude}
            >
              <TextInput
                id="incident-latitude"
                type="number"
                inputMode="decimal"
                step="any"
                min={-90}
                max={90}
                required
                value={form.latitude}
                onChange={(event) => setField("latitude", event.target.value)}
                placeholder="Contoh: 3.650000"
                invalid={fieldErrors.latitude !== undefined}
                disabled={isPending}
              />
            </FormField>

            <FormField
              label="Longitude"
              htmlFor="incident-longitude"
              required
              error={fieldErrors.longitude}
            >
              <TextInput
                id="incident-longitude"
                type="number"
                inputMode="decimal"
                step="any"
                min={-180}
                max={180}
                required
                value={form.longitude}
                onChange={(event) => setField("longitude", event.target.value)}
                placeholder="Contoh: 98.100000"
                invalid={fieldErrors.longitude !== undefined}
                disabled={isPending}
              />
            </FormField>
          </FormGrid>

          <FormField
            label="Deskripsi"
            htmlFor="incident-description"
            required
            error={fieldErrors.description}
            hint="Jelaskan kronologi, dampak, dan tindakan awal yang dilakukan."
          >
            <TextArea
              id="incident-description"
              required
              rows={5}
              maxLength={5000}
              value={form.description}
              onChange={(event) =>
                setField("description", event.target.value)
              }
              placeholder="Tuliskan detail kejadian..."
              invalid={fieldErrors.description !== undefined}
              disabled={isPending}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Data Terkait"
          description="Hubungkan laporan dengan satwa dan spesies yang terlibat jika tersedia."
        >
          <FormGrid>
            <FormField
              label="Satwa Terkait"
              htmlFor="incident-animal"
              error={fieldErrors.animal_id ?? relatedError}
              hint={animalsQuery.isPending ? "Memuat daftar satwa..." : undefined}
            >
              <select
                id="incident-animal"
                value={form.animal_id}
                onChange={(event) => setField("animal_id", event.target.value)}
                disabled={relatedDisabled}
                aria-invalid={fieldErrors.animal_id !== undefined}
                className="ui-input"
              >
                <option value="">Tidak ada satwa terkait</option>
                {animals.map((item) => (
                  <option key={item.animal_id} value={item.animal_id}>
                    {item.animal_code || `Satwa #${item.animal_id}`}
                  </option>
                ))}
                {form.animal_id !== "" &&
                !animals.some(
                  (item) => String(item.animal_id) === form.animal_id,
                ) ? (
                  <option value={form.animal_id}>Satwa #{form.animal_id}</option>
                ) : null}
              </select>
            </FormField>

            <FormField
              label="Spesies Terkait"
              htmlFor="incident-species"
              error={fieldErrors.species_id ?? relatedError}
              hint={speciesQuery.isPending ? "Memuat daftar spesies..." : undefined}
            >
              <select
                id="incident-species"
                value={form.species_id}
                onChange={(event) => setField("species_id", event.target.value)}
                disabled={relatedDisabled}
                aria-invalid={fieldErrors.species_id !== undefined}
                className="ui-input"
              >
                <option value="">Tidak ada spesies terkait</option>
                {species.map((item) => (
                  <option key={item.species_id} value={item.species_id}>
                    {item.common_name}
                  </option>
                ))}
                {form.species_id !== "" &&
                !species.some(
                  (item) => String(item.species_id) === form.species_id,
                ) ? (
                  <option value={form.species_id}>
                    Spesies #{form.species_id}
                  </option>
                ) : null}
              </select>
            </FormField>
          </FormGrid>
        </FormSection>

        {summaryMessage ? <FormAlert message={summaryMessage} /> : null}

        <FormActions>
          <Button
            variant="outline"
            onClick={() => router.push("/incidents")}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={relatedPending || relatedError !== undefined}
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </FormActions>
          </form>
        )}
      </div>

      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <IncidentAttachments
          reportId={recordId}
          syncStatus={detailQuery.data?.data?.sync_status ?? null}
          canUpload={canUpload}
          canSync={canSync}
        />
      </div>
    </div>
  );
}
