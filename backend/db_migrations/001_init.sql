-- 001_init.sql
create table if not exists day_status (
  date date primary key,
  status text not null check (status in ('available','limited','finished')),
  updated_at timestamptz not null default now()
);