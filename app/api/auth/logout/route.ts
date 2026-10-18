import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { EXPIRES_AT_COOKIE, TOKEN_COOKIE, TYPE_COOKIE } from "@/lib/cookie-names";

export const dynamic = "force-dynamic";

export const POST = async (): Promise<NextResponse> => {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_AT_COOKIE);
  cookieStore.delete(TYPE_COOKIE);

  return NextResponse.json(
    { success: true, message: "Logout berhasil.", errors: null },
    { status: 200 },
  );
};