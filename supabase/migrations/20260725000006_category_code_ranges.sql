-- Rango de códigos por categoría (ej: Acero Dorado = 0-1000) y código de producto
-- para poder etiquetar/buscar productos por número.

alter table public.categories
  add column code_start integer,
  add column code_end integer;

alter table public.products
  add column code integer unique;

create index products_code_idx on public.products(code);
