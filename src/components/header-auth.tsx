"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HeaderAuth() {
  const [state, setState] = useState<{ email: string | null; isAdmin: boolean }>({
    email: null,
    isAdmin: false,
  });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState({ email: null, isAdmin: false });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setState({ email: user.email ?? null, isAdmin: profile?.role === "admin" });
    }

    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  if (!state.email) {
    return (
      <Link href="/login" className="hover:text-gold transition-colors">
        Ingresar
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-4">
      {state.isAdmin && (
        <Link href="/admin" className="hover:text-gold transition-colors">
          Admin
        </Link>
      )}
      <Link href="/cuenta" className="hover:text-gold transition-colors">
        Mi cuenta
      </Link>
    </span>
  );
}
