"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/button";
import { FormAlert, FormField, FormGrid, SelectInput, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/ui";
import { useAdminTourGuides, useAdminTourRoutes, useShiftSave } from "@/hooks/use-tourism";
import { formatApiError, getApiFieldErrors } from "@/services/api";
import { SHIFT_LABELS, type TYPE_GUIDE_SHIFT, type TYPE_SHIFT_TYPE } from "@/types/tourism.type";
import { toLocalDateInput } from "@/utils/format";

const DEFAULT_TIMES: Record<TYPE_SHIFT_TYPE, [string, string]> = {
  pagi: ["07:00", "12:00"],
  siang: ["12:00", "17:00"],
  malam: ["18:00", "22:00"],
};

export function ShiftFormModal({ shift, onClose }: { shift: TYPE_GUIDE_SHIFT | null; onClose: () => void }) {
  const { showToast } = useToast();
  const guides = useAdminTourGuides();
  const routes = useAdminTourRoutes();
  const saveMutation = useShiftSave();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    guide_id: shift?.guide_id ?? 0,
    route_id: shift?.route_id ?? 0,
    shift_date: shift?.shift_date?.slice(0, 10) ?? toLocalDateInput(),
    shift_type: shift?.shift_type ?? ("pagi" as TYPE_SHIFT_TYPE),
    start_time: shift?.start_time?.slice(0, 5) ?? "07:00",
    end_time: shift?.end_time?.slice(0, 5) ?? "12:00",
    capacity: shift?.capacity ?? 10,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.guide_id || !form.route_id) return setError("Pilih pemandu dan rute.");
    if (form.end_time <= form.start_time && form.shift_type !== "malam") return setError("Jam selesai harus setelah jam mulai.");
    setError(null);
    try {
      await saveMutation.mutateAsync({ id: shift?.shift_id, payload: { ...form, capacity: Number(form.capacity) } });
      showToast(shift ? "Shift diperbarui." : "Shift ditambahkan.", "success");
      onClose();
    } catch (submitError) {
      setFieldErrors(getApiFieldErrors(submitError));
      setError(formatApiError(submitError, "Gagal menyimpan shift."));
    }
  };

  return (
    <Modal open onClose={onClose} title={shift ? "Ubah shift" : "Tambah shift pemandu"} description="Satu pemandu hanya boleh satu shift dengan tipe sama per tanggal." size="md">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormGrid columns={2}>
          <FormField label="Pemandu" htmlFor="shift-guide" required error={fieldErrors.guide_id}>
            <SelectInput id="shift-guide" value={form.guide_id || ""} onChange={(event) => setForm({ ...form, guide_id: Number(event.target.value) })}>
              <option value="">Pilih pemandu</option>
              {(guides.data ?? []).filter((guide) => guide.is_active).map((guide) => <option key={guide.guide_id} value={guide.guide_id}>{guide.display_name}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Rute" htmlFor="shift-route" required error={fieldErrors.route_id}>
            <SelectInput id="shift-route" value={form.route_id || ""} onChange={(event) => setForm({ ...form, route_id: Number(event.target.value) })}>
              <option value="">Pilih rute</option>
              {(routes.data ?? []).filter((route) => route.is_active).map((route) => <option key={route.route_id} value={route.route_id}>{route.name}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Tanggal" htmlFor="shift-date" required error={fieldErrors.shift_date}>
            <TextInput id="shift-date" type="date" min={toLocalDateInput()} value={form.shift_date} onChange={(event) => setForm({ ...form, shift_date: event.target.value })} />
          </FormField>
          <FormField label="Tipe shift" htmlFor="shift-type" required error={fieldErrors.shift_type}>
            <SelectInput
              id="shift-type"
              value={form.shift_type}
              onChange={(event) => {
                const type = event.target.value as TYPE_SHIFT_TYPE;
                setForm({ ...form, shift_type: type, start_time: DEFAULT_TIMES[type][0], end_time: DEFAULT_TIMES[type][1] });
              }}
            >
              {(Object.keys(SHIFT_LABELS) as TYPE_SHIFT_TYPE[]).map((type) => <option key={type} value={type}>{SHIFT_LABELS[type]}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Mulai" htmlFor="shift-start" required error={fieldErrors.start_time}>
            <TextInput id="shift-start" type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
          </FormField>
          <FormField label="Selesai" htmlFor="shift-end" required error={fieldErrors.end_time}>
            <TextInput id="shift-end" type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} />
          </FormField>
          <FormField label="Kapasitas peserta" htmlFor="shift-capacity" required error={fieldErrors.capacity}>
            <TextInput id="shift-capacity" type="number" min={1} max={50} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} />
          </FormField>
        </FormGrid>
        {error ? <FormAlert message={error} /> : null}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={saveMutation.isPending}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
