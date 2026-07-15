-- Suscriptores del newsletter (captura de mails desde el hero del home)
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Cualquiera puede suscribirse; solo admin puede leer o borrar.
create policy "newsletter: public insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter: admin read" on public.newsletter_subscribers
  for select using (public.is_admin());
create policy "newsletter: admin delete" on public.newsletter_subscribers
  for delete using (public.is_admin());
