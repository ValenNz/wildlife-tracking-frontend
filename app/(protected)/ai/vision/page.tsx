"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  AudioLines,
  FileText,
  ImagePlus,
  LoaderCircle,
  UploadCloud,
  X,
} from "lucide-react";

import { useToast } from "@/components/toast";
import { AiPredictionResult } from "./ai-prediction-result";
import { Button } from "@/components/button";
import {
  FormAlert,
  FormField,
  FormGrid,
  FormSection,
  SelectInput,
  TextInput,
  fieldDescribedBy,
} from "@/components/form";
import { PageHeader } from "@/components/ui/panel";
import { useIncidentReports } from "@/hooks/use-incidents";
import { useAiPrediction, useAiPredictionUpload } from "@/hooks/use-ai";
import { useTrackingDevices } from "@/hooks/use-devices";
import { useGeoZones } from "@/hooks/use-geo-zones";
import {
  formatApiError,
  getApiFieldErrors,
  toApiErrorState,
} from "@/services/api";
import {
  AI_ACCEPTED_FILE_TYPES,
  AI_MAX_FILE_SIZE_BYTES,
  getAiMediaKind,
} from "@/types/ai.type";
import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { formatDate } from "@/utils/format";

const ACCEPTED_FILE_ATTRIBUTE = [
  ...AI_ACCEPTED_FILE_TYPES,
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp4",
  ".mov",
  ".webm",
  ".wav",
  ".mp3",
  ".m4a",
  ".ogg",
  ".flac",
].join(",");

