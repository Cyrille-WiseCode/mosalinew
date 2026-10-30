# MOSALI — Design system

Source de vérité visuelle : `app/globals.css`. Aucun composant ne redéfinit une couleur, une ombre ou une texture.

## Direction
Monochrome froid (bleu-gris) + **un seul accent** : indigo ardoise (`--primary`, #5c5e8d en clair, éclairci en sombre).
Sémantiques (succès / alerte / erreur / info) désaturées, avec variante `-soft` pour les fonds.
Alternative B proposée et non retenue : sarcelle ardoise `hsl(190 25% 38%)` — remplaçable en changeant 3 variables.

## Typographie
Famille : **Instrument Sans** (humaniste, compacte), via `next/font`. Une seule famille ; chiffres tabulaires pour les montants.

| Token | Taille | Usage |
|---|---|---|
| `text-2xs` | 11 px | méta, badges, captions |
| `text-xs` | 12 px | labels, aides, erreurs |
| `text-sm` | 13 px | **texte d'interface par défaut** |
| `text-base` | 14 px | lecture (descriptions, paragraphes) |
| `text-lg` | 16 px | titres de carte / section |
| `text-xl` | 20 px | titre de page |
| `text-2xl` | 24 px | plafond dans l'application |
| `text-display` | 26 → 34 px (fluide) | **hero public uniquement** |

Plancher : 11 px (l'ancienne maquette descendait à 8–9 px).

## Surfaces et matières
- **Rayons** : 4 / 6 / 8 / 10 px (`rounded-sm/md/lg/xl`) — jamais de coin droit.
- **Grain** : une texture SVG, utilities `grain` + intensité `grain-soft` (cartes, champs) · `grain-medium` · `grain-strong` (bandeaux sombres) · `grain-print` (boutons, effet sérigraphie très visible). Le grain est derrière le contenu, au-dessus du fond.
- **Verre poli** (`glass`) : sidebar, cartes, dialogs, toasts uniquement.
- **Profondeur** : `shadow-z1` (repos) → `z2` (survol / popover) → `z3` (dialog).
- **Aucun dégradé.** Aucune bordure épaisse.

## Mouvement
Spring léger `cubic-bezier(.34,1.4,.64,1)`, 160 ms. Feedback tactile `active:scale-[.975]` sur les boutons. `prefers-reduced-motion` coupe toutes les animations.

## Accessibilité
Focus visible 2 px sur tout élément interactif, labels liés (`htmlFor`), erreurs `role="alert"` + `aria-describedby`, lien « Aller au contenu », zones tactiles ≥ 40 px sur mobile (32 px ≥ md), contraste ≥ AA sur les paires foreground/background des deux thèmes.

## Écart assumé
Tailwind v4 n'a plus de `tailwind.config` : les tokens HSL sont mappés dans `@theme inline` (même effet).
