-- ============================================================
-- EVAQ — Schéma initial v1
-- Migration : 20260323000000_initial_schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";   -- pour les jobs planifiés

-- ─────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────

create table public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null unique,
  subscription_tier text not null default 'free'
                    check (subscription_tier in ('free', 'monthly', 'yearly')),
  active_packs      jsonb not null default '[]',
  push_subscription jsonb,
  defcon_threshold  smallint not null default 3
                    check (defcon_threshold between 1 and 5),
  alert_mode        text not null default 'sage'
                    check (alert_mode in ('sage', 'expert')),
  last_active_at    timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

comment on column public.users.active_packs is
  'Tableau de packs one-shot : [{pack_id, purchased_at, expires_at}]';
comment on column public.users.push_subscription is
  'Objet PushSubscription Web Push API (endpoint + keys)';
comment on column public.users.defcon_threshold is
  'Niveau DEFCON minimum déclenchant une notification push (1=tout, 5=rien)';

-- ─────────────────────────────────────────
-- 2. USER_PROFILES
-- ─────────────────────────────────────────

create table public.user_profiles (
  user_id           uuid primary key references public.users(id) on delete cascade,
  h3_index          text,            -- H3 résolution 7 (~5km²) de la position de domicile
  adults            smallint not null default 1 check (adults >= 1),
  children          smallint not null default 0,
  pets              boolean not null default false,
  has_car           boolean not null default true,
  reduced_mobility  boolean not null default false,
  updated_at        timestamptz not null default now()
);

comment on column public.user_profiles.h3_index is
  'Index H3 résolution 7 — jamais lat/lon exactes (privacy by design)';

-- ─────────────────────────────────────────
-- 3. ALERTS
-- ─────────────────────────────────────────

create table public.alerts (
  id               uuid primary key default uuid_generate_v4(),
  source           text not null,    -- 'GDACS', 'ACLED', 'UCDP', 'WHO', 'RSS', 'TELEGRAM'
  event_type       text not null,    -- 'EQ', 'FL', 'TC', 'VO', 'DR', 'WF', 'CONFLICT', 'HEALTH'
  title            text not null,
  description      text,
  latitude         double precision not null,
  longitude        double precision not null,
  radius_km        double precision not null default 100,
  severity         smallint not null default 1 check (severity between 1 and 5),
  score_fiabilite  smallint not null default 50 check (score_fiabilite between 0 and 100),
  raw_data         jsonb not null default '{}',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.alerts.score_fiabilite is
  'Score 0-100 : <50 signal précoce, 50-79 probable, 80+ confirmé (mode sage threshold)';
comment on column public.alerts.severity is
  '1=mineur 2=modéré 3=sévère 4=grave 5=catastrophique';

create index idx_alerts_active on public.alerts (is_active, created_at desc);
create index idx_alerts_coords on public.alerts using gist (
  point(longitude, latitude)
);

-- ─────────────────────────────────────────
-- 4. USER_ALERTS
-- ─────────────────────────────────────────

create table public.user_alerts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  alert_id     uuid not null references public.alerts(id) on delete cascade,
  defcon_level smallint not null check (defcon_level between 1 and 5),
  notified_at  timestamptz,
  dismissed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (user_id, alert_id)
);

create index idx_user_alerts_user on public.user_alerts (user_id, created_at desc);

-- ─────────────────────────────────────────
-- 5. INVENTORY_ITEMS
-- ─────────────────────────────────────────

create table public.inventory_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  category    text not null,   -- 'eau', 'nourriture', 'medical', 'outils', 'documents', 'communication'
  title       text not null,
  quantity    numeric not null default 1,
  unit        text not null default 'unité',
  expiry_date date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_inventory_user on public.inventory_items (user_id, category);

-- ─────────────────────────────────────────
-- 6. SAVED_EVACUATION_PLANS
-- ─────────────────────────────────────────

create table public.saved_evacuation_plans (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  alert_id   uuid references public.alerts(id) on delete set null,
  route_data jsonb not null,    -- {routes: [...], threat_type, wind_direction, ...}
  created_at timestamptz not null default now()
);

