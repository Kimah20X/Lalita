-- ✅ Enable UUID generation extension
create extension if not exists "pgcrypto";

------------------------------------------------------
-- 1️⃣ USERS TABLE
------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password text not null,
  phone_number text,
  language text default 'english',
  role text default 'user',
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- 2️⃣ ADMINS TABLE
------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text default 'admin',
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- 3️⃣ SAVINGS TABLE
------------------------------------------------------
create table if not exists savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(12,2) default 0.00,
  goal numeric(12,2) default 0.00,
  status text default 'active',
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- 4️⃣ TRANSACTIONS TABLE
------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(12,2) not null,
  type text not null check (type in ('deposit', 'withdrawal')),
  status text default 'pending' check (status in ('pending', 'success', 'failed')),
  reference text,
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- 5️⃣ MENTORSHIPS TABLE
------------------------------------------------------
create table if not exists mentorships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  language text default 'english' check (language in ('english', 'pidgin', 'hausa')),
  created_by uuid references admins(id) on delete set null,
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- 6️⃣ FEEDBACK TABLE
------------------------------------------------------
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mentorship_id uuid references mentorships(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- 7️⃣ LANGUAGES TABLE
------------------------------------------------------
create table if not exists languages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null
);

-- WALLET / SAVINGS TABLE
create table if not exists savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(12,2) default 0.00,
  goal numeric(12,2) default 0.00,
  status text default 'active',
  created_at timestamp with time zone default now()
);

------------------------------------------------------
-- ✅ Insert default languages
------------------------------------------------------
insert into languages (name, code)
values 
  ('English', 'en'),
  ('Pidgin', 'pcm'),
  ('Hausa', 'ha')
on conflict do nothing;
