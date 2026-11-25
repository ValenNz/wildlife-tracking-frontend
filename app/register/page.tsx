import { redirect } from "next/navigation";

import { getDefaultRouteForRole } from "@/lib/navigation";
import { getVerifiedSession } from "@/services/session.service";

import RegisterForm from "./index";

export default async function RegisterPage() {
  const session = await getVerifiedSession();

  if (session.ok) redirect(getDefaultRouteForRole(session.user.role));

  return <RegisterForm />;
}
