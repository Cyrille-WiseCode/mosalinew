-- =============================================================================
-- 0003 — Offres, signalements, notifications, audit (immuable), vues
-- =============================================================================

create function private.current_casquette()
returns public.casquette
language sql stable security definer set search_path = ''
as $$ select p.active_casquette from public.profiles p where p.id = (select auth.uid()) $$;
grant execute on function private.current_casquette() to anon, authenticated;

create table public.offers (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles(id) on delete cascade,
  title             text not null check (char_length(title) between 3 and 120),
  description       text check (description is null or char_length(description) <= 5000),
  category_id       smallint references public.categories(id),
  budget_min        integer check (budget_min is null or budget_min >= 0),
  budget_max        integer check (budget_max is null or budget_max >= 0),
  currency          text not null default 'XAF' check (currency = 'XAF'),
  duration_days     integer check (duration_days is null or duration_days between 1 and 730),
  contract_type     public.contract_type,
  location          text check (location is null or char_length(location) <= 120),
  is_remote         boolean not null default false,
  deadline          timestamptz,
  status            public.offer_status not null default 'draft',
  published_at      timestamptz,
  closed_at         timestamptz,
  is_moderated      boolean not null default false,
  moderation_reason text,
  expiry_notified_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Brouillon : champs facultatifs (autosave). Complétude exigée par publish_offer().
  constraint offers_budget_range check (budget_min is null or budget_max is null or budget_max >= budget_min),
  search tsvector generated always as (
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored
);
comment on table public.offers is 'Offres de mission. Les transitions de statut passent exclusivement par les fonctions RPC (cf. 0005).';
comment on column public.offers.status is 'draft -> active -> filled | cancelled | expired. cancelled(modérée) -> active : super_admin uniquement.';

create index offers_status_published_idx on public.offers (status, published_at desc);
create index offers_category_idx         on public.offers (category_id);
create index offers_owner_idx            on public.offers (owner_id, updated_at desc);
create index offers_search_idx           on public.offers using gin (search);
create index offers_deadline_idx         on public.offers (deadline) where status = 'active';

create table public.offer_skills (
  offer_id uuid    not null references public.offers(id) on delete cascade,
  skill_id integer not null references public.skills(id) on delete cascade,
  primary key (offer_id, skill_id)
);

create table public.offer_reports (
  id          uuid primary key default gen_random_uuid(),
  offer_id    uuid not null references public.offers(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason      text not null check (char_length(reason) between 3 and 1000),
  status      public.report_status not null default 'open',
  created_at  timestamptz not null default now()
);
create index offer_reports_offer_idx on public.offer_reports (offer_id, status);

-- Notifications minimales : insertion uniquement (pas de centre de notifications ici).
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  category   text not null check (category in ('offer', 'system', 'identity', 'contract')),
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- Journal d'audit IMMUABLE
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid,                       -- null = système (cron)
  module      text not null,
  action_type text not null,
  entity_id   uuid,
  criticality public.audit_criticality not null default 'low',
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (module, entity_id, created_at desc);

create function private.audit_logs_immutable()
returns trigger language plpgsql as $$
begin raise exception 'AUDIT_IMMUTABLE' using errcode = 'P0001'; end;
$$;
create trigger audit_logs_no_update_delete
  before update or delete on public.audit_logs
  for each row execute function private.audit_logs_immutable();
create trigger audit_logs_no_truncate
  before truncate on public.audit_logs
  for each statement execute function private.audit_logs_immutable();

-- ---- Helpers internes -------------------------------------------------------
create function private.write_audit(
  p_actor uuid, p_module text, p_action text, p_entity uuid,
  p_criticality public.audit_criticality, p_before jsonb, p_after jsonb
) returns void
language sql security definer set search_path = ''
as $$
  insert into public.audit_logs (actor_id, module, action_type, entity_id, criticality, before, after)
  values (p_actor, p_module, p_action, p_entity, p_criticality, p_before, p_after)
$$;

create function private.notify(p_user uuid, p_category text, p_title text, p_body text, p_link text)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.notifications (user_id, category, title, body, link)
  values (p_user, p_category, p_title, p_body, p_link)
$$;

-- ---- Machine à états + verrous de champs -----------------------------------
create function private.guard_offer_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_rpc boolean := coalesce(current_setting('mosali.rpc', true), '') = '1';
begin
  if new.owner_id <> old.owner_id then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  -- Transitions de statut autorisées
  if new.status <> old.status then
    if (old.status = 'draft'  and new.status = 'active')
    or (old.status = 'active' and new.status in ('filled', 'cancelled', 'expired'))
    or (old.status = 'cancelled' and old.is_moderated and new.status = 'active'
        and private.current_app_role() = 'super_admin') then
      null;
    else
      raise exception 'INVALID_TRANSITION' using errcode = 'P0001',
        detail = old.status::text || '->' || new.status::text;
    end if;
  else
    -- Offre en fin de vie : plus aucune modification hors RPC
    if old.status in ('filled', 'cancelled', 'expired') and not v_rpc then
      raise exception 'OFFER_LOCKED' using errcode = 'P0001';
    end if;
  end if;

  -- Hypothèse §4.6 : tout modifiable sauf le type de contrat une fois publiée
  if old.status <> 'draft' and new.contract_type is distinct from old.contract_type then
    raise exception 'CONTRACT_TYPE_LOCKED' using errcode = 'P0001';
  end if;

  -- Une date limite publiée ne change que via extend_offer_deadline()
  if old.status <> 'draft' and new.deadline is distinct from old.deadline and not v_rpc then
    raise exception 'USE_EXTEND_DEADLINE' using errcode = 'P0001';
  end if;

  new.updated_at := now();
  return new;
end;
$$;
create trigger offers_guard_update
  before update on public.offers
  for each row execute function private.guard_offer_update();

-- Audit des modifications d'une offre active (ancien / nouveau contenu)
create function private.audit_offer_edit()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if old.status = 'active' and new.status = 'active'
     and coalesce(current_setting('mosali.rpc', true), '') <> '1'
     and (to_jsonb(old) - 'updated_at' - 'search') is distinct from (to_jsonb(new) - 'updated_at' - 'search') then
    perform private.write_audit((select auth.uid()), 'offers', 'update_offer', new.id, 'low',
      to_jsonb(old) - 'search', to_jsonb(new) - 'search');
  end if;
  return null;
end;
$$;
create trigger offers_audit_edit
  after update on public.offers
  for each row execute function private.audit_offer_edit();

-- ---- Vues ------------------------------------------------------------------
-- Exposition PUBLIQUE contrôlée : seule porte d'entrée pour anon et pour la liste
-- freelance. Vue volontairement SECURITY DEFINER (propriétaire postgres) : elle
-- n'expose que des colonnes non sensibles, uniquement les offres actives non
-- expirées de comptes non bloqués. La table de base reste protégée par RLS.
create view public.offer_cards as
select
  o.id, o.title, o.description, o.category_id, c.name as category_name,
  o.budget_min, o.budget_max, o.currency, o.duration_days, o.contract_type,
  o.location, o.is_remote, o.deadline, o.published_at,
  pp.organization_name,
  (p.identity_status = 'approved') as owner_verified,
  coalesce(
    (select array_agg(s.name order by s.name)
       from public.offer_skills os join public.skills s on s.id = os.skill_id
      where os.offer_id = o.id), '{}'::text[]) as skills,
  0::int as applications_count,   -- point d'accroche Package 3 (cf. offer_application_stats)
  o.search
from public.offers o
join public.profiles p on p.id = o.owner_id
left join public.porteur_profiles pp on pp.user_id = o.owner_id
left join public.categories c on c.id = o.category_id
where o.status = 'active'
  and not p.is_blocked
  and (o.deadline is null or o.deadline > now());

-- Compteurs de candidatures : valeurs à 0 tant que le Package 3 n'existe pas.
-- À reconstruire avec  applications(offer_id, status)  ; FK future documentée :
--   applications.offer_id -> offers.id ON DELETE CASCADE
-- et trigger CONDITIONNEL (à créer avec la table) : à la clôture / annulation /
-- retrait modéré, applications 'pending' -> 'closed' + notification aux candidats.
create view public.offer_application_stats with (security_invoker = true) as
select o.id as offer_id, 0::int as pending_count, 0::int as total_count
from public.offers o;
