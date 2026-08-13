import type { NextRequest } from "next/server";
import { resolverCallback } from "@/lib/auth-callback";

// Recupero de contraseña. Destino fijo y sin query: así el `redirectTo` que se
// registra en la allowlist de Supabase es una URL limpia.
export async function GET(request: NextRequest) {
  return resolverCallback(request, "/nueva-contrasena");
}
