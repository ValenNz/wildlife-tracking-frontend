"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Mic, MicOff, PhoneCall, PhoneOff, Radio, Volume2, VolumeX, X } from "lucide-react";

import type { TYPE_EMERGENCY_CONTACT } from "@/types/tourism.type";
import { cn } from "@/lib/utils";

type CallStatus = "ringing" | "connected" | "ended";

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function EmergencyCallModal({
  contact,
  onClose,
}: {
  contact: TYPE_EMERGENCY_CONTACT | null;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<CallStatus>("ringing");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [sharedCoords, setSharedCoords] = useState<string | null>(null);

  const speakerMutedRef = useRef(speakerMuted);

  useEffect(() => {
    speakerMutedRef.current = speakerMuted;
  }, [speakerMuted]);

  const playTone = useCallback((freqA: number, freqB: number | null, durationMs: number) => {
    if (speakerMutedRef.current || typeof window === "undefined") return;
    try {
      const win = window as AudioWindow;
      const AudioCtx = window.AudioContext ?? win.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      gain.connect(ctx.destination);

      const oscA = ctx.createOscillator();
      oscA.type = "sine";
      oscA.frequency.setValueAtTime(freqA, ctx.currentTime);
      oscA.connect(gain);
      oscA.start();
      oscA.stop(ctx.currentTime + durationMs / 1000);

      if (freqB !== null) {
        const oscB = ctx.createOscillator();
        oscB.type = "sine";
        oscB.frequency.setValueAtTime(freqB, ctx.currentTime);
        oscB.connect(gain);
        oscB.start();
        oscB.stop(ctx.currentTime + durationMs / 1000);
      }

      window.setTimeout(() => {
        void ctx.close().catch(() => undefined);
      }, durationMs + 150);
    } catch {
      // Abaikan jika AudioContext diblokir.
    }
  }, []);

  const handleEndCall = useCallback(() => {
    if (status === "ended") {
      onClose();
      return;
    }
    setStatus("ended");
    playTone(320, null, 220);
  }, [onClose, playTone, status]);

  // Auto-close modal 800ms after call ends
  useEffect(() => {
    if (status !== "ended") return;
    const timer = window.setTimeout(() => {
      onClose();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [onClose, status]);

  // Ringing tone + auto-connect after 2.4s
  useEffect(() => {
    if (!contact || status !== "ringing") return;

    playTone(440, 480, 650);
    const ringInterval = window.setInterval(() => {
      playTone(440, 480, 650);
    }, 1500);

    const connectTimer = window.setTimeout(() => {
      window.clearInterval(ringInterval);
      setStatus("connected");
      playTone(580, 740, 180);
    }, 2400);

    return () => {
      window.clearInterval(ringInterval);
      window.clearTimeout(connectTimer);
    };
  }, [contact, playTone, status]);

  // Live duration counter while connected
  useEffect(() => {
    if (!contact || status !== "connected") return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [contact, status]);

  // Escape key hangs up & closes cleanly
  useEffect(() => {
    if (!contact) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleEndCall();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contact, handleEndCall]);

  if (!contact) return null;

  const handleShareGps = () => {
    if (!("geolocation" in navigator)) {
      setSharedCoords("GPS tidak tersedia pada perangkat ini");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSharedCoords(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      },
      () => {
        setSharedCoords("3.55270, 98.11860 (Titik Posko)");
      },
      { timeout: 6000 },
    );
  };

  return (
    <div
      data-drunk-immune="true"
      role="dialog"
      aria-modal="true"
      aria-label={`Panggilan Darurat ke ${contact.name}`}
      onClick={(e) => {
        if (status === "ended" && e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4"
    >
      <div className="max-h-[calc(100dvh-1rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-3xl border border-emerald-500/30 bg-[#0b1914] p-5 text-white shadow-2xl sm:p-6">
        {/* Status Pill & Close Button */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono font-bold uppercase tracking-wider",
              status === "ringing"
                ? "bg-amber-500/20 text-amber-300"
                : status === "connected"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                status === "ringing"
                  ? "animate-ping bg-amber-400"
                  : status === "connected"
                    ? "bg-emerald-400"
                    : "bg-rose-400",
              )}
            />
            {status === "ringing"
              ? "Memanggil..."
              : status === "connected"
                ? `Terhubung · ${formatDuration(elapsedSeconds)}`
                : "Panggilan Diakhiri"}
          </span>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-white/60">{contact.available}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panggilan"
              className="inline-flex size-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Contact Avatar & Identity */}
        <div className="my-6 flex flex-col items-center text-center">
          <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-emerald-400/50 bg-emerald-950/80 text-emerald-300">
            {status === "ringing" ? (
              <span className="absolute inset-0 animate-ping rounded-full border border-emerald-400/40" />
            ) : null}
            <PhoneCall className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold leading-snug text-white">{contact.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-emerald-300">{contact.role}</p>
          <p className="mt-1.5 font-mono text-sm font-semibold text-white/90">{contact.phone}</p>
          {contact.radio_channel ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-white/70">
              <Radio className="size-3.5 text-emerald-400" />
              <span>{contact.radio_channel}</span>
            </p>
          ) : null}
        </div>

        {/* Live Call Status / Shared GPS */}
        <div className="mb-5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-center text-xs text-white/80">
          {status === "ringing" ? (
            <p>Menghubungkan ke posko darurat {contact.location}...</p>
          ) : status === "connected" ? (
            <p>
              {micMuted
                ? "Mikrofon Anda dibisukan. Petugas siap menerima laporan."
                : "Saluran suara aktif. Sampaikan posisi pos dan kondisi darurat Anda."}
            </p>
          ) : (
            <p>Panggilan selesai. Tetap tenang dan ikuti arahan petugas.</p>
          )}
          {sharedCoords ? (
            <p className="mt-1.5 font-mono text-[11px] text-emerald-300">
              GPS terkirim ke posko: {sharedCoords}
            </p>
          ) : null}
        </div>

        {/* Interactive Call Controls */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={status === "ended"}
            onClick={() => setMicMuted((m) => !m)}
            aria-pressed={micMuted}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl border py-3 text-[11px] font-semibold transition disabled:opacity-50",
              micMuted
                ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                : "border-white/15 bg-white/5 text-white hover:bg-white/10",
            )}
          >
            {micMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            <span>{micMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            type="button"
            disabled={status === "ended"}
            onClick={() => setSpeakerMuted((s) => !s)}
            aria-pressed={!speakerMuted}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl border py-3 text-[11px] font-semibold transition disabled:opacity-50",
              !speakerMuted
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
            )}
          >
            {speakerMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            <span>Speaker</span>
          </button>

          <button
            type="button"
            disabled={status === "ended"}
            onClick={handleShareGps}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/15 bg-white/5 py-3 text-[11px] font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <MapPin className="size-4 text-emerald-300" />
            <span>Kirim GPS</span>
          </button>
        </div>

        {/* End Call Button */}
        <div className="mt-4 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={handleEndCall}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-sm font-bold text-white shadow-lg transition hover:bg-rose-500"
          >
            <PhoneOff className="size-5" />
            <span>{status === "ended" ? "Tutup Panggilan" : "Akhiri Panggilan (End Call)"}</span>
          </button>

          <a
            href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
            className="text-[11px] text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            Atau buka aplikasi telepon perangkat ({contact.phone})
          </a>
        </div>
      </div>
    </div>
  );
}
