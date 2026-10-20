
import {
  PawPrint,
  Leaf,
  RadioTower,
  MapPin,
} from "lucide-react";

export const DUMMY_DASHBOARD_STATS = [
  {
    label: "Total Satwa",
    value: "24",
    detail: "Satwa terdaftar",
    icon: PawPrint,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Spesies",
    value: "3",
    detail: "Spesies terpantau",
    icon: Leaf,
    color: "bg-lime-50 text-lime-700",
  },
  {
    label: "Perangkat Aktif",
    value: "18",
    detail: "2 perlu diperiksa",
    icon: RadioTower,
    color: "bg-sky-50 text-sky-700",
  },
  {
    label: "Pembacaan GPS",
    value: "1.284",
    detail: "Data pemantauan",
    icon: MapPin,
    color: "bg-amber-50 text-amber-700",
  },
];
