import type { BlobResponse } from "@/types/api.type";

/** Simpan berkas dari backend (CSV, GeoJSON) sebagai unduhan di browser. */
export const saveBlob = ({ blob, filename }: BlobResponse, fallbackName: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename ?? fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
