-- =============================================================================
-- 0004 — Row Level Security + privilèges (qui lit, qui écrit, pourquoi)
-- Principe : RLS activée partout ; privilèges de colonnes pour les écritures
-- directes ; transitions et actions sensibles via RPC uniquement (0005).
-- =============================================================================
alter table public.categories         enable row level security;
alter table public.skills             enable row level security;
alter table public.profiles           enable row level security;
alter table public.freelance_profiles enable row level security;
alter table public.freelance_skills   enable row level security;
alter table public.porteur_profiles   enable row level security;
alter table public.identity_documents enable row level security;
alter table public.offers             enable row level security;
alter table public.offer_skills       enable row level security;
alter table public.offer_reports      enable row level security;
alter table public.notifications      enable row level security;
alter table public.audit_logs         enable row level security;

-- Repartir de zéro côté privilèges, puis accorder explicitement.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- ---- Référentiels -----------------------------------------------------------
grant select on public.categories, public.skills to anon, authenticated;
create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy skills_read     on public.skills     for select to anon, authenticated using (true);
-- Écriture des référentiels : super_admin uniquement (administration future).
grant insert, update, delete on public.categories, public.skills to authenticated;
create policy categories_admin on public.categories for all to authenticated
  using (private.current_app_role() = 'super_admin') with check (private.current_app_role() = 'super_admin');
create policy skills_admin on public.skills for all to authenticated
  using (private.current_app_role() = 'super_admin') with check (private.current_app_role() = 'super_admin');

-- ---- profiles ---------------------------------------------------------------
-- Lecture : son propre profil ; le super_admin lit tous les profils (administration).
-- Écriture : uniquement colonnes non sensibles. app_role, identity_status,
-- is_blocked, blocked_reason ne sont modifiables que par des fonctions de confiance.
grant select on public.profiles to authenticated;
grant update (full_name, phone, city, avatar_url, active_casquette) on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.current_app_role() = 'super_admin');
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid()) and private.is_active_user())
  with check (id = (select auth.uid()));

-- ---- freelance_profiles / porteur_profiles / freelance_skills ---------------
grant select, update on public.freelance_profiles, public.porteur_profiles to authenticated;
grant select, insert, delete on public.freelance_skills to authenticated;
create policy freelance_profiles_select on public.freelance_profiles for select to authenticated
  using (user_id = (select auth.uid()) or private.current_app_role() = 'super_admin');
create policy freelance_profiles_update on public.freelance_profiles for update to authenticated
  using (user_id = (select auth.uid()) and private.is_active_user()) with check (user_id = (select auth.uid()));
create policy porteur_profiles_select on public.porteur_profiles for select to authenticated
  using (user_id = (select auth.uid()) or private.current_app_role() = 'super_admin');
create policy porteur_profiles_update on public.porteur_profiles for update to authenticated
  using (user_id = (select auth.uid()) and private.is_active_user()) with check (user_id = (select auth.uid()));
create policy freelance_skills_own on public.freelance_skills for all to authenticated
  using (user_id = (select auth.uid()) and private.is_active_user())
  with check (user_id = (select auth.uid()) and private.is_active_user());

-- ---- identity_documents (structure ; UI à l'étape 7) -------------------------
grant select, insert on public.identity_documents to authenticated;
grant update (status, reviewed_by, review_note, reviewed_at) on public.identity_documents to authenticated;
create policy identity_docs_select on public.identity_documents for select to authenticated
  using (user_id = (select auth.uid()) or private.current_app_role() in ('moderator', 'super_admin'));
create policy identity_docs_insert on public.identity_documents for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending' and private.is_active_user());
create policy identity_docs_review on public.identity_documents for update to authenticated
  using (private.current_app_role() in ('moderator', 'super_admin'))
  with check (private.current_app_role() in ('moderator', 'super_admin'));

-- ---- offers -----------------------------------------------------------------
-- Lecture : offres actives (tout utilisateur connecté non bloqué), ses propres
-- offres (tout statut), toutes les offres pour modérateurs / super_admin.
-- Les anonymes passent par la vue offer_cards (cf. 0003).
grant select, insert, delete on public.offers to authenticated;
grant update (title, description, category_id, budget_min, budget_max, duration_days,
              contract_type, location, is_remote, deadline) on public.offers to authenticated;

create policy offers_select on public.offers for select to authenticated
  using (
    private.is_active_user() and (
      status = 'active'
      or owner_id = (select auth.uid())
      or private.current_app_role() in ('moderator', 'super_admin')
    )
  );
-- Création : uniquement un brouillon, à son nom, avec la casquette porteur active.
create policy offers_insert on public.offers for insert to authenticated
  with check (
    owner_id = (select auth.uid()) and status = 'draft'
    and private.is_active_user() and private.current_casquette() = 'porteur'
  );
-- Édition directe : brouillon ou active, propriétaire. status/published_at/closed_at/
-- is_moderated sont exclus des privilèges de colonnes -> RPC obligatoire.
create policy offers_update_owner on public.offers for update to authenticated
  using (owner_id = (select auth.uid()) and status in ('draft', 'active') and private.is_active_user())
  with check (owner_id = (select auth.uid()));
-- Suppression : brouillons uniquement.
create policy offers_delete_draft on public.offers for delete to authenticated
  using (owner_id = (select auth.uid()) and status = 'draft' and private.is_active_user());

-- ---- offer_skills -----------------------------------------------------------
-- Visibles si l'offre parente est visible (la sous-requête applique la RLS d'offers).
grant select, insert, delete on public.offer_skills to authenticated;
create policy offer_skills_select on public.offer_skills for select to authenticated
  using (exists (select 1 from public.offers o where o.id = offer_id));
create policy offer_skills_write on public.offer_skills for insert to authenticated
  with check (exists (select 1 from public.offers o
    where o.id = offer_id and o.owner_id = (select auth.uid())
      and o.status in ('draft', 'active')) and private.is_active_user());
create policy offer_skills_delete on public.offer_skills for delete to authenticated
  using (exists (select 1 from public.offers o
    where o.id = offer_id and o.owner_id = (select auth.uid())
      and o.status in ('draft', 'active')) and private.is_active_user());

-- ---- offer_reports : lecture modérateurs ; écriture via RPC flag_offer ------
grant select on public.offer_reports to authenticated;
create policy offer_reports_select on public.offer_reports for select to authenticated
  using (private.current_app_role() in ('moderator', 'super_admin'));

-- ---- notifications : lecture de ses notifications ; insertion via fonctions --
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_mark_read on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---- audit_logs : lecture super_admin ; AUCUNE politique d'écriture ---------
grant select on public.audit_logs to authenticated;
create policy audit_logs_select on public.audit_logs for select to authenticated
  using (private.current_app_role() = 'super_admin');

-- ---- Vues -------------------------------------------------------------------
grant select on public.offer_cards to anon, authenticated;
grant select on public.offer_application_stats to authenticated;
