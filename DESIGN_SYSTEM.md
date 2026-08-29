# MedPage — Design System (Sites médicaux)

Système de design visant le niveau des clinics privées haut de gamme
(Paris / New York / Montréal). 100 % CSS natif + Tailwind, **aucune** librairie
d'animation ou de composants UI externe.

## Typographie (via `next/font/google`)

| Rôle          | Police            | Variable           | Usage                                     |
| ------------- | ----------------- | ------------------ | ----------------------------------------- |
| Titres        | Playfair Display  | `--font-playfair`  | H1/H2, cartes, métriques (serif élégant)  |
| Corps         | Inter             | `--font-inter`     | Textes, paragraphes, formulaire           |
| Labels/accents| DM Sans           | `--font-dm`        | Labels uppercase, badges, petites valeurs |

Les trois polices sont chargées dans `app/layout.js` et exposées en variables
CSS sur `<html>`. Classes utilitaires : `.font-playfair`, `.font-dm` (globals.css).

## Couleurs

- Accent dynamique : `site.themeColor` (ex. `#0EA5A8`), transmis au `<main>`
  comme variable CSS `--accent` et utilisé inline (`style={{}}`) partout —
  Tailwind ne génère pas de classes à runtime.
- Ac clair : `--accent` + alpha (backgrounds : `${accent}1A` = ~10%).
- Fond base : `#FAFAFA` · Section alt : `#F0F4F8`
- Texte : `#0F172A` (primaire) · `#475569` (secondaire) · `#94A3B8` (tertiaire)
- Bordures : `#E2E8F0` · Cards : blanc + `--shadow-soft`
- Gradient text : `linear-gradient(135deg, #0F172A, var(--accent))`
  (`.gradient-text` avec préfixe `-webkit-` pour Safari)

## Spacing / Layout

- Max-width conteneur : **1200px** centré
- Padding sections : **120px** desktop / **80px** mobile
- Grille 8pt (8 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 120)
- Radius : 16px cards · 24px sections/forms · 999px pills

## Effets & Animations (globals.css)

- **Glass header** : `backdrop-blur-xl` + `bg-white/85`
- **Scroll progress** : barre `--accent` 3px fixe en haut (SiteHeader)
- **Shimmer CTA** : `.cta-primary` gradient animé 3s linéaire
- **Gradient text** : `.gradient-text`
- **Float** : cartes flottantes du hero (`@keyframes float`)
- **Ring rotatif** : anneau pointillé 20s autour de la photo (`ring-spin`)
- **Pulse** : point « Disponible » (`pulse-dot`)
- **Confetti** : succès formulaire (`@keyframes confetti-fall`)
- **ECG** : ligne de vie animée (non utilisée par défaut, disponible)
- **RevealOnScroll** : variantes `fade` / `slide-up` / `slide-left` /
  `slide-right` / `scale` via IntersectionObserver natif

### Micro-interactions (tous les éléments interactifs)

default → hover (lift + shadow, 200ms ease-out) → active (`scale 0.98`) →
focus (ring `--accent`). Accessibilité : `aria-label` sur boutons icon-only,
contraste ≥ 4.5:1, `:focus-visible` global.

## Responsive

| Breakpoint | Comportement                                              |
| ---------- | --------------------------------------------------------- |
| < 640px    | Hero empilé, drawer latéral, services 1 col, témoignages scroll, booking 1 col |
| 640–1024   | Hero split réduit, services 2 col, about empilé           |
| > 1024px   | Design premium complet, services 3 col                    |

## Sections vides

Chaque composant gère ses fallbacks : grille de services générique selon la
spécialité, galerie masquée si < 3 photos, témoignages masqués si absents,
bio/points forts génériques élégants.
