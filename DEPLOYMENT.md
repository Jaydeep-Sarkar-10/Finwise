# Finwise — Production Deployment Guide

**Stack:** React 19 + Vite → Vercel | Django 6.1 → Render | PostgreSQL → Render

---

## Overview

```
Browser → Vercel (React/Vite frontend)
              ↓ VITE_API_URL
        Render (Django + Gunicorn backend)
              ↓ DATABASE_URL
        Render PostgreSQL
              ↓ GEMINI_API_KEY
        Google Gemini API
              ↓ FIREBASE_PRIVATE_KEY etc.
        Firebase (Google auth verification)
```

---

## Pre-Deployment Checklist (run locally first)

```bash
# Backend
cd backend
python manage.py check
python manage.py makemigrations --check   # must output: "No changes detected"
python manage.py collectstatic --noinput  # must succeed

# Frontend
cd frontend
npm install
npm run build   # must succeed with zero errors
```

---

## Step 1 — Push to GitHub

Make sure the following are gitignored (already configured in .gitignore):
- `backend/.env`
- `frontend/.env.local`
- `backend/firebase-service-account.json`
- `backend/venv/`
- `frontend/node_modules/`
- `frontend/dist/`

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

---

## Step 2 — Create Render PostgreSQL Database

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Set:
   - Name: `finwise-db`
   - Region: choose closest to your users
   - Plan: Free (or Starter for production)
3. Click **Create Database**
4. After creation, copy the **Internal Database URL** (used in Step 3)

---

## Step 3 — Deploy Django Backend on Render

### Create the Web Service

1. Go to Render → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `finwise-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

### Set Environment Variables on Render

Go to the service → **Environment** tab and add:

#### Required

| Variable | Value |
|---|---|
| `SECRET_KEY` | Generate: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-app.onrender.com` |
| `DATABASE_URL` | Paste the Internal Database URL from Step 2 |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` (add after Vercel deployment) |
| `CSRF_TRUSTED_ORIGINS` | `https://your-app.onrender.com,https://your-app.vercel.app` |

#### Firebase Admin (copy from firebase-service-account.json)

| Variable | Value |
|---|---|
| `FIREBASE_TYPE` | `service_account` |
| `FIREBASE_PROJECT_ID` | from JSON: `project_id` |
| `FIREBASE_PRIVATE_KEY_ID` | from JSON: `private_key_id` |
| `FIREBASE_PRIVATE_KEY` | from JSON: `private_key` (paste the full key including `-----BEGIN...-----END-----\n` — Render stores it with literal `\n`) |
| `FIREBASE_CLIENT_EMAIL` | from JSON: `client_email` |
| `FIREBASE_CLIENT_ID` | from JSON: `client_id` |
| `FIREBASE_AUTH_URI` | `https://accounts.google.com/o/oauth2/auth` |
| `FIREBASE_TOKEN_URI` | `https://oauth2.googleapis.com/token` |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | `https://www.googleapis.com/oauth2/v1/certs` |
| `FIREBASE_CLIENT_X509_CERT_URL` | from JSON: `client_x509_cert_url` |

> **Important:** For `FIREBASE_PRIVATE_KEY`, paste the raw private key value from the JSON file. Do NOT wrap it in quotes. It should start with `-----BEGIN PRIVATE KEY-----\n`.

---

## Step 4 — Run Database Migrations on Render

After the first deployment succeeds, open the Render shell or use the console:

```bash
python manage.py migrate
```

Optional — create admin superuser:
```bash
python manage.py createsuperuser
```

Optional — seed default categories:
```bash
python manage.py seed_categories
```

---

## Step 5 — Deploy React Frontend on Vercel

### Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Set Environment Variables on Vercel

Go to Project → **Settings** → **Environment Variables** and add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-app.onrender.com` (your Render backend URL) |
| `VITE_FIREBASE_API_KEY` | from Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | from Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | from Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | from Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase Console |
| `VITE_FIREBASE_APP_ID` | from Firebase Console |

> Get Firebase web values from: Firebase Console → Project Settings → Your Apps → Web app → SDK setup and configuration

---

## Step 6 — Firebase Authorized Domains

Google Sign-In only works from authorized domains.

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. **Authentication** → **Settings** → **Authorized domains**
3. Add:
   - `your-app.vercel.app` (your Vercel domain)
   - Any custom domain you plan to use

---

## Step 7 — Update CORS After Vercel Deploy

Once you know your Vercel URL, update the Render environment variable:

```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-app.onrender.com,https://your-app.vercel.app
```

Then trigger a Render redeploy.

---

## Verification After Deployment

1. Visit your Vercel URL — landing page should load
2. Click "Get Started" — Auth modal should open
3. Try Google Sign-In — should authenticate successfully
4. Add a transaction — should save to Render PostgreSQL
5. Visit `/api/transactions/summary/` on your Render backend (unauthenticated = 401 is correct)
6. Check Render logs for any errors

---

## Secrets Reference

Never commit these. Store only in Render/Vercel environment variables:

| Secret | Where |
|---|---|
| `SECRET_KEY` | Render |
| `DATABASE_URL` | Render (auto-provided by Render PostgreSQL) |
| `GEMINI_API_KEY` | Render |
| `FIREBASE_PRIVATE_KEY` | Render |
| All `FIREBASE_*` | Render |
| `VITE_API_URL` | Vercel |
| `VITE_FIREBASE_*` | Vercel |

---

## Local Development (after production setup)

```bash
# Backend
cd backend
# .env already has local values — just run:
python manage.py runserver

# Frontend
cd frontend
# .env.local already has local values — just run:
npm run dev
```
