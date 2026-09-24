# BJJ Connections

A free daily [Connections](https://www.nytimes.com/games/connections)-style word
puzzle for Brazilian Jiu-Jitsu. Find four groups of four, learn a bit of BJJ
history/technique along the way, and share your result.

Live at **[bjjconnectionsbygabe.com](https://bjjconnectionsbygabe.com)**.

## Features
- Daily deterministic puzzle (everyone gets the same puzzle each day)
- Training mode with a real, content-based difficulty filter (white/blue/purple/black)
- Archive — replay any of the last 30 days' puzzles
- Streaks and local stats (persisted to `localStorage`, with a safe in-memory
  fallback if storage is unavailable — e.g. Safari private browsing)
- "One away" feedback
- "Learn why" explanations for every category
- Share results as a colored-square grid, like Wordle/Connections
- 50-puzzle bank with automated duplicate/structure checking
- Mobile-first, accessible layout (keyboard focus states, ARIA live regions)

## Files
- `index.html` — app structure, metadata (Open Graph/Twitter cards, favicon, manifest)
- `style.css` — styling, including a dark-mode variant and mobile tile sizing
- `data.js` — puzzle bank, difficulty classification, and validation logic
- `app.js` — gameplay, daily/training/archive modes, stats, sharing
- `scripts/validate-puzzles.js` — run this before committing changes to
  `data.js` (see below)
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png` — icons and social-share image
- `manifest.json` — enables "Add to Home Screen" on mobile
- `robots.txt`, `sitemap.xml` — search engine crawling/discovery

## Adding or editing puzzles
Puzzles live in the `ROUNDS` array in `data.js` — each entry is 4 groups of
`[item, item, item, item, "CATEGORY NAME"]`. Difficulty is *not* set manually;
it's inferred automatically from the actual technique terms in the puzzle
(see `classifyDifficulty` in `data.js`). If you use a category name that
doesn't have an entry in the `EXPLANATIONS` object, a generic fallback
sentence is shown instead of breaking — but it's worth adding a real
explanation for any new category.

Before committing a change to `data.js`, run:

```
node scripts/validate-puzzles.js
```

This checks every puzzle's structure and — importantly — checks the whole
bank for exact-duplicate puzzles, so a copy/paste mistake never ships
unnoticed.

## Deployment
Static site, no build step. Fully compatible with GitHub Pages — push these
files to the repository root of the `main` branch (already configured via
the `CNAME` file for the custom domain).
