"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button";
import {
  FormActions,
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  TextInput,
} from "@/components/form";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/ui/panel";
import { useAnimals } from "@/hooks/use-animals";
import { useGeoZones } from "@/hooks/use-geo-zones";
import { useZoneVisitCreate } from "@/hooks/use-zone-visits";
import { firstIssueMessage, issuesToFieldErrors, type FormErrors } from "@/lib/form";
import { formatApiError, getApiFieldErrors } from "@/services/api";

type VisitFormState = {
  animal_id: number;
  zone_id: number;
  entered_at: string;
};

type FieldName = keyof VisitFormState;

const VISIT_FIELDS: FieldName[] = ["animal_id", "zone_id", "entered_at"];

const nowLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

const visitSchema = z.object({
  animal_id: z.number().int().positive("Pilih satwa."),
  zone_id: z.number().int().positive("Pilih zona."),
  entered_at: z
    .string()
    .min(1, "Waktu masuk wajib diisi.")
    .refine((value) => new Date(value).getTime() <= Date.now(), "Waktu masuk tidak boleh di masa depan."),
});

export default function ZoneVisitCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useZoneVisitCreate();
  const animalsQuery = useAnimals();
  const zonesQuery = useGeoZones();
  const [form, setForm] = useState<VisitFormState>({ animal_id: 0, zone_id: 0, entered_at: nowLocal() });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors<FieldName>>({});

  const isPending = createMutation.isPending;
  const animals = animalsQuery.data?.data?.items ?? [];
  const zones = zonesQuery.data ?? [];
  const summaryMessage =
    validationError ??
    (createMutation.error ? formatApiError(createMutation.error, "Gagal mencatat kunjungan.") : null);

  const setField = <K extends FieldName>(key: K, value: VisitFormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setValidationError(null);
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const parsed = visitSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues, VISIT_FIELDS));
      setValidationError(firstIssueMessage(parsed.error.issues, "Periksa kembali isian form."));
      return;
    }

    try {
      await createMutation.mutateAsync({
        animal_id: parsed.data.animal_id,
        zone_id: parsed.data.zone_id,
        entered_at: parsed.data.entered_at.replace("T", " "),
      });
      showToast("Kunjungan zona dicatat.", "success");
      router.push("/zone-visits");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error) as FormErrors<FieldName>);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Lapangan"
        title="Catat Kunjungan Zona"
        description="Catat satwa yang terlihat masuk ke sebuah zona dari pengamatan langsung."
        className="mb-4"
        actions={
          <Link
            href="/zone-visits"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        }
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormSection title="Kunjungan" description="Satwa yang sudah tercatat di dalam zona tidak bisa dicatat dua kali.">
            <FormGrid columns={3}>
              <FormField label="Satwa" htmlFor="animal_id" required error={fieldErrors.animal_id}>
                <SelectInput
                  id="animal_id"
                  value={form.animal_id === 0 ? "" : String(form.animal_id)}
                  onChange={(event) => setField("animal_id", Number(event.target.value))}
                  invalid={fieldErrors.animal_id !== undefined}
                  disabled={isPending || animalsQuery.isLoading}
                >
                  <option value="">Pilih satwa</option>
                  {animals.map((animal) => (
                    <option key={animal.animal_id} value={animal.animal_id}>
                      {animal.animal_code}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="Zona" htmlFor="zone_id" required error={fieldErrors.zone_id}>
                <SelectInput
                  id="zone_id"
                  value={form.zone_id === 0 ? "" : String(form.zone_id)}
                  onChange={(event) => setField("zone_id", Number(event.target.value))}
                  invalid={fieldErrors.zone_id !== undefined}
                  disabled={isPending || zonesQuery.isLoading}
                >
                  <option value="">Pilih zona</option>
                  {zones.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="Waktu Masuk" htmlFor="entered_at" required error={fieldErrors.entered_at}>
                <TextInput
                  id="entered_at"
                  type="datetime-local"
                  value={form.entered_at}
                  max={nowLocal()}
                  onChange={(event) => setField("entered_at", event.target.value)}
                  invalid={fieldErrors.entered_at !== undefined}
                  disabled={isPending}
                />
              </FormField>
            </FormGrid>
          </FormSection>

          {summaryMessage ? <FormAlert message={summaryMessage} /> : null}

          <FormActions>
            <Button variant="outline" onClick={() => router.push("/zone-visits")} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" loading={isPending}>
              {isPending ? "Menyimpan..." : "Catat Kunjungan"}
            </Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
}
