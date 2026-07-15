-- p_variant_id pasa a ser opcional (default null)
drop function public.adjust_stock(uuid, uuid, int, text, text);

create or replace function public.adjust_stock(
  p_product_id uuid,
  p_quantity int,
  p_type text,
  p_variant_id uuid default null,
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

grant execute on function public.adjust_stock(uuid, int, text, uuid, text) to authenticated;
