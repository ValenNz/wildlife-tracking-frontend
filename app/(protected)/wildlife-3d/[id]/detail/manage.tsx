"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Crosshair, Save, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, FormCheckbox, FormField, FormGrid, FormSection, SelectInput, TextArea, TextInput } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { useSpeciesModelDelete, useSpeciesModelUpload, useSpeciesProfileUpdate } from "@/hooks/use-wildlife";
import { formatApiError } from "@/services/api";
import { MODEL_SOURCE_LABELS, type TYPE_MODEL_HOTSPOT, type TYPE_MODEL_SOURCE, type TYPE_SPECIES_PROFILE } from "@/types/wildlife.type";

const MAX_MB = 30;
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

type Props = {
  species: TYPE_SPECIES_PROFILE;
  hotspots: TYPE_MODEL_HOTSPOT[];
  onHotspotsChange: (hotspots: TYPE_MODEL_HOTSPOT[] | null) => void;
  picking: boolean;
  onPickingChange: (picking: boolean, handler?: (point: { position: string; normal: string }) => void) => void;
};

/** Panel peneliti/admin (izin manage_master_data): model 3D, titik keterangan, dan profil ensiklopedia. */
export function ManagePanel({ species, hotspots, onHotspotsChange, picking, onPickingChange }: Props) {
  const { showToast } = useToast();
  const uploadMutation = useSpeciesModelUpload();
  const deleteMutation = useSpeciesModelDelete();
  const updateMutation = useSpeciesProfileUpdate();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<TYPE_MODEL_SOURCE>("scan");
  const [credit, setCredit] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirtyHotspots, setDirtyHotspots] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    local_names: species.local_names ?? "",
    taxon_class: species.taxon_class ?? "",
    taxon_order: species.taxon_order ?? "",
    taxon_family: species.taxon_family ?? "",
    description: species.description ?? "",
    characteristics: (species.characteristics ?? []).join("\n"),
    size_weight: species.size_weight ?? "",
    lifespan: species.lifespan ?? "",
    activity_pattern: species.activity_pattern ?? "",
    diet: species.diet ?? "",
    behavior: species.behavior ?? "",
    habitat: species.habitat ?? "",
    distribution: species.distribution ?? "",
    population_estimate: species.population_estimate ?? "",
    threats: (species.threats ?? []).join("\n"),
    fun_facts: (species.fun_facts ?? []).join("\n"),
    legal_protection: species.legal_protection ?? "",
    is_public: species.is_public,
  }));
  type Field = Exclude<keyof typeof form, "is_public">;

  const setHotspots = (next: TYPE_MODEL_HOTSPOT[]) => {
    onHotspotsChange(next);
    setDirtyHotspots(true);
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return showToast("Pilih berkas .glb.", "error");
    if (!file.name.toLowerCase().endsWith(".glb")) return showToast("Format harus .glb (glTF biner).", "error");
    if (file.size > MAX_MB * 1024 * 1024) return showToast(`Ukuran maksimal ${MAX_MB} MB.`, "error");
    if (credit.trim() === "") return showToast("Isi kredit/pembuat & lisensi model.", "error");
    try {
      await uploadMutation.mutateAsync({ id: species.species_id, file, model_source: source, model_credit: credit.trim() });
      onHotspotsChange(null);
      setDirtyHotspots(false);
      setFile(null);
      showToast("Model 3D diunggah. Titik keterangan lama dihapus karena bentuk model berubah.", "success");
    } catch (error) {
      showToast(formatApiError(error, "Gagal mengunggah model."), "error");
    }
  };

  const saveHotspots = async () => {
    try {
      await updateMutation.mutateAsync({ id: species.species_id, payload: { model_hotspots: hotspots } });
      onHotspotsChange(null);
      setDirtyHotspots(false);
      showToast("Titik keterangan disimpan.", "success");
    } catch (error) {
      showToast(formatApiError(error, "Gagal menyimpan titik keterangan."), "error");
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    try {
      await updateMutation.mutateAsync({
        id: species.species_id,
        payload: {
          ...form,
          characteristics: lines(form.characteristics),
          threats: lines(form.threats),
          fun_facts: lines(form.fun_facts),
        },
      });
      showToast("Profil satwa disimpan.", "success");
    } catch (error) {
      setProfileError(formatApiError(error, "Gagal menyimpan profil."));
    }
  };

  const input = (key: Field, label: string, area = false, rows = 3, hint?: string) => (
    <FormField label={label} htmlFor={`sp-${key}`} hint={hint}>
      {area ? (
        <TextArea id={`sp-${key}`} rows={rows} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
      ) : (
        <TextInput id={`sp-${key}`} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
      )}
    </FormField>
  );

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-6">
      <h2 className="text-lg font-bold text-ink">Kelola konten & model 3D</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormSection title="Model 3D (.glb)" description="Format glTF biner dengan tekstur tertanam, maks. 30 MB. Model dari pemindaian (fotogrametri) atau berlisensi jelas (mis. CC-BY) — tulis pembuat & lisensinya.">
          <p className="text-sm text-ink-soft">
            Saat ini: {species.has_model ? `${species.model_source ? MODEL_SOURCE_LABELS[species.model_source] : "Model"} — ${species.model_credit ?? "-"}` : "belum ada model"}
          </p>
          <form onSubmit={upload} className="flex flex-col gap-3">
            <input type="file" accept=".glb,model/gltf-binary" aria-label="Berkas model GLB" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="text-sm" />
            <FormGrid columns={2}>
              <FormField label="Sumber model" htmlFor="model-source">
                <SelectInput id="model-source" value={source} onChange={(event) => setSource(event.target.value as TYPE_MODEL_SOURCE)}>
                  {(Object.keys(MODEL_SOURCE_LABELS) as TYPE_MODEL_SOURCE[]).map((value) => <option key={value} value={value}>{MODEL_SOURCE_LABELS[value]}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Kredit & lisensi" htmlFor="model-credit">
                <TextInput id="model-credit" maxLength={255} placeholder="mis. Pindaian Tim BBTNGL 2026, CC-BY 4.0" value={credit} onChange={(event) => setCredit(event.target.value)} />
              </FormField>
            </FormGrid>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" icon={<Upload className="size-4" />} loading={uploadMutation.isPending}>Unggah model</Button>
              {species.has_model ? <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirmDelete(true)}>Hapus model</Button> : null}
            </div>
          </form>
        </FormSection>

        <FormSection title="Titik keterangan di model" description="Tandai ciri penting (mis. cula, bercak dada). Klik “Tambah titik” lalu klik bagian tubuh di model.">
          {hotspots.length === 0 ? <p className="text-sm text-muted">Belum ada titik.</p> : null}
          <ol className="flex flex-col gap-3">
            {hotspots.map((hotspot, index) => (
              <li key={`${hotspot.position}-${index}`} className="flex flex-col gap-2 rounded-xl border border-line p-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                  <TextInput aria-label={`Label titik ${index + 1}`} maxLength={60} value={hotspot.label} onChange={(event) => setHotspots(hotspots.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))} />
                  <button type="button" aria-label={`Hapus titik ${index + 1}`} onClick={() => setHotspots(hotspots.filter((_, i) => i !== index))} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-danger/10"><Trash2 className="size-4" /></button>
                </div>
                <TextArea aria-label={`Keterangan titik ${index + 1}`} rows={2} maxLength={300} value={hotspot.description ?? ""} onChange={(event) => setHotspots(hotspots.map((item, i) => (i === index ? { ...item, description: event.target.value } : item)))} />
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={picking ? "secondary" : "outline"}
              icon={<Crosshair className="size-4" />}
              disabled={!species.has_model || hotspots.length >= 15}
              onClick={() =>
                picking
                  ? onPickingChange(false)
                  : onPickingChange(true, (point) => {
                      setHotspots([...hotspots, { label: `Titik ${hotspots.length + 1}`, description: "", ...point }]);
                      onPickingChange(false);
                    })
              }
            >
              {picking ? "Batal memilih" : "Tambah titik"}
            </Button>
            <Button icon={<Save className="size-4" />} disabled={!dirtyHotspots || hotspots.some((item) => item.label.trim() === "")} loading={updateMutation.isPending} onClick={() => void saveHotspots()}>
              Simpan titik
            </Button>
            {dirtyHotspots ? (
              <Button variant="ghost" onClick={() => { onHotspotsChange(null); setDirtyHotspots(false); }}>Batalkan perubahan</Button>
            ) : null}
          </div>
        </FormSection>
      </div>

      <form onSubmit={saveProfile} className="flex flex-col gap-4">
        <FormSection title="Profil ensiklopedia" description="Tampil untuk pengunjung, peneliti, dan konservasionis. Jangan menulis lokasi individu satwa (risiko perburuan). Daftar: satu butir per baris.">
          <FormGrid columns={2}>
            {input("local_names", "Nama daerah")}
            {input("legal_protection", "Status perlindungan")}
            {input("taxon_class", "Kelas")}
            {input("taxon_order", "Ordo")}
            {input("taxon_family", "Famili")}
            {input("activity_pattern", "Pola aktivitas")}
            {input("size_weight", "Ukuran & berat")}
            {input("lifespan", "Umur")}
            {input("population_estimate", "Estimasi populasi")}
          </FormGrid>
          {input("description", "Deskripsi", true, 3)}
          <FormGrid columns={2}>
            {input("characteristics", "Ciri-ciri fisik", true, 5, "Satu ciri per baris")}
            {input("behavior", "Perilaku & kebiasaan", true, 5)}
            {input("diet", "Makanan", true, 3)}
            {input("habitat", "Habitat", true, 3)}
            {input("distribution", "Sebaran (tingkat wilayah)", true, 3)}
            {input("threats", "Ancaman", true, 4, "Satu ancaman per baris")}
          </FormGrid>
          {input("fun_facts", "Fakta menarik", true, 3, "Satu fakta per baris")}
          <FormCheckbox id="sp-public" label="Tampilkan di ensiklopedia publik (pengunjung)" checked={form.is_public} onChange={(event) => setForm({ ...form, is_public: event.target.checked })} />
          {profileError ? <FormAlert message={profileError} /> : null}
          <div><Button type="submit" icon={<Save className="size-4" />} loading={updateMutation.isPending}>Simpan profil</Button></div>
        </FormSection>
      </form>

      <ConfirmationDialog
        open={confirmDelete}
        title="Hapus model 3D?"
        description="Berkas model dan semua titik keterangannya akan dihapus."
        isPending={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteMutation.mutate(species.species_id, {
            onSuccess: () => {
              setConfirmDelete(false);
              onHotspotsChange(null);
              showToast("Model 3D dihapus.", "success");
            },
            onError: (error) => showToast(formatApiError(error, "Gagal menghapus model."), "error"),
          })
        }
      />
    </div>
  );
}
