# Folder Responsibility Document

## Top-Level Structure

```
Figma-Dashboards-1/
├── client/      # Frontend SPA (React + Vite)
├── server/      # Backend API (Express + TypeScript) - SOURCE OF TRUTH
├── functions/   # Cloud Functions wrapper (for Firebase deploy)
├── tooling/     # Build utilities
└── test-data/   # Sample data for testing
```

---

## Runtime Matrix

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Local dev** | `client (vite:5173)` | `server (tsx:5001)` | Firestore (prod or emulator) |
| **Firebase prod** | `client (hosting)` | `functions (https)` | Firestore (prod) |
| **Tooling build** | `tooling/build.ts` | Combined bundle | N/A |

---

## Backend Source of Truth

> **Policy:** Backend source of truth is `server/`; `functions/` is a deployment wrapper that duplicates core routes for deployment isolation.

| | server/ | functions/ |
|---|---------|------------|
| Business logic | ✅ Canonical | 🔄 Duplicated subset |
| Domain models | ✅ Canonical | ❌ Import from server at build time (future) |
| Used in | Local dev, tests | Firebase deploy |

**Future improvement:** Functions should import server as built artifact to eliminate duplication.

---

## client/

**Purpose:** React SPA with Vite bundler. Renders all UI and manages client-side state.

**What belongs here:**
- React components (pages, layouts, primitives)
- Client-side routing (wouter)
- State management (React Query, Context)
- UI styling (Tailwind CSS)
- Client-side Firebase SDK (Auth, Firestore reads)
- Unit/integration tests for UI

**What must NOT belong here:**
- Server-side code (Express, Node fs operations)
- Firebase Admin SDK
- Database write logic (all writes go through `/api`)
- Secrets or service account files
- Backend business logic

**Data access policy:**
- **Reads:** Client Firestore reads allowed ONLY for public/viewer-safe collections (enforced by rules)
- **Writes:** ALL writes go through `/api` (never direct Firestore writes from client)
- **Admin reads:** Admin-only data accessed through `/api`, NOT direct Firestore

**Ownership boundaries:**
- Imports: `@/` alias → `client/src/`
- Calls: `/api/*` endpoints (proxied in dev, rewritten in prod)
- Does NOT import from: `server/`, `functions/`

---

## server/

**Purpose:** Express API server. Contains all backend business logic. **Source of truth for backend.**

**What belongs here:**
- Express routes and middleware
- Firebase Admin SDK initialization
- Firestore CRUD operations
- Authentication/authorization middleware
- Domain logic (reconcile, metrics, data quality)
- API endpoint handlers
- Backend unit/integration tests

**What must NOT belong here:**
- React components
- Frontend routing logic
- UI styling
- Client-side state management
- Hardcoded secrets (use env vars)

**Ownership boundaries:**
- Exports: `app` (Express instance) from `app.ts`
- Uses: `firebase-admin` for Firestore/Auth
- Does NOT import from: `client/`, `functions/`

---

## functions/

**Purpose:** Cloud Functions entry point for Firebase deployment. Wraps Express as HTTPS function.

> **Source of truth note:** Backend logic is duplicated here for deployment safety. Long-term goal: import from `server/` build output.

**What belongs here:**
- Cloud Function exports (e.g., `exports.api`)
- Firebase Admin initialization (for cloud env)
- Duplicated core API endpoints (health, auth, referrals)
- Cloud-specific configurations

**What must NOT belong here:**
- React components
- Full server logic (keep routes minimal)
- Local development server code
- Secrets or service account files

**Ownership boundaries:**
- Self-contained Express app (duplicates core routes from server)
- Uses: `firebase-functions`, `firebase-admin`
- Does NOT import from: `client/`
- Does NOT import from: `server/` (currently - for deployment safety)

---

## tooling/

**Purpose:** Build scripts and development utilities.

**What belongs here:**
- Combined build scripts (esbuild, vite)
- Code generation utilities
- Development helpers

**What must NOT belong here:**
- Application code
- React components
- Express routes

**Ownership boundaries:**
- May import: build configs from `client/`, `server/`
- Is NOT imported by: any application code

---

## test-data/

**Purpose:** Sample data for testing and development.

**What belongs here:**
- Mock JSON files for testing
- Sample event data for reconciliation tests
- Seed scripts for local development

**What must NOT belong here:**
- PII or real user data
- Production database exports
- Secrets, tokens, or API keys
- Service account files

---

## Key Files Reference

| File | Responsibility |
|------|----------------|
| `client/src/app/App.tsx` | Root component, routing, providers |
| `client/src/lib/firebase.ts` | Client Firebase SDK init |
| `client/src/lib/api.ts` | HTTP client with auth header |
| `server/src/app.ts` | Express app config (no listener) |
| `server/src/index.ts` | Local dev server listener |
| `server/src/services/firebase.ts` | Admin SDK init (ADC-first) |
| `server/src/api/router.ts` | Main API router |
| `functions/src/index.ts` | Cloud Function export |
| `firebase.json` | Hosting + Functions config |

---

## Import Graph

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  client/src/*                                                │
│    ├── Imports: @/ (self), @tanstack/react-query, wouter    │
│    ├── Calls: /api/* (HTTP)                                 │
│    └── Uses: Firebase Client SDK (firebase)                 │
│    └── Reads: Firestore (viewer-safe collections only)      │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP /api/*
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  server/src/* (local)  OR  functions/src/* (prod)           │
│    ├── Uses: Firebase Admin SDK (firebase-admin)            │
│    ├── Accesses: Firestore (all collections)                │
│    ├── Writes: All database mutations                       │
│    └── Does NOT import: client/*                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Checklist

Run these commands to verify architecture compliance:

```bash
# 1. Hosting path matches build output
npm run build --prefix client && test -f client/dist/public/index.html && echo "✅ Hosting path OK"

# 2. Server builds
npm run build --prefix server && echo "✅ Server build OK"

# 3. Functions builds
cd functions && npm run build && echo "✅ Functions build OK"

# 4. All tests pass
npm run test --prefix client -- --run && npm run test --prefix server -- --run

# 5. No secrets in repo
git ls-files | grep -E "serviceAccount|\.env$" && echo "❌ SECRETS FOUND" || echo "✅ No secrets"
```

**Checklist:**
- [x] No cross-imports between client and server
- [x] Functions self-contained (no TS cross-imports from server)
- [x] No secrets in repo (uses env vars + ADC)
- [x] Hosting path verified: `client/dist/public/index.html`
- [x] All builds pass
- [x] All tests pass (16/16)
