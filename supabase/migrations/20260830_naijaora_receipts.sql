-- Naijaora: receipt uploads + owner notifications support

alter table public.naijaora_orders
  add column if not exists receipt_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'naijaora-receipts',
  'naijaora-receipts',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "naijaora_receipts_insert" on storage.objects;
create policy "naijaora_receipts_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'naijaora-receipts'
    and (storage.foldername(name))[1] = 'receipts'
  );

drop policy if exists "naijaora_receipts_select" on storage.objects;
create policy "naijaora_receipts_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'naijaora-receipts');

drop policy if exists "naijaora_orders_update_payment" on public.naijaora_orders;
create policy "naijaora_orders_update_payment"
  on public.naijaora_orders for update
  to anon, authenticated
  using (status = 'pending_payment')
  with check (status = 'payment_submitted');
