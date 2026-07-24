-- Align the AI runtime schema, remove client-side cache writes, and make usage
-- reservations atomic so concurrent requests cannot bypass quotas.

create table if not exists public.ai_request_log (
  id uuid primary key default gen_random_uuid(),
  requester_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_request_log_lookup
  on public.ai_request_log(requester_key, created_at desc);

alter table public.ai_request_log enable row level security;

drop policy if exists "Service role manages AI request log" on public.ai_request_log;

create table if not exists public.lesson_cache (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  day integer not null,
  title text not null,
  topics_hash text not null,
  theory text not null,
  tasks jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_cache add column if not exists language text;
alter table public.lesson_cache add column if not exists title text;
alter table public.lesson_cache add column if not exists topics_hash text;
alter table public.lesson_cache add column if not exists theory text;
alter table public.lesson_cache add column if not exists tasks jsonb;
alter table public.lesson_cache add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'lesson_cache'
      and column_name = 'course_id'
  ) then
    execute $migration$
      update public.lesson_cache
      set language = coalesce(nullif(language, ''), nullif(course_id, ''), 'legacy'),
          title = coalesce(nullif(title, ''), coalesce(nullif(course_id, ''), 'Legacy lesson') || ' day ' || day::text),
          topics_hash = coalesce(nullif(topics_hash, ''), md5(coalesce(course_id, 'legacy') || ':' || day::text)),
          theory = coalesce(theory, ''),
          tasks = coalesce(tasks, '[]'::jsonb),
          updated_at = coalesce(updated_at, created_at, now())
    $migration$;
    execute 'alter table public.lesson_cache alter column course_id drop not null';
  else
    update public.lesson_cache
    set language = coalesce(nullif(language, ''), 'legacy'),
        title = coalesce(nullif(title, ''), 'Legacy lesson day ' || day::text),
        topics_hash = coalesce(nullif(topics_hash, ''), md5(id::text)),
        theory = coalesce(theory, ''),
        tasks = coalesce(tasks, '[]'::jsonb),
        updated_at = coalesce(updated_at, created_at, now());
  end if;
end
$$;

alter table public.lesson_cache alter column language set not null;
alter table public.lesson_cache alter column title set not null;
alter table public.lesson_cache alter column topics_hash set not null;
alter table public.lesson_cache alter column theory set not null;
alter table public.lesson_cache alter column tasks set not null;
alter table public.lesson_cache alter column updated_at set not null;
alter table public.lesson_cache alter column updated_at set default now();

drop trigger if exists set_lesson_cache_updated_at on public.lesson_cache;
create trigger set_lesson_cache_updated_at
  before update on public.lesson_cache
  for each row execute function public.set_updated_at();

create unique index if not exists lesson_cache_runtime_key_unique
  on public.lesson_cache(language, day, title, topics_hash);

create index if not exists idx_lesson_cache_lookup
  on public.lesson_cache(language, day, title, topics_hash);

alter table public.lesson_cache enable row level security;
drop policy if exists "Anyone can view cached lessons" on public.lesson_cache;
drop policy if exists "Authenticated users can cache lessons" on public.lesson_cache;

-- Revoke expired access immediately and normalize stale paid states.
update public.subscriptions
set status = 'expired',
    updated_at = now()
where status in ('active', 'trialing')
  and current_period_end is not null
  and current_period_end <= now();

update public.entitlements
set active = false,
    updated_at = now()
where active = true
  and ends_at is not null
  and ends_at <= now();

-- Service-role clients bypass RLS; explicit service-role policies are redundant.
drop policy if exists "Service role manages subscriptions" on public.subscriptions;
drop policy if exists "Service role manages entitlements" on public.entitlements;
drop policy if exists "Service role manages feature usage" on public.feature_usage;
drop policy if exists "Service role manages feature_usage" on public.feature_usage;
drop policy if exists "Service role manages billing events" on public.billing_events;
drop policy if exists "Service role manages payment orders" on public.payment_orders;
drop policy if exists "Service role manages payment requests" on public.manual_payment_requests;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own entitlements" on public.entitlements;
create policy "Users can view own entitlements"
  on public.entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own feature usage" on public.feature_usage;
create policy "Users can view own feature usage"
  on public.feature_usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own payment orders" on public.payment_orders;
create policy "Users can view own payment orders"
  on public.payment_orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own payment requests" on public.manual_payment_requests;
create policy "Users can view own payment requests"
  on public.manual_payment_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own payment requests" on public.manual_payment_requests;
create policy "Users can create own payment requests"
  on public.manual_payment_requests for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function public.reserve_ai_request(
  p_requester_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_count integer;
begin
  if nullif(btrim(p_requester_key), '') is null
    or p_max_requests < 1
    or p_window_seconds < 1
  then
    raise exception 'Invalid rate-limit reservation parameters.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ai-request:' || p_requester_key, 0)
  );

  select count(*)::integer
  into v_request_count
  from public.ai_request_log
  where requester_key = p_requester_key
    and created_at >= now() - pg_catalog.make_interval(secs => p_window_seconds);

  if v_request_count >= p_max_requests then
    return false;
  end if;

  insert into public.ai_request_log(requester_key)
  values (p_requester_key);

  return true;
