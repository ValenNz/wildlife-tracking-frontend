import type { TYPE_SPECIES } from "@/types/species.type";

export type AiProcessingStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "unrecognized";

export type AiVerificationStatus = "pending" | "confirmed" | "rejected";
export type AiAnalysisType = "image" | "audio";
export type AiMediaType = "image" | "video" | "audio";
export type AiThreatLevel = "none" | "low" | "medium" | "high" | "critical";
export type AiPhysicalCondition =
  | "healthy"
  | "injured"
  | "sick"
  | "emaciated"
  | "unknown";
export type AiBehavior =
  | "foraging"
  | "resting"
  | "moving"
  | "running"
  | "drinking"
  | "social"
  | "parenting"
  | "mating"
  | "alert"
  | "aggressive"
  | "unknown";
export type AiSoundCategory =
  | "animal_call"
  | "gunshot"
  | "chainsaw"
  | "tree_falling"
  | "fire"
  | "engine"
  | "vehicle"
  | "human_voice"
  | "dog_bark"
  | "environment"
  | "unknown";

export type AiSpecies = Pick<
  TYPE_SPECIES,
  "species_id" | "common_name" | "scientific_name" | "conservation_status"
>;

export type AiAnimal = {
  animal_id: number;
  name_animal?: string;
  name?: string;
  species_id?: number;
};

export type AiVerifier = {
  user_id: number;
  username?: string;
  full_name?: string;
  name?: string;
};

export type AiZone = { zone_id: number; zone_name: string; zone_type?: string };
export type AiDevice = { device_id: number; model?: string; device_type?: string };

export type AiMediaUpload = {
  media_id: number;
  uploaded_by: number;
  report_id?: number | null;
  device_id?: number | null;
  zone_id?: number | null;
  media_type: AiMediaType;
  file_path: string;
  mime_type?: string | null;
  file_size?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  captured_at?: string | null;
  uploaded_at?: string | null;
  uploader?: AiVerifier | null;
  zone?: AiZone | null;
  device?: AiDevice | null;
  report?: {
    report_id: number;
    incident_type?: string;
    description?: string;
  } | null;
  predictions?: AiPrediction[];
};

export type AiDetectedObject = {
  label: string;
  score?: number | string | null;
  box?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  } | null;
};

export type AiFace = {
  status: "staff" | "possible_staff" | "unknown" | string;
  label?: string;
  name?: string;
  user_id?: number | null;
  similarity?: number | string | null;
  bbox?: unknown;
  detection_confidence?: number | string | null;
  time_seconds?: number | string | null;
};

export type AiPrediction = {
  prediction_id: number;
  media_id: number;
  analysis_type: AiAnalysisType;
  predicted_species_id: number | null;
  confidence: number | string | null;
  detected_label?: string | null;
  individual_count?: number | null;
  predicted_animal_id?: number | null;
  animal_match_confidence?: number | string | null;
  animal_match_method?: string | null;
  physical_condition?: AiPhysicalCondition | null;
  condition_notes?: string | null;
  behavior?: AiBehavior | null;
  behavior_notes?: string | null;
  sound_category?: AiSoundCategory | null;
  sound_label?: string | null;
  threat_level?: AiThreatLevel | null;
  detected_objects?: AiDetectedObject[] | null;
  faces?: AiFace[] | null;
  staff_face_count?: number;
  unknown_face_count?: number;
  ai_summary?: string | null;
  raw_response?: unknown;
  model_version: string;
  processing_status: AiProcessingStatus;
  processed_at?: string | null;
  verification_status: AiVerificationStatus;
  verified_species_id?: number | null;
  verified_animal_id?: number | null;
  verified_by?: number | null;
  verified_at?: string | null;
  media?: AiMediaUpload | null;
  predictedSpecies?: AiSpecies | null;
  predictedAnimal?: AiAnimal | null;
  verifiedSpecies?: AiSpecies | null;
  verifiedAnimal?: AiAnimal | null;
  verifier?: AiVerifier | null;
};

export type AiPredictionUploadResult = {
  media: AiMediaUpload;
  prediction: AiPrediction;
};

