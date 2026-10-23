
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { getDeviceColumns } from "@/app/(protected)/master-data/devices/columns";
import {
  ACTIVE_OPTIONS,
  CONDITION_OPTIONS,
  DEFAULT_DEVICE_FILTERS,
} from "@/app/(protected)/master-data/devices/filter";
import { DUMMY_DEVICES } from "@/constant/dummy-devices";
import type { TrackingDevice } from "@/types/tracking-device.type";

// Simpan kode API lama untuk digunakan kembali nanti.
// import { useTrackingDevices } from "@/hooks/tracking-device.hook";
// import { toApiErrorState } from "@/services/api-client";

export function DeviceListView() {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULT_DEVICE_FILTERS);

  // BACKEND: aktifkan kembali ketika API sudah siap.
  // const { data, isLoading, error, refetch } = useTrackingDevices({
  //   onlyActive: toOnlyActiveDevice(filters.only_active),
  //   deviceCondition: toDeviceCondition(filters.device_condition),
  // });

  const isLoading = false;

  const columns = useMemo(() => getDeviceColumns(), []);

  const visibleDevices = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return DUMMY_DEVICES.filter((device) => {
      const matchesSearch =
        search.length === 0 ||
        device.model.toLowerCase().includes(search) ||
        (device.animal?.animal_code ?? "").toLowerCase().includes(search) ||
        String(device.device_id).includes(search);

      const matchesCondition =
        !filters.device_condition ||
        filters.device_condition === "all" ||
        device.device_condition === filters.device_condition;

      const matchesActive =
        !filters.only_active ||
        filters.only_active === "all" ||
        (filters.only_active === "active" && Boolean(device.is_active)) ||
        (filters.only_active === "inactive" && !device.is_active);

      return matchesSearch && matchesCondition && matchesActive;
    });
  }, [filters]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Perangkat Pelacak
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pantau perangkat GPS, kondisi perangkat, dan level baterai satwa.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Total Perangkat</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {DUMMY_DEVICES.length}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Perangkat Aktif</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {DUMMY_DEVICES.filter((device) => Boolean(device.is_active)).length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Baterai di Bawah 20%</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {
              DUMMY_DEVICES.filter(
                (device) =>
                  device.battery_level !== null &&
                  device.battery_level < 20,
              ).length
            }
          </p>
        </div>
      </div>

      <DataFilters
        fields={[
          {
            key: "search",
            kind: "search",
            label: "Cari",
            placeholder: "Model, ID, atau kode satwa",
          },
          {
            key: "device_condition",
            kind: "select",
            label: "Kondisi",
            options: CONDITION_OPTIONS,
          },
          {
            key: "only_active",
            kind: "select",
            label: "Aktif",
            options: ACTIVE_OPTIONS,
          },
        ]}
        values={filters}
        onFilterChange={(values) =>
          setFilters({ ...DEFAULT_DEVICE_FILTERS, ...values })
        }
        onReset={() => setFilters(DEFAULT_DEVICE_FILTERS)}
      />

      <DataTable
        data={visibleDevices}
        columns={columns}
        loading={isLoading}
        onRowClick={(row) =>
          router.push(`/master-data/devices/${row.device_id}/detail`)
        }
        getRowId={(row) => String(row.device_id)}
        label="daftar perangkat"
        emptyTitle="Belum ada perangkat"
        emptyDescription="Tidak ada perangkat yang cocok dengan filter saat ini."
      />
    </div>
  );
}
