# Food Tracker — Project Notes

## What this is
Milestone 1 app. A food/meal logging tracker. Goal: touch every layer of the stack once (front-end, back-end, database, AI, deployment). **Milestone 1 complete as of 2026-06-08.**

## Live URLs
- **Frontend**: https://food-tracker-sigma-gray.vercel.app
- **Backend**: https://food-tracker-production-9e89.up.railway.app
- **GitHub**: https://github.com/h-ortmann/food-tracker

## What's been built (as of 2026-06-08)

### Backend (`/backend`)
- Flask API with full CRUD: `GET /meals`, `POST /meals`, `PUT /meals/<id>`, `DELETE /meals/<id>`
- SQLAlchemy + PostgreSQL (Neon) in production, SQLite locally
- NullPool used for Neon compatibility (serverless DB drops idle connections)
- flask-cors enabled
- Flask-Migrate — migrations folder at `backend/migrations/`
- `requirements.txt` at `backend/requirements.txt`
- venv at `backend/venv/` — activate with `source venv/bin/activate`
- Run locally with: `python3 server.py` → serves on `http://127.0.0.1:5000`

### Meal model fields
| Field | Type | Notes |
|---|---|---|
| id | Integer | Auto-generated primary key |
| name | String(100) | Required |
| calories | Integer | Optional |
| meal_type | String(50) | breakfast / lunch / dinner / snack / drink |
| date | Date | Defaults to today |
| created_at | DateTime | Defaults to now — used for timestamps in UI |

All three models below also return a `timestamp` field (raw ISO datetime) alongside the human-readable `created_at` string, added specifically so the frontend Timeline can sort mixed entry types chronologically.

### Symptom model fields (added 2026-09-06)
| Field | Type | Notes |
|---|---|---|
| id | Integer | Auto-generated primary key |
| type | String(50) | bloating / pain / nausea / diarrhea / stool |
| severity | Integer | 1–5 scale. Used for bloating/pain/nausea/diarrhea, not stool |
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
- shadcn/ui for components (Card, Input, Button)
- API URL read from `VITE_API_URL` env var (falls back to `http://127.0.0.1:5000`)
- Local dev: `frontend/.env.local` sets `VITE_API_URL=http://127.0.0.1:5000`
- Run with: `npm run dev` → serves on `http://localhost:5173`
- Node via nvm — if `npm` not found, run: `source ~/.nvm/nvm.sh`

### Current UI
- Timeline at the top of the page: combined chronological feed of meals, symptoms, and weight entries, sorted by raw timestamp (`src/components/Timeline.jsx`)
- Meal log form: name + calories + meal type dropdown
- Meals grouped into cards by type (Breakfast, Lunch, Dinner, Snack, Drink, Other)
- Empty groups hidden — cards appear as meals are logged
- Timestamp below each meal name (12-hour format, e.g. "9:30 AM")
- Inset dividers between meals within a group (mx-4)
- Running calorie total in header
- Empty state: 🍽️ emoji + "No meals logged yet" when list is empty
- Delete button with outline border (variant="outline")
- **Symptom log form** (`src/components/SymptomForm.jsx`, added 2026-09-06): type dropdown, then conditional fields — toggle-button row for body part (pain only), toggle-button row for severity 1–5 (all types except stool), toggle-button row for Bristol scale 1–7 with hover descriptions (stool only), optional notes field
- **Weight log form** (`src/components/WeightForm.jsx`, added 2026-09-06): single number input + Add

Frontend is no longer a single-file app — `App.jsx` now owns fetch/state logic and passes `onAdd` callbacks down to the three new form components, which manage their own local form state.

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

## Deployment setup

**Railway (backend)**
- Root directory: `backend`
- Start command: `flask db upgrade && gunicorn server:app`
- Env vars: `DATABASE_URL` (Neon connection string), `FLASK_APP=server`
- Auto-deploys on push to `master`

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
`.gitignore` excludes `venv/`, `node_modules/`, `*.db`, `instance/`, `**/__pycache__/`, `**/.env.local`

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

1. **Symptom/reaction logger** — done 2026-09-06 (see models/UI above). Not yet committed to git, and not yet reviewed by Hannah in her own browser — that's the very next step.
2. **AIP feature** — food-friendliness lookup, AI-suggested recipes, saved recipes. Should reuse the AI-recipe-generation pattern already built in the use-it-up project.
3. **Trend analysis** — correlate symptoms with meals/recipes eaten beforehand. Deliberately saved for last, once phases 1–2 have produced real logged data.

Longer-term, explicitly deprioritized for now: making this accessible as a phone app rather than browser-only (PWA vs. native wrapper vs. React Native — needs fresh landscape research when it becomes the priority).

## What comes next

1. **Hannah reviews the symptom logger UI locally** and brings back adjustments/feedback
2. **Commit today's work** — nothing from the 2026-09-06 session is committed yet (also note: some older CLAUDE.md edits from a prior session were already sitting uncommitted before today)
3. Move to the AIP feature (phase 2 above) once phase 1 feels right
4. Older backlog, still valid: App mascot / real image for empty state; AI feature: calorie estimation from meal name
