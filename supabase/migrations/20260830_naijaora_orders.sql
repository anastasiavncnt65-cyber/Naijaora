-- Naijaora food ordering (website). Run in Supabase SQL editor.

create table if not exists public.naijaora_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  email text,
  pickup_time_preference text,
  notes text,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'payment_submitted', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_submitted_at timestamptz,
  estimated_ready_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists naijaora_orders_status_idx on public.naijaora_orders (status);
create index if not exists naijaora_orders_created_idx on public.naijaora_orders (created_at desc);

create table if not exists public.naijaora_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  dish text,
  created_at timestamptz not null default now()
);

create index if not exists naijaora_reviews_created_idx on public.naijaora_reviews (created_at desc);

alter table public.naijaora_orders enable row level security;
alter table public.naijaora_reviews enable row level security;

drop policy if exists "naijaora_orders_insert" on public.naijaora_orders;
create policy "naijaora_orders_insert"
  on public.naijaora_orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "naijaora_orders_update_payment" on public.naijaora_orders;
create policy "naijaora_orders_update_payment"
  on public.naijaora_orders for update
  to anon, authenticated
  using (status = 'pending_payment')
  with check (status in ('pending_payment', 'payment_submitted'));

drop policy if exists "naijaora_reviews_select" on public.naijaora_reviews;
create policy "naijaora_reviews_select"
  on public.naijaora_reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "naijaora_reviews_insert" on public.naijaora_reviews;
create policy "naijaora_reviews_insert"
  on public.naijaora_reviews for insert
  to anon, authenticated
  with check (true);

create or replace view public.naijaora_popular_items
with (security_invoker = true)
as
select
  item->>'itemId' as item_id,
  count(*)::int as order_count
from public.naijaora_orders o,
  jsonb_array_elements(o.items) as item
where o.status in ('payment_submitted', 'preparing', 'ready', 'completed')
group by item->>'itemId';

grant select on public.naijaora_popular_items to anon, authenticated;
