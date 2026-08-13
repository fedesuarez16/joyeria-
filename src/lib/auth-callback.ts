import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function loginConError(mensaje: string): never {
  redirect(`/login?error=${encodeURIComponent(mensaje)}`);
}

/**
 * Valida el token del mail y deja la sesión lista.
 *
 * El destino llega por parámetro y no por query string: la allowlist de
 * Redirect URLs de Supabase se lleva mal con `?` en la URL, así que cada flujo
 * usa su propia ruta y el `redirectTo` queda sin query.
 */
export async function resolverCallback(
  request: NextRequest,
  destino: string
): Promise<never> {
  const { searchParams } = request.nextUrl;

  // Supabase avisa por query cuando el link venció o ya se usó (otp_expired).
  const errorDescription = searchParams.get("error_description");
  if (errorDescription) loginConError(errorDescription);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  // Flujo con token_hash: sirve desde cualquier navegador, no depende de cookies previas.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) loginConError(error.message);
    redirect(destino);
  }

  // Flujo PKCE: necesita la cookie del code verifier, o sea el mismo navegador del pedido.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) loginConError(error.message);
    redirect(destino);
  }

  loginConError("El link es inválido o está incompleto.");
}

// Solo rutas internas: un `next` absoluto sería un open redirect.
export function destinoSeguro(valor: string | null) {
  return valor?.startsWith("/") && !valor.startsWith("//") ? valor : "/";
}
