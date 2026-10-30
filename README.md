# MOSALI — Inscription, connexion, offres (Next.js 16 · Supabase · Tailwind v4)

## Démarrage
```bash
npm install
cp .env.example .env.local        # URL + clé anon Supabase
supabase start                    # ou un projet Supabase distant
supabase db reset                 # migrations + seed.sql (+ seed_demo.sql en local, voir ci-dessous)
npm run dev
```
Pour les données de démo locales : ajouter `sql_paths = ["./seed.sql", "./seed_demo.sql"]` dans `supabase/config.toml` (**jamais en production**). Comptes démo : `kongo@demo.mosali.test` / `Demo-Mosali-2026`.

### Réglages Supabase (Dashboard → Authentication)
- Confirmation e-mail **activée** ; *Site URL* = `NEXT_PUBLIC_SITE_URL` ; *Redirect URLs* : `<site>/auth/callback`.
- Longueur minimale du mot de passe : 8. Limites de débit d'envoi d'e-mails : à régler selon votre trafic.
- pg_cron : activer l'extension (Database → Extensions) pour l'expiration automatique des offres.

### Premier Super Admin (jamais via l'interface)
Créer le compte par l'inscription, puis en SQL : voir le commentaire final de `supabase/seed.sql`.
Pour tester la publication, passer un porteur en vérifié :
`update public.profiles set identity_status='approved' where id='<uuid>';`

## Ce qui est livré
- **Design system** (`docs/design-system.md`) : tokens, échelle compacte façon Linear, grain, verre, mode sombre.
- **Auth** : inscription (choix de casquette), connexion, mot de passe oublié / réinitialisation, vérification e-mail, déconnexion, comptes bloqués.
- **Offres** : explorateur filtrable (mot-clé FTS français, domaine, contrat, budget, lieu, télétravail, pagination), détail avec **description**, lien public partageable, « Mes offres », brouillons avec **autosave**, publication avec récapitulatif, prolongation, clôture, annulation, suppression de brouillon, modération (retirer / signaler / rétablir).
- **Base** : 6 migrations, RLS, RPC, audit immuable, expiration cron, seeds, tests pgTAP.
- **Landing** refactorisée en composants (images fournies respectées, textes agrandis).

## Vérifié / non vérifié
Vérifié : `tsc --noEmit` ✔ · `next build` ✔ (police Google remplacée temporairement, le sandbox n'y accède pas) · rendu et redirections des routes avec Supabase injoignable ✔ · syntaxe SQL des migrations et des tests ✔.
**Non exécuté** : migrations et tests pgTAP contre un vrai Postgres, parcours complets avec un Supabase réel, tests visuels dans un navigateur, Lighthouse.

## Limites connues
- Types de base non générés : lancer `npm run db:types` puis typer les clients (`createServerClient<Database>`). Les types de `features/offers/types.ts` sont écrits à la main en attendant.
- Pas de rate limiting applicatif sur l'auth (Supabase applique ses propres limites).
- Chiffres de la bande de confiance : statiques (maquette) ; vérification d'identité, profils, candidatures, notifications UI : étapes suivantes.
- La synchronisation des compétences d'une offre n'est pas atomique (2 requêtes idempotentes).
