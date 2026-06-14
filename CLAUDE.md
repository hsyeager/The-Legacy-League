# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"The Legacy League" — a single-page fantasy football (soccer) tracker for the World Cup 2026, where 12 managers
each draft 4 national teams (one per betting tier) and compete across three parallel divisions (Gold/Silver/Bronze)
using the same draw and scoring but different manager rosters.

## Architecture

This is a **single self-contained HTML file** (`index.html`) — no build step, no package manager, no bundler.

- React 18 and Babel Standalone are loaded from `unpkg.com` via `<script>` tags in `<head>`.
- All app code lives in one `<script type="text/babel" data-presets="react">` block at the bottom of the file,
  written as JSX and transpiled in-browser by Babel.
- There is no linter or build/dev command — just open `index.html` in a browser (or serve the directory with any
  static file server) to run it.
- A Playwright scaffold (`playwright.config.ts`, `tests/`, `.github/workflows/playwright.yml`) is set up via
  `npm install`, but `tests/example.spec.ts` is still the unmodified `npm init playwright` boilerplate (it tests
  playwright.dev, not this app) — there are no real tests for `index.html` yet.

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

## Code structure (all within `index.html`)

The script is organized into clearly delimited sections via comment banners, in this order:

1. **DATA** — static configuration objects that define the entire league:
   - `TEAMS`: all 48 qualified nations, keyed by short code, each with `name`, `flag`, and `tier` (1–4, by
     pre-tournament odds).
   - `SQUADS`: array of 12 squads (one per "Group N"), each an array of 4 team codes — one per tier.
   - `MANAGERS`: array of 12 entries (index-aligned with `SQUADS`), each with `gold`/`silver`/`bronze` manager
     names — these are the three parallel divisions sharing the same draw.
   - `DIVISIONS`, `DIV_COLOR`, `TIER_META`, `STAGES`, `ROUND_BONUS`, `KO_WINS`, `WIN_PTS`, `REACH_KO_BONUS`,
     `PLACEMENT_BONUS`, `ROUND_LABEL`, `STAGE_DESC`, `REACHED_LABEL` — all the constants the scoring engine
     reads from.

2. **ESPN LIVE SYNC** — pulls live tournament data with no API key:
   - `ESPN_URL` hits `site.api.espn.com`'s public scoreboard endpoint for the full tournament date range.
   - `SYN` is a synonym map built from `TEAMS` names/codes plus a long list of `alias(...)` calls mapping ESPN's
     team abbreviations/names (including non-English spellings) to our internal team codes.
   - `resolveCode()` looks up an ESPN team object against `SYN`.
   - `classifyLabel()` / `parseEvents()` turn raw ESPN events into per-team results (group-stage records, knockout
     fixtures reached, goals, match logs) and a flat `schedule` array. This is the most complex logic in the file —
     it infers real-world group standings from head-to-head results, tracks each team's furthest `stage`
     (`GROUP`/`R32`/`R16`/`QF`/`SF`/`THIRD`/`FINAL`/`CHAMPION`), and computes elimination/`alive` status.
   - `syncFromESPN()` is the async entry point that fetches + parses.

3. **SCORING** — pure functions over the data from step 2:
   - `teamScore(result, tier)`: points for one nation — group W/D results, knockout-win bonuses (tier-weighted via
     `WIN_PTS`), round-reached bonuses (`ROUND_BONUS`), the +3 "reached knockouts" breadth bonus, and placement
     bonuses (`PLACEMENT_BONUS`).
   - `managerScore(squad, results)`: sums `teamScore` across a manager's 4 teams, plus aggregate GF/GA/GD/wins/CS.
   - `teamMatchPoints(code, match)`: per-match point breakdown used in the team detail drawer to explain "how the
     points add up".
   - When changing scoring rules, update both the constants in section 1 **and** the corresponding logic here —
     and also the prose description in `RulesTab` (section "TABS"), which is the user-facing rules explanation and
     must stay in sync with the actual point math.

4. **PERSISTENCE** — `loadData`/`saveData` read/write a single JSON blob to `localStorage` under key
   `legacy-league-v1` (`{ api, schedule, lastSync }`). This is purely a cache of the last ESPN sync; there is no
   server-side or per-manager state.

5. **SMALL UI PIECES** — shared building blocks: the `C` color palette object, `Flag`, `TierPill`, `Card`,
   `SectionTitle`, `ManagerNames`, `PointsTab`, `TeamDetail` (the bottom-sheet modal showing a team's full match log
   and point breakdown).

6. **TABS** — one component per bottom-nav tab: `RulesTab`, `TeamsTab`, `StandingsTab` (fantasy standings, with
   Gold/Silver/Bronze division toggle), `TournamentTab` (real-world World Cup group standings, reconstructed via
   `GroupTable` from each team's `GROUP`-stage results in `api` — separate from the fantasy `StandingsTab`),
   `GameLogTab` (Past/Today/Future collapsible match lists via `MatchRow`).

7. **ROOT** — `App()`: top-level state (`tab`, `selected`, `api`, `schedule`, `sync` status), loads/saves via
   `localStorage`, and auto-syncs from ESPN on mount + every 5 minutes via `setInterval`. Renders the header, sync
   status bar, tab bar, active tab content, and the `TeamDetail` modal. Mounted with
   `ReactDOM.createRoot(...).render(<App />)` at the very end of the file.

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
  follow this same inline-breakpoint pattern. Note the `--pad`/`--gap-*`/`--h1`/etc. CSS custom properties set per
  breakpoint in the `<head>` `<style>` block are currently unused by the JSX.
