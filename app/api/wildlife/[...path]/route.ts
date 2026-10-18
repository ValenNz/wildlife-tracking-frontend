import { NextResponse } from "next/server";
import { LaravelProxyError, fetchFromLaravel } from "@/lib/laravel-proxy";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = "force-dynamic";

const handleError = (error: unknown): NextResponse => {
  if (error instanceof LaravelProxyError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: null },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Terjadi kesalahan tak terduga saat menghubungi backend.",
      errors: null,
    },
    { status: 500 },
  );
};

export const GET = async (
  request: Request,
  context: RouteContext,
): Promise<NextResponse> => {
  try {
    const { path } = await context.params;
    const segments = (path ?? []).map((segment) => decodeURIComponent(segment));

    const payload = await fetchFromLaravel<unknown>(
      segments,
      new URL(request.url).searchParams,
    );

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};