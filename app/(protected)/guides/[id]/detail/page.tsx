"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Award, BadgeCheck, Languages, PawPrint, Sparkles } from "lucide-react";

import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { GuideAvatar, RatingStars } from "@/components/tourism";
import { useTourGuide } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { SHIFT_LABELS } from "@/types/tourism.type";
import { formatLongDate } from "@/utils/format";

export default function GuideDetailPage() {
  const params = useParams<{ id: string }>();
  const guideQuery = useTourGuide(Number(params.id ?? 0));
  const detail = guideQuery.data;

  if (guideQuery.isLoading) return <Loading label="Memuat profil pemandu..." />;
  if (guideQuery.error || !detail) {
    const error = toApiErrorState(guideQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void guideQuery.refetch()} />;
  }

  const { guide, upcoming_shifts: shifts } = detail;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/guides" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" /> Semua pemandu
      </Link>

      <section className="ui-panel flex flex-col gap-6 p-6 md:flex-row">
        <GuideAvatar guideId={guide.guide_id} name={guide.display_name} hasPhoto={guide.has_photo} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink">{guide.display_name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <RatingStars value={guide.reviews_avg_guide_rating} />
            {guide.reviews_count ? `${Number(guide.reviews_avg_guide_rating).toFixed(1)} dari ${guide.reviews_count} ulasan` : "Belum ada ulasan"}
          </p>
          <p className="mt-4 text-sm leading-7 text-ink-soft">{guide.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.specialties.map((item) => (
              <span key={item} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-soft">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-card bg-primary-dark p-5 text-white md:col-span-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70"><PawPrint className="size-4" />Satwa favorit</p>
          <p className="mt-2 text-xl font-bold">{guide.favorite_animal}</p>
          {guide.favorite_animal_reason ? <p className="mt-2 text-sm leading-6 text-white/80">“{guide.favorite_animal_reason}”</p> : null}
        </div>
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="flex items-center gap-2 text-xs text-muted"><Award className="size-4 text-primary" />Pengalaman</p>
          <p className="mt-2 text-lg font-bold text-ink">{guide.years_experience} tahun</p>
          {guide.certification ? <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft"><BadgeCheck className="size-3.5 text-primary" />{guide.certification}</p> : null}
        </div>
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="flex items-center gap-2 text-xs text-muted"><Languages className="size-4 text-primary" />Bahasa</p>
          <p className="mt-2 text-sm font-semibold text-ink">{guide.languages.join(", ")}</p>
        </div>
      </div>

      {guide.fun_fact ? (
        <p className="flex gap-3 rounded-card border border-dashed border-primary/40 bg-primary-soft/40 p-5 text-sm leading-6 text-ink-soft">
          <Sparkles className="size-5 shrink-0 text-primary" />
          <span><b className="text-ink">Fun fact:</b> {guide.fun_fact}</span>
        </p>
      ) : null}

      <section className="ui-panel p-5">
        <h2 className="mb-4 text-base font-bold text-ink">Jadwal shift mendatang</h2>
        {shifts.length === 0 ? (
          <EmptyState title="Belum ada jadwal" description="Pemandu ini belum dijadwalkan." />
        ) : (
          <ul className="divide-y divide-line">
            {shifts.map((shift) => (
              <li key={shift.shift_id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="min-w-56 font-semibold text-ink">{formatLongDate(shift.shift_date)}</span>
                <span className="text-muted">{SHIFT_LABELS[shift.shift_type]} {shift.start_time}–{shift.end_time}</span>
                {shift.route ? <Link href={`/tours/${shift.route.slug}/detail`} className="text-primary hover:underline">{shift.route.name}</Link> : null}
                <span className={`ml-auto text-xs font-semibold ${shift.remaining > 0 ? "text-forest-primary" : "text-danger"}`}>
                  {shift.remaining > 0 ? `Sisa ${shift.remaining}` : "Penuh"}
                </span>
                {shift.remaining > 0 && shift.route ? (
                  <Link href={`/tours/${shift.route.slug}/create?shift=${shift.shift_id}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">Pesan</Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
