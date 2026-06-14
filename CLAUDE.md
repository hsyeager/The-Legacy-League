# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"The Legacy League" — a single-page fantasy football (soccer) tracker for the World Cup 2026, where 12 managers
each draft 4 national teams (one per betting tier) and compete across three parallel divisions (Gold/Silver/Bronze)
using the same draw and scoring but different manager rosters.

## Architecture

This is a **build-free, multi-file static app** — no build step, no package manager, no bundler.

- `index.html` is a thin shell: it sets up the `<head>` (viewport meta, base styles, React 18 + ReactDOM +
  Babel Standalone from `unpkg.com`), provides the `#root` mount point, and loads the app code via a sequence of
  `<script type="text/babel" data-presets="react" src="js/...">` tags, transpiled in-browser by Babel.
- All app code lives under `js/`, split into one file per section of the old monolith (see "Code structure"
  below). Load order in `index.html` matters: `data.js` → `espn-sync.js` → `scoring.js` → `persistence.js` →
  `ui.js` → `tabs.js` → `app.js` — later files reference top-level `const`/`function` declarations from earlier
  ones (no modules/imports, everything is global script scope).
- There is no linter or build/dev command — just open `index.html` in a browser (or serve the directory with any
  static file server) to run it.
- A Playwright scaffold (`playwright.config.ts`, `tests/`, `.github/workflows/playwright.yml`) is set up via
  `npm install`, but `tests/example.spec.ts` is still the unmodified `npm init playwright` boilerplate (it tests
  playwright.dev, not this app) — there are no real tests for `index.html`/`js/` yet.

### Running / verifying changes

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Opening the file directly (`file://`) also works since there's no server-side logic, but a local HTTP server
avoids any browser quirks with `fetch` from `file://` origins.

```bash
# run the Playwright suite (currently just boilerplate, see above)
npx playwright test
```

## Code structure (under `js/`)

Each file corresponds to one section of the original monolith (still delimited internally via the same comment
banners). Listed in load order:

1. **`js/data.js` — DATA** — static configuration objects that define the entire league. Also declares the shared
   `const { useState, useEffect, useMemo } = React;` hook destructure used by `js/tabs.js` and `js/app.js` — all
   `<script>` files share one global scope, so this only needs to happen once, in the first-loaded file:
   - `TEAMS`: all 48 qualified nations, keyed by short code, each with `name`, `flag`, and `tier` (1–4, by
     pre-tournament odds).
   - `SQUADS`: array of 12 squads (one per "Group N"), each an array of 4 team codes — one per tier.
   - `MANAGERS`: array of 12 entries (index-aligned with `SQUADS`), each with `gold`/`silver`/`bronze` manager
     names — these are the three parallel divisions sharing the same draw.
   - `DIVISIONS`, `DIV_COLOR`, `TIER_META`, `STAGES`, `ROUND_BONUS`, `KO_WINS`, `WIN_PTS`, `REACH_KO_BONUS`,
     `PLACEMENT_BONUS`, `ROUND_LABEL`, `STAGE_DESC`, `REACHED_LABEL`, `statusOf()` — all the constants/helpers the
     scoring engine and UI read from.

2. **`js/espn-sync.js` — ESPN LIVE SYNC** — pulls live tournament data with no API key:
   - `ESPN_URL` hits `site.api.espn.com`'s public scoreboard endpoint for the full tournament date range.
   - `SYN` is a synonym map built from `TEAMS` names/codes plus a long list of `alias(...)` calls mapping ESPN's
     team abbreviations/names (including non-English spellings) to our internal team codes.
   - `resolveCode()` looks up an ESPN team object against `SYN`.
   - `classifyLabel()` / `parseEvents()` turn raw ESPN events into per-team results (group-stage records, knockout
     fixtures reached, goals, match logs) and a flat `schedule` array. This is the most complex logic in the app —
     it infers real-world group standings from head-to-head results, tracks each team's furthest `stage`
     (`GROUP`/`R32`/`R16`/`QF`/`SF`/`THIRD`/`FINAL`/`CHAMPION`), and computes elimination/`alive` status.
   - `syncFromESPN()` is the async entry point that fetches + parses.

