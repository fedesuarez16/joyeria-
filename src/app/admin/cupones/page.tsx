import { createClient } from "@/lib/supabase/server";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function CouponsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Cupones de descuento</h1>
      <CouponManager coupons={coupons ?? []} />
    </div>
  );
}
