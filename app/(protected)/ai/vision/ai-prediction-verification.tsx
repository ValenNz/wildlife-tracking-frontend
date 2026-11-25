"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

import { useToast } from "@/components/toast";
import { Button } from "@/components/button";
import { ErrorState } from "@/components/ui/error-state";
import { FormField, SelectInput, fieldDescribedBy } from "@/components/form";
import { Modal } from "@/components/ui/modal";
import { useAiPredictionVerification } from "@/hooks/use-ai";
import { useAnimals } from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import { formatApiError, getApiFieldErrors, toApiErrorState } from "@/services/api";
import type {
  AiPredictionVerifyPayload,
  AiVerificationStatus,
} from "@/types/ai.type";

type AiPredictionVerificationProps = {
  predictionId: number;
  defaultSpeciesId?: number | null;
  defaultAnimalId?: number | null;
  /** Spesies wajib saat menerima hasil foto/video (aturan backend); audio boleh tanpa spesies. */
  requireSpecies?: boolean;
  onVerified?: () => void;
};

type VerificationAction = Extract<
  AiVerificationStatus,
  "confirmed" | "rejected"
>;

export function AiPredictionVerification({
  predictionId,
  defaultSpeciesId,
  defaultAnimalId,
  requireSpecies = true,
  onVerified,
}: AiPredictionVerificationProps) {
  const { showToast } = useToast();
  const speciesQuery = useSpecies();
  const verificationMutation = useAiPredictionVerification();
  const [action, setAction] = useState<VerificationAction | null>(null);
  const [speciesId, setSpeciesId] = useState("");
  const [animalId, setAnimalId] = useState("");
  const animalsQuery = useAnimals();
  const animals = (animalsQuery.data?.data?.items ?? []).filter(
    (animal) => speciesId === "" || animal.species_id === Number(speciesId),
  );
  const speciesRequired = action === "confirmed" && requireSpecies;
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  const speciesList = speciesQuery.data?.data?.items ?? [];
  const isPending = verificationMutation.isPending;

  const openAction = (nextAction: VerificationAction) => {
    setAction(nextAction);
    setSpeciesId(
      defaultSpeciesId && defaultSpeciesId > 0 ? String(defaultSpeciesId) : "",
    );
    setAnimalId(defaultAnimalId && defaultAnimalId > 0 ? String(defaultAnimalId) : "");
    setFieldError(undefined);
    verificationMutation.reset();
  };

  const closeDialog = () => {
    if (isPending) return;
    setAction(null);
    setFieldError(undefined);
    verificationMutation.reset();
  };

  const submitVerification = () => {
    if (action === null) return;
    if (speciesRequired && speciesId === "") {
      setFieldError("Pilih spesies hasil verifikasi.");
      return;
    }

    const payload: AiPredictionVerifyPayload = {
      verification_status: action,
      verified_species_id: speciesId === "" ? null : Number(speciesId),
      ...(action === "confirmed" && animalId !== ""
        ? { verified_animal_id: Number(animalId) }
        : {}),
    };

    verificationMutation.mutate(
      { id: predictionId, payload },
      {
        onSuccess: () => {
          showToast("Verifikasi prediksi berhasil disimpan.", "success");
          setAction(null);
          onVerified?.();
        },
        onError: (error) => {
          showToast(
            formatApiError(error, "Gagal menyimpan verifikasi prediksi."),
            "error",
          );
          setFieldError(
            getApiFieldErrors(error).verified_species_id ??
              "Gagal menyimpan verifikasi. Silakan coba lagi.",
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          icon={<CheckCircle2 className="size-4" />}
          disabled={isPending || speciesQuery.isLoading}
          onClick={() => openAction("confirmed")}
        >
          Terima
        </Button>
        <Button
          variant="outline"
          icon={<XCircle className="size-4" />}
          disabled={isPending || speciesQuery.isLoading}
          onClick={() => openAction("rejected")}
        >
          Tolak
        </Button>
      </div>

      {speciesQuery.isError ? (
        <ErrorState
          kind={toApiErrorState(speciesQuery.error).kind}
          message={toApiErrorState(speciesQuery.error).message}
          status={toApiErrorState(speciesQuery.error).status}
          errors={toApiErrorState(speciesQuery.error).errors}
          onRetry={() => void speciesQuery.refetch()}
        />
      ) : null}

      <Modal
        open={action !== null}
        onClose={closeDialog}
        title={action === "confirmed" ? "Konfirmasi prediksi" : "Tolak prediksi"}
        description={
          action === "confirmed"
            ? "Pilih spesies dan, bila dikenali, individunya. Individu yang dipilih menambah galeri foto re-identifikasi."
            : "Hasil AI ditandai salah. Spesies boleh dikosongkan."
        }
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl bg-primary-soft/60 p-3 text-sm text-ink-soft">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>
              Status verification akan diperbarui menjadi{" "}
              <strong>{action === "confirmed" ? "Terkonfirmasi" : "Ditolak"}</strong>.
            </p>
          </div>

          <FormField
            label="Spesies Hasil Verifikasi"
            htmlFor="ai-verification-species"
            required={speciesRequired}
            error={fieldError}
          >
            <SelectInput
              id="ai-verification-species"
              value={speciesId}
              invalid={fieldError !== undefined}
              aria-describedby={fieldDescribedBy(
                "ai-verification-species",
                false,
                fieldError !== undefined,
              )}
              disabled={isPending || speciesQuery.isLoading}
              onChange={(event) => {
                setSpeciesId(event.target.value);
                setFieldError(undefined);
              }}
            >
              <option value="">{speciesRequired ? "Pilih spesies" : "Tidak ditentukan"}</option>
              {speciesList.map((species) => (
                <option key={species.species_id} value={species.species_id}>
                  {species.common_name} · {species.scientific_name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          {action === "confirmed" ? (
            <FormField label="Individu Satwa (opsional)" htmlFor="ai-verification-animal">
              <SelectInput
                id="ai-verification-animal"
                value={animalId}
                disabled={isPending || animalsQuery.isLoading}
                onChange={(event) => setAnimalId(event.target.value)}
              >
                <option value="">Tidak diketahui</option>
                {animals.map((animal) => (
                  <option key={animal.animal_id} value={animal.animal_id}>
                    {animal.animal_code}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>
              Batal
            </Button>
            <Button
              variant={action === "rejected" ? "danger" : "primary"}
              loading={isPending}
              disabled={speciesQuery.isLoading}
              onClick={submitVerification}
            >
              {isPending ? "Menyimpan..." : "Simpan Verifikasi"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
