"use client";

import Link from "next/link";
import { useState } from "react";
import { Link2, Link2Off, MapPinPlus, Radio, UploadCloud } from "lucide-react";

import { AiProcessingBadge, AiThreatBadge } from "@/app/(protected)/ai/vision/ai-status";
import { Button } from "@/components/button";
import { FormField, FormGrid, SelectInput, TextInput } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { useAnimals } from "@/hooks/use-animals";
import {
  useDeviceAssignAnimal,
  useDeviceCaptureUpload,
  useDeviceCaptures,
  useDeviceConditionUpdate,
  useDeviceStatusUpdate,
  useDeviceTelemetryUpdate,
  useDeviceUnassignAnimal,
} from "@/hooks/use-devices";
import { useGpsReadingCreate, useGpsReadingsByDevice } from "@/hooks/use-tracking";
import { ApiError, formatApiError, getApiFieldErrors } from "@/services/api";
import {
  DEVICE_CONDITION_LABELS,
  DEVICE_CONDITIONS,
  type DeviceCondition,
  type TrackingDevice,
} from "@/types/device.type";
import { formatDateTime } from "@/utils/format";

type DeviceOperationsProps = {
  device: TrackingDevice;
  /** manage_master_data: status, kondisi, pasang/lepas kalung */
  canManage: boolean;
  /** create_data: telemetri, titik GPS manual, rekaman kamera/audio */
  canWrite: boolean;
};

const nowLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

/** Operasi perangkat dari endpoint /devices/{id}/... sesuai jenis perangkat. */
export function DeviceOperations({ device, canManage, canWrite }: DeviceOperationsProps) {
  return (
    <div className="flex flex-col gap-6">
      <DeviceStatusPanel device={device} canManage={canManage} canWrite={canWrite} />
      {device.device_type === "gps" ? (
        <>
          <CollarPanel device={device} canManage={canManage} />
          <GpsReadingPanel deviceId={device.device_id} canWrite={canWrite} />
        </>
      ) : (
        <CapturePanel device={device} canWrite={canWrite} />
      )}
    </div>
  );
}

