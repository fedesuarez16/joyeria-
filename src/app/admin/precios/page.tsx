import { getCategories } from "@/lib/queries";
import { BulkPriceForm } from "@/components/admin/bulk-price-form";

export default async function PricesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Actualización masiva de precios</h1>
      <p className="mt-1 text-sm text-stone-500">
        Aplicá un aumento o descuento porcentual a todos los productos o a una categoría.
        Los precios de variantes con precio propio también se actualizan.
      </p>
      <div className="mt-5 rounded-xl border border-stone-200 bg-white p-5">
        <BulkPriceForm categories={categories} />
      </div>
    </div>
  );
}
