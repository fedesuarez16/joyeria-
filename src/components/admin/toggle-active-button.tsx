"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ToggleActiveButton({
  productId,
  active,
}: {
  productId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("products").update({ active: !active }).eq("id", productId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-stone-200 text-stone-500 hover:bg-stone-300"
      }`}
    >
      {active ? "Publicado" : "Oculto"}
    </button>
  );
}
