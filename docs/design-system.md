# Design system

Inspired by the *grammar* of investwithroots.com (cream paper, full-bleed bands, soft serif + humanist sans, pill CTAs). Original identity — not a clone.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| cream | `#F7F1E3` | Page, nav, FAQ |
| apricot | `#FF8A4C` | Primary, hero warmth |
| ink | `#2A1F18` | Type, dark band, footer |
| sky | `#7EB8E8` | Accent band / Vector card |
| blush | `#F5C4D8` | RAG card |
| butter | `#F5E27A` | LangGraph card |

Do not use Roots mint `#49E885` or forest `#123F2E`.

## Type

- Display: [Newsreader](https://fonts.google.com/specimen/Newsreader) via `next/font` (build-time)
- UI: [Figtree](https://fonts.google.com/specimen/Figtree) via `next/font`
- Sentence case. Display 800–900, body 500–600.

## Brand files (`apps/web/public/brand/`)

- `logo.svg` — source of truth for the nav badge
- `logo-flat.png` — simple pictogram
- `icon-512.png` — painterly app tile
- `apple-touch-icon.png` — 180px
- `favicon-32.png` / `favicon.ico`
- `impact-mural.png` — humanist “AI in human life” hero
- `impact-mural-og.png` — open-graph / local preview crop

### Mural story

Everyday people (student, parent and child, maker, caregiver, musician) stay in the foreground. A light constellation overlay is the *impact*. Hopeful, not dystopian. Hero uses a cream/apricot scrim so headlines stay readable. Other bands stay flat color.

### Logo story

A cream circular badge. Human profile first; an off-center 3-node apricot constellation in the mind. People first, graph second. Never recolor onto mint. Never add a SaaS glow.

## Shape

- CTAs: fully round pills
- Cards: ~48px radius
- Quote / trace slabs may be flatter
