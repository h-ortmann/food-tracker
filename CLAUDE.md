# Food Tracker — Project Notes

## What this is
Milestone 1 app. A food/meal logging tracker. Goal: touch every layer of the stack once (front-end, back-end, database, AI, deployment). **Milestone 1 complete as of 2026-06-08.**

## Live URLs
- **Frontend**: https://food-tracker-sigma-gray.vercel.app
- **Backend**: https://food-tracker-production-9e89.up.railway.app
- **GitHub**: https://github.com/h-ortmann/food-tracker

## What's been built (as of 2026-10-05)

### Backend (`/backend`)
- Flask API with full CRUD: `GET /meals`, `POST /meals`, `PUT /meals/<id>`, `DELETE /meals/<id>`
- SQLAlchemy + PostgreSQL (Neon) in production, SQLite locally
- NullPool used for Neon compatibility (serverless DB drops idle connections)
- flask-cors enabled
- Flask-Migrate — migrations folder at `backend/migrations/`
- `requirements.txt` at `backend/requirements.txt`
- venv at `backend/venv/` — activate with `source venv/bin/activate`
- Run locally with: `python3 server.py` → serves on `http://127.0.0.1:5000`
- **All dependencies pinned** in `requirements.txt` — including `SQLAlchemy==2.0.50`, which isn't imported directly but must be pinned: an unpinned rebuild pulled SQLAlchemy 2.1 (default Postgres driver switched to `psycopg` v3, not installed) and crash-looped production on 2026-10-05
- `anthropic==1.11.0` + `python-dotenv==1.2.4` for the AIP lookup; `ANTHROPIC_API_KEY` read from `backend/.env` locally (git-ignored) and Railway Variables in production
- `POST /aip/lookup` — body `{"food": "..."}` → Claude Sonnet 5.5 with structured output (JSON schema) → `{food, verdict: "yes"|"no"|"maybe", reason, swap}`; 400 if empty, 422 on refusal. Effort `low`; server-side refusal fallbacks (`fallbacks="default"`) enabled

### Meal model fields
| Field | Type | Notes |
|---|---|---|
| id | Integer | Auto-generated primary key |
| name | String(100) | Required |
| calories | Integer | Optional |
| grams | Float | Optional, added 2026-10-04 — shown in parentheses after calories |
| meal_type | String(50) | breakfast / lunch / dinner / snack / drink |
| date | Date | Defaults to today |
| created_at | DateTime | Defaults to now — used for timestamps in UI |

All three models below also return a `timestamp` field (raw ISO datetime) alongside the human-readable `created_at` string, added specifically so the frontend Timeline can sort mixed entry types chronologically.

### Symptom model fields (added 2026-09-06)
| Field | Type | Notes |
|---|---|---|
| id | Integer | Auto-generated primary key |
| type | String(50) | bloating / pain / nausea / diarrhea / stool / period |
| severity | Integer | 1–5 scale for bloating/pain/nausea/diarrhea. **For period: flow 1–4** (Spotting/Light/Medium/Heavy, shown as words via `FLOW_SCALE`). Not used for stool |
| body_part | String(50) | Only for pain: stomach / digestive_tract / head / uterus |
| bristol_scale | Integer | Only for stool: 1–7 |
| notes | String(500) | Optional free text |
| date | Date | Defaults to today |
| created_at | DateTime | Defaults to now |

Single flexible table (not one table per symptom type) — chosen deliberately so the timeline and future trend-analysis feature can query "everything on this date" in one go.

### WeightEntry model fields (added 2026-09-06)
| Field | Type | Notes |
|---|---|---|
| id | Integer | Auto-generated primary key |
| weight | Float | Required |
| date | Date | Defaults to today |
| created_at | DateTime | Defaults to now |

Routes: full CRUD for both at `/symptoms` and `/symptoms/<id>`, `/weights` and `/weights/<id>`, same shape as the existing `/meals` routes.

### Frontend (`/frontend`)
- React + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- shadcn/ui for components (Card, Input, Button, Sheet)
- `react-router-dom` for page routing (added 2026-10-04)
- API URL read from `VITE_API_URL` env var (falls back to `http://127.0.0.1:5000`)
- Local dev: `frontend/.env.local` sets `VITE_API_URL=http://127.0.0.1:5000`
- Run with: `npm run dev` → serves on `http://localhost:5173`
- Node via nvm — if `npm` not found, run: `source ~/.nvm/nvm.sh`

### App structure (restructured 2026-10-04)
The app moved from a single scrolling page to a mobile-app-style shell: a bottom nav with three tabs, routed with `react-router-dom`.