function DeviceStatusPanel({ device, canManage, canWrite }: DeviceOperationsProps) {
  const { showToast } = useToast();
  const statusMutation = useDeviceStatusUpdate(device.device_id);
  const conditionMutation = useDeviceConditionUpdate(device.device_id);
  const telemetryMutation = useDeviceTelemetryUpdate(device.device_id);
  const [battery, setBattery] = useState(device.battery_level?.toString() ?? "");
  const [signal, setSignal] = useState(device.signal_strength?.toString() ?? "");

  const onError = (error: unknown) =>
    showToast(formatApiError(error, "Gagal memperbarui perangkat."), "error");

  return (
    <Panel>
      <SectionHeader
        title="Status Perangkat"
        description={`Data terakhir ${formatDateTime(device.last_recorded_at)}. Baterai di bawah 20% atau sinyal lemah memicu notifikasi.`}
      />
      <FormGrid columns={3}>
        <FormField label="Status" htmlFor="device-active">
          <SelectInput
            id="device-active"
            value={device.is_active ? "1" : "0"}
            disabled={!canManage || statusMutation.isPending}
            onChange={(event) =>
              statusMutation.mutate(event.target.value === "1", {
                onSuccess: () => showToast("Status perangkat disimpan.", "success"),
                onError,
              })
            }
          >
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </SelectInput>
        </FormField>

        <FormField label="Kondisi" htmlFor="device-condition">
          <SelectInput
            id="device-condition"
            value={device.device_condition}
            disabled={!canManage || conditionMutation.isPending}
            onChange={(event) =>
              conditionMutation.mutate(event.target.value as DeviceCondition, {
                onSuccess: () => showToast("Kondisi perangkat disimpan.", "success"),
                onError,
              })
            }
          >
            {DEVICE_CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {DEVICE_CONDITION_LABELS[condition]}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="flex items-end gap-2">
          <FormField label="Baterai (%)" htmlFor="device-battery" className="flex-1">
            <TextInput
              id="device-battery"
              type="number"
              min={0}
              max={100}
              value={battery}
              disabled={!canWrite}
              onChange={(event) => setBattery(event.target.value)}
            />
          </FormField>
          <FormField label="Sinyal (%)" htmlFor="device-signal" className="flex-1">
            <TextInput
              id="device-signal"
              type="number"
              min={0}
              max={100}
              value={signal}
              disabled={!canWrite}
              onChange={(event) => setSignal(event.target.value)}
            />
          </FormField>
          {canWrite ? (
            <Button
              variant="outline"
              size="icon"
              aria-label="Kirim telemetri"
              icon={<Radio className="size-4" />}
              loading={telemetryMutation.isPending}
              onClick={() =>
                telemetryMutation.mutate(
                  {
                    battery_level: battery === "" ? undefined : Number(battery),
                    signal_strength: signal === "" ? undefined : Number(signal),
                  },
                  {
                    onSuccess: () => showToast("Telemetri dikirim.", "success"),
                    onError,
                  },
                )
              }
            />
          ) : null}
        </div>
      </FormGrid>
    </Panel>
  );
}

function CollarPanel({ device, canManage }: Pick<DeviceOperationsProps, "device" | "canManage">) {
  const { showToast } = useToast();
  const animalsQuery = useAnimals();
  const assignMutation = useDeviceAssignAnimal(device.device_id);
  const unassignMutation = useDeviceUnassignAnimal(device.device_id);
  const [animalId, setAnimalId] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);
  const animals = animalsQuery.data?.data?.items ?? [];

  const assign = (force: boolean) =>
    assignMutation.mutate(
      { animalId: Number(animalId), force },
      {
        onSuccess: () => {
          setConflict(null);
          showToast("Kalung dipasang ke satwa.", "success");
        },
        onError: (error) => {
          // 409: satwa sudah memakai kalung lain, minta konfirmasi untuk memindahkan.
          if (error instanceof ApiError && error.status === 409) {
            setConflict(error.message);
            return;
          }
          showToast(formatApiError(error, "Gagal memasang kalung."), "error");
        },
      },
    );

  return (
    <Panel>
      <SectionHeader
        title="Kalung pada Satwa"
        description={
          device.animal
            ? `Terpasang pada ${device.animal.animal_code ?? device.animal.name_animal}.`
            : "Kalung belum terpasang pada satwa."
        }
      />
      {canManage ? (
        <div className="flex flex-wrap items-end gap-2">
          <FormField label="Pasang ke Satwa" htmlFor="collar-animal" className="min-w-56">
            <SelectInput
              id="collar-animal"
              value={animalId}
              disabled={animalsQuery.isLoading}
              onChange={(event) => setAnimalId(event.target.value)}
            >
              <option value="">Pilih satwa</option>
              {animals.map((animal) => (
                <option key={animal.animal_id} value={animal.animal_id}>
                  {animal.animal_code}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <Button
            icon={<Link2 className="size-4" />}
            disabled={animalId === ""}
            loading={assignMutation.isPending}
            onClick={() => assign(false)}
          >
            Pasang
          </Button>
          {device.animal ? (
            <Button
              variant="outline"
              icon={<Link2Off className="size-4" />}
              loading={unassignMutation.isPending}
              onClick={() =>
                unassignMutation.mutate(undefined, {
                  onSuccess: () => showToast("Kalung dilepas dari satwa.", "success"),
                  onError: (error) => showToast(formatApiError(error, "Gagal melepas kalung."), "error"),
                })
              }
            >
              Lepas Kalung
            </Button>
          ) : null}
        </div>
      ) : null}

      <ConfirmationDialog
        open={conflict !== null}
        title="Satwa Sudah Memakai Kalung Lain"
        description={`${conflict ?? ""} Pindahkan ke perangkat ini?`}
        confirmLabel="Pindahkan"
        isPending={assignMutation.isPending}
        onConfirm={() => assign(true)}
        onCancel={() => setConflict(null)}
      />
    </Panel>
  );
}

function GpsReadingPanel({ deviceId, canWrite }: { deviceId: number; canWrite: boolean }) {
  const { showToast } = useToast();
  const readingsQuery = useGpsReadingsByDevice(deviceId);
  const createMutation = useGpsReadingCreate();
  const [form, setForm] = useState({ latitude: "", longitude: "", recorded_at: nowLocal() });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readings = (readingsQuery.data?.data ?? []).slice(0, 20);

  return (
    <Panel>
      <SectionHeader
        title="Titik GPS Terbaru"
        description="Titik baru otomatis dicek terhadap zona: masuk zona risiko memicu notifikasi."
      />
      {canWrite ? (
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <FormField label="Lintang" htmlFor="gps-latitude" error={errors.latitude} className="w-36">
            <TextInput
              id="gps-latitude"
              inputMode="decimal"
              placeholder="3.6714"
              value={form.latitude}
              onChange={(event) => setForm((previous) => ({ ...previous, latitude: event.target.value }))}
            />
          </FormField>
          <FormField label="Bujur" htmlFor="gps-longitude" error={errors.longitude} className="w-36">
            <TextInput
              id="gps-longitude"
              inputMode="decimal"
              placeholder="98.15"
              value={form.longitude}
              onChange={(event) => setForm((previous) => ({ ...previous, longitude: event.target.value }))}
            />
          </FormField>
          <FormField label="Waktu" htmlFor="gps-recorded-at" error={errors.recorded_at}>
            <TextInput
              id="gps-recorded-at"
              type="datetime-local"
              value={form.recorded_at}
              onChange={(event) => setForm((previous) => ({ ...previous, recorded_at: event.target.value }))}
            />
          </FormField>
          <Button
            icon={<MapPinPlus className="size-4" />}
            loading={createMutation.isPending}
            onClick={() =>
              createMutation.mutate(
                {
                  device_id: deviceId,
                  latitude: Number(form.latitude),
                  longitude: Number(form.longitude),
                  recorded_at: form.recorded_at.replace("T", " "),
                },
                {
                  onSuccess: () => {
                    setErrors({});
                    showToast("Titik GPS disimpan.", "success");
                  },
                  onError: (error) => setErrors(getApiFieldErrors(error)),
                },
              )
            }
          >
            Tambah Titik
          </Button>
        </div>
      ) : null}

      {readings.length === 0 ? (
        <p className="text-sm text-muted">Belum ada titik GPS.</p>
      ) : (
        <ul className="divide-y divide-line text-sm">
          {readings.map((reading) => (
            <li key={reading.reading_id} className="flex justify-between gap-3 py-2">
              <span className="tabular-nums text-ink-soft">
                {Number(reading.latitude).toFixed(5)}, {Number(reading.longitude).toFixed(5)}
              </span>
              <span className="text-xs text-muted">{formatDateTime(reading.recorded_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function CapturePanel({ device, canWrite }: Pick<DeviceOperationsProps, "device" | "canWrite">) {
  const { showToast } = useToast();
  const capturesQuery = useDeviceCaptures(device.device_id);
  const uploadMutation = useDeviceCaptureUpload(device.device_id);
  const [file, setFile] = useState<File | null>(null);
  const isAudio = device.device_type === "audio";
  const captures = capturesQuery.data?.data ?? [];

  return (
    <Panel>
      <SectionHeader
        title={isAudio ? "Rekaman Perekam Suara" : "Tangkapan Kamera Jebak"}
        description={
          isAudio
            ? "Rekaman (maks. 25 MB) dianalisis untuk tembakan, gergaji mesin, mesin, dan suara satwa."
            : "Foto atau video (maks. 50 MB) dianalisis untuk satwa, wajah staf, dan aktivitas manusia."
        }
      />
      {canWrite ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="file"
            aria-label="Berkas rekaman"
            accept={
              isAudio
                ? "audio/*,.m4a,.flac"
                : "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            }
            className="text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-forest-deep"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button
            icon={<UploadCloud className="size-4" />}
            disabled={!file}
            loading={uploadMutation.isPending}
            onClick={() =>
              file &&
              uploadMutation.mutate(file, {
                onSuccess: () => {
                  setFile(null);
                  showToast("Rekaman dikirim ke AI.", "success");
                },
                onError: (error) => showToast(formatApiError(error, "Gagal mengirim rekaman."), "error"),
              })
            }
          >
            Kirim Rekaman
          </Button>
        </div>
      ) : null}

      {captures.length === 0 ? (
        <p className="text-sm text-muted">Belum ada rekaman dari perangkat ini.</p>
      ) : (
        <ul className="divide-y divide-line">
          {captures.map((media) => {
            const predictions = media.predictions ?? [];
            const latest = predictions[predictions.length - 1];

            return (
              <li key={media.media_id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                <span className="text-ink-soft">{formatDateTime(media.captured_at ?? media.uploaded_at)}</span>
                {latest ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <AiProcessingBadge status={latest.processing_status} />
                    {latest.threat_level && latest.threat_level !== "none" ? (
                      <AiThreatBadge level={latest.threat_level} />
                    ) : null}
                    <Link
                      href={`/ai/vision/${latest.prediction_id}/detail`}
                      className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {latest.sound_label ?? latest.predictedSpecies?.common_name ?? `Prediksi #${latest.prediction_id}`}
                    </Link>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
