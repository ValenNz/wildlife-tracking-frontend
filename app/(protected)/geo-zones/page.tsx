"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import { useGeoZones, useGeoZoneDelete } from "@/hooks/use-geo-zones";

import { getGeoZoneColumns } from "./column";
import { INITIAL_FILTERS, ZONE_TYPE_OPTIONS } from "./filter";
import { useToast } from "@/components/toast";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { ErrorState } from "@/components/ui/error-state";
import { Modal } from "@/components/ui/modal";

import { ZoneContents, ZoneLocator } from "./zone-contents";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { formatApiError, toApiErrorState } from "@/services/api";
import { formatDisplayValue, formatGeoJson } from "@/utils/format";

import type { GeoZone } from "@/types/geo-zone.type";
import type { GeoZoneFilterValues } from "./filter";

export default function GeoZonesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<GeoZoneFilterValues>(INITIAL_FILTERS);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [deletingZone, setDeletingZone] = useState<GeoZone | null>(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  const params = useMemo(
    () => ({
      search: debouncedSearch,
      zoneType: filters.zoneType === "all" ? undefined : filters.zoneType,
    }),
    [debouncedSearch, filters.zoneType],
  );

  const query = useGeoZones(params);
  const deleteMutation = useGeoZoneDelete(deletingZone?.zone_id ?? 0);

  const zones = query.data ?? [];
  const selectedZone = zones.find((zone) => zone.zone_id === selectedZoneId);

  const closeDetail = useCallback(() => {
    setSelectedZoneId(null);
  }, []);

  const openCreateForm = useCallback(() => {
    router.push("/geo-zones/create");
  }, [router]);

  const openEditForm = useCallback(
    (zone: GeoZone) => {
      router.push(`/geo-zones/${zone.zone_id}/edit`);
    },
    [router],
  );

  const openDeleteDialog = useCallback((zone: GeoZone) => {
    setDeletingZone(zone);
  }, []);

  const columns = useMemo(
    () =>
      getGeoZoneColumns({
        onDetail: (zone) => setSelectedZoneId(zone.zone_id),
        onEdit: openEditForm,
        onDelete: openDeleteDialog,
      }),
    [openDeleteDialog, openEditForm],
  );

  const closeDeleteDialog = useCallback(() => {
    if (deleteMutation.isPending) return;

    setDeletingZone(null);
    deleteMutation.reset();
  }, [deleteMutation]);

  const handleDelete = useCallback(async () => {
    if (!deletingZone) return;

    try {
      await deleteMutation.mutateAsync();

      showToast("Zona berhasil dihapus.", "success");
      setDeletingZone(null);
      setSelectedZoneId(null);
    } catch (error) {
      showToast(formatApiError(error, "Gagal menghapus zona."), "error");
    }
  }, [deleteMutation, deletingZone, showToast]);

  const radiusCount = zones.filter((zone) => zone.radius_km !== null).length;
  const polygonCount = zones.filter((zone) => zone.polygon_geojson !== null).length;

  if (query.isPending) {
    return (
      <DataTable
        data={[]}
        columns={columns}
        loading
        label="daftar zona"
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
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Zona Geografis"
        description="Pengelolaan zona geografis Taman Nasional Gunung Leuser."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={openCreateForm}>
            Tambah Zona
          </Button>
        }
      />

      <ZoneLocator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Zona"
          value={String(zones.length)}
          hint="Seluruh zona dari backend"
        />
        <StatCard
          label="Zona Beradius"
          value={String(radiusCount)}
          hint="Zona yang memiliki radius"
          tone="positive"
        />
        <StatCard
          label="Zona Berpoligon"
          value={String(polygonCount)}
          hint="Zona yang memiliki data GeoJSON"
          tone="info"
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <h2 className="text-base font-bold text-ink">Cari dan Filter Zona</h2>
          <p className="mt-1 text-sm text-muted">
            Cari berdasarkan nama zona atau filter berdasarkan jenis zona.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={[
              {
                key: "search",
                kind: "search",
                label: "Cari Zona",
                placeholder: "Nama zona",
              },
              {
                key: "zoneType",
                kind: "select",
                label: "Jenis Zona",
                options: ZONE_TYPE_OPTIONS,
              },
            ]}
            values={filters}
            onFilterChange={(values) =>
              setFilters({
                ...INITIAL_FILTERS,
                ...values,
              })
            }
            onReset={() => setFilters(INITIAL_FILTERS)}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">Daftar Zona</h2>
            <p className="mt-1 text-sm text-muted">
              Menampilkan {zones.length} zona dari backend.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
            Data API
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTable
            data={zones}
            columns={columns}
            loading={query.isFetching}
            onRowClick={(zone) => setSelectedZoneId(zone.zone_id)}
            getRowId={(zone) => String(zone.zone_id)}
            label="daftar zona"
            emptyTitle="Belum ada zona"
            emptyDescription="Tidak ada zona yang cocok dengan filter saat ini."
          />
        </div>
      </section>

      <Modal
        open={selectedZoneId !== null}
        onClose={closeDetail}
        title="Detail Zona"
        description="Informasi zona geografis"
        size="lg"
      >
        {!selectedZone ? (
          <p className="py-8 text-center text-muted">Data zona tidak ditemukan.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-sage">ID Zona</p>
              <p className="mt-1 font-medium text-forest-black">{selectedZone.zone_id}</p>
            </div>
            <div>
              <p className="text-sm text-sage">Nama Zona</p>
              <p className="mt-1 font-medium text-forest-black">{selectedZone.zone_name}</p>
            </div>
            <div>
              <p className="text-sm text-sage">Jenis Zona</p>
              <p className="mt-1 text-forest-black">{selectedZone.zone_type}</p>
            </div>
            <div>
              <p className="text-sm text-sage">Latitude</p>
              <p className="mt-1 text-forest-black">
                {formatDisplayValue(selectedZone.center_lat)}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage">Longitude</p>
              <p className="mt-1 text-forest-black">
                {formatDisplayValue(selectedZone.center_lon)}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage">Radius (km)</p>
              <p className="mt-1 text-forest-black">
                {formatDisplayValue(selectedZone.radius_km)}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage">Dibuat oleh (ID)</p>
              <p className="mt-1 text-forest-black">
                {formatDisplayValue(selectedZone.created_by)}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage">Tanggal Dibuat</p>
              <p className="mt-1 text-forest-black">
                {formatDisplayValue(selectedZone.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage">GeoJSON</p>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-natural-muted/30 p-3 text-xs text-olive-dark">
                {formatGeoJson(selectedZone.polygon_geojson)}
              </pre>
            </div>
            <ZoneContents zoneId={selectedZone.zone_id} />
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeDetail}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={deletingZone !== null}
        title="Hapus Zona?"
        description={
          <p>
            Apakah kamu yakin ingin menghapus zona{" "}
            <span className="font-semibold text-forest-black">
              {deletingZone?.zone_name}
            </span>
            ? Data yang sudah dihapus tidak dapat dikembalikan.
          </p>
        }
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? formatApiError(deleteMutation.error, "Gagal menghapus zona.")
            : null
        }
        onConfirm={() => void handleDelete()}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
