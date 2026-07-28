-- El rango de códigos ya no vive en la categoría: ahora se define por el par
-- (categoría + subcategoría). Ej: "Acero Blanco → Anillos" puede tener un rango
-- distinto que "Acero Dorado → Anillos".

create table public.category_code_ranges (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory_id uuid not null references public.categories(id) on delete cascade,
  code_start integer,
  code_end integer,
  created_at timestamptz not null default now(),
  unique (category_id, subcategory_id)
);

create index category_code_ranges_category_idx on public.category_code_ranges(category_id);

alter table public.category_code_ranges enable row level security;
create policy "category_code_ranges: public read" on public.category_code_ranges
  for select using (true);
create policy "category_code_ranges: admin write" on public.category_code_ranges
  for all using (public.is_admin()) with check (public.is_admin());

-- La categoría ya no lleva rango propio.
alter table public.categories drop column if exists code_start;
alter table public.categories drop column if exists code_end;
