"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Camera, CameraOff, CheckCircle2, ScanLine, Users } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, TextInput } from "@/components/form";
import { DataTable } from "@/components/data-table";
import { useToast } from "@/components/toast";
import { PageHeader, StatCard } from "@/components/ui";
import { useTicketCheckIn, useTodayVisits } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { VISITOR_TYPE_LABELS, type TYPE_BOOKING } from "@/types/tourism.type";

import { getTodayVisitColumns } from "./column";

type BarcodeDetectorLike = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike;

const getDetector = (): BarcodeDetectorCtor | undefined =>
  typeof window === "undefined" ? undefined : (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;

export default function TicketCheckInPage() {
  const { showToast } = useToast();
  const todayQuery = useTodayVisits();
  const checkInMutation = useTicketCheckIn();
  const [ticket, setTicket] = useState("");
  const [result, setResult] = useState<TYPE_BOOKING | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const columns = useMemo(() => getTodayVisitColumns(), []);
  const visits = todayQuery.data ?? [];
  const checkedIn = visits.filter((visit) => visit.status === "checked_in");

  const submit = async (value: string) => {
    const payload = value.trim();
    if (payload === "" || checkInMutation.isPending) return;
    setError(null);
    setResult(null);
    try {
      const response = await checkInMutation.mutateAsync(payload);
      setResult(response.data);
      setTicket("");
      showToast(response.message ?? "Check-in berhasil.", "success");
    } catch (submitError) {
      setError(toApiErrorState(submitError).message || "Tiket tidak valid.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };


  useEffect(() => {
    const Detector = getDetector();
    if (!scanning || !Detector) return;
    let active = true;
    const detector = new Detector({ formats: ["qr_code"] });

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        while (active) {
          const codes = await detector.detect(videoRef.current).catch(() => []);
          if (codes[0]?.rawValue) {
            stopCamera();
            void submit(codes[0].rawValue);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch {
        setError("Kamera tidak dapat diakses. Izinkan akses kamera atau ketik kode tiket.");
        stopCamera();
      }
    })();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dijalankan ulang hanya saat status kamera berubah
  }, [scanning]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(ticket);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Loket"
        title="Check-in Tiket"
        description="Pindai QR pada e-tiket pengunjung atau ketik isinya (format KODE.TOKEN). Tiket hanya sah sekali, pada tanggal kunjungan, dan setelah lunas."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Kunjungan hari ini" value={todayQuery.isLoading ? "..." : String(visits.length)} icon={<Users className="size-5" />} />
        <StatCard label="Sudah check-in" value={String(checkedIn.length)} tone="positive" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Peserta hadir" value={String(checkedIn.reduce((sum, visit) => sum + visit.participant_count, 0))} icon={<Users className="size-5" />} />
      </div>

      <section className="ui-panel grid gap-6 p-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <TextInput
              aria-label="Isi QR tiket"
              placeholder="TNGL-XXXXXXXX.token"
              value={ticket}
              autoFocus
              onChange={(event) => setTicket(event.target.value)}
              className="font-mono"
            />
            <Button type="submit" icon={<ScanLine className="size-4" />} loading={checkInMutation.isPending}>Validasi</Button>
          </form>
          <Button
            variant="outline"
            icon={scanning ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
            onClick={() => {
              if (scanning) return stopCamera();
              if (!getDetector()) return setError("Browser ini belum mendukung pemindaian QR. Ketik kode tiket secara manual.");
              setError(null);
              setScanning(true);
            }}
          >
            {scanning ? "Matikan kamera" : "Pindai dengan kamera"}
          </Button>
          <video ref={videoRef} muted playsInline className={scanning ? "aspect-video w-full rounded-2xl bg-forest-black object-cover" : "hidden"} />
          {error ? <FormAlert message={error} /> : null}
        </div>

        <div className="rounded-2xl border border-line bg-surface-muted p-5">
          {result ? (
            <div className="flex flex-col gap-3 text-sm">
              <p className="flex items-center gap-2 text-lg font-bold text-forest-primary"><CheckCircle2 className="size-6" />Check-in berhasil</p>
              <p className="font-mono text-xs font-bold text-primary">{result.booking_code}</p>
              <p className="text-ink">{result.route?.name} · pemandu {result.shift?.guide?.display_name ?? "-"}</p>
              <ul className="divide-y divide-line rounded-xl bg-surface px-3">
                {(result.participants ?? []).map((participant, index) => (
                  <li key={participant.participant_id ?? index} className="flex justify-between py-2">
                    <span>{participant.full_name}</span>
                    <span className="text-xs text-muted">{VISITOR_TYPE_LABELS[participant.visitor_type]}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">Cocokkan nama peserta dengan identitas (dan kartu pelajar untuk tarif pelajar).</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Hasil validasi tiket akan tampil di sini.</p>
          )}
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-ink">Daftar kunjungan hari ini</h2>
          <p className="mt-1 text-sm text-muted">Pemesanan lunas untuk tanggal hari ini.</p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable data={visits} columns={columns} loading={todayQuery.isLoading} getRowId={(row) => String(row.booking_id)} label="kunjungan" emptyTitle="Belum ada kunjungan hari ini" />
        </div>
      </section>
    </div>
  );
}
