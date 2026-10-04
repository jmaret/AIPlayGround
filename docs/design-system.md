# Design system

UX chrome matches AetherForge’s warm paper: Source Serif 4 + Source Sans 3, a sticky cream header, segmented tabs, and paper `WorkspacePanel`s at `max-w-3xl`. Teal stays the accent.

Playground keeps its own name, mark, mural, and copy. No stock office photography, third-party wordmark, or sign-in.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| background / paper | `#F6EAD8` | Page wash and text panels |
| ink | `#152028` | Type |
| ink-muted | `#5A6B76` | Secondary type |
| accent | `#0F4C5C` | Primary buttons, eyebrows |
| accent-hover | `#0C3D4A` | Button hover |
| line | `#D8C4AA` | Borders |
| mark fill | `#E6CA98` | Logo disc |
| mark stroke | `#B89260` | Logo rim |
| mark ink | `#2A2622` / `#5C3A22` | Logo drawing |
| danger | `#9B2C2C` | Errors |
| success | `#1F6B4A` | Grounded answers |

Backdrop is a cream wash (`#F6EAD8` into `#ECDCC4`) — no stock photo.

## Type

- Display: [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) via `next/font` (`--font-display`)
- UI: [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) (`--font-sans`)
- Mono: [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for distances and node dumps
- Sentence case. Display 500–700. Buttons `rounded-md`, not pills.

## Shell

- Sticky header: `bg-[rgba(246,234,216,0.9)] backdrop-blur-md`, `border-[var(--line)]`
- Brand row: mark + serif “Playground” + muted tagline
- Segmented nav: Home / Labs / Privacy
- Action: teal “Open a lab”
- Quiet footer line under `max-w-3xl` main
- No Sign In, no email capture

## Surfaces

`WorkspacePanel`: `rounded-xl border border-[var(--line)] bg-[rgba(246,234,216,0.92)] shadow-[0_18px_50px_-36px_rgba(15,40,50,0.55)] backdrop-blur-sm`.

The humanist mural sits inside the hero panel (crop + fade), not as a full-bleed Roots band.

## Brand files (`apps/web/public/brand/`)

- `logo.svg` — gold disc (`#E6CA98` / `#B89260`) with the profile and constellation in `#2A2622` and `#5C3A22`
- `icon-512.png` / `apple-touch-icon.png` / favicons
- `impact-mural.png` — AI-in-human-life illustration, used inside the hero panel
