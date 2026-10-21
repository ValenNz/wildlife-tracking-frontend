"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { getDeviceColumns } from "@/app/(protected)/master-data/devices/columns";
import {
  ACTIVE_OPTIONS,
  CONDITION_OPTIONS,
  DEFAULT_DEVICE_FILTERS,
  toDeviceCondition,
  toOnlyActiveDevice,
} from "@/app/(protected)/master-data/devices/filter";
import { useTrackingDevices } from "@/hooks/tracking-device.hook";
import { toApiErrorState } from "@/services/api-client";
import type { TrackingDevice } from "@/types/tracking-device.type";

export function DeviceListView() {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULT_DEVICE_FILTERS);

  const { data, isLoading, error, refetch } = useTrackingDevices({
    onlyActive: toOnlyActiveDevice(filters.only_active),
    deviceCondition: toDeviceCondition(filters.device_condition),
  });

  const columns = useMemo(() => getDeviceColumns(), []);

  const visibleDevices = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (search.length === 0) return data?.data ?? [];

    return (data?.data ?? []).filter(
      (device) =>
        device.model.toLowerCase().includes(search) ||
        (device.animal?.animal_code ?? "").toLowerCase().includes(search) ||
        String(device.device_id).includes(search),
    );
  }, [data, filters.search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Perangkat Pelacak</h2>
        <p className="text-sm text-zinc-600">
          Collar GPS, kondisi perangkat, dan level baterai.
        </p>
      </div>

      <DataFilters
        fields={[
          {
            key: "search",
            kind: "search",
            label: "Cari",
            placeholder: "Model, ID, atau nama satwa",
          },
          {
            key: "device_condition",
            kind: "select",
            label: "Kondisi",
            options: CONDITION_OPTIONS,
          },
          { key: "only_active", kind: "select", label: "Aktif", options: ACTIVE_OPTIONS },
        ]}
        values={filters}
        onFilterChange={(values) => setFilters({ ...DEFAULT_DEVICE_FILTERS, ...values })}
        onReset={() => setFilters(DEFAULT_DEVICE_FILTERS)}
      />

      {error ? (
        <ErrorState
          kind={toApiErrorState(error).kind}
          message={toApiErrorState(error).message}
          status={toApiErrorState(error).status}
          errors={toApiErrorState(error).errors}
          onRetry={refetch}
        />
      ) : (
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          loading={isLoading}
          onRowClick={(row) => router.push(`/master-data/devices/${row.device_id}/detail`)}
          getRowId={(row) => String(row.device_id)}
          label="daftar perangkat"
          emptyTitle="Belum ada perangkat"
          emptyDescription="Tidak ada perangkat yang cocok dengan filter saat ini."
        />
      )}
    </div>
  );
}