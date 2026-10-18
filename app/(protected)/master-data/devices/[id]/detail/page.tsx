import { DeviceDetailView } from "@/app/(protected)/master-data/devices/[id]/detail/device-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DeviceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const deviceId = Number(id);

  return <DeviceDetailView deviceId={Number.isFinite(deviceId) ? deviceId : -1} />;
}