-- Fix order insert RLS (INSERT … RETURNING needs SELECT, or insert without returning).
-- Keep orders private: no public SELECT on the full table.

grant usage on schema public to anon, authenticated;
grant insert, update on public.naijaora_orders to anon, authenticated;
grant select, insert on public.naijaora_reviews to anon, authenticated;
grant select on public.naijaora_popular_items to anon, authenticated;

drop policy if exists "naijaora_orders_insert" on public.naijaora_orders;
create policy "naijaora_orders_insert"
  on public.naijaora_orders for insert
  to anon, authenticated
  with check (
    status = 'pending_payment'
    and order_number is not null
    and customer_name is not null
    and phone is not null
    and items is not null
  );

drop policy if exists "naijaora_orders_update_payment" on public.naijaora_orders;
create policy "naijaora_orders_update_payment"
  on public.naijaora_orders for update
  to anon, authenticated
  using (status = 'pending_payment')
  with check (status = 'payment_submitted');

-- Popular items: run as owner so anon does not need SELECT on raw orders
create or replace view public.naijaora_popular_items
with (security_invoker = false)
as
select
  item->>'itemId' as item_id,
  count(*)::int as order_count
from public.naijaora_orders o,
  jsonb_array_elements(o.items) as item
where o.status in ('payment_submitted', 'preparing', 'ready', 'completed')
group by item->>'itemId';

grant select on public.naijaora_popular_items to anon, authenticated;
