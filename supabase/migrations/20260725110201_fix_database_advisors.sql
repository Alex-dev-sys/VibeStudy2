alter function public.set_updated_at()
  set search_path = '';

create index if not exists idx_billing_events_user_id
  on public.billing_events(user_id);
