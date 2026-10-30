# Architecture

## Arborescence
```
app/                 routes uniquement (fines) : (auth) · (app) · (public) · auth/callback
components/ui/       primitives shadcn (Radix + cva), thémées par tokens
components/patterns/ composants métier réutilisables (PageHeader, StatusBadge, ConfirmDialog, FilterBar, DataTable…)
components/layout/   AppShell, AppSidebar
features/<domaine>/  auth · offers · profiles · landing
  ├─ schemas.ts      Zod, partagé formulaire ↔ Server Action
  ├─ queries.ts      lecture (server-only) — Repository
  ├─ actions.ts      écriture (Server Actions) — Commandes
  └─ components/     UI du domaine
lib/                 supabase (clients, proxy, adaptateurs d'erreurs), messages FR, format, result, session
supabase/migrations  0001 enums · 0002 profils · 0003 offres/audit/vues · 0004 RLS · 0005 RPC · 0006 cron
supabase/tests       pgTAP
```

## Patterns
| Pattern | Où |
|---|---|
| Repository | `features/*/queries.ts` : seul endroit où l'on lit Supabase |
| Command | `features/*/actions.ts` : une action = une intention métier, retour `Result<T>` |
| Adapter | `lib/supabase/errors.ts` : erreur Postgres/Auth → code métier + message FR |
| Strategy | `StatusBadge` (table statut → ton), `CategoryIcon` |
| Result | `lib/result.ts` : aucun `throw` d'un cas prévu vers l'UI |
| Facade | `lib/supabase/{server,browser,proxy}` |
| State machine | trigger `guard_offer_update` + RPC (jamais d'UPDATE de statut côté client) |

## Sécurité — défense en profondeur
1. **Proxy** (`proxy.ts`) : session, routes protégées, compte bloqué → déconnexion.
2. **Server Actions** : validation Zod, `getCurrentUser`, codes d'erreur typés.
3. **RLS + privilèges de colonnes** : `status`, `published_at`, `is_moderated`, `app_role`, `identity_status` ne sont écrits que par des fonctions `SECURITY DEFINER` (`search_path` verrouillé, schéma `private` non exposé).
4. **RPC transactionnelles** : précondition + changement + notification + audit dans une même transaction ; idempotentes.
5. **Audit immuable** : triggers UPDATE/DELETE/TRUNCATE interdits.

La clé `service_role` n'est jamais utilisée.

## Hypothèses prises (à valider — voir README)
Types de contrat `forfait | regie | temps_partiel` · date limite obligatoire, 90 jours max, alerte J-3 · un utilisateur peut avoir les deux profils · offre publiée : tout modifiable sauf le type de contrat · rétablissement : uniquement une offre retirée par modération, super_admin · liste et détail lisibles par tout connecté ; lien public `/m/[id]` sans contact du porteur · taxonomie en tables seedées.
