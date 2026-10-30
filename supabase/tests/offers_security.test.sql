-- pgTAP — `supabase test db`. Vérifie RLS, privilèges de colonnes, RPC et audit.
-- NB : écrit mais non exécuté dans l'environnement de génération (pas de Postgres/Supabase local).
begin;
select plan(18);

create function pg_temp.as_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid::text, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;

-- ---- Jeu de données (en tant que postgres) ----------------------------------
insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'porteur@t.test',  '{"active_casquette":"porteur"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a2', 'authenticated', 'authenticated', 'unverified@t.test','{"active_casquette":"porteur"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000b1', 'authenticated', 'authenticated', 'freelance@t.test', '{"active_casquette":"freelance"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000c1', 'authenticated', 'authenticated', 'modo@t.test',      '{}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000d1', 'authenticated', 'authenticated', 'admin@t.test',     '{}');
update public.profiles set identity_status = 'approved' where id = '00000000-0000-0000-0000-0000000000a1';
update public.profiles set app_role = 'moderator'   where id = '00000000-0000-0000-0000-0000000000c1';
update public.profiles set app_role = 'super_admin' where id = '00000000-0000-0000-0000-0000000000d1';

insert into public.categories (slug, name) values ('t-cat', 'Test') on conflict do nothing;
insert into public.skills (slug, name) values ('t-skill', 'TestSkill') on conflict do nothing;

insert into public.offers (id, owner_id, title, description, category_id, budget_min, budget_max, duration_days, contract_type, deadline, status, published_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', 'Offre active', repeat('x', 40), (select id from public.categories where slug='t-cat'), 100, 200, 10, 'forfait', now() + interval '20 days', 'active', now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1', 'Brouillon complet', repeat('y', 40), (select id from public.categories where slug='t-cat'), 100, 200, 10, 'forfait', now() + interval '20 days', 'draft', null),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-0000000000a1', 'Brouillon incomplet', null, null, null, null, null, null, null, 'draft', null),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-0000000000a2', 'Brouillon non vérifié', repeat('z', 40), (select id from public.categories where slug='t-cat'), 1, 2, 3, 'forfait', now() + interval '10 days', 'draft', null);
insert into public.offer_skills values
  ('10000000-0000-0000-0000-000000000002', (select id from public.skills where slug='t-skill')),
  ('10000000-0000-0000-0000-000000000004', (select id from public.skills where slug='t-skill'));

-- ---- Lecture ----------------------------------------------------------------
set local role anon;
select throws_ok($$select * from public.offers$$, '42501', null, 'anon : accès direct à offers refusé');
select is((select count(*)::int from public.offer_cards), 1, 'anon : seule l''offre active est visible via offer_cards');
reset role;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1');
select is((select count(*)::int from public.offers where status = 'draft'), 0, 'freelance : ne voit aucun brouillon');
select throws_ok(
  $$insert into public.offers (owner_id, title) values ('00000000-0000-0000-0000-0000000000b1', 'Intrus')$$,
  '42501', null, 'freelance : création d''offre refusée (RLS)');
select throws_ok($$update public.profiles set app_role = 'super_admin' where id = '00000000-0000-0000-0000-0000000000b1'$$,
  '42501', null, 'utilisateur : ne peut pas s''auto-promouvoir (privilège de colonne)');
reset role;

-- ---- Écriture directe interdite sur les colonnes de statut ------------------
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1');
select throws_ok($$update public.offers set status = 'filled' where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'porteur : ne peut pas changer status directement');
select throws_ok($$update public.offers set deadline = now() + interval '40 days' where id = '10000000-0000-0000-0000-000000000001'$$,
  'P0001', 'USE_EXTEND_DEADLINE', 'porteur : date limite d''une offre active via extend_offer_deadline uniquement');

-- ---- RPC : publication ------------------------------------------------------
select throws_ok($$select public.publish_offer('10000000-0000-0000-0000-000000000003')$$,
  'P0001', 'MISSING_FIELDS', 'publish : brouillon incomplet refusé');
select is((public.publish_offer('10000000-0000-0000-0000-000000000002') ->> 'status'), 'active', 'publish : brouillon complet publié');
select is((public.publish_offer('10000000-0000-0000-0000-000000000002') ->> 'status'), 'active', 'publish : idempotent (double clic)');
select throws_ok($$select public.extend_offer_deadline('10000000-0000-0000-0000-000000000001', now() + interval '120 days')$$,
  'P0001', 'INVALID_DEADLINE', 'extend : au-delà de 90 jours refusé');
select is((public.close_offer('10000000-0000-0000-0000-000000000001') ->> 'status'), 'filled', 'close : active -> filled');
select throws_ok($$select public.cancel_offer('10000000-0000-0000-0000-000000000001')$$,
  'P0001', 'INVALID_STATUS', 'cancel : impossible après clôture');
reset role;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2');
select throws_ok($$select public.publish_offer('10000000-0000-0000-0000-000000000004')$$,
  'P0001', 'IDENTITY_REQUIRED', 'publish : identité non vérifiée refusée');
reset role;

-- ---- Modération -------------------------------------------------------------
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
select throws_ok($$select public.moderate_remove_offer('10000000-0000-0000-0000-000000000002', '')$$,
  'P0001', 'REASON_REQUIRED', 'modération : motif obligatoire');
select is((public.moderate_remove_offer('10000000-0000-0000-0000-000000000002', 'Contenu non conforme') ->> 'status'), 'cancelled', 'modération : retrait par modérateur');
reset role;

-- ---- Audit immuable (en tant que postgres) ----------------------------------
select throws_ok($$delete from public.audit_logs$$, 'P0001', 'AUDIT_IMMUTABLE', 'audit : suppression impossible');

select * from finish();
rollback;
