import type { NextRequest } from "next/server";
import { destinoSeguro, resolverCallback } from "@/lib/auth-callback";

// Confirmación de cuenta. Acepta `?next=` para volver a donde estaba el usuario.
export async function GET(request: NextRequest) {
  const next = destinoSeguro(request.nextUrl.searchParams.get("next"));
  return resolverCallback(request, next);
}
