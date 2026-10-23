
"use client";

import {
  PawPrint,
  Leaf,
  RadioTower,
  AlertTriangle,
  MapPin,
  TrendingUp,
} from "lucide-react";

const statistics = [
  {
    title: "Total Satwa Terpantau",
    value: "24",
    description: "Satwa dalam pemantauan",
    icon: PawPrint,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Jumlah Spesies",
    value: "3",
    description: "Spesies yang terdata",
    icon: Leaf,
    color: "bg-lime-100 text-lime-700",
  },
  {
    title: "Perangkat Aktif",
    value: "18",
    description: "Perangkat GPS aktif",
    icon: RadioTower,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Laporan Insiden",
    value: "5",
    description: "Laporan tercatat",
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-700",
  },
];

const speciesData = [
  { name: "Orangutan Sumatra", count: 12, color: "bg-emerald-600" },
  { name: "Harimau Sumatra", count: 7, color: "bg-amber-500" },
  { name: "Badak Sumatra", count: 5, color: "bg-blue-600" },
];

const incidents = [
  {
    title: "Pengamatan satwa",
    location: "Zona pemantauan utara",
    status: "Tercatat",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Peringatan perangkat GPS",
    location: "Zona pemantauan tengah",
    status: "Perlu ditinjau",
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Laporan kondisi kawasan",
    location: "Zona pemantauan selatan",
    status: "Tercatat",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function StatisticsPage() {
  const totalAnimals = speciesData.reduce(
    (total, species) => total + species.count,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <TrendingUp className="size-6" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-950">
            Statistik Kawasan
          </h2>
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Ringkasan data pemantauan satwa liar Taman Nasional Gunung Leuser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    {item.title}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-zinc-900">
                    {item.value}
                  </p>
                </div>

                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">
              Sebaran Satwa per Spesies
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Ringkasan satwa berdasarkan spesies.
            </p>
          </div>

          <div className="mb-6 flex items-end justify-between rounded-xl bg-emerald-50 p-4">
            <div>
              <p className="text-sm text-emerald-800">
                Total satwa dalam contoh data
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-950">
                {totalAnimals}
              </p>
            </div>
            <PawPrint className="size-10 text-emerald-700" />
          </div>

          <div className="flex flex-col gap-5">
            {speciesData.map((species) => (
              <div key={species.name}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="font-medium text-zinc-700">
                    {species.name}
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {species.count} satwa
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full ${species.color}`}
                    style={{
                      width: `${(species.count / totalAnimals) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-zinc-900">
              Ringkasan Insiden
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Contoh informasi kejadian di kawasan pemantauan.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-zinc-100">
            {incidents.map((incident, index) => (
              <div
                key={incident.title}
                className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  {index === 0 ? (
                    <PawPrint className="size-5" />
                  ) : index === 1 ? (
                    <RadioTower className="size-5" />
                  ) : (
                    <MapPin className="size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900">
                    {incident.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {incident.location}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${incident.color}`}
                >
                  {incident.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <Leaf className="mt-0.5 size-5 shrink-0 text-emerald-700" />
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            Informasi pemantauan
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Angka dan laporan pada halaman ini merupakan data dummy untuk
            pengembangan tampilan. Data aktual akan ditampilkan setelah
            integrasi dengan backend.
          </p>
        </div>
      </div>
    </div>
  );
}
