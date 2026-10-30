-- =============================================================================
-- 0001 — Extensions, schéma privé, enums, tables de référence
-- =============================================================================
create extension if not exists pgcrypto;

-- Schéma privé : non exposé par l'API PostgREST. Contient les fonctions
-- SECURITY DEFINER internes (helpers, audit, notifications, expiration).
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create type public.app_role          as enum ('user', 'moderator', 'super_admin');
create type public.casquette         as enum ('freelance', 'porteur');
create type public.identity_status   as enum ('none', 'pending', 'approved', 'rejected');
create type public.offer_status      as enum ('draft', 'active', 'filled', 'cancelled', 'expired');
-- Hypothèse (point §4.4/§4.10 à valider) : 3 types de contrat adaptés au freelancing.
create type public.contract_type     as enum ('forfait', 'regie', 'temps_partiel');
create type public.audit_criticality as enum ('low', 'medium', 'high');
create type public.report_status     as enum ('open', 'dismissed', 'actioned');
create type public.doc_type          as enum ('cni', 'passport', 'permis');
create type public.doc_status        as enum ('pending', 'approved', 'rejected');

-- Taxonomie administrable (point §4.8) : tables seedées, modifiables plus tard.
create table public.categories (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  sort_order  smallint not null default 0
);
comment on table public.categories is 'Domaines d''expertise (taxonomie de référence, lecture publique).';

create table public.skills (
  id          integer generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  category_id smallint references public.categories(id) on delete set null
);
comment on table public.skills is 'Compétences (taxonomie de référence, lecture publique).';
