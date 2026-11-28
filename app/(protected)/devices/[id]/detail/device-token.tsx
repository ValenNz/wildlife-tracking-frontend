"use client";

import { useState } from "react";
import { Copy, KeyRound, ShieldOff } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/button";
import { FormAlert } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/ui";
import { api, formatApiError } from "@/services/api";
import type { ApiResponse } from "@/types/api.type";
import { formatDateTime } from "@/utils/format";

type TokenInfo = { exists: boolean; created_at: string | null; last_used_at: string | null };


export function DeviceTokenPanel({ deviceId }: { deviceId: number }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const key = ["device-token", deviceId];
  const info = useQuery({
    queryKey: key,
    queryFn: () => api.get<ApiResponse<TokenInfo>>(`/devices/${deviceId}/api-token`),
    select: (response) => response.data,
  });
  const [plain, setPlain] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"create" | "revoke" | null>(null);

  const create = useMutation({
    mutationFn: () => api.post<ApiResponse<{ token: string }>>(`/devices/${deviceId}/api-token`),
    onSuccess: async (response) => {
      setPlain(response.data.token);
      setConfirm(null);
      await queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error) => showToast(formatApiError(error, "Gagal membuat token."), "error"),
  });
  const revoke = useMutation({
    mutationFn: () => api.delete<ApiResponse<{ revoked: number }>>(`/devices/${deviceId}/api-token`),
    onSuccess: async () => {
      setPlain(null);
      setConfirm(null);
      showToast("Token perangkat dicabut.", "success");
      await queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error) => showToast(formatApiError(error, "Gagal mencabut token."), "error"),
  });

  return (
    <section className="ui-panel flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-primary-soft p-2 text-primary"><KeyRound className="size-5" /></span>
        <div>
          <h2 className="text-base font-bold text-ink">Token API perangkat</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Dipasang di perangkat lapangan untuk mengirim telemetri, rekaman, dan titik GPS. Tidak kedaluwarsa karena idle,
            tetapi hanya bisa mengirim data perangkat ini (tidak bisa membaca data apa pun). Membuat token baru mencabut token lama.
          </p>
        </div>
      </div>
      <p className="text-sm text-ink-soft">
        {info.isLoading
          ? "Memeriksa…"
          : info.data?.exists
            ? `Token aktif sejak ${formatDateTime(info.data.created_at)} · terakhir dipakai ${info.data.last_used_at ? formatDateTime(info.data.last_used_at) : "belum pernah"}`
            : "Belum ada token."}
      </p>
      {plain ? (
        <div className="flex flex-col gap-2">
          <FormAlert tone="info" message="Salin token ini sekarang dan simpan di konfigurasi perangkat. Token tidak akan ditampilkan lagi." />
          <div className="flex gap-2">
            <code className="flex-1 overflow-x-auto rounded-xl bg-surface-muted px-3 py-2 font-mono text-xs">{plain}</code>
            <Button
              variant="outline"
              icon={<Copy className="size-4" />}
              onClick={() => void navigator.clipboard?.writeText(plain).then(() => showToast("Token disalin.", "success"))}
            >
              Salin
            </Button>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button icon={<KeyRound className="size-4" />} onClick={() => setConfirm("create")}>
          {info.data?.exists ? "Buat token baru" : "Buat token"}
        </Button>
        {info.data?.exists ? (
          <Button variant="danger" icon={<ShieldOff className="size-4" />} onClick={() => setConfirm("revoke")}>Cabut token</Button>
        ) : null}
      </div>
      <ConfirmationDialog
        open={confirm === "revoke"}
        title="Cabut token perangkat?"
        description="Perangkat tidak bisa mengirim data sampai diberi token baru."
        confirmLabel="Ya, cabut"
        isPending={revoke.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => revoke.mutate()}
      />
      <Modal open={confirm === "create"} onClose={() => setConfirm(null)} title="Buat token perangkat?" size="sm">
        <p className="text-sm leading-6 text-ink-soft">Token lama (bila ada) langsung tidak berlaku; perbarui konfigurasi perangkat setelah ini.</p>
        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={() => setConfirm(null)}>Batal</Button>
          <Button icon={<KeyRound className="size-4" />} loading={create.isPending} onClick={() => create.mutate()}>Ya, buat token</Button>
        </div>
      </Modal>
    </section>
  );
}
