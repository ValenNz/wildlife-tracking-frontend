"use client";

/* eslint-disable @next/next/no-img-element -- object URL dari proxy, bukan aset statis */
import { useGuidePhoto } from "@/hooks/use-tourism";
import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export function GuideAvatar({
  guideId,
  name,
  hasPhoto,
  size = "md",
}: {
  guideId: number;
  name: string;
  hasPhoto: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const photo = useGuidePhoto(guideId, hasPhoto);
  const sizes = { sm: "size-9 text-xs", md: "size-14 text-base", lg: "size-24 text-2xl" } as const;

  return photo.data ? (
    <img src={photo.data} alt={`Foto ${name}`} className={cn("shrink-0 rounded-2xl object-cover", sizes[size])} />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl bg-primary-soft font-bold text-primary",
        sizes[size],
      )}
    >
      {initials(name)}
    </span>
  );
}
