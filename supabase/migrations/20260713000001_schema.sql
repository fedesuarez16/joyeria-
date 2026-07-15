-- ============================================================
-- Joyería — esquema inicial
-- ============================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: own read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: own update" on public.profiles
  for update using (auth.uid() = id);

-- crea profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- CATEGORIES ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "categories: public read" on public.categories for select using (true);
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- PRODUCTS ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 3,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(active);

alter table public.products enable row level security;
create policy "products: public read active" on public.products
  for select using (active or public.is_admin());
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- VARIANTS ----------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  stock int not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create index variants_product_idx on public.product_variants(product_id);

alter table public.product_variants enable row level security;
create policy "variants: public read" on public.product_variants for select using (true);
create policy "variants: admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- IMAGES ----------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index images_product_idx on public.product_images(product_id);

alter table public.product_images enable row level security;
create policy "images: public read" on public.product_images for select using (true);
create policy "images: admin write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- COUPONS ----------
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  value numeric(12,2) not null check (value > 0),
  active boolean not null default true,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
create policy "coupons: admin all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- ORDERS ----------
create sequence public.order_number_seq start 1000;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null default nextval('public.order_number_seq'),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null default '',
  customer_phone text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'delivered', 'cancelled')),
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  coupon_code text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy "orders: own read" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders: admin write" on public.orders
  for update using (public.is_admin());

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null
);

create index order_items_order_idx on public.order_items(order_id);

alter table public.order_items enable row level security;
create policy "order_items: via order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- ---------- STOCK MOVEMENTS ----------
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity int not null, -- positivo = entrada, negativo = salida
  type text not null check (type in ('sale', 'entry', 'adjustment', 'cancellation')),
  note text,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index movements_product_idx on public.stock_movements(product_id);
create index movements_created_idx on public.stock_movements(created_at desc);

alter table public.stock_movements enable row level security;
create policy "movements: admin all" on public.stock_movements
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- RPCs
-- ============================================================

-- Valida un cupón y devuelve su descuento
create or replace function public.validate_coupon(p_code text)
returns table (code text, discount_type text, value numeric)
language plpgsql stable security definer set search_path = public
as $$
begin
  return query
  select c.code, c.discount_type, c.value
  from public.coupons c
  where upper(c.code) = upper(p_code)
    and c.active
    and (c.expires_at is null or c.expires_at > now())
    and (c.max_uses is null or c.used_count < c.max_uses);
end;
$$;

