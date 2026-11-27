"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  Compass,
  Droplets,
  MapPin,
  PhoneCall,
  Radio,
  ShieldAlert,
  Siren,
  Users,
  Wifi,
} from "lucide-react";

import { useToast } from "@/components/toast";
import { EmergencyCallModal } from "@/components/tourism/emergency-call-modal";
import { useRouteSafety, useSendEmergencyAlert } from "@/hooks/use-tourism";
import { formatApiError } from "@/services/api";
import type {
  TYPE_EMERGENCY_ALERT_PAYLOAD,
  TYPE_EMERGENCY_ALERT_RESPONSE,
  TYPE_EMERGENCY_CONTACT,
} from "@/types/tourism.type";
import { formatDateTime } from "@/utils/format";

const EMERGENCY_TYPES: { value: TYPE_EMERGENCY_ALERT_PAYLOAD["emergency_type"]; label: string }[] = [
  { value: "cedera", label: "Cedera / Evakuasi Medis" },
  { value: "tersesat", label: "Terpisah / Tersesat di Jalur" },
  { value: "satwa_agresif", label: "Pertemuan Satwa Agresif" },
  { value: "cuaca_ekstrem", label: "Cuaca Ekstrem / Banjir / Longsor" },
  { value: "kebakaran", label: "Titik Api / Kebakaran Hutan" },
  { value: "lainnya", label: "Keadaan Darurat Lainnya" },
];

const STATUS_BADGE: Record<"aman" | "waspada" | "darurat", { label: string; cls: string }> = {
  aman: { label: "JALUR AMAN", cls: "bg-success-soft text-success border-success/30" },
  waspada: { label: "WASPADA AI", cls: "bg-warning-soft text-warning border-warning/30" },
  darurat: { label: "SIAGA DARURAT", cls: "bg-danger-soft text-danger border-danger/40" },
};

