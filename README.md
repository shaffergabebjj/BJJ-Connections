# BJJ Connections

A growing collection of Brazilian Jiu-Jitsu techniques, training tools, competition resources, and daily puzzles for grapplers. Built by Gabe Shaffer as a personal project.

Live at **[bjjconnectionsbygabe.com](https://bjjconnectionsbygabe.com)**.

## Site Structure

| Page | Description |
|------|-------------|
| `index.html` | Home page — hero, featured tools, puzzle preview, about |
| `techniques.html` | Searchable/filterable technique explorer with 80+ techniques |
| `puzzles.html` | Daily Connections-style BJJ word puzzle with training mode and archive |
| `competition.html` | Interactive competition prep checklists (gi, no-gi, weigh-in, match-day) |
| `training.html` | Drilling ideas, solo drills, conditioning concepts, goal-setting tool |
| `resources.html` | BJJ glossary, belt system reference, and curated links |
| `about.html` | About Gabe Shaffer and the project |

## Features

### Daily Puzzle (puzzles.html)
- Daily deterministic puzzle (everyone gets the same puzzle each day)
- Training mode with content-based difficulty filter (white/blue/purple/black)
- Archive — replay any of the last 30 days' puzzles
- Streaks and local stats (persisted to `localStorage`)
- "One away" feedback
- "Learn why" explanations for every category
- Share results as a colored-square grid
- 100-puzzle bank with automated duplicate/structure checking

### Technique Explorer (techniques.html)
- 80+ techniques across 9 categories
- Search by name or description
- Filter by category and approximate belt difficulty
- Belt-level badges for difficulty indication

### Competition Prep (competition.html)
- Interactive checklists: week-before, gi prep, no-gi prep, what to bring, match-day, weigh-in
- Progress bars with local storage persistence
- Links to rules organizations (IBJJF, ADCC, NAGA, etc.)
- Competition terminology glossary

### Training Resources (training.html)
- Solo drilling ideas
- Partner drilling ideas
- Warm-up routines
- Strength & conditioning concepts
- Goal-setting tool with local storage

## Files

- `index.html`, `techniques.html`, `puzzles.html`, `competition.html`, `training.html`, `resources.html`, `about.html` — site pages
- `style.css` — full design system (black/white combat-sports aesthetic, dark mode, responsive)
- `data.js` — puzzle bank, difficulty classification, and validation logic
- `app.js` — puzzle gameplay logic (daily/training/archive modes, stats, sharing)
- `techniques.js` — technique database (categories, belt levels, descriptions)
- `nav.js` — shared navigation (mobile menu toggle, active states)
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png` — icons and social image
- `manifest.json` — PWA manifest for "Add to Home Screen"
- `robots.txt`, `sitemap.xml` — search engine crawling/discovery
- `CNAME` — custom domain configuration

## Deployment

Static site, no build step. Fully compatible with GitHub Pages — push all files to the repository root of the `main` branch (configured via the `CNAME` file for the custom domain `bjjconnectionsbygabe.com`).

## Adding or Editing Puzzles

Puzzles live in the `ROUNDS` array in `data.js`. Difficulty is inferred automatically from the technique terms (see `classifyDifficulty` in `data.js`). See the comments in `data.js` for detailed instructions.

## Architecture

- Vanilla HTML, CSS, and JavaScript — no frameworks or build tools
- Multi-page static architecture for SEO and no-JS content fallback
- Shared navigation included in each page with `nav.js` for mobile menu toggle
- All interactive features use `localStorage` for persistence with safe fallbacks
- Mobile-first responsive design with dark mode support
