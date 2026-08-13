"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  // /nueva-contrasena redirige acá con ?error=... cuando el link ya no sirve.
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Sin query string a propósito: la allowlist de Supabase se lleva mal con
      // `?`. /auth/recuperar valida el token y manda a elegir la contraseña.
      redirectTo: `${window.location.origin}/auth/recuperar`,
    });

    setLoading(false);

    // Un error acá es de la plataforma (por ejemplo, límite de envíos), no
    // "ese mail no existe": Supabase responde igual exista o no la cuenta.
    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-stone-600">
          Si <span className="font-medium text-stone-900">{email}</span> tiene una cuenta,
          le mandamos un link para crear una contraseña nueva.
        </p>
        <p className="text-sm text-stone-500">
          Revisá también la carpeta de spam. El link vence en una hora.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-stone-500">
        Escribí tu email y te mandamos un link para crear una contraseña nueva.
      </p>

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar link"}
      </button>

      <p className="text-center text-sm text-stone-500">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Volver a ingresar
        </Link>
      </p>
    </form>
  );
}
