# Food Tracker — Project Notes

## What this is
Milestone 1 app. A food/meal logging tracker. Goal: touch every layer of the stack once (front-end, back-end, database, AI, deployment). Not about polish — about getting end-to-end working.

## What's been built (as of 2026-06-05)

### Backend (`/backend`)
- Flask API with full CRUD: `GET /meals`, `POST /meals`, `PUT /meals/<id>`, `DELETE /meals/<id>`
- SQLAlchemy + SQLite (`food_tracker.db`) for persistence
- flask-cors enabled (required for React to call the API from a different port)
- venv at `backend/venv/` — activate with `source venv/bin/activate`
- Run with: `python3 server.py` → serves on `http://127.0.0.1:5000`

### Frontend (`/frontend`)
- React + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- shadcn/ui for components (Card, Input, Button so far)
- Components live in `src/components/ui/`
- Run with: `npm run dev` → serves on `http://localhost:5173`
- Node via nvm — if `npm` not found, run: `source ~/.nvm/nvm.sh`

### Current UI
- Single screen: meal name + calories form, Add button, list of logged meals below
- Fully wired: form → POST → SQLite → GET → React re-render

## Decisions made

| Decision | Choice | Reason |
|---|---|---|
| Language | Python | AI/ML ecosystem advantage |
| Back-end framework | Flask | Familiar from playground, simple |
| Database | SQLite → PostgreSQL | SQLite for local, swap on deploy |
| ORM | SQLAlchemy | Industry standard, production pattern |
| Front-end framework | React | Industry standard, transferable skills |
| Component library | shadcn/ui | Most prevalent in industry right now |

## What comes next

1. **Migrations** — before changing the schema, set up Flask-Migrate
2. **More fields** — add `date`, `meal_type` to the Meal model
3. **Better UI** — delete button on each meal, running calorie total for the day
4. **AI features** — calorie estimation from meal name, meal suggestions
5. **Deployment** — get it on a real URL (swap SQLite → PostgreSQL)

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
