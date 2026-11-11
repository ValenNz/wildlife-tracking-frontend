
"use client";

import { useMemo, useState } from "react";

import { useGeoZones } from "@/hooks/use-geo-zones";

import type { GeoZone } from "@/types/geo-zone";

export default function GeoZonesPage() {
  const {
    data: zones = [],
    isLoading,
    error,
    refetch,
  } = useGeoZones();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  
  const selectedZone = zones.find(
    (zone) => zone.zone_id === selectedZoneId,
  );

  const filteredZones = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return zones.filter((zone) => {
      const matchesSearch =
        zone.zone_name.toLowerCase().includes(keyword) ||
        zone.zone_type.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "Semua" || zone.zone_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [zones, search, typeFilter]);

  // Statistik zona
  const radiusCount = zones.filter(
    (zone) => zone.radius_km !== null && zone.radius_km !== "",
  ).length;

  const polygonCount = zones.filter(
    (zone) => zone.polygon_geojson !== null,
  ).length;

  // Format nilai
  const formatValue = (
    value: number | string | null | undefined,
  ) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return String(value);
  };

  // Format GeoJSON
  const formatGeoJSON = (value: GeoZone["polygon_geojson"]) => {
    if (value === null) return "—";

    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }

    return JSON.stringify(value, null, 2);
  };

  // Tutup modal detail
  const closeDetail = () => {
    setSelectedZoneId(null);
  };

  return (
    <main className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Zona Geografis
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Pengelolaan zona geografis Taman Nasional Gunung Leuser.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Zona</p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {isLoading ? "..." : zones.length}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Seluruh zona dari backend
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Zona Beradius</p>

          <p className="mt-2 text-3xl font-semibold text-green-700">
            {isLoading ? "..." : radiusCount}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Zona yang memiliki radius
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Zona Berpoligon</p>

          <p className="mt-2 text-3xl font-semibold text-gray-600">
            {isLoading ? "..." : polygonCount}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Zona yang memiliki data GeoJSON
          </p>
        </div>
      </div>

      {/* Daftar Zona */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Daftar Zona
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Informasi zona geografis yang terdaftar dalam sistem.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
            {filteredZones.length} zona ditemukan
          </span>
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau jenis zona..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-700"
          >
            <option value="Semua">Semua Jenis</option>
            <option value="jalan_raya">Jalan Raya</option>
            <option value="koridor_ekologis">Koridor Ekologis</option>
            <option value="perkebunan">Perkebunan</option>
            <option value="permukiman">Permukiman</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-medium">No.</th>
                <th className="px-5 py-4 font-medium">Nama Zona</th>
                <th className="px-5 py-4 font-medium">Jenis Zona</th>
                <th className="px-5 py-4 font-medium">Latitude</th>
                <th className="px-5 py-4 font-medium">Longitude</th>
                <th className="px-5 py-4 font-medium">Radius (km)</th>
                <th className="px-5 py-4 font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Memuat data zona dari backend...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-red-600">
                      Gagal mengambil data zona geografis.
                    </p>

                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-3 font-medium text-green-700 hover:text-green-900"
                    >
                      Coba lagi
                    </button>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredZones.map((zone, index) => (
                    <tr
                      key={zone.zone_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900">
                        {zone.zone_name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {zone.zone_type}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatValue(zone.center_lat)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatValue(zone.center_lon)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatValue(zone.radius_km)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedZoneId(zone.zone_id)
                          }
                          className="font-medium text-green-700 hover:text-green-900"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredZones.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        Zona geografis tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
          Menampilkan {isLoading || error ? 0 : filteredZones.length} dari{" "}
          {isLoading || error ? 0 : zones.length} zona
        </div>
      </section>

      {/* Modal Detail Zona */}
      {selectedZoneId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetail}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="zone-detail-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="zone-detail-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Detail Zona
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informasi zona geografis
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                aria-label="Tutup detail"
                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            {/* Loading */}
            {!selectedZone ? (
              <p className="py-8 text-center text-gray-500">
                Data zona tidak ditemukan.
              </p>
            ) : (
              <>
                {/* Isi Detail */}
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ID Zona</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {selectedZone.zone_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Nama Zona</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {selectedZone.zone_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Jenis Zona</p>
                    <p className="mt-1 text-gray-900">
                      {selectedZone.zone_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="mt-1 text-gray-900">
                      {formatValue(selectedZone.center_lat)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="mt-1 text-gray-900">
                      {formatValue(selectedZone.center_lon)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Radius (km)</p>
                    <p className="mt-1 text-gray-900">
                      {formatValue(selectedZone.radius_km)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Dibuat oleh (ID)</p>
                    <p className="mt-1 text-gray-900">
                      {formatValue(selectedZone.created_by)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                    <p className="mt-1 text-gray-900">
                      {formatValue(selectedZone.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">GeoJSON</p>

                    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                      {formatGeoJSON(selectedZone.polygon_geojson)}
                    </pre>
                  </div>
                </div>

                {/* Tombol Tutup */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900"
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