-- Crea un pedido de forma atómica: valida stock, descuenta, registra movimientos
-- items: [{"product_id": "...", "variant_id": "..."|null, "quantity": 2}]
create or replace function public.create_order(
  p_items jsonb,
  p_customer_name text default '',
  p_customer_phone text default '',
  p_coupon_code text default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_item record;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_total numeric(12,2);
  v_order_id uuid;
  v_order_number bigint;
  v_coupon public.coupons%rowtype;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  -- primera pasada: validar stock con lock y calcular subtotal
  for v_item in
    select (e->>'product_id')::uuid as product_id,
           nullif(e->>'variant_id', '')::uuid as variant_id,
           (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) e
  loop
    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'Cantidad inválida';
    end if;

    select * into v_product from public.products
    where id = v_item.product_id and active
    for update;

    if not found then
      raise exception 'Producto no disponible';
    end if;

    if v_item.variant_id is not null then
      select * into v_variant from public.product_variants
      where id = v_item.variant_id and product_id = v_item.product_id
      for update;

      if not found then
        raise exception 'Variante no disponible';
      end if;

      if v_variant.stock < v_item.quantity then
        raise exception 'Stock insuficiente para % (%)', v_product.name, v_variant.name;
      end if;

      v_unit_price := coalesce(v_variant.price_override, v_product.price);
    else
      if v_product.stock < v_item.quantity then
        raise exception 'Stock insuficiente para %', v_product.name;
      end if;
      v_unit_price := v_product.price;
    end if;

    v_subtotal := v_subtotal + v_unit_price * v_item.quantity;
  end loop;

  -- cupón
  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
    where upper(code) = upper(trim(p_coupon_code))
      and active
      and (expires_at is null or expires_at > now())
      and (max_uses is null or used_count < max_uses)
    for update;

    if not found then
      raise exception 'Cupón inválido o vencido';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.value / 100, 2);
    else
      v_discount := least(v_coupon.value, v_subtotal);
    end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  v_total := v_subtotal - v_discount;

  insert into public.orders (user_id, customer_name, customer_phone, subtotal, discount, total, coupon_code)
  values (auth.uid(), p_customer_name, p_customer_phone, v_subtotal, v_discount, v_total, v_coupon.code)
  returning id, order_number into v_order_id, v_order_number;

  -- segunda pasada: descontar stock, registrar items y movimientos
  for v_item in
    select (e->>'product_id')::uuid as product_id,
           nullif(e->>'variant_id', '')::uuid as variant_id,
           (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) e
  loop
    select * into v_product from public.products where id = v_item.product_id;

    if v_item.variant_id is not null then
      select * into v_variant from public.product_variants where id = v_item.variant_id;
      v_unit_price := coalesce(v_variant.price_override, v_product.price);

      update public.product_variants
      set stock = stock - v_item.quantity
      where id = v_item.variant_id;
    else
      v_unit_price := v_product.price;

      update public.products
      set stock = stock - v_item.quantity, updated_at = now()
      where id = v_item.product_id;
    end if;

    insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, quantity, unit_price)
    values (v_order_id, v_item.product_id, v_item.variant_id, v_product.name,
            case when v_item.variant_id is not null then v_variant.name end,
            v_item.quantity, v_unit_price);

    insert into public.stock_movements (product_id, variant_id, quantity, type, order_id, created_by)
    values (v_item.product_id, v_item.variant_id, -v_item.quantity, 'sale', v_order_id, auth.uid());
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total
  );
end;
$$;

grant execute on function public.create_order(jsonb, text, text, text) to anon, authenticated;
grant execute on function public.validate_coupon(text) to anon, authenticated;

-- Ajuste manual de stock (admin): registra movimiento y actualiza stock
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity int,
  p_type text,
  p_note text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo administradores';
  end if;

  if p_type not in ('entry', 'adjustment', 'cancellation') then
    raise exception 'Tipo de movimiento inválido';
  end if;

  if p_variant_id is not null then
    update public.product_variants
    set stock = stock + p_quantity
    where id = p_variant_id;
  else
    update public.products
    set stock = stock + p_quantity, updated_at = now()
    where id = p_product_id;
  end if;

  insert into public.stock_movements (product_id, variant_id, quantity, type, note, created_by)
  values (p_product_id, p_variant_id, p_quantity, p_type, p_note, auth.uid());
end;
$$;

grant execute on function public.adjust_stock(uuid, uuid, int, text, text) to authenticated;

-- Actualización masiva de precios por porcentaje (admin)
-- p_percent: 10 = +10%, -15 = -15%. p_category_id null = todos
create or replace function public.bulk_update_prices(
  p_percent numeric,
  p_category_id uuid default null
)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_admin() then
    raise exception 'Solo administradores';
  end if;

  update public.products
  set price = round(price * (1 + p_percent / 100), 2),
      updated_at = now()
  where (p_category_id is null or category_id = p_category_id);

  get diagnostics v_count = row_count;

  update public.product_variants v
  set price_override = round(v.price_override * (1 + p_percent / 100), 2)
  from public.products p
  where v.product_id = p.id
    and v.price_override is not null
    and (p_category_id is null or p.category_id = p_category_id);

  return v_count;
end;
$$;

grant execute on function public.bulk_update_prices(numeric, uuid) to authenticated;

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "storage: public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "storage: admin upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "storage: admin update product images" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "storage: admin delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
