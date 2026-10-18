import { SpeciesDetailView } from "@/app/(protected)/master-data/species/[id]/detail/species-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpeciesDetailPage({ params }: PageProps) {
  const { id } = await params;
  const speciesId = Number(id);

  return (
    <SpeciesDetailView speciesId={Number.isFinite(speciesId) ? speciesId : -1} />
  );
}