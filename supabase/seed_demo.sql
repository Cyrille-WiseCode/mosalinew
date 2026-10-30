-- DONNÉES DE DÉMO — DÉVELOPPEMENT LOCAL UNIQUEMENT (supabase db reset). Ne jamais lancer en production.
do $$
declare
  r record; v_uid uuid; v_offer uuid;
begin
  for r in select * from (values
    ('kongo@demo.mosali.test', 'Kongo Digital', 'Développeur full-stack React', 'developpement', 900000, 1200000, 42, 'forfait', 'Brazzaville', false,
     'Nous recherchons un développeur full-stack pour construire le portail client de notre plateforme de logistique : tableau de bord, suivi des expéditions et API interne. Vous travaillerez avec notre équipe produit en sprints de deux semaines, avec des points réguliers à Brazzaville.',
     array['react','nodejs','postgresql']),
    ('paysika@demo.mosali.test', 'PaySika', 'Designer produit & UX', 'design', 650000, 850000, 28, 'forfait', null, true,
     'Conception de l''expérience mobile de notre application de paiement : recherche utilisateur auprès de commerçants, parcours clés, maquettes haute fidélité et bibliothèque de composants documentée. Livraison par lots hebdomadaires.',
     array['figma','ux-research','design-system']),
    ('biso@demo.mosali.test', 'Biso Market', 'Consultant stratégie digitale', 'marketing', 450000, 600000, 21, 'regie', 'Pointe-Noire', false,
     'Audit de la présence digitale de notre marketplace et définition d''un plan d''acquisition sur trois mois : canaux, budgets, indicateurs de suivi. Restitution sous forme d''atelier avec l''équipe commerciale.',
     array['strategie','marketing','analytics'])
  ) as t(email, org, title, cat, bmin, bmax, days, ctype, loc, remote, descr, skills)
  loop
    v_uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', r.email,
            crypt('Demo-Mosali-2026', gen_salt('bf')), now(),
            jsonb_build_object('full_name', r.org, 'active_casquette', 'porteur'), now(), now());
    update public.profiles set identity_status = 'approved' where id = v_uid;
    update public.porteur_profiles set organization_name = r.org where user_id = v_uid;

    insert into public.offers (owner_id, title, description, category_id, budget_min, budget_max, duration_days,
                               contract_type, location, is_remote, deadline, status, published_at)
    select v_uid, r.title, r.descr, c.id, r.bmin, r.bmax, r.days, r.ctype::public.contract_type, r.loc, r.remote,
           now() + interval '30 days', 'active', now() - interval '1 day'
      from public.categories c where c.slug = r.cat
    returning id into v_offer;

    insert into public.offer_skills (offer_id, skill_id)
    select v_offer, s.id from public.skills s where s.slug = any (r.skills);
  end loop;
end $$;
