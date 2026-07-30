import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function loginConError(mensaje: string): never {
  redirect(`/login?error=${encodeURIComponent(mensaje)}`);
}

// Solo rutas internas: un `next` absoluto sería un open redirect.
function destinoSeguro(valor: string | null) {
  return valor?.startsWith("/") && !valor.startsWith("//") ? valor : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = destinoSeguro(searchParams.get("next"));

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
    redirect(next);
  }

  // Flujo PKCE: necesita la cookie del code verifier, o sea el mismo navegador del registro.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) loginConError(error.message);
    redirect(next);
  }

  loginConError("El link de confirmación es inválido o está incompleto.");
}
