-- ============================================
-- VibeStudy Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  current_streak int default 0,
  longest_streak int default 0,
  total_xp int default 0,
  level int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  course_id text not null,
  current_day int default 1,
  completed_days int[] default '{}',
  last_activity timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, course_id)
);

create table public.completed_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  course_id text not null,
  day int not null,
  task_id int not null,
  code text,
  xp_earned int default 10,
  completed_at timestamptz default now(),
  unique(user_id, course_id, day, task_id)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  achievement_type text not null,
  achievement_name text not null,
  achieved_at timestamptz default now(),
  unique(user_id, achievement_type, achievement_name)
);

create table public.lesson_cache (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  day int not null,
  title text not null,
  topics_hash text not null,
  theory text not null,
  tasks jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(language, day, title, topics_hash)
);

create table public.ai_request_log (
  id uuid primary key default gen_random_uuid(),
  requester_key text not null,
  created_at timestamptz default now()
);

create table public.subscriptions (
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
  updated_at timestamptz default now(),
  unique(provider, provider_subscription_id)
);

create table public.entitlements (
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
  updated_at timestamptz default now(),
  unique(user_id, entitlement_code, source, source_id)
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('cryptomus', 'yookassa', 'stripe', 'manual')),
  provider_event_id text not null,
  event_type text not null,
  user_id uuid references auth.users on delete set null,
  subscription_id uuid references public.subscriptions on delete set null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz default now(),
  unique(provider, provider_event_id)
);

create table public.feature_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  feature_code text not null check (feature_code in ('lesson_generation', 'ai_hint', 'ai_review')),
  usage_date date not null default current_date,
  usage_count int not null default 0 check (usage_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, feature_code, usage_date)
);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.completed_tasks enable row level security;
alter table public.achievements enable row level security;
alter table public.lesson_cache enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.billing_events enable row level security;
alter table public.feature_usage enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

create policy "Users can view own completed tasks"
  on public.completed_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own completed tasks"
  on public.completed_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can view own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

create policy "Anyone can view cached lessons"
  on public.lesson_cache for select
  using (true);

create policy "Authenticated users can cache lessons"
  on public.lesson_cache for insert
  with check (auth.role() = 'authenticated');

create policy "Service role manages AI request log"
  on public.ai_request_log for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Users can view own entitlements"
  on public.entitlements for select
  using (auth.uid() = user_id);

create policy "Service role manages entitlements"
  on public.entitlements for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Users can view own feature usage"
  on public.feature_usage for select
  using (auth.uid() = user_id);

create policy "Service role manages feature usage"
  on public.feature_usage for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role manages billing events"
  on public.billing_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_lesson_cache_updated_at
  before update on public.lesson_cache
  for each row execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger set_entitlements_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

create trigger set_feature_usage_updated_at
  before update on public.feature_usage
  for each row execute function public.set_updated_at();

create index idx_user_progress_user_id on public.user_progress(user_id);
create index idx_user_progress_course_id on public.user_progress(course_id);
create index idx_completed_tasks_user_id on public.completed_tasks(user_id);
create index idx_achievements_user_id on public.achievements(user_id);
create index idx_lesson_cache_lookup on public.lesson_cache(language, day, title, topics_hash);
create index idx_ai_request_log_lookup on public.ai_request_log(requester_key, created_at desc);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status, current_period_end);
create index idx_entitlements_user_lookup on public.entitlements(user_id, entitlement_code, active);
create index idx_billing_events_subscription_id on public.billing_events(subscription_id);
create index idx_feature_usage_user_lookup on public.feature_usage(user_id, feature_code, usage_date desc);
