"use client";

/* eslint-disable @next/next/no-img-element -- pratinjau bukti dari blob privat */
import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { FormAlert, FormField, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { ErrorState, Loading, Modal, PageHeader } from "@/components/ui";
import { useAdminPayments, usePaymentVerify } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import { TOURISM_ADMIN_SERVICE } from "@/services/tourism.service";
import { PAYMENT_STATUS_LABELS, type TYPE_PAYMENT } from "@/types/tourism.type";
import { formatRupiah } from "@/utils/format";

import { getPaymentColumns } from "./column";

function ProofReview({ payment, onClose }: { payment: TYPE_PAYMENT; onClose: () => void }) {
  const { showToast } = useToast();
  const verifyMutation = usePaymentVerify();
  const [proof, setProof] = useState<{ url: string; type: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let url: string | null = null;
    TOURISM_ADMIN_SERVICE.GET_PAYMENT_PROOF(payment.payment_id)
      .then((response) => {
        url = URL.createObjectURL(response.blob);
        setProof({ url, type: response.contentType });
      })
      .catch((error) => setLoadError(formatApiError(error, "Bukti tidak dapat dimuat.")));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [payment.payment_id]);

  const verify = async (approve: boolean) => {
    if (!approve && reason.trim() === "") return showToast("Isi alasan penolakan.", "error");
    try {
      await verifyMutation.mutateAsync({ id: payment.payment_id, approve, reason: approve ? undefined : reason.trim() });
      showToast(approve ? "Pembayaran diterima, tiket terbit." : "Bukti ditolak; pengunjung diberi waktu mengunggah ulang.", "success");
      onClose();
    } catch (error) {
      showToast(formatApiError(error, "Verifikasi gagal."), "error");
    }
  };

  return (
    <Modal open onClose={onClose} title={`Bukti pembayaran ${payment.reference}`} description={`${payment.booking?.booking_code ?? ""} · ${formatRupiah(payment.amount)}`} size="lg">
      <div className="flex flex-col gap-4">
        {loadError ? (
          <FormAlert message={loadError} />
        ) : !proof ? (
          <Loading label="Memuat bukti..." />
        ) : proof.type.includes("pdf") ? (
          <iframe src={proof.url} title="Bukti pembayaran" className="h-[60vh] w-full rounded-xl border border-line" />
        ) : (
          <img src={proof.url} alt="Bukti pembayaran" className="max-h-[60vh] w-full rounded-xl border border-line object-contain" />
        )}
        <FormAlert tone="info" message={`Pastikan nominal ${formatRupiah(payment.amount)} dan berita ${payment.reference} sesuai mutasi rekening sebelum menerima.`} />
        {payment.status === "awaiting_verification" ? (
          <>
            <FormField label="Alasan penolakan (wajib jika menolak)" htmlFor="reason">
              <TextInput id="reason" maxLength={255} value={reason} onChange={(event) => setReason(event.target.value)} />
            </FormField>
            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              <Button variant="danger" icon={<X className="size-4" />} loading={verifyMutation.isPending} onClick={() => void verify(false)}>Tolak</Button>
              <Button icon={<Check className="size-4" />} loading={verifyMutation.isPending} onClick={() => void verify(true)}>Terima & terbitkan tiket</Button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}

export default function PaymentsPage() {
  const [status, setStatus] = useState("awaiting_verification");
  const [selected, setSelected] = useState<TYPE_PAYMENT | null>(null);
  const paymentsQuery = useAdminPayments(status === "all" ? undefined : status);
  const columns = useMemo(() => getPaymentColumns({ onReview: setSelected }), []);

  if (paymentsQuery.error) {
    const error = toApiErrorState(paymentsQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void paymentsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Kelola Wisata"
        title="Verifikasi Pembayaran"
        description="Periksa bukti transfer pengunjung. Tiket QR otomatis terbit setelah pembayaran diterima. Pembayaran via gateway terverifikasi otomatis melalui webhook bertanda tangan."
      />
      <div className="flex flex-wrap gap-2">
        {["awaiting_verification", "pending", "paid", "rejected", "refunded", "all"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${status === value ? "bg-primary text-white" : "border border-line bg-surface text-ink-soft hover:border-primary"}`}
          >
            {value === "all" ? "Semua" : PAYMENT_STATUS_LABELS[value as keyof typeof PAYMENT_STATUS_LABELS]}
          </button>
        ))}
      </div>
      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={paymentsQuery.data ?? []} columns={columns} loading={paymentsQuery.isLoading} getRowId={(row) => String(row.payment_id)} label="pembayaran" emptyTitle="Tidak ada pembayaran" />
      </section>
      {selected ? <ProofReview payment={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