end;
$$;

revoke all on function public.reserve_ai_request(text, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_ai_request(text, integer, integer) to service_role;

create or replace function public.reserve_feature_usage(
  p_user_id uuid,
  p_feature_code text,
  p_track_id text,
  p_day integer,
  p_daily_limit integer default null
)
returns table(allowed boolean, reason text, usage_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_paid boolean;
  v_chosen_track text;
  v_usage_count integer := 0;
begin
  if p_user_id is null
    or p_feature_code not in ('lesson_generation', 'ai_hint', 'ai_review')
    or nullif(btrim(p_track_id), '') is null
    or p_day < 1
    or (p_daily_limit is not null and p_daily_limit < 1)
  then
    raise exception 'Invalid feature usage reservation parameters.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('feature-usage:' || p_user_id::text, 0)
  );

  select exists (
    select 1
    from public.entitlements e
    where e.user_id = p_user_id
      and e.active = true
      and e.starts_at <= now()
      and (e.ends_at is null or e.ends_at > now())
      and (
        e.entitlement_code = 'all_tracks'
        or (p_feature_code = 'lesson_generation' and e.entitlement_code = 'unlimited_lessons')
        or (p_feature_code = 'ai_hint' and e.entitlement_code = 'unlimited_ai_hints')
        or (
          p_feature_code = 'ai_review'
          and e.entitlement_code in ('unlimited_ai_reviews', 'unlimited_lessons')
        )
      )
  ) into v_is_paid;

  if not v_is_paid then
    select fu.metadata ->> 'track_id'
    into v_chosen_track
    from public.feature_usage fu
    where fu.user_id = p_user_id
      and nullif(fu.metadata ->> 'track_id', '') is not null
    order by fu.usage_date asc, fu.created_at asc
    limit 1;

    if v_chosen_track is not null and v_chosen_track <> p_track_id then
      allowed := false;
      reason := 'Free plan is limited to one selected track. Upgrade to unlock all tracks.';
      usage_count := 0;
      return next;
      return;
    end if;

    if p_day > 3 then
      allowed := false;
      reason := 'Free plan includes only the first 3 days of the selected track.';
      usage_count := 0;
      return next;
      return;
    end if;

    select coalesce(fu.usage_count, 0)
    into v_usage_count
    from public.feature_usage fu
    where fu.user_id = p_user_id
      and fu.feature_code = p_feature_code
      and fu.usage_date = current_date;

    v_usage_count := coalesce(v_usage_count, 0);
    if p_daily_limit is not null and v_usage_count >= p_daily_limit then
      allowed := false;
      reason := 'Daily AI hint limit reached for the free plan.';
      usage_count := v_usage_count;
      return next;
      return;
    end if;
  end if;

  insert into public.feature_usage as fu (
    user_id,
    feature_code,
    usage_date,
    usage_count,
    metadata
  )
  values (
    p_user_id,
    p_feature_code,
    current_date,
    1,
    pg_catalog.jsonb_build_object(
      'track_id', p_track_id,
      'day', p_day,
      'touched_at', now()
    )
  )
  on conflict (user_id, feature_code, usage_date)
  do update set
    usage_count = fu.usage_count + 1,
    metadata = fu.metadata || excluded.metadata,
    updated_at = now()
  returning fu.usage_count into v_usage_count;

  allowed := true;
  reason := null;
  usage_count := v_usage_count;
  return next;
end;
$$;

revoke all on function public.reserve_feature_usage(uuid, text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.reserve_feature_usage(uuid, text, text, integer, integer)
  to service_role;
