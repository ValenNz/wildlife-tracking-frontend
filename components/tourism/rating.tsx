"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({ value, className }: { value: number | string | null | undefined; className?: string }) {
  const rating = Number(value ?? 0);

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Rating ${rating.toFixed(1)} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={cn("size-3.5", rating >= star - 0.25 ? "fill-amber-400 text-amber-400" : "text-line-strong")}
        />
      ))}
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  label,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} bintang`}
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded-md p-1 transition hover:scale-110 disabled:opacity-50"
        >
          <Star
            aria-hidden="true"
            className={cn("size-6", value >= star ? "fill-amber-400 text-amber-400" : "text-line-strong")}
          />
        </button>
      ))}
    </div>
  );
}
