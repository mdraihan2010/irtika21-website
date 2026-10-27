-- Irtika'21 database schema
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.registrations (
  id             bigint generated always as identity primary key,
  ref            text not null unique,                 -- e.g. IRT-R7K2M9QXA, also blocks double submits
  category       text not null check (category in ('fresher','general','gradM','gradF','other')),
  amount         integer not null check (amount > 0),  -- recalculated on the server, never trusted from the browser
  name           text not null,
  department     text,
  session        text,
  student_id     text,
  email          text not null,
  gift_wear      text not null check (gift_wear in ('tshirt','scarf')),
  tshirt_size    text,
  pay_method     text not null check (pay_method in ('bkash','nagad')),
  sender_number  text not null,
  trx_id         text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','verified','rejected')),
  email_status   text not null default 'none' check (email_status in ('none','received_sent','confirmed_sent','failed')),
  admin_note     text,
  verified_by    text,
  verified_at    timestamptz,
  created_at     timestamptz not null default now(),
  unique (pay_method, trx_id)                          -- one Transaction ID can be used once
);

create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  ref            text not null unique,
  buyer_name     text not null,
  phone          text not null,
  items          jsonb not null,                       -- [{product, qty, unit_price}]
  tshirt_size    text,
  total          integer not null check (total > 0),
  pay_method     text not null check (pay_method in ('bkash','nagad')),
  sender_number  text not null,
  trx_id         text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','verified','rejected')),
  order_status   text not null default 'submitted' check (order_status in ('submitted','ready','delivered','cancelled')),
  admin_note     text,
  verified_by    text,
  verified_at    timestamptz,
  created_at     timestamptz not null default now(),
  unique (pay_method, trx_id)
);

-- Fast lists for the admin dashboard
create index if not exists registrations_created_idx on public.registrations (created_at desc);
create index if not exists registrations_status_idx  on public.registrations (payment_status);
create index if not exists registrations_email_idx   on public.registrations (email);
create index if not exists orders_created_idx        on public.orders (created_at desc);
create index if not exists orders_status_idx         on public.orders (payment_status);

-- Security: Row Level Security ON with no public policies.
-- The website's server uses the secret service-role key; browsers can read or change nothing directly.
alter table public.registrations enable row level security;
alter table public.orders        enable row level security;
