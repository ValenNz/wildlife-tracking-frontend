
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/cookie-names";

const FALLBACK_BASE_URL = "http://127.0.0.1:8000/api";

const getBaseUrl = (): string => {
  const configured =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    FALLBACK_BASE_URL;

  return configured.replace(/\/+$/, "");
};

type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

const proxyRequest = async (
  request: Request,
  context: RouteContext,
): Promise<Response> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesi tidak ditemukan. Silakan login kembali.",
      },
      { status: 401 },
    );
  }

  const { path } = await context.params;
  const incomingUrl = new URL(request.url);

  const endpoint = path.map(encodeURIComponent).join("/");
  const targetUrl = `${getBaseUrl()}/${endpoint}${incomingUrl.search}`;

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.text(),
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Tidak dapat menghubungi backend Laravel.",
      },
      { status: 503 },
    );
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
