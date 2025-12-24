<div align="center">

# 🏥 Healthcare Referral Management System

### Event-Driven Reconciliation Dashboard

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-dashboard--b9ee6.web.app-00C853?style=for-the-badge)](https://dashboard-b9ee6.web.app)
[![API Docs](https://img.shields.io/badge/📚_API_Docs-Swagger_UI-85EA2D?style=for-the-badge)](https://dashboard-b9ee6.web.app/api/docs)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Deployed-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

---

**A production-grade dashboard for processing healthcare referral events with deterministic state reconciliation**

[View Demo](https://dashboard-b9ee6.web.app) · [API Documentation](https://dashboard-b9ee6.web.app/api/docs) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Technical Implementation](#-technical-implementation)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Deployment](#-deployment)

---

## 🎯 About The Project

This project implements a **healthcare referral event reconciliation system** that processes messy, out-of-order, and potentially duplicated event streams to produce a consistent final state for each referral.

### Problem Statement

Given an event feed where:
- ⚠️ Events can arrive **out of order**
- ⚠️ Events can be **duplicated**
- ⚠️ Sequence numbers may have **gaps**

**Goal:** Reconstruct the correct final state for each referral deterministically.

### Implementation Checklist

| Requirement | Status | Implementation |
|-------------|:------:|----------------|
| Deduplicate by `(referral_id, seq)` | ✅ | `reconcile.ts` |
| Sort events by ascending `seq` | ✅ | `reconcile.ts` |
| Process events in order | ✅ | `reconcile.ts` |
| Handle terminal statuses (`COMPLETED`/`CANCELLED`) | ✅ | `reconcile.ts` |
| Terminal → Terminal override | ✅ | `reconcile.ts` |
| Ignore non-terminal after terminal | ✅ | `reconcile.ts` |
| `APPOINTMENT_SET` creates/updates | ✅ | `reconcile.ts` |
| `APPOINTMENT_CANCELLED` removes | ✅ | `reconcile.ts` |
| `active_appointment` = earliest upcoming | ✅ | `reconcile.ts` |
| Terminal status → `active_appointment = null` | ✅ | `reconcile.ts` |

---

## 🧠 Technical Implementation

### Core Algorithm

```typescript
function reconcile(events: ReferralEvent[]): Map<string, ReferralState>
```

#### Input Schema

```typescript
interface ReferralEvent {
  referral_id: string;           // Unique referral identifier
  seq: number;                   // Sequence number (may be out of order)
  type: EventType;               // STATUS_UPDATE | APPOINTMENT_SET | APPOINTMENT_CANCELLED
  payload: EventPayload;         // Type-specific data
}
```

#### Output Schema

```typescript
interface ReferralState {
  referral_id: string;
  status: "CREATED" | "SENT" | "ACKNOWLEDGED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  active_appointment: {
    appt_id: string;
    start_time: string;          // ISO 8601
  } | null;
}
```

### Algorithm Steps

```
┌─────────────────────────────────────────────────────────┐
│  1. GROUP events by referral_id                         │
├─────────────────────────────────────────────────────────┤
│  2. For each referral:                                  │
│     ├── DEDUPLICATE by (referral_id, seq)              │
│     ├── SORT by ascending seq                          │
│     └── PROCESS each event:                            │
│         ├── STATUS_UPDATE    → Update status           │
│         ├── APPOINTMENT_SET  → Track appointment       │
│         └── APPOINTMENT_CANCELLED → Remove appointment │
├─────────────────────────────────────────────────────────┤
│  3. FINALIZE active_appointment:                        │
│     ├── If terminal status → null                      │
│     └── Else → earliest non-cancelled by start_time   │
└─────────────────────────────────────────────────────────┘
```

### Terminal Status Rules

```typescript
const TERMINAL = ["COMPLETED", "CANCELLED"];

if (currentIsTerminal && newIsTerminal) {
  // ✅ Allow: CANCELLED → COMPLETED
  state.status = newStatus;
} else if (currentIsTerminal) {
  // ❌ Ignore: COMPLETED → SENT
  return;
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ 
- **npm** 9+
- **Firebase CLI** (for deployment)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd Figma-Dashboards-1

# 2. Install dependencies
npm install
npm install --prefix client
npm install --prefix server
npm install --prefix functions
```

### Running Locally

```bash
# Terminal 1: Start API Server
npm run dev:server
# → http://localhost:5001/api/docs

# Terminal 2: Start Frontend
npm run dev
# → http://localhost:5173
```

### Test Credentials

| Role | Email | Password |
|:----:|-------|----------|
| 👑 Admin | `admin@example.com` | `admin123` |
| 👁️ Viewer | `viewer@example.com` | `viewer123` |

---

## 📚 API Reference

### Base URL

```
Production: https://dashboard-b9ee6.web.app/api
Local:      http://localhost:5001/api
```

### Endpoints

| Method | Endpoint | Auth | Description |
|:------:|----------|:----:|-------------|
| `GET` | `/health` | ❌ | Health check |
| `POST` | `/auth/login` | ❌ | Authenticate & get token |
| `GET` | `/auth/me` | ✅ | Get current user profile |
| `GET` | `/referrals` | ✅ | List all referrals |
| `GET` | `/referrals/:id` | ✅ | Get referral details |
| `POST` | `/uploads` | 👑 | Upload events (Admin only) |

### Interactive Documentation

📖 **Swagger UI:** https://dashboard-b9ee6.web.app/api/docs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│    │   Auth      │  │  Dashboard  │  │  Referral Details   │   │
│    │   Provider  │  │  Overview   │  │  (Charts/Tables)    │   │
│    └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │
│           │                │                     │               │
│           └────────────────┴─────────────────────┘               │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │    API Client    │                           │
│                   │  (with Auth)     │                           │
│                   └────────┬────────┘                           │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                    FIREBASE HOSTING + FUNCTIONS                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                    Express API                           │  │
│    │  ┌─────────┐  ┌──────────────┐  ┌─────────────────────┐ │  │
│    │  │  Auth   │  │   Referrals  │  │   Upload/Reconcile  │ │  │
│    │  │ Routes  │  │    Routes    │  │      Routes         │ │  │
│    │  └────┬────┘  └──────┬───────┘  └──────────┬──────────┘ │  │
│    │       │              │                     │             │  │
│    │       └──────────────┴─────────────────────┘             │  │
│    │                      │                                    │  │
│    │            ┌─────────▼─────────┐                         │  │
│    │            │  reconcile()       │                         │  │
│    │            │  Domain Logic      │                         │  │
│    │            └─────────┬─────────┘                         │  │
│    └──────────────────────┼──────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      FIRESTORE DATABASE                          │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  organizations/default/                                  │  │
│    │    ├── users/{uid}         → { email, role }            │  │
│    │    ├── referrals/{id}      → { status, appointments }   │  │
│    │    └── events/{uploadId}   → { raw events }             │  │
│    └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS |
| **Charts** | Recharts |
| **Routing** | Wouter |
| **Backend** | Express, TypeScript |
| **Auth** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **Hosting** | Firebase Hosting |
| **Functions** | Firebase Cloud Functions (Node.js 20) |
| **API Docs** | Swagger UI (OpenAPI 3.0) |

---

## 🚢 Deployment

### Deploy to Firebase

```bash
# 1. Build client
npm run build --prefix client

# 2. Build functions
npm run build --prefix functions

# 3. Deploy everything
firebase deploy
```

### Production URLs

| Service | URL |
|---------|-----|
| 🌐 Application | https://dashboard-b9ee6.web.app |
| 📖 Swagger | https://dashboard-b9ee6.web.app/api/docs |

---

## 📸 Screenshots

### Login Page
Clean, modern authentication with demo credentials

### Dashboard Overview
Real-time metrics, charts, and referral status visualization

### Swagger UI
Interactive API documentation for testing endpoints

---

## 👨‍💻 Development

### Project Structure

```
Referral-Management-System/
├── 📂 client/                 # React SPA
│   ├── 📂 src/
│   │   ├── 📂 app/           # Providers, Router
│   │   ├── 📂 features/      # Feature modules
│   │   │   ├── 📂 auth/      # Login page
│   │   │   └── 📂 referrals/ # Dashboard, domain logic
│   │   ├── 📂 shared/        # Reusable components
│   │   └── 📂 lib/           # Firebase, API client
│   └── 📄 index.html
│
├── 📂 server/                 # Express API (local dev)
│   └── 📂 src/
│       ├── 📂 api/           # Route handlers
│       ├── 📂 domain/        # Business logic
│       └── 📂 services/      # Firebase, Auth
│
├── 📂 functions/              # Firebase Cloud Functions
│   └── 📂 src/
│       └── 📄 index.ts       # Production API
│
├── 📄 firebase.json          # Firebase config
├── 📄 firestore.rules        # Security rules
└── 📄 README.md
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run dev:server` | Start backend dev server |
| `npm run build --prefix client` | Build frontend |
| `npm run build --prefix functions` | Build Cloud Functions |
| `firebase deploy` | Deploy to Firebase |

---

## 📝 License

Distributed under the MIT License.

---

<div align="center">

**Built with ❤️ for SWE Intern Technical Assignment**

December 2025

</div>
