"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/button";
import { FormAlert, FormCheckbox, FormField, FormGrid, TextArea, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/ui";
import { useGuidePhotoUpload, useTourGuideSave } from "@/hooks/use-tourism";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import type { TYPE_TOUR_GUIDE } from "@/types/tourism.type";

const csv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function GuideFormModal({ guide, onClose }: { guide: TYPE_TOUR_GUIDE | null; onClose: () => void }) {
  const { showToast } = useToast();
  const saveMutation = useTourGuideSave();
  const photoMutation = useGuidePhotoUpload();
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    display_name: guide?.display_name ?? "",
    bio: guide?.bio ?? "",
    languages: guide?.languages.join(", ") ?? "Indonesia",
    specialties: guide?.specialties.join(", ") ?? "",
    favorite_animal: guide?.favorite_animal ?? "",
    favorite_animal_reason: guide?.favorite_animal_reason ?? "",
    years_experience: String(guide?.years_experience ?? 0),
    certification: guide?.certification ?? "",
    fun_fact: guide?.fun_fact ?? "",
    is_active: guide?.is_active ?? true,
  });
  const set = (key: keyof typeof form, value: string | boolean) => setForm((previous) => ({ ...previous, [key]: value }));
  const busy = saveMutation.isPending || photoMutation.isPending;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (photo && (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 5 * 1024 * 1024)) {
      return setError("Foto harus JPG/PNG/WEBP maks. 5 MB.");
    }
    setError(null);
    try {
      const response = await saveMutation.mutateAsync({
        id: guide?.guide_id,
        payload: {
          display_name: form.display_name.trim(),
          bio: form.bio.trim(),
          languages: csv(form.languages),
          specialties: csv(form.specialties),
          favorite_animal: form.favorite_animal.trim(),
          favorite_animal_reason: form.favorite_animal_reason.trim() || null,
          years_experience: Number(form.years_experience || 0),
          certification: form.certification.trim() || null,
          fun_fact: form.fun_fact.trim() || null,
          is_active: form.is_active,
        },
      });
      if (photo) await photoMutation.mutateAsync({ id: response.data.guide_id, file: photo });
      showToast(guide ? "Profil pemandu diperbarui." : "Pemandu ditambahkan.", "success");
      onClose();
    } catch (submitError) {
      setFieldErrors(getApiFieldErrors(submitError));
      setError(formatApiError(submitError, "Gagal menyimpan pemandu."));
    }
  };

  const input = (key: keyof typeof form, label: string, required = false, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <FormField label={label} htmlFor={`guide-${key}`} required={required} error={fieldErrors[key]}>
      <TextInput id={`guide-${key}`} value={String(form[key])} onChange={(event) => set(key, event.target.value)} {...props} />
    </FormField>
  );

  return (
    <Modal open onClose={onClose} title={guide ? `Ubah ${guide.display_name}` : "Tambah pemandu"} description="Data ini tampil publik. Jangan isi nomor HP/alamat pribadi." size="lg">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormGrid columns={2}>
          {input("display_name", "Nama tampilan", true, { maxLength: 100 })}
          {input("years_experience", "Pengalaman (tahun)", false, { type: "number", min: 0, max: 70 })}
          {input("languages", "Bahasa (pisahkan koma)", true)}
          {input("specialties", "Keahlian (pisahkan koma)", false)}
          {input("favorite_animal", "Satwa favorit", true, { maxLength: 100 })}
          {input("favorite_animal_reason", "Alasan satwa favorit", false, { maxLength: 255 })}
          {input("certification", "Sertifikasi", false, { maxLength: 150 })}
          {input("fun_fact", "Fun fact", false, { maxLength: 255 })}
        </FormGrid>
        <FormField label="Bio" htmlFor="guide-bio" required error={fieldErrors.bio}>
          <TextArea id="guide-bio" rows={4} maxLength={2000} value={form.bio} onChange={(event) => set("bio", event.target.value)} />
        </FormField>
        <FormField label="Foto (opsional)" htmlFor="guide-photo" hint="JPG/PNG/WEBP maks. 5 MB.">
          <input id="guide-photo" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="text-sm" />
        </FormField>
        <FormCheckbox id="guide-active" label="Aktif (tampil di jadwal publik)" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} />
        {error ? <FormAlert message={error} /> : null}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button>
          <Button type="submit" loading={busy}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
