create table if not exists public.manual_payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  plan_code text not null check (plan_code in ('pro_monthly', 'pro_three_month')),
  wallet_address text not null,
  network text not null,
  asset_symbol text not null,
  expected_amount numeric(10, 2) not null check (expected_amount > 0),
  tx_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists manual_payment_requests_tx_hash_unique
  on public.manual_payment_requests (lower(tx_hash));

create index if not exists idx_manual_payment_requests_user_id
  on public.manual_payment_requests (user_id, created_at desc);

create index if not exists idx_manual_payment_requests_status
  on public.manual_payment_requests (status, created_at desc);

alter table public.manual_payment_requests enable row level security;

drop policy if exists "Users can view own payment requests" on public.manual_payment_requests;
create policy "Users can view own payment requests"
  on public.manual_payment_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own payment requests" on public.manual_payment_requests;
create policy "Users can create own payment requests"
  on public.manual_payment_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Service role manages payment requests" on public.manual_payment_requests;
create policy "Service role manages payment requests"
  on public.manual_payment_requests for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop trigger if exists set_manual_payment_requests_updated_at on public.manual_payment_requests;
create trigger set_manual_payment_requests_updated_at
  before update on public.manual_payment_requests
  for each row execute function public.set_updated_at();