const validateFile = (file: File): string | null => {

  if (getAiMediaKind(file) === null) {
    return "Format file harus gambar, video, atau audio yang didukung.";
  }
  if (file.size > AI_MAX_FILE_SIZE_BYTES) {
    return `Ukuran file maksimal ${AI_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
};

export default function AiVisionUploadPage() {
  const userRole = useUserRole();
  const canVerify = userRole ? roleHasPermission(userRole, "verify_ai") : false;
  const canDelete = userRole ? roleHasPermission(userRole, "delete_data") : false;
  const { showToast } = useToast();
  const incidentQuery = useIncidentReports();
  const uploadMutation = useAiPredictionUpload();
  const [file, setFile] = useState<File | null>(null);
  const [reportId, setReportId] = useState("");
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [zoneId, setZoneId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [predictionId, setPredictionId] = useState(0);
  const zonesQuery = useGeoZones();
  const devicesQuery = useTrackingDevices();

  const predictionQuery = useAiPrediction(predictionId);
  const result = predictionQuery.data?.data ?? null;
  const zones = zonesQuery.data ?? [];
  const mediaDevices = (devicesQuery.data?.data ?? []).filter(
    (device) => device.device_type !== "gps",
  );

  const incidents = incidentQuery.data?.data ?? [];
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );


  const resultId = result?.prediction_id ?? 0;
  useEffect(() => {
    if (!resultId) return;
    requestAnimationFrame(() =>
      document.getElementById("ai-vision-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, [resultId]);

  useEffect(() => {
    if (!previewUrl) return;

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = (nextFile: File | undefined) => {
    if (!nextFile) return;

    const validationError = validateFile(nextFile);
    setFileError(validationError ?? undefined);
    if (validationError) return;

    setFile(nextFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file) {
      setFileError("Pilih media terlebih dahulu.");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    uploadMutation.mutate(
      {
        file,
        report_id: reportId === "" ? null : Number(reportId),
        zone_id: zoneId === "" ? null : Number(zoneId),
        device_id: deviceId === "" ? null : Number(deviceId),
        captured_at: capturedAt === "" ? null : capturedAt.replace("T", " "),
      },
      {
        onSuccess: (response) => {
          showToast(response.message || "Media berhasil dikirim ke AI.", "success");
          setPredictionId(response.data.prediction.prediction_id);
          setFile(null);
          setFileError(undefined);
        },
        onError: (error) => {
          showToast(
            formatApiError(error, "Gagal menganalisis media. Silakan coba lagi."),
            "error",
          );
          const fieldErrors = getApiFieldErrors(error);
          setFileError(fieldErrors.file ?? "Media gagal diproses backend.");
        },
      },
    );
  };

  const isPending = uploadMutation.isPending;
  const apiErrorState = uploadMutation.isError
    ? toApiErrorState(uploadMutation.error)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Vision"
        title="Identifikasi Satwa dari Media"
        description="Unggah gambar, video, atau audio dari lapangan untuk mendapatkan analisis dari model AI. Hasil bersifat advisory dan memerlukan verifikasi manusia."
      />

      <FormSection
        title="Unggah Media"
        description="Format gambar, video, atau audio yang didukung dengan ukuran maksimal 50 MB. Media diproses oleh backend Laravel."
      >
        <FormGrid columns={2}>
          <FormField
            label="File Media"
            htmlFor="ai-file"
            required
            error={fileError}
            hint="Seret media ke area ini atau klik untuk memilih."
          >
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-muted/50 p-4 text-center"
            >
              {previewUrl ? (
                <div className="flex w-full flex-col items-center gap-3">
                  {file?.type.startsWith("image/") ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-surface">
                      <Image
                        src={previewUrl}
                        alt="Pratinjau media yang akan dianalisis"
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                      />
                    </div>
                  ) : file?.type.startsWith("video/") ? (
                    <video
                      src={previewUrl}
                      controls
                      className="aspect-video w-full rounded-lg border border-line bg-surface"
                    />
                  ) : (
                    <div className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-4">
                      <AudioLines aria-hidden="true" className="size-6 text-primary" />
                      <audio src={previewUrl} controls className="min-w-0 flex-1" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <p className="max-w-full truncate text-xs font-medium text-ink-soft">
                      {file?.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Hapus media"
                      icon={<X className="size-3.5" />}
                      disabled={isPending}
                      onClick={() => {
                        setFile(null);
                        setFileError(undefined);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud aria-hidden="true" className="size-8 text-primary" />
                  <p className="mt-2 text-sm font-medium text-ink-soft">
                    Seret media ke sini
                  </p>
                  <label
                    htmlFor="ai-file"
                    className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
                  >
                    <FileText aria-hidden="true" className="size-4" />
                    Pilih Media
                  </label>
                  <input
                    id="ai-file"
                    type="file"
                    accept={ACCEPTED_FILE_ATTRIBUTE}
                    className="sr-only"
                    aria-describedby={fieldDescribedBy(
                      "ai-file",
                      fileError === undefined,
                      fileError !== undefined,
                    )}
                    disabled={isPending}
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                </>
              )}
            </div>
          </FormField>

          <div className="flex flex-col gap-4">
            <FormField
              label="Zona"
              htmlFor="ai-zone-id"
              hint="Opsional. Orang tidak dikenal di koridor satwa dinilai sebagai ancaman."
            >
              <SelectInput
                id="ai-zone-id"
                value={zoneId}
                disabled={isPending || zonesQuery.isLoading}
                onChange={(event) => setZoneId(event.target.value)}
              >
                <option value="">Tanpa zona</option>
                {zones.map((zone) => (
                  <option key={zone.zone_id} value={zone.zone_id}>
                    {zone.zone_name}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormGrid columns={2}>
              <FormField label="Perangkat Sumber" htmlFor="ai-device-id">
                <SelectInput
                  id="ai-device-id"
                  value={deviceId}
                  disabled={isPending || devicesQuery.isLoading}
                  onChange={(event) => setDeviceId(event.target.value)}
                >
                  <option value="">Unggahan manual</option>
                  {mediaDevices.map((device) => (
                    <option key={device.device_id} value={device.device_id}>
                      {device.model}
                      {device.serial_number ? ` (${device.serial_number})` : ""}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField label="Waktu Pengambilan" htmlFor="ai-captured-at">
                <TextInput
                  id="ai-captured-at"
                  type="datetime-local"
                  value={capturedAt}
                  disabled={isPending}
                  onChange={(event) => setCapturedAt(event.target.value)}
                />
              </FormField>
            </FormGrid>

            <FormField
              label="Laporan Insiden Terkait"
              htmlFor="ai-report-id"
              hint="Opsional. Hubungkan media dengan laporan insiden yang sudah ada."
            >
              <SelectInput
                id="ai-report-id"
                value={reportId}
                disabled={isPending || incidentQuery.isLoading}
                onChange={(event) => setReportId(event.target.value)}
              >
                <option value="">Tidak ada laporan terkait</option>
                {incidents.map((incident) => (
                  <option key={incident.report_id} value={incident.report_id}>
                    #{incident.report_id} · {incident.incident_type} ·{" "}
                    {formatDate(incident.timestamp)}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            {incidentQuery.isError ? (
              <FormAlert
                message={formatApiError(
                  incidentQuery.error,
                  "Gagal memuat daftar laporan insiden.",
                )}
              />
            ) : null}

            {apiErrorState && !fileError ? (
              <FormAlert
                message={formatApiError(
                  uploadMutation.error,
                  "Gagal menganalisis media.",
                )}
              />
            ) : null}

            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary-soft/50 p-3 text-xs text-ink-soft">
              {isPending ? (
                <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-primary" />
              ) : (
                <ImagePlus aria-hidden="true" className="size-5 text-primary" />
              )}
              <span>
                {isPending
                  ? "Backend sedang memproses media dengan model AI. Harap tunggu..."
                  : "Prediksi AI dapat membantu identifikasi, tetapi keputusan akhir tetap oleh petugas."}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={isPending}
              disabled={!file || isPending}
              icon={<UploadCloud className="size-4" />}
              onClick={handleSubmit}
            >
              {isPending ? "Menganalisis..." : "Kirim ke AI"}
            </Button>
          </div>
        </FormGrid>
      </FormSection>

      {result ? (
        <div id="ai-vision-result" className="scroll-mt-20">
        <AiPredictionResult
          prediction={result}
          canVerify={canVerify}
          canDelete={canDelete}
          onVerified={() => void predictionQuery.refetch()}
          onDeleted={() => setPredictionId(0)}
          detailHref={`/ai/vision/${result.prediction_id}/detail`}
        />
        </div>
      ) : null}
    </div>
  );
}
