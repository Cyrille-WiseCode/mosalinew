-- =============================================================================
-- 0002 — Profils, casquettes, vérification d'identité (structure)
-- =============================================================================
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text not null default '' check (char_length(full_name) <= 120),
  avatar_url       text,
  phone            text check (phone is null or char_length(phone) <= 30),
  city             text check (city is null or char_length(city) <= 80),
  app_role         public.app_role not null default 'user',
  active_casquette public.casquette not null default 'freelance',
  identity_status  public.identity_status not null default 'none',
  is_blocked       boolean not null default false,
  blocked_reason   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on column public.profiles.app_role is 'Rôle plateforme. Jamais modifiable par l''utilisateur (privilège colonne retiré en 0004).';

create table public.freelance_profiles (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  headline        text check (headline is null or char_length(headline) <= 140),
  bio             text check (bio is null or char_length(bio) <= 2000),
  portfolio_links text[] not null default '{}'
);

create table public.freelance_skills (
  user_id  uuid not null references public.freelance_profiles(user_id) on delete cascade,
  skill_id integer not null references public.skills(id) on delete cascade,
  primary key (user_id, skill_id)
);

create table public.porteur_profiles (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  organization_name text check (organization_name is null or char_length(organization_name) <= 120),
  sector            text check (sector is null or char_length(sector) <= 120),
  description       text check (description is null or char_length(description) <= 2000)
);

-- Table seule dans cette itération (UI = étape 7). Bucket Storage privé à créer.
create table public.identity_documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  doc_type     public.doc_type not null,
  storage_path text not null,
  status       public.doc_status not null default 'pending',
  reviewed_by  uuid references public.profiles(id),
  review_note  text,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ---- Helpers (privés, SECURITY DEFINER, search_path verrouillé) -------------
-- Évitent la récursion RLS : les politiques lisent profiles via ces fonctions.
create or replace function private.current_app_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$ select p.app_role from public.profiles p where p.id = (select auth.uid()) $$;

create or replace function private.is_active_user()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select not p.is_blocked from public.profiles p where p.id = (select auth.uid())), false) $$;

grant execute on function private.current_app_role() to anon, authenticated;
grant execute on function private.is_active_user()   to anon, authenticated;

-- ---- Création automatique du profil à l'inscription -------------------------
-- La casquette initiale vient des métadonnées d'inscription, mais app_role et
-- identity_status ne sont JAMAIS lus depuis le client.
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_casquette public.casquette;
begin
  v_casquette := case new.raw_user_meta_data ->> 'active_casquette'
                   when 'porteur' then 'porteur'::public.casquette
                   else 'freelance'::public.casquette end;

  insert into public.profiles (id, full_name, active_casquette)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120), v_casquette);

  -- Hypothèse §4.3 : un utilisateur peut posséder les deux profils.
  insert into public.freelance_profiles (user_id) values (new.id);
  insert into public.porteur_profiles   (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();
