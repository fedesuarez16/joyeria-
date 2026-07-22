-- Separa las categorías en dos ejes independientes: "categoria" (material/línea)
-- y "subcategoria" (tipo de producto), para poder filtrar/asignar ambas a la vez.

alter table public.categories
  add column type text not null default 'categoria' check (type in ('categoria', 'subcategoria'));

update public.categories set type = 'subcategoria'
where slug in (
  'abridores', 'anillos', 'aros', 'cadenas', 'collares',
  'conjuntos', 'dijes', 'pulseras', 'tobilleras', 'esclavas'
);

alter table public.products
  add column subcategory_id uuid references public.categories(id) on delete set null;

create index products_subcategory_idx on public.products(subcategory_id);