comment on column public.saved_evacuation_plans.route_data is
  'Données OSRM + règles métier de fuite (3 routes, type de menace, direction vent)';

create index idx_plans_user on public.saved_evacuation_plans (user_id, created_at desc);

-- ─────────────────────────────────────────
-- 7. COMMUNITY_SIGNALS
-- ─────────────────────────────────────────

create table public.community_signals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  h3_index    text not null,
  signal_type text not null check (signal_type in ('stock', 'depart', 'danger', 'aide')),
  message     text,
  created_at  timestamptz not null default now()
);

create index idx_signals_h3 on public.community_signals (h3_index, created_at desc);

-- ─────────────────────────────────────────
-- 8. SURVIVAL_KNOWLEDGE
-- ─────────────────────────────────────────

create table public.survival_knowledge (
  id          uuid primary key default uuid_generate_v4(),
  threat_type text not null,   -- 'militaire', 'nucleaire', 'chimique', 'sanitaire', 'naturel', 'civil'
  category    text not null,   -- 'eau', 'nourriture', 'medical', 'outils', 'documents', 'communication'
  title       text not null,
  content     text not null,
  source      text not null,   -- 'SGDSN p.X', 'Croix-Rouge CataKit', etc.
  priority    smallint not null default 1 check (priority between 1 and 3),
  created_at  timestamptz not null default now()
);

create index idx_knowledge_threat on public.survival_knowledge (threat_type, category);

-- ─────────────────────────────────────────
-- 9. SOURCE_INGESTION_LOGS
-- ─────────────────────────────────────────

create table public.source_ingestion_logs (
  id                 uuid primary key default uuid_generate_v4(),
  source             text not null,
  run_at             timestamptz not null default now(),
  status             text not null check (status in ('success', 'partial', 'error')),
  articles_processed integer not null default 0,
  alerts_created     integer not null default 0,
  error_message      text
);

create index idx_logs_source on public.source_ingestion_logs (source, run_at desc);

-- ─────────────────────────────────────────
-- RLS — Row Level Security
-- ─────────────────────────────────────────

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.alerts enable row level security;
alter table public.user_alerts enable row level security;
alter table public.inventory_items enable row level security;
alter table public.saved_evacuation_plans enable row level security;
alter table public.community_signals enable row level security;
alter table public.survival_knowledge enable row level security;
alter table public.source_ingestion_logs enable row level security;

-- users : lecture/écriture de sa propre ligne
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- user_profiles : idem
create policy "profiles_own" on public.user_profiles
  for all using (auth.uid() = user_id);

-- alerts : lecture par tous les utilisateurs authentifiés
create policy "alerts_read" on public.alerts
  for select using (auth.role() = 'authenticated');

-- user_alerts : sa propre ligne
create policy "user_alerts_own" on public.user_alerts
  for all using (auth.uid() = user_id);

-- inventory_items : sa propre ligne
create policy "inventory_own" on public.inventory_items
  for all using (auth.uid() = user_id);

-- saved_evacuation_plans : sa propre ligne
create policy "plans_own" on public.saved_evacuation_plans
  for all using (auth.uid() = user_id);

-- community_signals : lecture par tous les auth, écriture propre ligne
create policy "signals_read" on public.community_signals
  for select using (auth.role() = 'authenticated');
create policy "signals_insert" on public.community_signals
  for insert with check (auth.uid() = user_id);

-- survival_knowledge : lecture seule pour les auth
create policy "knowledge_read" on public.survival_knowledge
  for select using (auth.role() = 'authenticated');

-- source_ingestion_logs : service_role uniquement (pas de lecture utilisateur)
create policy "logs_service_only" on public.source_ingestion_logs
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────
-- TRIGGER : créer users + user_profiles à l'inscription
-- ─────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.user_profiles (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- TRIGGER : updated_at automatique
-- ─────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_alerts
  before update on public.alerts
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_inventory
  before update on public.inventory_items
  for each row execute procedure public.set_updated_at();
