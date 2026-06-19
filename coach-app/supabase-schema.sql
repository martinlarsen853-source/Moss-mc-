-- Martin AI Coach – Supabase schema
-- Run this in Supabase SQL editor to initialize all tables

create table if not exists daily_metrics (
  id uuid default gen_random_uuid() primary key,
  date date unique not null,
  hrv numeric,
  resting_hr integer,
  sleep_duration_min integer,
  sleep_score integer,
  body_battery_start integer,
  stress_avg numeric,
  steps integer,
  weight_kg numeric,
  ctl numeric,
  atl numeric,
  tsb numeric,
  notes text,
  created_at timestamptz default now()
);

create table if not exists workouts (
  id uuid default gen_random_uuid() primary key,
  interval_id text unique,
  garmin_activity_id text,
  date date not null,
  type text not null default 'Unknown',
  name text not null,
  duration_sec integer,
  distance_m numeric,
  avg_hr integer,
  max_hr integer,
  avg_pace_sec_per_km numeric,
  avg_cadence integer,
  training_load numeric,
  hr_zone_1_min integer,
  hr_zone_2_min integer,
  hr_zone_3_min integer,
  hr_zone_4_min integer,
  hr_zone_5_min integer,
  ai_analysis text,
  drag_median_pace_sec numeric,
  created_at timestamptz default now()
);

create table if not exists drag_intervals (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references workouts(id) on delete cascade,
  sequence integer not null,
  duration_sec integer not null,
  avg_pace_sec_per_km numeric not null,
  avg_hr integer not null,
  max_hr integer not null,
  hr_drop_in_rest integer,
  created_at timestamptz default now()
);

create table if not exists nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  logged_at timestamptz not null default now(),
  description text not null,
  kcal integer not null,
  protein_g numeric not null,
  carbs_g numeric,
  fat_g numeric,
  source text check (source in ('photo','preset','manual')) default 'manual',
  image_url text,
  preset_id uuid,
  created_at timestamptz default now()
);

create table if not exists meal_presets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  kcal integer not null,
  protein_g numeric not null,
  carbs_g numeric,
  fat_g numeric,
  emoji text default '🍽️',
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists coaching_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  type text not null,
  message text not null,
  data_snapshot jsonb,
  workout_id uuid references workouts(id) on delete set null
);

create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create table if not exists training_plan (
  id uuid default gen_random_uuid() primary key,
  week_number integer unique not null,
  date_start date not null,
  date_end date not null,
  target_km integer not null,
  phase text not null default 'build',
  key_session text not null,
  is_light_week boolean default false,
  created_at timestamptz default now()
);

-- Seed default meal presets for Martin
insert into meal_presets (name, description, kcal, protein_g, carbs_g, fat_g, emoji, sort_order)
values
  ('Sardinlunsj', '1 boks sardiner + 3 egg', 370, 38, 2, 22, '🐟', 1),
  ('3 egg', 'Røregg eller kokt', 225, 18, 1, 16, '🍳', 2),
  ('Kvarg 500g', 'Plain kvarg', 250, 45, 16, 1, '🥛', 3),
  ('Proteinshake', '40g proteinpulver + vann', 170, 36, 5, 2, '💪', 4)
on conflict do nothing;

-- Seed training plan (uke 1–16)
insert into training_plan (week_number, date_start, date_end, target_km, key_session, is_light_week) values
  (1,  '2026-06-08', '2026-06-14', 30, 'I gang etter 3 ukers stopp', false),
  (2,  '2026-06-15', '2026-06-21', 40, 'Full Askim-disiplin', false),
  (3,  '2026-06-22', '2026-06-28', 50, 'Bakkesprint mandag fra nå (4–6)', false),
  (4,  '2026-06-29', '2026-07-05', 33, 'LETT – Hyrox teknisk, ikke race', true),
  (5,  '2026-07-06', '2026-07-12', 50, 'Langturer kupert herfra', false),
  (6,  '2026-07-13', '2026-07-19', 50, 'Duttebu-økt 1: 5–6×2–3 min motbakke 165–172 i langtur', false),
  (7,  '2026-07-20', '2026-07-26', 52, 'Største uka – følg røde flagg', false),
  (8,  '2026-07-27', '2026-08-02', 34, 'LETT', true),
  (9,  '2026-08-03', '2026-08-09', 50, 'Duttebu-økt 2: langtur PÅ Skiptvet-løypa → terskeldom etter', false),
  (10, '2026-08-10', '2026-08-16', 40, 'DUTTEBULØPET (generalprøve 11,14 km)', false),
  (11, '2026-08-17', '2026-08-23', 52, 'Vekt fryses. Lør: bane 5×1000 i målfart', false),
  (12, '2026-08-24', '2026-08-30', 52, 'Toppuke. Siste race-lørdag', false),
  (13, '2026-08-31', '2026-09-06', 50, 'Lør: bane 4×1500 i målfart', false),
  (14, '2026-09-07', '2026-09-13', 42, '-20%. Tir 4–5×3 min i 10K-fart', false),
  (15, '2026-09-14', '2026-09-20', 28, 'LØPSUKA. SØN 20. SEP: 10 KM RACE', false),
  (16, '2026-09-21', '2026-09-27', 15, 'HYROX-UKA. SØN 27. SEP: HYROX', false)
on conflict (week_number) do nothing;
