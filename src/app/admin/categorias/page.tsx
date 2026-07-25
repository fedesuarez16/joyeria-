import { getCategories } from "@/lib/queries";
import { CategoryRangesTable } from "@/components/admin/category-ranges-table";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-xl font-semibold">Categorías</h1>
      <p className="mt-1 text-sm text-stone-500">
        Definí el rango de códigos de cada categoría (ej: Acero Dorado = 0 a 1000) para
        organizar la numeración de los productos.
      </p>
      <div className="mt-4">
        <CategoryRangesTable categories={categories} />
      </div>
    </div>
  );
}
