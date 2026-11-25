"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/button";
import { FormActions, FormAlert, FormCheckbox, FormField, FormGrid, FormSection, SelectInput, TextArea, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/ui";
import { useTourRouteSave } from "@/hooks/use-tourism";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type { TYPE_DIFFICULTY, TYPE_TOUR_ROUTE, TYPE_TOUR_ROUTE_PAYLOAD } from "@/types/tourism.type";

type RouteFormState = {
  code: string;
  name: string;
  entry_point: string;
  summary: string;
  description: string;
  difficulty: TYPE_DIFFICULTY;
  duration_hours: string;
  duration_days: string;
  distance_km: string;
  max_group_size: string;
  min_age: string;
  meeting_point: string;
  meeting_lat: string;
  meeting_lon: string;
  start_time: string;
  guide_fee_per_person: string;
  itinerary: string;
  includes: string;
  bring_list: string;
  rules: string;
  wildlife: string;
  waypoints: string;
  is_active: boolean;
};

const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

const toState = (route?: TYPE_TOUR_ROUTE): RouteFormState => ({
  code: route?.code ?? "",
  name: route?.name ?? "",
  entry_point: route?.entry_point ?? "",
  summary: route?.summary ?? "",
  description: route?.description ?? "",
  difficulty: route?.difficulty ?? "sedang",
  duration_hours: String(route?.duration_hours ?? 4),
  duration_days: String(route?.duration_days ?? 1),
  distance_km: route?.distance_km ? String(route.distance_km) : "",
  max_group_size: String(route?.max_group_size ?? 10),
  min_age: String(route?.min_age ?? 0),
  meeting_point: route?.meeting_point ?? "",
  meeting_lat: route?.meeting_lat ? String(route.meeting_lat) : "",
  meeting_lon: route?.meeting_lon ? String(route.meeting_lon) : "",
  start_time: route?.start_time?.slice(0, 5) ?? "08:00",
  guide_fee_per_person: String(route?.guide_fee_per_person ?? 0),
  itinerary: (route?.itinerary ?? []).map((step) => [step.time, step.title, step.description ?? ""].join(" | ")).join("\n"),
  includes: (route?.includes ?? []).join("\n"),
  bring_list: (route?.bring_list ?? []).join("\n"),
  rules: (route?.rules ?? []).join("\n"),
  wildlife: (route?.wildlife ?? []).join("\n"),
  waypoints: (route?.waypoints ?? []).map((point) => point.join(", ")).join("\n"),
  is_active: route?.is_active ?? true,
});

const toPayload = (state: RouteFormState): TYPE_TOUR_ROUTE_PAYLOAD | string => {
  const itinerary = lines(state.itinerary).map((line) => {
    const [time = "", title = "", ...rest] = line.split("|").map((part) => part.trim());
    return { time, title, description: rest.join(" | ") || null };
  });
  if (itinerary.some((step) => !step.time || !step.title)) return "Setiap baris itinerary harus berformat: waktu | judul | keterangan.";

  const waypoints = lines(state.waypoints).map((line) => line.split(",").map((part) => Number(part.trim())));
  if (waypoints.some((point) => point.length !== 3 || point.some((value) => !Number.isFinite(value)))) {
    return "Setiap baris waypoint harus berformat: lintang, bujur, ketinggian.";
  }

  return {
    code: state.code.trim(),
    name: state.name.trim(),
    entry_point: state.entry_point.trim(),
    summary: state.summary.trim(),
    description: state.description.trim(),
    difficulty: state.difficulty,
    duration_hours: Number(state.duration_hours),
    duration_days: Number(state.duration_days),
    distance_km: state.distance_km ? Number(state.distance_km) : null,
    max_group_size: Number(state.max_group_size),
    min_age: Number(state.min_age || 0),
    meeting_point: state.meeting_point.trim(),
    meeting_lat: state.meeting_lat ? Number(state.meeting_lat) : null,
    meeting_lon: state.meeting_lon ? Number(state.meeting_lon) : null,
    start_time: state.start_time,
    guide_fee_per_person: Number(state.guide_fee_per_person),
    itinerary,
    includes: lines(state.includes),
    bring_list: lines(state.bring_list),
    rules: lines(state.rules),
    wildlife: lines(state.wildlife),
    waypoints: waypoints.length ? (waypoints as [number, number, number][]) : null,
    zone_id: null,
    is_active: state.is_active,
  };
};

export function RouteForm({ route }: { route?: TYPE_TOUR_ROUTE }) {
  const router = useRouter();
  const { showToast } = useToast();
  const saveMutation = useTourRouteSave();
  const [form, setForm] = useState<RouteFormState>(() => toState(route));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof RouteFormState>(key: K, value: RouteFormState[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const text = (key: keyof RouteFormState, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <FormField label={label} htmlFor={key} required={required} error={fieldErrors[key]}>
      <TextInput id={key} value={String(form[key])} onChange={(event) => set(key, event.target.value as never)} invalid={fieldErrors[key] !== undefined} {...props} />
    </FormField>
  );
  const area = (key: keyof RouteFormState, label: string, hint: string, rows = 4) => (
    <FormField label={label} htmlFor={key} hint={hint} error={fieldErrors[key]}>
      <TextArea id={key} rows={rows} value={String(form[key])} onChange={(event) => set(key, event.target.value as never)} />
    </FormField>
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);
    if (typeof payload === "string") return setError(payload);
    setError(null);
    try {
      await saveMutation.mutateAsync({ id: route?.route_id, payload });
      showToast(route ? "Rute diperbarui." : "Rute ditambahkan.", "success");
      router.push("/tourism/routes");
    } catch (submitError) {
      setFieldErrors(getApiFieldErrors(submitError));
      setError(formatApiError(submitError, "Gagal menyimpan rute."));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title={route ? `Ubah ${route.name}` : "Tambah Rute Tur"}
        className="mb-0"
        actions={<Link href="/tourism/routes" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft hover:border-primary"><ArrowLeft className="size-4" />Kembali</Link>}
      />
      <form onSubmit={onSubmit} noValidate className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <FormSection title="Identitas rute">
          <FormGrid columns={3}>
            {text("code", "Kode", { placeholder: "BL-03", maxLength: 30 })}
            {text("name", "Nama rute", { maxLength: 150 })}
            {text("entry_point", "Pintu masuk", { maxLength: 100 })}
          </FormGrid>
          {text("summary", "Ringkasan", { maxLength: 500 })}
          {area("description", "Deskripsi lengkap", "Ditampilkan di halaman detail rute.", 5)}
        </FormSection>
        <FormSection title="Durasi, kapasitas & harga">
          <FormGrid columns={3}>
            <FormField label="Tingkat kesulitan" htmlFor="difficulty" required>
              <SelectInput id="difficulty" value={form.difficulty} onChange={(event) => set("difficulty", event.target.value as TYPE_DIFFICULTY)}>
                <option value="mudah">Mudah</option><option value="sedang">Sedang</option><option value="sulit">Menantang</option>
              </SelectInput>
            </FormField>
            {text("duration_hours", "Durasi (jam)", { type: "number", min: 1 })}
            {text("duration_days", "Jumlah hari (tiket masuk ×)", { type: "number", min: 1 })}
            {text("distance_km", "Jarak (km)", { type: "number", step: "0.1", min: 0 }, false)}
            {text("max_group_size", "Maks. rombongan", { type: "number", min: 1, max: 50 })}
            {text("min_age", "Usia minimal", { type: "number", min: 0 }, false)}
            {text("start_time", "Jam mulai", { type: "time" })}
            {text("guide_fee_per_person", "Jasa pemandu / orang (Rp)", { type: "number", min: 0 })}
          </FormGrid>
        </FormSection>
        <FormSection title="Titik kumpul & jalur">
          <FormGrid columns={3}>
            {text("meeting_point", "Titik kumpul", { maxLength: 200 })}
            {text("meeting_lat", "Lintang", { type: "number", step: "any" }, false)}
            {text("meeting_lon", "Bujur", { type: "number", step: "any" }, false)}
          </FormGrid>
          {area("waypoints", "Waypoint jalur", "Satu titik per baris: lintang, bujur, ketinggian (m). Dipakai untuk peta & profil ketinggian.")}
        </FormSection>
        <FormSection title="Informasi untuk pengunjung" description="Satu butir per baris.">
          {area("itinerary", "Itinerary", "Format per baris: waktu | judul | keterangan")}
          <FormGrid columns={2}>
            {area("includes", "Termasuk dalam paket", "")}
            {area("bring_list", "Yang perlu dibawa", "")}
            {area("rules", "Aturan kawasan", "")}
            {area("wildlife", "Satwa yang mungkin dijumpai", "")}
          </FormGrid>
          <FormCheckbox id="is_active" label="Rute aktif (tampil di katalog)" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} />
        </FormSection>
        {error ? <FormAlert message={error} /> : null}
        <FormActions>
          <Button variant="outline" onClick={() => router.push("/tourism/routes")}>Batal</Button>
          <Button type="submit" loading={saveMutation.isPending}>Simpan</Button>
        </FormActions>
      </form>
    </div>
  );
}
