import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-center font-display text-3xl font-semibold">Crear cuenta</h1>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