- `src/main.jsx` — wraps `<App />` in `<BrowserRouter>`
- `src/App.jsx` — just `<Routes>` for the three pages + `<BottomNav>`, rendered on every page
- `src/components/BottomNav.jsx` — fixed bottom nav, 3 tabs (Home / AIP / Analysis), active tab highlighted via `NavLink`
- `src/pages/Home.jsx` — the diary (see below); owns all meals/symptoms/weights state and fetch/CRUD logic
- `src/pages/Aip.jsx` — AIP food lookup (smart page: owns `result`/`isLoading`/`error`, calls `/aip/lookup`, shows errors). Renders `SearchBox` (dumb: collects text, calls `onSearch`) and `VerdictCard` (dumb: big coloured ✅/❌/⚠️ band filling to the card top, muted reason, "Try instead" swap box)
- `src/pages/Analysis.jsx` — placeholder for phase 3 (trend analysis)
- `frontend/vercel.json` — rewrites every path to `index.html` so routed pages (`/aip`, `/analysis`) work on refresh/direct link
- `src/lib/mealTypes.js`, `src/lib/symptomTypes.js` — shared constants (icons/labels, toggle-row option lists) so the logging forms and the timeline display stay in sync instead of duplicating lookup tables

**Why only 3 tabs, not 4:** symptom/weight history isn't a separate page — the Home diary (the combined `Timeline`) already shows everything chronologically, so a dedicated "Food Log" or "Symptoms" page would just be a filtered duplicate of the same data.

### Home page (the diary)
- Two primary quick-action buttons at the top — **Log meal** and **Log symptom** — open a bottom sheet (shadcn `Sheet`, slides up from the bottom) rather than showing the form inline on the page
- Small **weight** button next to the title (shows last logged weight, or "Log weight"), also opens a sheet — lower visual weight since it's a once-a-day action
- **Logging a meal** (`src/components/MealForm.jsx`): pick the meal type first (breakfast/lunch/dinner/snack/drink), then add as many food items as you want — each "Add" saves immediately, with a running "✓ item" checklist — then hit **Done** to close the sheet. Replaces the old one-item-at-a-time flow.
- **Timeline** (`src/components/Timeline.jsx`) — combined chronological feed of meals, symptoms, and weight entries, **newest first** (flipped from oldest-first on 2026-10-04, to help spot recent patterns)
  - Meals are **grouped by date + meal type** (e.g. one "Lunch" row instead of one row per food item), showing the meal type, time, and total calories. Tap to expand and see each item individually, with pencil/trash icons to edit/delete.
  - Expanded groups have a "+ Add item" row to add a forgotten item straight into that group — defaults to today's date (no date picker yet, so this only works correctly for same-day groups)
  - Each food item shows calories and, if set, **grams in parentheses** (e.g. "Chicken — 300 kcal (150g)"), added 2026-10-04
  - **Symptoms and weight entries are also editable/deletable** in place (pencil opens an inline edit form, trash deletes with a `window.confirm` guard) — added 2026-10-04 for consistency with meals
  - Deleting a meal also asks for confirmation (added after the delete button became icon-only, to guard against accidental taps)
- Empty state: "Nothing logged yet today" when the timeline is empty

Frontend is fully split into components — `Home.jsx` owns fetch/state logic for all three entry types and passes callbacks down; forms (`MealForm`, `SymptomForm`, `WeightForm`) manage their own local input state; `Timeline` owns its own expand/collapse and "add item inline" state.

## Decisions made

