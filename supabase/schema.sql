create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  credits integer not null default 6 check (credits >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  property_type text not null default 'Βίλα',
  location text not null,
  capacity integer,
  bedrooms integer,
  bathrooms integer,
  size_sqm integer,
  amenities text[] not null default '{}',
  booking_url text,
  website_url text,
  description text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  balance_after integer not null,
  reason text not null,
  reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  tool text not null,
  credits integer not null,
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.credit_orders (
  shopify_order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  credits integer not null check (credits > 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.tool_runs enable row level security;
alter table public.credit_orders enable row level security;

create policy "own profile" on public.profiles for select using (auth.uid() = id);
create policy "own properties" on public.properties for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ledger" on public.credit_ledger for select using (auth.uid() = user_id);
create policy "own runs" on public.tool_runs for select using (auth.uid() = user_id);
create policy "own credit orders" on public.credit_orders for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, credits)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', ''), 6);
  insert into public.credit_ledger (user_id, amount, balance_after, reason)
  values (new.id, 6, 6, 'Δώρο εγγραφής');
  return new;
end;
$$;

create or replace function public.grant_credits(p_user_id uuid, p_amount integer, p_reason text, p_reference text)
returns integer language plpgsql security definer set search_path = public as $$
declare current_balance integer;
begin
  if p_amount <= 0 then raise exception 'invalid amount'; end if;
  update public.profiles set credits = credits + p_amount where id = p_user_id returning credits into current_balance;
  if current_balance is null then raise exception 'profile missing'; end if;
  insert into public.credit_ledger (user_id, amount, balance_after, reason, reference)
  values (p_user_id, p_amount, current_balance, p_reason, p_reference);
  return current_balance;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.spend_credits(p_user_id uuid, p_amount integer, p_reason text, p_reference text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare current_balance integer;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  select credits into current_balance from public.profiles where id = p_user_id for update;
  if current_balance is null then raise exception 'profile missing'; end if;
  if p_amount <= 0 then raise exception 'invalid amount'; end if;
  if current_balance < p_amount then raise exception 'insufficient credits'; end if;
  current_balance := current_balance - p_amount;
  update public.profiles set credits = current_balance where id = p_user_id;
  insert into public.credit_ledger (user_id, amount, balance_after, reason, reference)
  values (p_user_id, -p_amount, current_balance, p_reason, p_reference);
  return current_balance;
end;
$$;

create or replace function public.process_credit_order(p_order_id text, p_user_id uuid, p_amount integer)
returns integer language plpgsql security definer set search_path = public as $$
declare current_balance integer;
begin
  if exists (select 1 from public.credit_orders where shopify_order_id = p_order_id) then
    select credits into current_balance from public.profiles where id = p_user_id;
    return current_balance;
  end if;
  insert into public.credit_orders (shopify_order_id, user_id, credits)
  values (p_order_id, p_user_id, p_amount);
  current_balance := public.grant_credits(p_user_id, p_amount, 'Αγορά credits', p_order_id);
  return current_balance;
end;
$$;

revoke execute on function public.grant_credits(uuid, integer, text, text) from public, anon, authenticated;
revoke execute on function public.process_credit_order(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.grant_credits(uuid, integer, text, text) to service_role;
grant execute on function public.process_credit_order(text, uuid, integer) to service_role;
