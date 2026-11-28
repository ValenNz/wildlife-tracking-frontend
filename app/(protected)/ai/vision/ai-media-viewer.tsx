"use client";

import { useEffect, useMemo, useRef } from "react";
import { FileAudio, ImageOff, LoaderCircle } from "lucide-react";

import { useAiMediaFile } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";
import type { AiDetectedObject, AiFace, AiMediaType } from "@/types/ai.type";

const toBox = (value: unknown): [number, number, number, number] | null =>
  Array.isArray(value) && value.length === 4 && value.every((item) => typeof item === "number")
    ? (value as [number, number, number, number])
    : null;

type AiMediaViewerProps = {
  mediaId: number;
  mediaType?: AiMediaType | null;
  objects?: AiDetectedObject[] | null;
  faces?: AiFace[] | null;

  seekTo?: number | null;
  className?: string;
  alt: string;
};

const FACE_TONE: Record<string, string> = {
  staff: "border-forest-primary bg-forest-primary text-white",
  possible_staff: "border-natural-muted bg-natural-muted text-forest-black",
  unknown: "border-forest-black bg-forest-black text-white",
};


export function AiMediaViewer({
  mediaId,
  mediaType,
  objects,
  faces,
  seekTo,
  className,
  alt,
}: AiMediaViewerProps) {
  const mediaQuery = useAiMediaFile(mediaId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const objectUrl = useMemo(
    () => (mediaQuery.data?.blob ? URL.createObjectURL(mediaQuery.data.blob) : null),
    [mediaQuery.data],
  );

  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  useEffect(() => {
    if (seekTo === null || seekTo === undefined || !videoRef.current) return;
    videoRef.current.currentTime = seekTo;
    void videoRef.current.play().catch(() => undefined);
  }, [seekTo]);

  const type: AiMediaType =
    mediaType ??
    (mediaQuery.data?.contentType.startsWith("video/")
      ? "video"
      : mediaQuery.data?.contentType.startsWith("audio/")
        ? "audio"
        : "image");

  if (mediaQuery.isPending) {
    return (
      <div className={cn("flex min-h-40 items-center justify-center rounded-xl border border-line bg-surface-muted", className)}>
        <LoaderCircle aria-label="Memuat media" className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (mediaQuery.isError || !objectUrl) {
    return (
      <div className={cn("flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-muted text-xs text-muted", className)}>
        <ImageOff aria-hidden="true" className="size-7" />
        Berkas media tidak dapat dimuat.
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className={cn("flex flex-col justify-center gap-3 rounded-xl border border-line bg-primary-soft/60 p-4", className)}>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <FileAudio aria-hidden="true" className="size-5 text-primary" />
          Rekaman suara
        </div>
        <audio controls src={objectUrl} className="w-full" aria-label={alt} />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className={cn("overflow-hidden rounded-xl border border-line bg-forest-black", className)}>
        <video ref={videoRef} controls src={objectUrl} className="h-full w-full object-contain" aria-label={alt} />
      </div>
    );
  }

  const boxes = objects?.filter((object) => object.box) ?? [];
  const faceBoxes = (faces ?? [])
    .map((face) => ({ face, box: toBox(face.bbox) }))
    .filter((item): item is { face: AiFace; box: [number, number, number, number] } => item.box !== null);

  return (
    <figure className={cn("relative overflow-hidden rounded-xl border border-line bg-surface-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL dari backend privat */}
      <img src={objectUrl} alt={alt} className="block h-auto w-full" />
      {boxes.map((object, index) => (
        <span
          key={`o-${index}`}
          aria-hidden="true"
          className="pointer-events-none absolute border-2 border-white/90 shadow-[0_0_0_1px_rgba(15,31,23,0.6)]"
          style={{
            left: `${object.box!.xmin}%`,
            top: `${object.box!.ymin}%`,
            width: `${object.box!.xmax - object.box!.xmin}%`,
            height: `${object.box!.ymax - object.box!.ymin}%`,
          }}
        >
          <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-white/90 px-1.5 text-[10px] font-semibold text-forest-black">
            {object.label} {Math.round(Number(object.score ?? 0) * 100)}%
          </span>
        </span>
      ))}
      {faceBoxes.map(({ face, box }, index) => {
        const tone = FACE_TONE[face.status] ?? FACE_TONE.unknown;

        return (
          <span
            key={`f-${index}`}
            aria-hidden="true"
            className={cn("pointer-events-none absolute border-2", tone.split(" ")[0])}
            style={{
              left: `${box[0] * 100}%`,
              top: `${box[1] * 100}%`,
              width: `${box[2] * 100}%`,
              height: `${box[3] * 100}%`,
            }}
          >
            <span className={cn("absolute left-0 top-full mt-0.5 whitespace-nowrap rounded px-1.5 text-[10px] font-semibold", tone)}>
              {face.status === "staff" ? face.name : face.status === "possible_staff" ? `${face.name}?` : "Tidak dikenal"}
            </span>
          </span>
        );
      })}
    </figure>
  );
}