3. **`js/scoring.js` — SCORING** — pure functions over the data from step 2:
   - `teamScore(result, tier)`: points for one nation — group W/D results, knockout-win bonuses (tier-weighted via
     `WIN_PTS`), round-reached bonuses (`ROUND_BONUS`), the +3 "reached knockouts" breadth bonus, and placement
     bonuses (`PLACEMENT_BONUS`).
   - `managerScore(squad, results)`: sums `teamScore` across a manager's 4 teams, plus aggregate GF/GA/GD/wins/CS.
   - `teamMatchPoints(code, match)`: per-match point breakdown used in the team detail drawer to explain "how the
     points add up".
   - When changing scoring rules, update both the constants in `js/data.js` **and** the corresponding logic here —
     and also the prose description in `RulesTab` (`js/tabs.js`), which is the user-facing rules explanation and
     must stay in sync with the actual point math.

4. **`js/persistence.js` — PERSISTENCE** — `loadData`/`saveData` read/write a single JSON blob to `localStorage`
   under key `legacy-league-v1` (`{ api, schedule, lastSync }`). This is purely a cache of the last ESPN sync;
   there is no server-side or per-manager state.

5. **`js/ui.js` — SMALL UI PIECES** — shared building blocks: the `C` color palette object (includes `win`/
   `winBg`/`winBgStrong` for win-highlight styling and `live` for in-progress match indicators, in addition to
   the base bg/card/text/gold/mut/red tones), `Flag`, `TierPill`, `Card`, `SectionTitle`, `ManagerNames`,
   `TeamRow` (shared row renderer for a single team — flag, name + status, optional GD/GF/W/CS stats, tier pill,
   points, and a chevron; supports a `"card"` variant used by `PointsTab` and a `"list"` variant used by
   `StandingsTab`'s expanded squad dropdown), `TeamDetail` (the bottom-sheet modal showing a team's full match log
   and point breakdown), and `CollapsibleSection`.

6. **`js/tabs.js` — TABS** — one component per bottom-nav tab: `PointsTab`, `RulesTab`,
   `StandingsTab` (fantasy standings, with Gold/Silver/Bronze division toggle; each manager row expands into a
   dropdown listing their squad's nations via `TeamRow`'s `"list"` variant), `TeamOwners`, `MatchRow`,
   `GameLogTab` (Past/Today/Future collapsible match lists via `MatchRow`), `TournamentTab` (real-world World Cup
   group standings, reconstructed via `GroupTable` from each team's `GROUP`-stage results in `api` — separate from
   the fantasy `StandingsTab`).

7. **`js/app.js` — ROOT** — `TABS` (bottom-nav tab definitions) and `App()`: top-level state (`tab`, `selected`,
   `api`, `schedule`, `sync` status), loads/saves via `localStorage`, and auto-syncs from ESPN on mount + every 5
   minutes via `setInterval`. Renders the header, sync status bar, tab bar, active tab content, and the
   `TeamDetail` modal. Mounted with `ReactDOM.createRoot(...).render(<App />)` at the very end of the file.

## Key invariants to preserve

- `SQUADS[i]` and `MANAGERS[i]` are index-aligned — squad `i` belongs to the three managers (one per division) at
  `MANAGERS[i]`.
- Every team code referenced in `SQUADS` must exist in `TEAMS`, and every code added to `TEAMS` needs a
  corresponding `alias(...)` entry (or matching name) in the ESPN sync map so live results resolve correctly.
- `teamScore`/`managerScore` are pure — they take `results`/`api` data and constants as input, with no side
  effects. Any new scoring rule should be expressible as a constant table (like `WIN_PTS`, `ROUND_BONUS`, etc.) read
  by these functions, then mirrored in `RulesTab`'s prose.
- Responsive layout is handled per-component, not via a shared hook/context: most components independently compute
  `isMobile`/`isTablet` from `window.innerWidth` (breakpoints at 481px and 769px) and branch styles/grid columns on
  that. `App()` separately tracks `width` via a `resize` listener for the header/tab bar. New responsive UI should
  follow this same inline-breakpoint pattern.
- `index.html`'s `<head>` `<style>` block is intentionally minimal (base `html`/`body`/`#boot` rules only) — all
  layout and responsive styling lives inline in the JSX via the per-component breakpoint pattern above. Don't
  reintroduce unused global CSS (e.g. custom properties) there.
- When adding a shared row/list UI for a team, prefer extending `TeamRow` (`js/ui.js`) over duplicating markup in
  a tab — both `PointsTab` and `StandingsTab`'s expanded squad dropdown already share it via the `"card"`/`"list"`
  variants.
- Each `<script src="js/...">` tag in `index.html` has a `?v=YYYYMMDDHHMM` cache-busting query string (GitHub
  Pages doesn't support custom `Cache-Control` headers). Whenever any file under `js/` changes, bump all seven
  `?v=` values to the current date and time (e.g. via `date +%Y%m%d%H%M`) so browsers don't serve stale cached
  scripts, even across multiple updates in the same day.
