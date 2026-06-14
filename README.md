# The Legacy League · World Cup 2026

A single-page fantasy football (soccer) tracker for the World Cup 2026. Twelve managers each draft 4 national
teams (one per betting tier) and compete across three parallel divisions — **Premier League (Gold)**,
**Undertakers (Silver)**, and **Bottom Feeders (Bronze)** — sharing the same tournament draw but with different
manager rosters per division.

## Features

- **Live scoring** — syncs results from ESPN's public scoreboard API (no API key required) and computes fantasy
  points per team: group-stage results, knockout-round wins (tier-weighted), round-reached bonuses, a "reached
  knockouts" breadth bonus, and placement bonuses.
- **Standings** — fantasy standings per division, with each manager row expanding to show their drafted squad.
- **Points breakdown** — per-team scoring detail, including a full match log explaining how each team's points
  add up.
- **Game log** — past, live, and upcoming matches, grouped by date.
- **Tournament tab** — real-world World Cup group standings, reconstructed from live results.
- **Rules** — a prose explanation of the scoring system, kept in sync with the actual point math.

## Architecture

This is a **build-free, multi-file static app** — no build step, no package manager, no bundler required to run
it.

- `index.html` is a thin shell: it sets up `<head>` (viewport meta, base styles, React 18 + ReactDOM + Babel
  Standalone from `unpkg.com`), provides the `#root` mount point, and loads the app code via a sequence of
  `<script type="text/babel">` tags, transpiled in-browser by Babel.
- All app code lives under [js/](js/), one file per section of the original monolith, loaded in this order:

  | File | Purpose |
  | --- | --- |
  | [js/data.js](js/data.js) | Static league configuration — teams, squads, managers, divisions, scoring tables |
  | [js/espn-sync.js](js/espn-sync.js) | Live tournament sync from ESPN's public scoreboard API |
  | [js/scoring.js](js/scoring.js) | Pure scoring functions over synced results |
  | [js/persistence.js](js/persistence.js) | `localStorage` cache of the last ESPN sync |
  | [js/ui.js](js/ui.js) | Shared UI building blocks (cards, rows, modals, color palette) |
  | [js/tabs.js](js/tabs.js) | Bottom-nav tab components (Points, Standings, Game Log, Tournament, Rules) |
  | [js/app.js](js/app.js) | Root `App` component, top-level state, auto-sync, and render entrypoint |

  Load order matters: later files reference top-level `const`/`function` declarations from earlier ones (no
  modules/imports — everything is global script scope).

## Running locally

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Opening `index.html` directly (`file://`) also works since there's no server-side logic, but a local HTTP server
avoids browser quirks with `fetch` from `file://` origins.

## Tests

A [Playwright](https://playwright.dev/) scaffold is set up and runs in CI on every push/PR to `main`/`master`:

```bash
npm install
npx playwright test
```

## Deployment

The app is deployed as a static site (e.g. GitHub Pages). Since GitHub Pages doesn't support custom
`Cache-Control` headers, each `<script src="js/...">` tag in [index.html](index.html) carries a
`?v=YYYYMMDDHHMM` cache-busting query string — bump all seven `?v=` values whenever any file under `js/` changes
so browsers don't serve stale cached scripts.
