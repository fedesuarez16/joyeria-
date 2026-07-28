-- Cancela un pedido y repone el stock de forma atómica e idempotente.
-- Solo admin. Recorre los items del pedido, devuelve el stock a producto o
-- variante y registra un movimiento 'cancellation' por cada uno.
-- Idempotente: si el pedido ya está cancelado, no repone de nuevo.
create or replace function public.cancel_order(p_order_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item public.order_items%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Solo administradores';
  end if;

  -- lock del pedido para evitar cancelaciones concurrentes
  select * into v_order from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  -- ya cancelado: no reponer stock por segunda vez
  if v_order.status = 'cancelled' then
    return;
  end if;

  -- reponer stock por cada item y registrar el movimiento inverso
  for v_item in
    select * from public.order_items where order_id = p_order_id
  loop
    if v_item.variant_id is not null then
      update public.product_variants
      set stock = stock + v_item.quantity
      where id = v_item.variant_id;
    elsif v_item.product_id is not null then
      update public.products
      set stock = stock + v_item.quantity, updated_at = now()
      where id = v_item.product_id;
    end if;

    -- product_id puede ser null si el producto fue borrado: sin movimiento
    if v_item.product_id is not null then
      insert into public.stock_movements (product_id, variant_id, quantity, type, order_id, created_by)
      values (v_item.product_id, v_item.variant_id, v_item.quantity, 'cancellation', p_order_id, auth.uid());
    end if;
  end loop;

  update public.orders
  set status = 'cancelled'
  where id = p_order_id;
end;
$$;

grant execute on function public.cancel_order(uuid) to authenticated;
