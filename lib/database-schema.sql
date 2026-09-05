create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text not null unique,
  brand text not null,
  model text not null,
  year int,
  color text,
  customer_id uuid not null references customers(id) on delete restrict,
  status text not null check (status in ('scheduled','in_service','parts_waiting','ready','delivered')) default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists repair_orders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  customer_id uuid not null references customers(id) on delete restrict,
  status text not null check (status in ('scheduled','in_service','parts_waiting','ready','delivered')) default 'scheduled',
  scheduled_at timestamptz,
  work_order_no text not null unique,
  notes text,
  part_cost numeric(12,2) not null default 0,
  labor_cost numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  payment_type text not null check (payment_type in ('cash','card','open')) default 'open',
  debt_amount numeric(12,2) not null default 0,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid references repair_orders(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null default 0,
  category text not null check (category in ('part','labor','other')) default 'part',
  incurred_at timestamptz not null default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  type text not null check (type in ('appointment','parts_waiting','ready','maintenance')),
  title text not null,
  due_at timestamptz not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists payment_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references repair_orders(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  amount numeric(12,2) not null,
  payment_type text not null check (payment_type in ('cash','card','open')),
  note text,
  paid_at timestamptz not null default now()
);

create index if not exists idx_vehicles_plate on vehicles(plate);
create index if not exists idx_vehicles_status on vehicles(status);
create index if not exists idx_repair_orders_vehicle on repair_orders(vehicle_id);
create index if not exists idx_repair_orders_customer on repair_orders(customer_id);
create index if not exists idx_reminders_due_at on reminders(due_at);
create index if not exists idx_payment_ledger_customer on payment_ledger(customer_id);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vehicles_updated_at
before update on vehicles
for each row execute procedure update_updated_at_column();

create trigger repair_orders_updated_at
before update on repair_orders
for each row execute procedure update_updated_at_column();
