"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Expand, Pause, Play, RotateCcw, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TYPE_MODEL_HOTSPOT } from "@/types/wildlife.type";

type Vector = { x: number; y: number; z: number };
type ModelViewerElement = HTMLElement & {
  cameraTarget: string;
  cameraOrbit: string;
  fieldOfView: string;
  loaded: boolean;
  positionAndNormalFromPoint: (x: number, y: number) => { position: Vector; normal: Vector } | null;
};

export type SpeciesViewerHandle = { focusHotspot: (index: number) => void; reset: () => void };

/** Sudut tiga perempat dari depan-samping: bentuk tubuh lebih terbaca daripada tampak depan lurus. */
const DEFAULT_ORBIT = "35deg 75deg auto";

const vec = (value: Vector) => `${value.x.toFixed(3)}m ${value.y.toFixed(3)}m ${value.z.toFixed(3)}m`;

/**
 * Penampil model 3D satwa berbasis <model-viewer>: putar (seret), perbesar (scroll/cubit), geser (klik kanan / dua jari),
 * putar otomatis, titik keterangan bernomor, layar penuh, dan AR (WebXR) di ponsel yang mendukung.
 * Mode `picking`: klik pada permukaan model mengembalikan posisi & normal untuk membuat titik keterangan baru.
 */
export const SpeciesViewer = forwardRef<
  SpeciesViewerHandle,
  {
    src: string | null;
    alt: string;
    hotspots: TYPE_MODEL_HOTSPOT[];
    activeHotspot?: number | null;
    onHotspotClick?: (index: number) => void;
    picking?: boolean;
    onPick?: (point: { position: string; normal: string }) => void;
    className?: string;
    compact?: boolean;
  }
>(function SpeciesViewer({ src, alt, hotspots, activeHotspot = null, onHotspotClick, picking = false, onPick, className, compact = false }, ref) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(!compact);
  const [showLabels, setShowLabels] = useState(true);

  // model-viewer mendaftarkan custom element saat diimpor; hanya di browser.
  useEffect(() => {
    let active = true;
    import("@google/model-viewer")
      .then(() => active && setReady(true))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const onLoad = () => setLoaded(true);
    const onError = () => setFailed(true);
    viewer.addEventListener("load", onLoad);
    viewer.addEventListener("error", onError);
    return () => {
      viewer.removeEventListener("load", onLoad);
      viewer.removeEventListener("error", onError);
    };
  }, [ready, src]);

  const reset = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.cameraTarget = "auto auto auto";
    viewer.cameraOrbit = DEFAULT_ORBIT;
    viewer.fieldOfView = "auto";
  }, []);

  const focusHotspot = useCallback(
    (index: number) => {
      const viewer = viewerRef.current;
      const hotspot = hotspots[index];
      if (!viewer || !hotspot) return;
      setAutoRotate(false);
      viewer.cameraTarget = hotspot.position;
      viewer.fieldOfView = "32deg";
    },
    [hotspots],
  );

  useImperativeHandle(ref, () => ({ focusHotspot, reset }), [focusHotspot, reset]);

  useEffect(() => {
    if (activeHotspot !== null && activeHotspot !== undefined) focusHotspot(activeHotspot);
  }, [activeHotspot, focusHotspot]);

  const handleClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (!picking || !onPick || !viewerRef.current) return;
    const hit = viewerRef.current.positionAndNormalFromPoint(event.clientX, event.clientY);
    if (hit) onPick({ position: vec(hit.position), normal: vec(hit.normal) });
  };

  const fullscreen = () => {
    const element = wrapperRef.current;
    if (!element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element.requestFullscreen?.();
  };

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center rounded-2xl border border-line bg-surface-muted p-6 text-center text-sm text-muted", className)}>
        Model 3D tidak dapat ditampilkan (browser tanpa WebGL atau berkas rusak).
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={cn("relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_35%,#f4f7f2,#dfe7dc)]", className)}>
      {ready && src ? (
        <model-viewer
          ref={viewerRef as never}
          src={src}
          alt={alt}
          camera-controls=""
          camera-orbit={DEFAULT_ORBIT}
          touch-action="pan-y"
          auto-rotate={autoRotate ? "" : undefined}
          auto-rotate-delay="1500"
          rotation-per-second="18deg"
          shadow-intensity="1.1"
          shadow-softness="0.8"
          exposure="1.05"
          environment-image="neutral"
          interaction-prompt={compact ? "none" : "auto"}
          ar={compact ? undefined : ""}
          ar-modes="webxr"
          interpolation-decay="120"
          disable-zoom={compact ? "" : undefined}
          onClick={handleClick}
          style={{ width: "100%", height: "100%", cursor: picking ? "crosshair" : undefined, ["--poster-color" as string]: "transparent" }}
        >
          {!compact && showLabels
            ? hotspots.map((hotspot, index) => (
                <button
                  key={`${hotspot.position}-${index}`}
                  type="button"
                  slot={`hotspot-${index}`}
                  data-position={hotspot.position}
                  data-normal={hotspot.normal ?? undefined}
                  data-visibility-attribute="visible"
                  onClick={(event) => {
                    event.stopPropagation();
                    onHotspotClick?.(index);
                    focusHotspot(index);
                  }}
                  title={hotspot.label}
                  className={cn(
                    "group flex size-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg transition data-[visible]:opacity-100 opacity-35",
                    activeHotspot === index ? "scale-110 bg-[#e0662d]" : "bg-primary",
                  )}
                >
                  {index + 1}
                  <span className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-forest-black/85 px-2 py-1 text-[11px] font-semibold group-hover:block">
                    {hotspot.label}
                  </span>
                </button>
              ))
            : null}
          <span slot="progress-bar" />
          {!compact ? (
            <button slot="ar-button" type="button" className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary-dark shadow">
              Lihat di ruangan (AR)
            </button>
          ) : null}
        </model-viewer>
      ) : null}

      {!loaded ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-muted">
          {src === null && ready ? "Model 3D belum tersedia" : "Memuat model 3D…"}
        </div>
      ) : null}

      {!compact && loaded ? (
        <div className="absolute left-3 top-3 flex gap-1.5">
          <button type="button" onClick={() => setAutoRotate((value) => !value)} aria-pressed={autoRotate} title={autoRotate ? "Hentikan putaran" : "Putar otomatis"} className="inline-flex size-9 items-center justify-center rounded-xl bg-white/90 text-ink shadow hover:bg-white">
            {autoRotate ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button type="button" onClick={reset} title="Atur ulang kamera" className="inline-flex size-9 items-center justify-center rounded-xl bg-white/90 text-ink shadow hover:bg-white">
            <RotateCcw className="size-4" />
          </button>
          {hotspots.length > 0 ? (
            <button type="button" onClick={() => setShowLabels((value) => !value)} aria-pressed={showLabels} title="Tampilkan/sembunyikan titik keterangan" className={cn("inline-flex size-9 items-center justify-center rounded-xl shadow", showLabels ? "bg-primary text-white" : "bg-white/90 text-ink")}>
              <Tag className="size-4" />
            </button>
          ) : null}
          <button type="button" onClick={fullscreen} title="Layar penuh" className="inline-flex size-9 items-center justify-center rounded-xl bg-white/90 text-ink shadow hover:bg-white">
            <Expand className="size-4" />
          </button>
        </div>
      ) : null}

      {picking ? (
        <p className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-forest-black/80 px-3 py-2 text-center text-xs font-semibold text-white">
          Klik bagian tubuh pada model untuk menaruh titik keterangan baru
        </p>
      ) : null}
    </div>
  );
});
