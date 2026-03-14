# Advanced IMS

React + Vite + TypeScript frontend, FastAPI backend, and Supabase Postgres.

## 1) Configure Database (Supabase)

Backend reads env from `backend/.env`.

Set `DATABASE_URL` to the Supabase **Transaction Pooler** connection string:

`postgresql://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres`

Do not use direct host `db.<project-ref>.supabase.co:5432` for this setup.

## 2) Run FastAPI Backend

From repo root:

```powershell
c:/Users/Arham/OneDrive/Documents/GitHub/Advanced-IMS/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000
```

Health checks:

```powershell
curl.exe -s http://127.0.0.1:8000/health
curl.exe -s http://127.0.0.1:8000/health/db
```

Expected:
- `/health` => `{"status":"ok"}`
- `/health/db` => `{"status":"ok","db":true}`

If DB is not reachable, DB-backed routes return `503` with an actionable message.

## 3) API Smoke Tests

```powershell
curl.exe -i http://127.0.0.1:8000/api/categories
curl.exe -i http://127.0.0.1:8000/api/warehouses
curl.exe -i http://127.0.0.1:8000/api/products
curl.exe -i http://127.0.0.1:8000/api/dashboard/kpis
```

Note: auth is bypassed in development when `DEV_BYPASS_AUTH=true` in `backend/.env`.

## 4) Frontend Connection

Frontend env in repo root `.env`:

- `VITE_API_URL=http://localhost:8000`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

Run frontend:

```powershell
npm install
npm run dev
```

Build check:

```powershell
npm run build
```

## 5) Current Integration Status

- API client is wired in `src/lib/api/client.ts`.
- Product/receipt-related pages call backend API helpers.
- Dashboard page currently uses mock data and can be migrated to live API next.

