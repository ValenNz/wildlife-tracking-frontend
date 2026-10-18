import { formatDate } from "@/utils/format";
import type { DeviceAlert } from "@/types/tracking-device";
import type { GpsReading } from "@/types/gps-reading";

type DeviceAlertsProps = {
  alerts: DeviceAlert[];
};

const severityLabel = (alert: DeviceAlert): string => {
  if (alert.battery_level !== null && alert.battery_level < 20) {
    return "Baterai lemah";
  }

  return "Sinyal lemah";
};

export function DeviceAlerts({ alerts }: DeviceAlertsProps) {
  if (alerts.length === 0) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Tidak ada perangkat yang memerlukan perhatian.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.map((alert) => (
        <li
          key={alert.device_id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900"
        >
          <span className="font-medium">
            {alert.model}
            <span className="block text-xs font-normal opacity-80">
              Perangkat #{alert.device_id}
              {alert.animal_id ? ` · Satwa #${alert.animal_id}` : " · Belum dipasangkan"}
            </span>
          </span>
          <span className="text-xs font-semibold">{severityLabel(alert)}</span>
        </li>
      ))}
    </ul>
  );
}

type ReadingFeedProps = {
  readings: GpsReading[];
};

export function ReadingFeed({ readings }: ReadingFeedProps) {
  return (
    <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {readings.map((reading) => {
        const animalName = reading.trackingDevice?.animal?.name ?? "Satwa tidak diketahui";

        return (
          <li key={reading.reading_id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="font-medium text-zinc-900">{animalName}</span>
            <span className="text-xs tabular-nums text-zinc-600">
              {Number(reading.latitude).toFixed(4)}, {Number(reading.longitude).toFixed(4)}
            </span>
            <span className="text-xs text-zinc-500">{formatDate(reading.recorded_at)}</span>
          </li>
        );
      })}
    </ul>
  );
}