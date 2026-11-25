import type { TYPE_CONSERVATION_STATUS } from "@/types/species.type";

/** Titik keterangan pada permukaan model (format atribut model-viewer: "Xm Ym Zm"). */
export type TYPE_MODEL_HOTSPOT = {
  label: string;
  description?: string | null;
  position: string;
  normal?: string | null;
};

export type TYPE_MODEL_SOURCE = "illustrative" | "scan" | "licensed";

/** Profil ensiklopedia satwa (tanpa data individu/lokasi). */
export type TYPE_SPECIES_PROFILE = {
  species_id: number;
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
  local_names: string | null;
  taxon_class: string | null;
  taxon_order: string | null;
  taxon_family: string | null;
  description: string | null;
  characteristics: string[] | null;
  size_weight: string | null;
  lifespan: string | null;
  activity_pattern: string | null;
  diet: string | null;
  behavior: string | null;
  habitat: string | null;
  distribution: string | null;
  population_estimate: string | null;
  threats: string[] | null;
  fun_facts: string[] | null;
  legal_protection: string | null;
  model_source: TYPE_MODEL_SOURCE | null;
  model_credit: string | null;
  model_hotspots: TYPE_MODEL_HOTSPOT[] | null;
  is_public: boolean;
  has_model: boolean;
};

export type TYPE_SPECIES_PROFILE_PAYLOAD = Partial<
  Omit<TYPE_SPECIES_PROFILE, "species_id" | "has_model" | "model_source" | "model_credit">
>;

export type TYPE_WILDLIFE_PARAMS = { search?: string; taxon_class?: string; conservation_status?: string };

export const MODEL_SOURCE_LABELS: Record<TYPE_MODEL_SOURCE, string> = {
  illustrative: "Model ilustratif",
  scan: "Hasil pemindaian 3D",
  licensed: "Model berlisensi",
};

export const IUCN_LABELS: Record<TYPE_CONSERVATION_STATUS, { code: string; label: string; tone: string }> = {
  "Critically Endangered": { code: "CR", label: "Kritis", tone: "bg-[#b42318] text-white" },
  Endangered: { code: "EN", label: "Genting", tone: "bg-[#e0662d] text-white" },
  Vulnerable: { code: "VU", label: "Rentan", tone: "bg-[#e3b007] text-[#2a2100]" },
  "Near Threatened": { code: "NT", label: "Hampir Terancam", tone: "bg-[#7fa53a] text-white" },
  "Least Concern": { code: "LC", label: "Risiko Rendah", tone: "bg-[#3f8f4f] text-white" },
  "Data Deficient": { code: "DD", label: "Kurang Data", tone: "bg-[#8a8f98] text-white" },
  "Extinct in the Wild": { code: "EW", label: "Punah di Alam", tone: "bg-[#3a2a4a] text-white" },
  Extinct: { code: "EX", label: "Punah", tone: "bg-black text-white" },
};
