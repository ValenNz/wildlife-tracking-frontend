"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { DataFilters } from "@/components/filter";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";

import { getDeviceColumns } from "./column";

import {
  ACTIVE_OPTIONS,
  CONDITION_OPTIONS,
  DEFAULT_DEVICE_FILTERS,
} from "./filter";

import {
  useTrackingDevices,
  useTrackingDeviceDelete,
} from "@/hooks/use-devices";

import { useToast } from "@/components/toast";
import { formatApiError, toApiErrorState } from "@/services/api";

import type { TrackingDevice } from "@/types/device.type";

export default function DeviceListPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [filters, setFilters] = useState(DEFAULT_DEVICE_FILTERS);

  const [selectedDeleteDevice, setSelectedDeleteDevice] =
    useState<TrackingDevice | null>(null);

  const query = useTrackingDevices();

  const deleteMutation = useTrackingDeviceDelete(
    selectedDeleteDevice?.device_id ?? 0,
  );

  const devices = useMemo(() => query.data?.data ?? [], [query.data]);

  const handleCreate = useCallback(() => {
    router.push("/devices/create");
  }, [router]);

  const handleEdit = useCallback(
    (device: TrackingDevice) => {
      router.push(`/devices/${device.device_id}/edit`);
    },
    [router],
  );

  const handleDelete = useCallback(
    (device: TrackingDevice) => {
      deleteMutation.reset();
      setSelectedDeleteDevice(device);
    },
    [deleteMutation],
  );

  const handleConfirmDelete = async () => {
    if (!selectedDeleteDevice) return;

    try {
      await deleteMutation.mutateAsync();

      showToast("Perangkat berhasil dihapus.", "success");
      setSelectedDeleteDevice(null);
    } catch (error) {
      showToast(
        formatApiError(error, "Gagal menghapus perangkat."),
        "error",
      );
    }
  };

  const columns = useMemo(
    () =>
      getDeviceColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  const visibleDevices = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesSearch =
        search.length === 0 ||
        device.model.toLowerCase().includes(search) ||
        (device.animal?.animal_code ?? "")
          .toLowerCase()
          .includes(search) ||
        String(device.device_id).includes(search);

      const matchesCondition =
        !filters.device_condition ||
        filters.device_condition === "all" ||
        device.device_condition === filters.device_condition;

      const matchesActive =
        !filters.only_active ||
        filters.only_active === "all" ||
        (filters.only_active === "active" &&
          Boolean(device.is_active)) ||
        (filters.only_active === "inactive" &&
          !Boolean(device.is_active));

      return (
        matchesSearch &&
        matchesCondition &&
        matchesActive
      );
    });
  }, [devices, filters]);

  const totalDevices = devices.length;

  const activeDevices = devices.filter(
    (device) => Boolean(device.is_active),
  ).length;

  const lowBatteryDevices = devices.filter(
    (device) =>
      device.battery_level !== null &&
      device.battery_level < 20,
  ).length;

  if (query.isPending) {
    return (
      <DataTable
        data={[]}
        columns={columns}
        loading
        label="daftar perangkat"
      />
    );
  }

  if (query.isError) {
    const error = toApiErrorState(query.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Master Data"
        title="Perangkat Pelacak"
        description="Pantau perangkat GPS, kondisi perangkat, dan level baterai satwa."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={handleCreate}>
            Tambah Perangkat
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Perangkat" value={String(totalDevices)} />
        <StatCard
          label="Perangkat Aktif"
          value={String(activeDevices)}
          tone="positive"
        />
        <StatCard
          label="Baterai di Bawah 20%"
          value={String(lowBatteryDevices)}
          tone="warning"
        />
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
          setFilters({
            ...DEFAULT_DEVICE_FILTERS,
            ...values,
          })
        }
        onReset={() => setFilters(DEFAULT_DEVICE_FILTERS)}
      />

      <DataTable
        data={visibleDevices}
        columns={columns}
        loading={query.isFetching}
        onRowClick={(row: TrackingDevice) =>
          router.push(
            `/devices/${row.device_id}/detail`,
          )
        }
        getRowId={(row) => String(row.device_id)}
        label="daftar perangkat"
        emptyTitle="Belum ada perangkat"
        emptyDescription="Tidak ada perangkat yang cocok dengan filter saat ini."
      />

      <ConfirmationDialog
        open={selectedDeleteDevice !== null}
        title="Hapus Perangkat?"
        description={
          <p>
            Apakah kamu yakin ingin menghapus perangkat{" "}
            <span className="font-semibold text-forest-black">
              {selectedDeleteDevice?.model}
            </span>{" "}
            (ID: {selectedDeleteDevice?.device_id})? Tindakan ini tidak dapat
            dibatalkan.
          </p>
        }
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? formatApiError(
                deleteMutation.error,
                "Gagal menghapus perangkat. Silakan coba lagi.",
              )
            : null
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          deleteMutation.reset();
          setSelectedDeleteDevice(null);
        }}
      />

    </div>
  );
}
