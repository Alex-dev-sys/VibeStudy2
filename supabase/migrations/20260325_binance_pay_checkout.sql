alter table public.subscriptions
  drop constraint if exists subscriptions_provider_check;

alter table public.subscriptions
  add constraint subscriptions_provider_check
  check (provider in ('binance', 'cryptomus', 'yookassa', 'stripe', 'manual'));

alter table public.billing_events
  drop constraint if exists billing_events_provider_check;

alter table public.billing_events
  add constraint billing_events_provider_check
  check (provider in ('binance', 'cryptomus', 'yookassa', 'stripe', 'manual'));

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  provider text not null check (provider in ('binance', 'cryptomus', 'yookassa', 'stripe', 'manual')),
  plan_code text not null check (plan_code in ('pro_monthly', 'pro_three_month')),
  status text not null check (status in ('created', 'pending', 'paid', 'canceled', 'expired', 'error', 'refunding', 'refunded')),
  merchant_trade_no text not null,
  provider_order_id text,
  provider_transaction_id text,
  amount numeric(18, 8) not null,
  currency text not null,
  checkout_url text,
  deeplink text,
  universal_url text,
  qr_code_link text,
  order_expires_at timestamptz,
  paid_at timestamptz,
  last_checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists payment_orders_provider_trade_no_unique
  on public.payment_orders(provider, merchant_trade_no);

create unique index if not exists payment_orders_provider_order_unique
  on public.payment_orders(provider, provider_order_id)
  where provider_order_id is not null;

create index if not exists idx_payment_orders_user_created_at
  on public.payment_orders(user_id, created_at desc);

create index if not exists idx_payment_orders_status_expires
  on public.payment_orders(status, order_expires_at);

alter table public.payment_orders enable row level security;

drop policy if exists "Users can view own payment orders" on public.payment_orders;
create policy "Users can view own payment orders"
  on public.payment_orders for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages payment orders" on public.payment_orders;
create policy "Service role manages payment orders"
  on public.payment_orders for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop trigger if exists set_payment_orders_updated_at on public.payment_orders;
create trigger set_payment_orders_updated_at
  before update on public.payment_orders
  for each row execute function public.set_updated_at();
