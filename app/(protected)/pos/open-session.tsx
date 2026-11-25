"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Store } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, FormField, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { usePosOpenSession } from "@/hooks/use-pos";
import { formatApiError } from "@/services/api";
import { formatRupiah } from "@/utils/format";

export function OpenSessionCard() {
  const { showToast } = useToast();
  const openMutation = usePosOpenSession();
  const [counter, setCounter] = useState("Loket Bukit Lawang");
  const [cash, setCash] = useState("200000");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (counter.trim() === "") return setError("Isi nama loket.");
    try {
      await openMutation.mutateAsync({ counter_name: counter.trim(), opening_cash: Number(cash || 0) });
      showToast("Sesi kas dibuka. Selamat bertugas!", "success");
    } catch (submitError) {
      setError(formatApiError(submitError, "Gagal membuka sesi."));
    }
  };

  return (
    <section className="ui-panel mx-auto w-full max-w-lg p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Store className="size-6" /></span>
        <div>
          <h2 className="text-lg font-bold text-ink">Buka sesi kas</h2>
          <p className="text-sm text-muted">Hitung uang kembalian di laci sebelum mulai menjual.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label="Nama loket" htmlFor="counter" required>
          <TextInput id="counter" maxLength={100} value={counter} onChange={(event) => setCounter(event.target.value)} />
        </FormField>
        <FormField label="Modal kembalian awal (Rp)" htmlFor="opening" required hint={formatRupiah(cash)}>
          <TextInput id="opening" type="number" min={0} step={1000} value={cash} onChange={(event) => setCash(event.target.value)} />
        </FormField>
        {error ? <FormAlert message={error} /> : null}
        <Button type="submit" size="lg" loading={openMutation.isPending}>Buka Sesi</Button>
      </form>
    </section>
  );
}