| Decision | Choice | Reason |
|---|---|---|
| Language | Python | AI/ML ecosystem advantage |
| Back-end framework | Flask | Familiar from playground, simple |
| Database | SQLite locally → PostgreSQL (Neon) in production | SQLite for local dev, Neon free tier for cloud |
| ORM | SQLAlchemy | Industry standard, production pattern |
| Migrations | Flask-Migrate | Schema changes need tracking like code |
| Front-end framework | React | Industry standard, transferable skills |
| Component library | shadcn/ui | Most prevalent in industry right now |
| Backend hosting | Railway | Render UI was broken; Railway auto-deploys from GitHub |
| DB hosting | Neon | Free serverless PostgreSQL, no credit card |
| Frontend hosting | Vercel | Free, excellent GitHub integration |
| Symptom data model | One flexible `Symptom` table with nullable type-specific columns, not a table per symptom type | Timeline and future trend-analysis need to query "everything on this date" as one simple query |
| App structure | Bottom nav with 3 pages (Home/AIP/Analysis), routed with `react-router-dom` | Mobile-app-style navigation instead of one long scrolling page; decided before building AIP/Analysis so those features get built into their own screen instead of needing to be carved out of Home later |
| Home page content | No separate "Food Log" or "Symptoms" page — Home's combined `Timeline` serves as the browsable diary for everything | A dedicated history page per entry type would just duplicate what the Timeline already shows |
| Meal logging flow | Pick meal type first, then add multiple items before closing the sheet | Logging a full meal item-by-item (re-selecting type each time) was tedious |
| Production deps | Pin exact versions, including hidden ones that have broken us | Unpinned SQLAlchemy drifted on rebuild and crashed prod (2026-10-05) |
| AIP lookup model | Claude Sonnet 5.5 (Hannah's choice) | Accuracy matters more than cost for health guidance; Haiku more likely to miss edge cases |
| AIP lookup output | Structured outputs (JSON schema with `enum` verdict) | Frontend maps verdict to colour/emoji, so shape must be guaranteed — no regex fence-stripping |
| Verdict card hierarchy | Flashy verdict → quieter reason → swap | Hannah's design: answer at a glance, detail if wanted |
| Period tracking | New `period` symptom type; flow 1–4 in existing `severity` column, displayed as words | No migration needed (flexible table); numbers stay queryable for Phase 3, words read faster |
| Commit granularity | One commit per undoable idea — not split by backend/frontend layer | Discussed 2026-10-05 |
| Timeline order | Newest-first (meals, symptoms, weights, and items within an expanded meal group) | Recent entries matter most for spotting patterns day-to-day |

## Deployment setup

**Railway (backend)**
- Root directory: `backend`
- Start command: `flask db upgrade && gunicorn server:app`
- Env vars: `DATABASE_URL` (Neon connection string), `FLASK_APP=server`, `ANTHROPIC_API_KEY` (added 2026-10-05)
- Auto-deploys on push to `master`
- ⚠️ Status shows green/Active even while the app crash-loops — after every deploy, curl `/meals` (and `/aip/lookup`) to confirm

**Vercel (frontend)**
- Root directory: `frontend`
- Framework: Vite (auto-detected)
- Env var: `VITE_API_URL=https://food-tracker-production-9e89.up.railway.app`
- Auto-deploys on push to `master`

**Neon (database)**
- Region: EU West
- Connection string in Railway env var `DATABASE_URL`

## Git

Repo: `https://github.com/h-ortmann/food-tracker` (master branch)
`.gitignore` excludes `venv/`, `node_modules/`, `*.db`, `instance/`, `**/__pycache__/`, `**/.env.local`, `**/.env`

## To run locally
Terminal 1 (backend):
```bash
cd backend
source venv/bin/activate
python3 server.py
```

Terminal 2 (frontend):
```bash
cd frontend
source ~/.nvm/nvm.sh   # if npm not found
npm run dev
```

Open `http://localhost:5173`

## Migration workflow (for future schema changes)
```bash
# After updating the Meal model in server.py:
FLASK_APP=server flask db migrate -m "describe the change"
FLASK_APP=server flask db upgrade
```

## Milestone 3 expansion (started 2026-09-06)

Turning this from a plain meal logger into a symptom-and-food tracker ahead of an AIP diet. Three planned phases:

1. **Symptom/reaction logger** — done 2026-09-06, reviewed and polished 2026-10-04 (nav/IA restructure, grams, newest-first order, full edit/delete for all entry types — see sections above). Committed and pushed.
2. **AIP feature** — **food lookup done and live 2026-10-05** (see `/aip/lookup` + `Aip.jsx` above). Remaining: AI-suggested recipes, saved recipes — reuse use-it-up's recipe pattern, now with structured outputs. Also added 2026-10-05 (phase 1 territory): period tracking with flow level.
3. **Trend analysis** — correlate symptoms with meals/recipes eaten beforehand. Deliberately saved for last, once phases 1–2 have produced real logged data. Page shell exists (`src/pages/Analysis.jsx`) but is just a placeholder.

Longer-term, explicitly deprioritized for now: making this accessible as a phone app rather than browser-only (PWA vs. native wrapper vs. React Native — needs fresh landscape research when it becomes the priority).

Known limitation: the Timeline's inline "+ Add item" (adding a forgotten item to an existing meal group) always saves with today's date, since `POST /meals` doesn't yet accept an explicit date — fine for "forgot to log something earlier today," not for backdating into a past day's group.

## What comes next

1. **AIP recipe suggestions** (phase 2, part 2) on the AIP tab, below/alongside the lookup — reuse use-it-up's recipe generation, upgraded to structured outputs + Sonnet 5.5
2. Optional: save lookups into a personal "safe foods / avoid" list
3. Older fetch calls in `Home.jsx` still have no error handling (AIP page does — use it as the pattern)
4. Known limitation still open: inline "+ Add item" always saves with today's date
5. Older backlog: app mascot / empty-state image; AI calorie estimation from meal name
