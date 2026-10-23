
"use client";

import { useMemo, useState } from "react";

type GeoZone = {
  id: number;
  name: string;
  description: string;
  area: string;
  status: "Aktif" | "Nonaktif";
};

const DUMMY_GEO_ZONES: GeoZone[] = [
  {
    id: 1,
    name: "Zona Konservasi A",
    description: "Area perlindungan dan konservasi satwa liar",
    area: "Wilayah A",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Zona Pemantauan B",
    description: "Area pemantauan pergerakan satwa liar",
    area: "Wilayah B",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Zona Penelitian C",
    description: "Area untuk kegiatan penelitian ekologi",
    area: "Wilayah C",
    status: "Nonaktif",
  },
  {
    id: 4,
    name: "Zona Konservasi D",
    description: "Area pendukung kegiatan konservasi",
    area: "Wilayah D",
    status: "Aktif",
  },
];

export default function GeoZonesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedZone, setSelectedZone] = useState<GeoZone | null>(null);

  const filteredZones = useMemo(() => {
    return DUMMY_GEO_ZONES.filter((zone) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        zone.name.toLowerCase().includes(keyword) ||
        zone.description.toLowerCase().includes(keyword) ||
        zone.area.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" || zone.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const activeCount = DUMMY_GEO_ZONES.filter(
    (zone) => zone.status === "Aktif",
  ).length;

  const inactiveCount = DUMMY_GEO_ZONES.filter(
    (zone) => zone.status === "Nonaktif",
  ).length;

  return (
    <main className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Zona Geografis
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Pengelolaan zona geografis Taman Nasional Gunung Leuser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Zona</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {DUMMY_GEO_ZONES.length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Seluruh zona terdaftar
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Zona Aktif</p>
          <p className="mt-2 text-3xl font-semibold text-green-700">
            {activeCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Zona berstatus aktif
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Zona Nonaktif</p>
          <p className="mt-2 text-3xl font-semibold text-gray-600">
            {inactiveCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Zona berstatus nonaktif
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Daftar Zona</h2>
            <p className="mt-1 text-sm text-gray-500">
              Informasi zona geografis yang terdaftar dalam sistem.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
            {filteredZones.length} zona ditemukan
          </span>
        </div>

        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau deskripsi zona..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-700"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-medium">No.</th>
                <th className="px-5 py-4 font-medium">Nama Zona</th>
                <th className="px-5 py-4 font-medium">Deskripsi</th>
                <th className="px-5 py-4 font-medium">Wilayah</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredZones.map((zone, index) => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {zone.name}
                  </td>
                  <td className="max-w-xs px-5 py-4 text-gray-600">
                    {zone.description}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{zone.area}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        zone.status === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {zone.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedZone(zone)}
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
                    colSpan={6}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Zona geografis tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
          Menampilkan {filteredZones.length} dari {DUMMY_GEO_ZONES.length} zona
        </div>
      </section>

      {selectedZone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedZone(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="zone-detail-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
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
                onClick={() => setSelectedZone(null)}
                aria-label="Tutup detail"
                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nama Zona</p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedZone.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Deskripsi</p>
                <p className="mt-1 text-gray-900">
                  {selectedZone.description}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Wilayah</p>
                <p className="mt-1 text-gray-900">{selectedZone.area}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedZone.status}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
