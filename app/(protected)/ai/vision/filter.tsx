import type { FilterField, FilterValues } from "@/components/filter";
import {
  AI_PROCESSING_STATUS_LABELS,
  AI_THREAT_LEVEL_LABELS,
  AI_VERIFICATION_STATUS_LABELS,
} from "@/types/ai.type";

export type AiHistoryFilters = FilterValues & {
  processing_status: string;
  verification_status: string;
  species_id: string;
  threat_level: string;
  analysis_type: string;
  min_confidence: string;
  start_date: string;
  end_date: string;
};

export const INITIAL_FILTERS: AiHistoryFilters = {
  processing_status: "all",
  verification_status: "all",
  species_id: "all",
  threat_level: "all",
  analysis_type: "all",
  min_confidence: "",
  start_date: "",
  end_date: "",
};

type SpeciesOption = {
  species_id: number;
  common_name: string;
};

export const getHistoryFilterFields = (
  speciesList: readonly SpeciesOption[],
): FilterField[] => [
  {
    key: "processing_status",
    kind: "select",
    label: "Status Proses",
    options: [
      { label: "Semua Status Proses", value: "all" },
      ...Object.entries(AI_PROCESSING_STATUS_LABELS).map(
        ([value, label]) => ({ label, value }),
      ),
    ],
  },
  {
    key: "verification_status",
    kind: "select",
    label: "Status Verifikasi",
    options: [
      { label: "Semua Verifikasi", value: "all" },
      ...Object.entries(AI_VERIFICATION_STATUS_LABELS).map(
        ([value, label]) => ({ label, value }),
      ),
    ],
  },
  {
    key: "species_id",
    kind: "select",
    label: "Spesies Terprediksi",
    options: [
      { label: "Semua Spesies", value: "all" },
      ...speciesList.map((species) => ({
        label: species.common_name,
        value: String(species.species_id),
      })),
    ],
  },
  {
    key: "threat_level",
    kind: "select",
    label: "Tingkat Ancaman",
    options: [
      { label: "Semua Ancaman", value: "all" },
      ...Object.entries(AI_THREAT_LEVEL_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    ],
  },
  {
    key: "analysis_type",
    kind: "select",
    label: "Jenis Analisis",
    options: [
      { label: "Foto, Video, dan Audio", value: "all" },
      { label: "Foto & Video", value: "image" },
      { label: "Audio", value: "audio" },
    ],
  },
  {
    key: "min_confidence",
    kind: "select",
    label: "Kepercayaan Minimum",
    options: [
      { label: "Semua Nilai", value: "" },
      { label: "≥ 80%", value: "0.8" },
      { label: "≥ 60%", value: "0.6" },
      { label: "≥ 50%", value: "0.5" },
    ],
  },
  { key: "start_date", kind: "date", label: "Dari Tanggal" },
  { key: "end_date", kind: "date", label: "Sampai Tanggal" },
];
