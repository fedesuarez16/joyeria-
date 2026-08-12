import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-center font-display text-3xl font-semibold">
        Recuperar contraseña
      </h1>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
