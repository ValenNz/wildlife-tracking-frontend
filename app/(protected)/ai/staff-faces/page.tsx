"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, FormField, TextInput } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader, Panel } from "@/components/ui/panel";
import {
  useStaffFaceCreate,
  useStaffFaceDeleteByName,
  useStaffFaces,
} from "@/hooks/use-ai";
import { formatApiError, toApiErrorState } from "@/services/api";

import { StaffFaceThumbnail } from "./staff-face-thumbnail";

/** Galeri wajah staf (admin): dasar pengenalan "staf vs Tidak dikenal / pengunjung". */
export default function StaffFacesPage() {
  const { showToast } = useToast();
  const facesQuery = useStaffFaces();
  const add = useStaffFaceCreate();
  const removeAll = useStaffFaceDeleteByName();
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmName, setConfirmName] = useState<string | null>(null);
  const groups = facesQuery.data?.data ?? [];

  const upload = async () => {
    if (name.trim() === "" || files.length === 0) return;
    const failed: string[] = [];
    for (const [index, file] of files.entries()) {
      setProgress(`Mengirim ${index + 1} dari ${files.length}...`);
      try {
        await add.mutateAsync({ file, name: name.trim() });
      } catch (error) {
        failed.push(`${file.name}: ${formatApiError(error, "gagal")}`);
      }
    }
    setProgress(null);
    setErrors(failed);
    showToast(
      failed.length === 0 ? `${files.length} foto ${name.trim()} ditambahkan.` : `${files.length - failed.length} foto ditambahkan, ${failed.length} gagal.`,
      failed.length === 0 ? "success" : "error",
    );
    setFiles([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Analisis AI"
        title="Wajah Staf"
        description="Wajah di foto dan video dicocokkan dengan galeri ini. Yang cocok diberi nama staf; selain itu ditandai Tidak dikenal / pengunjung. Daftarkan 5-10 foto per staf dari berbagai sudut dan cahaya."
      />

      <Panel>
        <h3 className="text-sm font-bold text-ink">Tambah foto staf</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:items-end">
          <FormField label="Nama staf" htmlFor="staff-name" required hint="Nama yang tampil saat wajah dikenali.">
            <TextInput
              id="staff-name"
              value={name}
              list="staff-names"
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. Farrellino"
            />
            <datalist id="staff-names">
              {groups.map((group) => (
                <option key={group.name} value={group.name} />
              ))}
            </datalist>
          </FormField>
          <FormField label="Foto wajah" htmlFor="staff-files" required hint="Boleh beberapa foto sekaligus (JPG, PNG, WEBP). Wajah terbesar di tiap foto yang dipakai.">
            <input
              id="staff-files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-forest-deep"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </FormField>
          <Button
            icon={<UserPlus className="size-4" />}
            loading={progress !== null}
            disabled={name.trim() === "" || files.length === 0}
            onClick={() => void upload()}
          >
            {progress ?? "Daftarkan"}
          </Button>
        </div>
        {errors.length > 0 ? <FormAlert message={errors.join(" · ")} /> : null}
      </Panel>

      {facesQuery.isPending ? (
        <Loading label="Memuat galeri wajah..." />
      ) : facesQuery.isError ? (
        <ErrorState
          kind={toApiErrorState(facesQuery.error).kind}
          message={toApiErrorState(facesQuery.error).message}
          status={toApiErrorState(facesQuery.error).status}
          errors={toApiErrorState(facesQuery.error).errors}
          onRetry={() => void facesQuery.refetch()}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="Belum ada staf terdaftar"
          description="Semua wajah akan ditandai Tidak dikenal sampai foto staf didaftarkan di atas."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.name} className="ui-panel p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-ink">{group.name}</h3>
                  <p className="text-xs text-muted">
                    {group.photo_count} foto{group.user ? ` · akun ${group.user.full_name ?? group.user.username}` : ""}
                  </p>
                </div>
                <Button variant="danger" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => setConfirmName(group.name)}>
                  Hapus semua foto
                </Button>
              </div>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {group.faces.map((face) => (
                  <StaffFaceThumbnail key={face.staff_face_id} id={face.staff_face_id} name={group.name} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={confirmName !== null}
        title={`Hapus semua foto ${confirmName ?? ""}?`}
        description="Foto dan data wajahnya dihapus dari galeri. Wajah orang ini akan ditandai Tidak dikenal di analisis berikutnya."
        isPending={removeAll.isPending}
        onCancel={() => setConfirmName(null)}
        onConfirm={() =>
          confirmName &&
          removeAll.mutate(confirmName, {
            onSuccess: () => {
              showToast(`Foto ${confirmName} dihapus.`, "success");
              setConfirmName(null);
            },
            onError: (error) => showToast(formatApiError(error, "Gagal menghapus."), "error"),
          })
        }
      />
    </div>
  );
}
