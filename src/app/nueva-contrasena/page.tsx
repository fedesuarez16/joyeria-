import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/new-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function NuevaContrasenaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión no hay nada que actualizar: se llega acá sólo con el link del
  // mail ya validado por /auth/callback.
  if (!user) {
    redirect(
      `/recuperar?error=${encodeURIComponent(
        "El link venció o ya se usó. Pedí uno nuevo."
      )}`
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-center font-display text-3xl font-semibold">
        Nueva contraseña
      </h1>
      <NewPasswordForm />
    </div>
  );
}