export type AiPredictionListParams = {
  media_id?: number;
  processing_status?: AiProcessingStatus | "all";
  verification_status?: AiVerificationStatus | "all";
  model_version?: string;
  analysis_type?: AiAnalysisType;
  threat_level?: AiThreatLevel;
  physical_condition?: AiPhysicalCondition;
  behavior?: AiBehavior;
  sound_category?: AiSoundCategory;
  predicted_species_id?: number;
  predicted_animal_id?: number;
  verified_species_id?: number;
  device_id?: number;
  zone_id?: number;
  min_threat?: AiThreatLevel;
  min_confidence?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};

export type AiMediaUploadListParams = {
  uploaded_by?: number;
  report_id?: number;
  device_id?: number;
  zone_id?: number;
  media_type?: AiMediaType;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};

export type AiUploadPayload = {
  file: File;
  report_id?: number | null;
  device_id?: number | null;
  zone_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  captured_at?: string | null;
};

export type AiPredictionVerifyPayload = {
  verification_status: Extract<AiVerificationStatus, "confirmed" | "rejected">;
  verified_species_id?: number | null;
  verified_animal_id?: number | null;
};

export type AiSummaryReportParams = {
  start_date?: string;
  end_date?: string;
};

export type AiSummaryStatistics = {
  total_animals?: number;
  total_species?: number;
  total_readings?: number;
  total_incidents?: number;
  total_predictions?: number;
  total_verified_predictions?: number;
  average_confidence?: number | string | null;
  active_devices?: number;
  [key: string]: number | string | null | undefined;
};

export type AiSpeciesBreakdownItem = {
  species_id?: number;
  name?: string;
  common_name?: string;
  scientific_name?: string;
  count?: number;
  total?: number;
  status?: string;
  percentage?: number | string | null;
  [key: string]: number | string | null | undefined;
};

export type AiRecommendation = {
  priority: "high" | "critical" | "medium" | "low" | string;
  icon?: string;
  title: string;
  message: string;
};

export type AiSummaryReport = {
  success: boolean;
  period: {
    start: string;
    end: string;
  };
  summary: string;
  used_ai: boolean;
  statistics: AiSummaryStatistics;
  species_breakdown: AiSpeciesBreakdownItem[];
  incidents_by_type?: Record<string, number>;
  ai_insights?: Record<string, unknown>;
  ai_recap?: AiRecap | null;
  recommendations?: AiRecommendation[];
  generated_at?: string;
};

export type AiRecap = {
  period: { start: string; end: string };
  totals: {
    media_uploaded: number;
    media_by_type: Record<string, number>;
    predictions: number;
    by_status: Record<string, number>;
    by_verification: Record<string, number>;
    animals_detected: number;
    threat_detections: number;
    staff_appearances: number;
    unknown_faces: number;
  };
  species: {
    species_id: number;
    common_name: string | null;
    scientific_name: string | null;
    detections: number;
    individuals_counted: number;
    average_confidence: number;
    last_seen: string | null;
  }[];
  other_labels: Record<string, number>;
  individuals: {
    animal_id: number;
    name_animal: string | null;
    sightings: number;
    methods: Record<string, number>;
    last_seen: string | null;
  }[];
  faces: {
    staff: { name: string; appearances: number; last_seen: string | null }[];
    unknown_faces: number;
    media_with_unknown_faces: number;
    possible_staff_needing_verification: number;
  };
  sounds: { category: string; label: string; count: number; from_video: number }[];
  threats: {
    by_level: Record<string, number>;
    recent: {
      prediction_id: number;
      time: string | null;
      zone: string | null;
      media_type: string | null;
      threat_level: AiThreatLevel;
      label: string | null;
      verification_status: AiVerificationStatus;
    }[];
  };
  physical_conditions: Record<string, number>;
  behaviors: Record<string, number>;
  by_zone: { zone: string; detections: number; animals: number; threats: number; unknown_faces: number }[];
  daily: {
    date: string;
    analyzed: number;
    animals: number;
    threats: number;
    unknown_faces: number;
    staff_appearances: number;
  }[];
  models: string[];
};

export type StaffFace = {
  staff_face_id: number;
  name: string;
  user_id: number | null;
  model?: string;
  detection_confidence?: number | null;
  created_at?: string;
};

export type StaffFaceGroup = {
  name: string;
  user_id: number | null;
  user?: { user_id: number; full_name?: string; username?: string } | null;
  photo_count: number;
  faces: StaffFace[];
};

export type AnimalReferencePhoto = {
  embedding_id: number;
  animal_id: number;
  species_id?: number | null;
  media_id?: number | null;
  prediction_id?: number | null;
  source: "reference" | "verified" | string;
  model?: string;
  created_at?: string;
};

