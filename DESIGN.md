# Weaviate Design System (Inspo)

> Extracted by [Inspo](https://github.com/Nutlope/inspo). Reference material for intentional design decisions for Nexora AI Learning Companion.
> Source: https://weaviate.io
> Mode: light (Split Studio)

## Tone
The design uses a vibrant, layered design with a bold, stylized aesthetic and contrasting neon lime, deep ink, and pale green color palette. The layout is split, with a prominent hero section, interactive vector visualizers, and a grid of integrations. It feels like a modern, high-performance AI developer and learning platform.

## Color Tokens

| Token | Hex | Role | Usage |
|---|---|---|---|
| `lime` | `#cfde22` | Dominant / Neon Accent | Primary CTA buttons, glowing badges, active indicators |
| `ink` | `#1d156b` | Primary Ink & Surface | Deep indigo/navy headings, text, dark action buttons |
| `pale` | `#dcf090` | Raised Surface | Highlight pill badges, glow backdrops, selection states |
| `slate` | `#4c4b84` | Support / Accent | Secondary text, subtle icons, border accents |
| `muted` | `#a2b9c0` | Muted Gray-Blue | Subtle metadata, timestamps, disabled items |
| `paper` | `#f7f9fd` | Base Canvas | Crisp cool-paper background |
| `border` | `#dedcef` | Subtle Rules | 1px clean futuristic borders |
| `white` | `#ffffff` | Elevated Cards | High-contrast white cards |

## Typography
- **Headings (h1, h2, h3)**: `Plus Jakarta Sans`, bold (600-800), letter-spacing: -0.03em to -0.04em.
- **Body**: `Inter`, 400-500, line-height: 1.6, clean legibility.
- **Code & Vectors**: `JetBrains Mono`, tabular figures, monospace vector similarity displays.

## Macrostructure: Split Studio
- Sticky / floating capsule masthead with blur backdrop (`backdrop-blur-xl`).
- High-contrast split hero: Left typography & CTAs, Right interactive vector/graph demonstration.
- Geometric card radii: `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full` (9999px) for pill buttons and status tags.
- Neon glow effects (`shadow-[0_0_25px_rgba(207,222,34,0.35)]`).
