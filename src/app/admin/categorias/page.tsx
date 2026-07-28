import { getCategories, getCategoryCodeRanges } from "@/lib/queries";
import { CategoryRangesTable } from "@/components/admin/category-ranges-table";

export default async function AdminCategoriesPage() {
  const [categories, ranges] = await Promise.all([
    getCategories(),
    getCategoryCodeRanges(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Categorías</h1>
      <p className="mt-1 text-sm text-stone-500">
        Dentro de cada categoría, definí el rango de códigos de sus subcategorías
        (ej: Acero Blanco → Anillos = 0 a 100) para organizar la numeración de los
        productos.
      </p>
      <div className="mt-4">
        <CategoryRangesTable categories={categories} ranges={ranges} />
      </div>
    </div>
  );
}
