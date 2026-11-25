"use client";

import { useEffect, useMemo } from "react";
import { LoaderCircle, X } from "lucide-react";

import { useToast } from "@/components/toast";
import { useStaffFaceDelete, useStaffFaceFile } from "@/hooks/use-ai";
import { formatApiError } from "@/services/api";

export function StaffFaceThumbnail({ id, name }: { id: number; name: string }) {
  const { showToast } = useToast();
  const file = useStaffFaceFile(id);
  const remove = useStaffFaceDelete();
  const url = useMemo(() => (file.data ? URL.createObjectURL(file.data.blob) : null), [file.data]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <li className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-muted">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob URL dari storage privat
        <img src={url} alt={`Foto wajah ${name}`} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-muted" />
        </span>
      )}
      <button
        type="button"
        aria-label={`Hapus foto ${name} #${id}`}
        disabled={remove.isPending}
        onClick={() =>
          remove.mutate(id, {
            onError: (error) => showToast(formatApiError(error, "Gagal menghapus foto."), "error"),
          })
        }
        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-forest-black opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </li>
  );
}
