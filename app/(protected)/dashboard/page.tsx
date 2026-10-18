import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getSessionUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSessionUser();

  return <DashboardView role={user?.role ?? "konservasionis_lapangan"} />;
}