export type AiHealth = {
  success: boolean;
  ai_service: {
    status: "not_configured" | "ok" | "error";
    message: string;
    models?: Record<string, string>;
  };
  audio_service: string | Record<string, unknown>;
  vision_service: string | Record<string, unknown>;
  queue: string;
  timestamp: string;
};

export type AiVocabulary = {
  physical_conditions: Record<string, string>;
  behaviors: Record<string, string>;
  sound_categories: Record<string, string>;
  threat_levels: Record<string, string>;
  device_types: Record<string, string>;
};

export type AiDetectObjectsResult = {
  success: boolean;
  model: string;
  objects: AiDetectedObject[];
  object_count: number;
  species: AiSpecies | null;
  physical_condition: AiPhysicalCondition | null;
  behavior: AiBehavior | null;
  human_activity: Record<string, boolean | string>;
  summary: string | null;
};

export type AiThreatListParams = {
  min_level?: AiThreatLevel;
  analysis_type?: AiAnalysisType;
  start_date?: string;
  page?: number;
  per_page?: number;
};

export const AI_PROCESSING_STATUS_LABELS: Record<
  AiProcessingStatus,
  string
> = {
  queued: "Antrean",
  processing: "Diproses",
  completed: "Selesai",
  failed: "Gagal",
  unrecognized: "Tidak Dikenali",
};

export const AI_VERIFICATION_STATUS_LABELS: Record<
  AiVerificationStatus,
  string
> = {
  pending: "Menunggu Verifikasi",
  confirmed: "Terkonfirmasi",
  rejected: "Ditolak",
};

export const AI_THREAT_LEVEL_LABELS: Record<AiThreatLevel, string> = {
  none: "Tidak Ada",
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  critical: "Kritis",
};

export const AI_PHYSICAL_CONDITION_LABELS: Record<
  AiPhysicalCondition,
  string
> = {
  healthy: "Sehat",
  injured: "Terluka",
  sick: "Sakit",
  emaciated: "Kurus",
  unknown: "Tidak Diketahui",
};

export const AI_BEHAVIOR_LABELS: Record<AiBehavior, string> = {
  foraging: "Mencari Makan",
  resting: "Istirahat",
  moving: "Bergerak",
  running: "Berlari",
  drinking: "Minum",
  social: "Sosial",
  parenting: "Merawat Anak",
  mating: "Kawin",
  alert: "Waspada",
  aggressive: "Agresif",
  unknown: "Tidak Diketahui",
};

export const AI_SOUND_CATEGORY_LABELS: Record<AiSoundCategory, string> = {
  animal_call: "Suara Satwa",
  gunshot: "Tembakan",
  chainsaw: "Gergaji Mesin",
  tree_falling: "Pohon Tumbang",
  fire: "Kebakaran",
  engine: "Mesin",
  vehicle: "Kendaraan",
  human_voice: "Suara Manusia",
  dog_bark: "Gonggongan Anjing",
  environment: "Lingkungan",
  unknown: "Tidak Diketahui",
};

export const AI_ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/flac",
] as const;

export const AI_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Ekstensi yang diterima backend (/ai/upload). Browser sering memberi MIME audio berbeda (audio/x-wav, audio/x-m4a). */
export const AI_ACCEPTED_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp",
  "mp4", "mov", "webm",
  "wav", "mp3", "m4a", "ogg", "flac",
] as const;

export const getAiMediaKind = (file: { name: string; type: string }): AiMediaType | null => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!(AI_ACCEPTED_EXTENSIONS as readonly string[]).includes(extension)) return null;
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "image";
  if (["mp4", "mov", "webm"].includes(extension)) return "video";

  return "audio";
};

export const AI_FACE_STATUS_LABELS: Record<string, string> = {
  staff: "Staf terdaftar",
  possible_staff: "Perlu verifikasi",
  unknown: "Tidak dikenal",
};

export const AI_MATCH_METHOD_LABELS: Record<string, string> = {
  appearance_reid: "Kemiripan penampilan",
  gps_proximity: "Kedekatan kalung GPS",
  zone_presence: "Berada di zona yang sama",
  distinctive_marks: "Ciri fisik",
  single_candidate: "Kandidat tunggal",
};
export const AI_DETECT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
