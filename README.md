# BJJ Connections

A growing collection of Brazilian Jiu-Jitsu techniques, training tools, competition resources, and daily puzzles for grapplers. Built by Gabe Shaffer as a personal project.

Live at **[bjjconnectionsbygabe.com](https://bjjconnectionsbygabe.com)**.

## Site Structure

| Page | Description |
|------|-------------|
| `index.html` | Home page — playable daily puzzle, mode shortcuts, training tools |
| `techniques.html` | Technique explorer with search, filters, and saved favorites |
| `puzzles.html` | Daily Connections-style BJJ word puzzle with training mode and archive |
| `competition.html` | Interactive competition prep checklists (gi, no-gi, weigh-in, match-day) |
| `training.html` | Drilling ideas, solo drills, conditioning concepts, goal-setting tool |
| `resources.html` | BJJ glossary, belt system reference, and curated links |
| `about.html` | About Gabe Shaffer and the project |

## Features

### Daily Puzzle (puzzles.html)
- Daily deterministic puzzle (everyone gets the same puzzle each day)
- Training mode with belt difficulty, unseen-first rotation, Unplayed and Practice mistakes queues
- Unfinished Training rounds and practice filters restore after reload
- Training completion by belt and recent-practice replay in Stats
- Exact four-word groups capped at three appearances across the bank
- Archive — replay any of the last 30 days' puzzles
- Streaks and local stats (persisted to `localStorage`)
- "One away" feedback
- "Learn why" explanations for every category
- Share results as a colored-square grid
- 123-puzzle bank (100 daily rounds, 12 Brown training rounds, and 11 Black training rounds) with automated duplicate/structure checking

### Technique Explorer (techniques.html)
- Technique library with category, belt, search, and saved-only filters
- Search names, descriptions, and aliases, including punctuation and accent variations
- Render 24 cards at a time; Show more keeps the full library reachable
- Share search, category, belt, and saved-only states through the URL
- Filter by category and approximate belt difficulty
- Belt-level badges for difficulty indication

### Competition Prep (competition.html)
- Interactive checklists: week-before, gi prep, no-gi prep, what to bring, match-day, weigh-in
- Progress bars with local storage persistence
- Links to rules organizations (IBJJF, ADCC, NAGA, etc.)
- Competition terminology glossary

### Training Resources (training.html)
- Work/rest round timer with pause, resume, and elapsed-time recovery
- Quick-start timer presets with saved settings, total duration, and locked controls during active rounds
- Undo the most recent goal or session deletion during the current visit
- Weekly sessions, mat time, and open-goal summary
- Solo drilling ideas
- Partner drilling ideas
- Warm-up routines
- Strength & conditioning concepts
- Goal-setting tool with local storage

## Files

- `index.html`, `techniques.html`, `puzzles.html`, `competition.html`, `training.html`, `resources.html`, `about.html` — site pages
- `style.css` — full design system (black/white combat-sports aesthetic, dark mode, responsive)
- `data.js` — puzzle bank, difficulty classification, and validation logic
- `game-core.js` — shared guess rules, seeded board order, and resilient Training history
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
- Shared navigation includes an accessible mobile overlay, reading progress on long pages, and iPhone install guidance

### Personal tools
- Competition checklists include overall progress, remaining-only filtering, and print styles.
- Competition prep can save an event name/date locally and show a days-to-go marker.
- Training plans restore saved choices; goals and session logs are stored in the current browser.
- Export the session log as CSV for a portable backup. Browser data does not sync between devices.
- Run the seven Node regression suites listed in `.github/workflows/validate.yml`. They cover puzzle state, personal tools, practice rotation, timers, resource coverage, offline behavior, and page integration.

Resources uses `resource-catalog.js` to include every entry from `techniques.js`, together with direct lessons in `technique-videos.js`. Add a matching video reference whenever adding a technique; `node tests/resource-tests.js` checks coverage, search, links and rendering. All 284 Resources entries have descriptions and direct videos. Additional terms and drills use `glossary-videos.js`; add a matching reference when adding a glossary entry. Coverage tests check every entry and the visible video count.

### Library and loading behavior
- `techniques-page.js` and `resources-page.js` keep browsing behavior separate from page markup.
- All 284 Resources entries remain searchable, each with a description and a direct video link; only the first 24 matching cards render initially.
- Questions can be filtered by topic and searched; answers remain collapsed until selected, with one open at a time.
- `home-desk.js` and `competition-event.js` validate optional saved data so malformed storage cannot interrupt the page.
- The service worker caches only app-shell paths, shares cached pages across search URLs, and preserves unrelated caches. Static assets return from cache while revalidating; navigations fall back to a saved page after 2.5 seconds on slow connections.
- Offline mode applies to cached site pages. External videos still require a connection.