export function TrailSafetyPanel({ slug }: { slug: string }) {
  const { showToast } = useToast();
  const safetyQuery = useRouteSafety(slug);
  const sosMutation = useSendEmergencyAlert(slug);

  const [sosOpen, setSosOpen] = useState(false);
  const [posCode, setPosCode] = useState("POS-1");
  const [emergencyType, setEmergencyType] =
    useState<TYPE_EMERGENCY_ALERT_PAYLOAD["emergency_type"]>("cedera");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [lastSos, setLastSos] = useState<TYPE_EMERGENCY_ALERT_RESPONSE | null>(null);
  const [activeCall, setActiveCall] = useState<TYPE_EMERGENCY_CONTACT | null>(null);

  const safety = safetyQuery.data;
  if (safetyQuery.isLoading || !safety) {
    return (
      <section className="ui-panel p-5">
        <p className="text-sm text-muted">Memuat informasi keselamatan jalur, pos, dan kontak darurat...</p>
      </section>
    );
  }

  const badge = STATUS_BADGE[safety.trail_status];

  const handleCaptureGps = () => {
    if (!("geolocation" in navigator)) {
      showToast("GPS browser tidak tersedia.", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        showToast("Koordinat GPS berhasil diambil.", "success");
      },
      () => {
        showToast("Gagal mengambil koordinat GPS.", "error");
      },
      { timeout: 8000 },
    );
  };

  const handleSubmitSos = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      showToast("Tuliskan detail kondisi darurat minimal 5 karakter.", "error");
      return;
    }

    try {
      const res = await sosMutation.mutateAsync({
        pos_code: posCode,
        emergency_type: emergencyType,
        description: description.trim(),
        latitude: coords?.lat ?? null,
        longitude: coords?.lon ?? null,
      });
      setLastSos(res.data);
      setDescription("");
      setSosOpen(false);
      showToast(`Sinyal darurat ${res.data.alert_code} terkirim ke ${res.data.notified_rangers} petugas.`, "success");
    } catch (err) {
      showToast(formatApiError(err, "Gagal mengirim sinyal darurat."), "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Keadaan Darurat Jalur (Deteksi AI & Instant Alert SOS) */}
      <section className="ui-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="size-5 text-danger" />
            <div>
              <h2 className="text-base font-bold text-ink">
                Keadaan Darurat Jalur · Deteksi AI & Instant Alert
              </h2>
              <p className="text-xs text-muted">
                Dipantau otomatis oleh sensor AI (YAMNet &amp; SpeciesNet) serta laporan SOS langsung ke ranger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.cls}`}>
              {badge.label}
            </span>
            <button
              type="button"
              onClick={() => setSosOpen((prev) => !prev)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-danger px-3.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              <Siren className="size-4" />
              {sosOpen ? "Tutup Form SOS" : "Kirim Sinyal Darurat (SOS)"}
            </button>
          </div>
        </div>

        {lastSos ? (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger-soft p-4 text-sm text-danger">
            <p className="font-bold">
              Sinyal SOS {lastSos.alert_code} Aktif · {lastSos.pos_code} ({lastSos.notified_rangers} petugas diberi notifikasi instan)
            </p>
            {lastSos.nearest_contact ? (
              <p className="mt-1 text-xs text-ink">
                Hubungi segera: <strong>{lastSos.nearest_contact.name}</strong> ({lastSos.nearest_contact.phone})
                {lastSos.nearest_contact.radio_channel ? ` · ${lastSos.nearest_contact.radio_channel}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        {sosOpen ? (
          <form onSubmit={handleSubmitSos} className="mt-4 grid gap-3 rounded-xl border border-danger/30 bg-surface-muted p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sos-pos" className="ui-label">Posisi Pos Terdekat</label>
              <select
                id="sos-pos"
                value={posCode}
                onChange={(e) => setPosCode(e.target.value)}
                className="ui-input"
              >
                {safety.post_details.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sos-type" className="ui-label">Jenis Keadaan Darurat</label>
              <select
                id="sos-type"
                value={emergencyType}
                onChange={(e) =>
                  setEmergencyType(e.target.value as TYPE_EMERGENCY_ALERT_PAYLOAD["emergency_type"])
                }
                className="ui-input"
              >
                {EMERGENCY_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sos-desc" className="ui-label">Detail Situasi &amp; Jumlah Korban/Peserta</label>
              <textarea
                id="sos-desc"
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: 1 peserta terkilir di dekat Pos 1, butuh tandu evakuasi."
                className="ui-input"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={handleCaptureGps}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink hover:border-primary"
              >
                <MapPin className="size-3.5 text-primary" />
                {coords
                  ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                  : "Sertakan Koordinat GPS"}
              </button>

              <button
                type="submit"
                disabled={sosMutation.isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-danger px-4 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
              >
                <Siren className="size-3.5" />
                {sosMutation.isPending ? "Mengirim SOS..." : "Kirim Alert Instan Sekarang"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-5">
          {safety.ai_emergencies.length === 0 ? (
            <p className="border-t border-line pt-4 text-sm text-muted">
              Belum ada anomali berbahaya yang terdeteksi AI pada koridor jalur saat ini.
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {safety.ai_emergencies.map((alert) => (
                <li key={alert.prediction_id} className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0 text-warning" />
                      <span className="text-sm font-semibold text-ink">{alert.label}</span>
                      {alert.detected_at ? (
                        <span className="text-xs text-muted">
                          · {formatDateTime(alert.detected_at)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">{alert.summary}</p>
                  </div>
                  <span className="shrink-0 self-start rounded-md bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger">
                    {alert.threat_level}
                    {alert.confidence !== null ? ` (${alert.confidence}%)` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 2. Detail Informasi Setiap Pos */}
      <section className="ui-panel p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <Compass className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-ink">Detail Informasi Setiap Pos Jalur</h2>
            <p className="text-xs text-muted">
              Elevasi, jarak tempuh, sumber air, cakupan sinyal radio/seluler, dan fasilitas darurat tiap pos.
            </p>
          </div>
        </div>

        <ol className="divide-y divide-line border-t border-line">
          {safety.post_details.map((post) => (
            <li key={post.code} className="grid gap-3 py-4 md:grid-cols-[200px_1fr]">
              <div>
                <p className="text-xs font-semibold text-primary">
                  {post.code} · {post.elevation_m} mdpl · {post.distance_km} km
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-ink">{post.name}</h3>
              </div>

              <div className="space-y-2">
                <dl className="grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <Droplets className="mt-0.5 size-4 shrink-0 text-sky-600" />
                    <span>{post.water_source}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wifi className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>{post.signal}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <span>Kapasitas: {post.capacity}</span>
                  </div>
                </dl>
                {post.notes ? <p className="text-xs leading-5 text-muted">{post.notes}</p> : null}
                {post.facilities.length > 0 ? (
                  <p className="text-xs text-muted">
                    <span className="font-semibold text-ink-soft">Fasilitas:</span>{" "}
                    {post.facilities.join(" · ")}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Kontak Darurat beserta Detailnya */}
      <section className="ui-panel p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <PhoneCall className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-ink">Kontak Darurat &amp; Evakuasi Jalur</h2>
            <p className="text-xs text-muted">
              Simpan nomor posko, frekuensi radio VHF, dan klinik evakuasi sebelum memasuki kawasan hutan.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-line border-t border-line">
          {safety.emergency_contacts.map((contact) => (
            <li
              key={`${contact.name}-${contact.phone}`}
              className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-ink">{contact.name}</h3>
                  <span className="text-xs text-muted">· {contact.available}</span>
                </div>
                <p className="text-xs font-medium text-primary">{contact.role}</p>
                <p className="text-xs text-ink-soft">
                  {contact.location}
                  {contact.radio_channel ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-muted">
                      <Radio className="size-3 text-primary" />
                      {contact.radio_channel}
                    </span>
                  ) : null}
                </p>
                {contact.notes ? <p className="text-xs text-muted">{contact.notes}</p> : null}
              </div>

              <button
                type="button"
                onClick={() => setActiveCall(contact)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white transition hover:bg-primary-dark"
              >
                <PhoneCall className="size-3.5" />
                <span>Hubungi {contact.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <EmergencyCallModal
        key={activeCall ? `${activeCall.name}-${activeCall.phone}` : "closed"}
        contact={activeCall}
        onClose={() => setActiveCall(null)}
      />
    </div>
  );
}
