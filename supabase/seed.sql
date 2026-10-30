-- Référentiels (idempotent)
insert into public.categories (slug, name, sort_order) values
  ('developpement', 'Développement', 1),
  ('design', 'Design & UX', 2),
  ('marketing', 'Marketing & stratégie', 3),
  ('redaction', 'Rédaction & traduction', 4),
  ('data', 'Data & analyse', 5),
  ('gestion', 'Gestion de projet', 6)
on conflict (slug) do nothing;

insert into public.skills (slug, name, category_id)
select v.slug, v.name, c.id from (values
  ('react','React','developpement'), ('nodejs','Node.js','developpement'), ('postgresql','PostgreSQL','developpement'),
  ('typescript','TypeScript','developpement'), ('flutter','Flutter','developpement'),
  ('figma','Figma','design'), ('ux-research','UX Research','design'), ('design-system','Design system','design'),
  ('strategie','Stratégie','marketing'), ('marketing','Marketing','marketing'), ('seo','SEO','marketing'),
  ('analytics','Analytics','marketing'), ('redaction-web','Rédaction web','redaction'),
  ('traduction','Traduction','redaction'), ('excel','Excel avancé','data'), ('power-bi','Power BI','data'),
  ('scrum','Scrum','gestion'), ('budgetisation','Budgétisation','gestion')
) as v(slug, name, cat) join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- Bootstrap du premier Super Admin (point §4.10) : jamais via l'interface.
-- Après création du compte par inscription, exécuter manuellement :
--   update public.profiles set app_role = 'super_admin', identity_status = 'approved'
--    where id = (select id from auth.users where email = 'vous@exemple.com');
