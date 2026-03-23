create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  provider text not null check (provider in ('cryptomus', 'yookassa', 'stripe', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  plan_code text not null check (plan_code in ('free', 'pro_monthly', 'pro_three_month')),
  status text not null check (status in ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'expired', 'paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  trial_ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  entitlement_code text not null check (
    entitlement_code in (
      'core_access',
      'all_tracks',
      'unlimited_lessons',
      'unlimited_ai_hints',
      'unlimited_ai_reviews',
      'analytics_access',
      'streak_recovery'
    )
  ),
  source text not null check (source in ('subscription', 'grant', 'promotion')),
  source_id uuid,
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('cryptomus', 'yookassa', 'stripe', 'manual')),
  provider_event_id text not null,
  event_type text not null,
  user_id uuid references auth.users on delete set null,
  subscription_id uuid references public.subscriptions on delete set null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.feature_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  feature_code text not null check (feature_code in ('lesson_generation', 'ai_hint', 'ai_review')),
  usage_date date not null default current_date,
  usage_count int not null default 0 check (usage_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists subscriptions_provider_subscription_unique
  on public.subscriptions(provider, provider_subscription_id);

create unique index if not exists entitlements_user_code_source_unique
  on public.entitlements(user_id, entitlement_code, source, source_id);

create unique index if not exists billing_events_provider_event_unique
  on public.billing_events(provider, provider_event_id);

create unique index if not exists feature_usage_user_feature_day_unique
  on public.feature_usage(user_id, feature_code, usage_date);

create index if not exists idx_subscriptions_user_id
  on public.subscriptions(user_id);

create index if not exists idx_subscriptions_status
  on public.subscriptions(status, current_period_end);

create index if not exists idx_entitlements_user_lookup
  on public.entitlements(user_id, entitlement_code, active);

create index if not exists idx_billing_events_subscription_id
  on public.billing_events(subscription_id);

create index if not exists idx_feature_usage_user_lookup
  on public.feature_usage(user_id, feature_code, usage_date desc);

alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.billing_events enable row level security;
alter table public.feature_usage enable row level security;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages subscriptions" on public.subscriptions;
create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users can view own entitlements" on public.entitlements;
create policy "Users can view own entitlements"
  on public.entitlements for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages entitlements" on public.entitlements;
create policy "Service role manages entitlements"
  on public.entitlements for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users can view own feature usage" on public.feature_usage;
create policy "Users can view own feature usage"
  on public.feature_usage for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages feature usage" on public.feature_usage;
create policy "Service role manages feature_usage"
  on public.feature_usage for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages billing events" on public.billing_events;
create policy "Service role manages billing events"
  on public.billing_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists set_entitlements_updated_at on public.entitlements;
create trigger set_entitlements_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

drop trigger if exists set_feature_usage_updated_at on public.feature_usage;
create trigger set_feature_usage_updated_at
  before update on public.feature_usage
  for each row execute function public.set_updated_at();
