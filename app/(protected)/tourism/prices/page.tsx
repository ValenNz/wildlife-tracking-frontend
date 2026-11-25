"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarPlus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, FormField, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { useAdminPrices, useHolidayCreate, useHolidayDelete, useHolidays, usePriceUpdate } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_TICKET_PRICE } from "@/types/tourism.type";
import { formatLongDate, formatRupiah } from "@/utils/format";

function PriceRow({ price }: { price: TYPE_TICKET_PRICE }) {
  const { showToast } = useToast();
  const updateMutation = usePriceUpdate();
  const [amount, setAmount] = useState(String(price.amount));
  const [active, setActive] = useState(price.is_active);
  const dirty = Number(amount) !== price.amount || active !== price.is_active;

  const save = () =>
    updateMutation.mutate(
      { id: price.price_id, payload: { amount: Number(amount), is_active: active } },
      {
        onSuccess: () => showToast(`Tarif ${price.name} disimpan.`, "success"),
        onError: (error) => showToast(formatApiError(error, "Gagal menyimpan tarif."), "error"),
      },
    );

  return (
    <tr className="align-middle">
      <td className="py-3 pr-3">
        <p className="font-medium text-ink">{price.name}</p>
        <p className="text-xs text-muted">{price.code} · {price.legal_basis ?? "-"}{price.min_quantity > 1 ? ` · min. ${price.min_quantity} orang` : ""}</p>
      </td>
      <td className="py-3 pr-3 text-xs text-muted">{price.day_type === "holiday" ? "Minggu/Libur" : price.day_type === "weekday" ? "Senin–Sabtu" : "Semua"}</td>
      <td className="py-3 pr-3">
        <TextInput aria-label={`Tarif ${price.name}`} type="number" min={0} value={amount} onChange={(event) => setAmount(event.target.value)} className="w-36" />
        <p className="mt-1 text-[11px] text-muted">{formatRupiah(amount)} /{price.unit}</p>
      </td>
      <td className="py-3 pr-3">
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={active} onChange={(event) => setActive(event.target.checked)} />Aktif</label>
      </td>
      <td className="py-3">
        <Button size="sm" variant="outline" icon={<Save className="size-3.5" />} disabled={!dirty} loading={updateMutation.isPending} onClick={save}>Simpan</Button>
      </td>
    </tr>
  );
}

export default function PricesPage() {
  const { showToast } = useToast();
  const pricesQuery = useAdminPrices();
  const holidaysQuery = useHolidays();
  const createHoliday = useHolidayCreate();
  const deleteHoliday = useHolidayDelete();
  const [holiday, setHoliday] = useState({ holiday_date: "", name: "" });

  const addHoliday = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!holiday.holiday_date || holiday.name.trim() === "") return;
    createHoliday.mutate(
      { holiday_date: holiday.holiday_date, name: holiday.name.trim() },
      {
        onSuccess: () => {
          showToast("Hari libur ditambahkan.", "success");
          setHoliday({ holiday_date: "", name: "" });
        },
        onError: (error) => showToast(formatApiError(error, "Gagal menambah hari libur."), "error"),
      },
    );
  };

  if (pricesQuery.error) {
    const error = toApiErrorState(pricesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void pricesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title="Tarif & Hari Libur"
        description="Tarif PNBP mengikuti PP 36/2024 (TNGL kelas III). Ubah hanya bila ada peraturan baru. Pemesanan yang sudah dibuat tetap memakai harga saat dipesan."
      />
      <section className="ui-panel overflow-x-auto p-5">
        {pricesQuery.isLoading ? (
          <Loading />
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr><th className="pb-2">Tarif</th><th className="pb-2">Hari</th><th className="pb-2">Nominal</th><th className="pb-2">Status</th><th className="pb-2" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(pricesQuery.data ?? []).map((price) => <PriceRow key={price.price_id} price={price} />)}
            </tbody>
          </table>
        )}
      </section>

      <section className="ui-panel p-5">
        <h2 className="text-base font-bold text-ink">Hari libur nasional</h2>
        <p className="mt-1 text-sm text-muted">Tanggal di daftar ini (dan setiap hari Minggu) memakai tarif hari libur. Tambahkan libur yang tanggalnya berubah tiap tahun (Idul Fitri, Waisak, dsb.).</p>
        <form onSubmit={addHoliday} className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <FormField label="Tanggal" htmlFor="holiday-date"><TextInput id="holiday-date" type="date" value={holiday.holiday_date} onChange={(event) => setHoliday({ ...holiday, holiday_date: event.target.value })} /></FormField>
          <FormField label="Nama" htmlFor="holiday-name"><TextInput id="holiday-name" maxLength={150} value={holiday.name} onChange={(event) => setHoliday({ ...holiday, name: event.target.value })} /></FormField>
          <Button type="submit" icon={<CalendarPlus className="size-4" />} loading={createHoliday.isPending}>Tambah</Button>
        </form>
        {holidaysQuery.error ? <div className="mt-3"><FormAlert message={formatApiError(holidaysQuery.error, "Gagal memuat hari libur.")} /></div> : null}
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(holidaysQuery.data ?? []).map((item) => (
            <li key={item.holiday_id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
              <span><b className="text-ink">{formatLongDate(item.holiday_date)}</b><span className="block text-xs text-muted">{item.name}</span></span>
              <button
                type="button"
                aria-label={`Hapus ${item.name}`}
                onClick={() => deleteHoliday.mutate(item.holiday_id, { onSuccess: () => showToast("Hari libur dihapus.", "success") })}
                className="inline-flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
