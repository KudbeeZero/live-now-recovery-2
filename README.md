<div align="center">

<br/>

<!-- Logo -->
<img src="https://img.shields.io/badge/%E2%9D%A4%EF%B8%8F-Live%20Now%20Recovery-00C47C?style=for-the-badge&labelColor=12131D&color=00C47C&logoColor=white" alt="Live Now Recovery" height="40"/>

<br/><br/>

# 🟢 Live Now Recovery

### Real-time • Privacy-First • Decentralized
### Medication-Assisted Treatment Discovery for Northeast Ohio

<br/>

[![Built on Caffeine.ai](https://img.shields.io/badge/Built%20on-Caffeine.ai-3B6FD4?style=flat-square&labelColor=12131D)](https://caffeine.ai)
[![ICP](https://img.shields.io/badge/Powered%20by-Internet%20Computer-5B21D6?style=flat-square&labelColor=12131D)](https://internetcomputer.org)
[![Claude AI](https://img.shields.io/badge/AI-Claude%20Opus%204.6-CC785C?style=flat-square&labelColor=12131D)](https://anthropic.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square&labelColor=12131D&logo=react&logoColor=61DAFB)](https://react.dev)
[![Motoko](https://img.shields.io/badge/Backend-Motoko-F57C00?style=flat-square&labelColor=12131D)](https://internetcomputer.org/docs/motoko)
[![License](https://img.shields.io/badge/License-Proprietary%20%7C%20All%20Rights%20Reserved-FF4444?style=flat-square&labelColor=12131D)](#-license)

<br/>

> **People in crisis need to know who is open right now — not last week.**
> Live Now Recovery shows real-time MAT provider availability, routes patients to $45/month Suboxone, and leaves zero trace. No accounts. No data. No surveillance.

<br/>

---

</div>

## 🧭 Navigation

| Section | Description |
|---|---|
| [🎯 What It Does](#-what-it-does) | Mission and core principles |
| [✨ Features](#-features) | Full feature breakdown |
| [🧠 Sentinel AI](#-sentinel-ai) | Claude-powered crisis assistant |
| [🛠️ Tech Stack](#️-tech-stack) | Languages, frameworks, infrastructure |
| [🚀 Getting Started](#-getting-started) | Local dev setup and env vars |
| [🔌 Backend API](#-backend-api) | Motoko canister function reference |
| [🔒 Privacy Architecture](#-privacy-architecture) | Zero-PHI design |
| [🗺️ Region Served](#️-region-served) | Coverage area |
| [⚖️ License](#️-license) | Proprietary — all rights reserved |

---

## 🎯 What It Does

Live Now Recovery is the **only platform** combining real-time MAT provider availability, cost transparency, and absolute patient privacy — running on decentralized ICP infrastructure with no cloud dependency.

<details>
<summary><strong>🟢 Real-Time Provider Status</strong></summary>
<br/>

Providers toggle their availability on a 4-hour heartbeat:

```
Live ──(4h no check-in)──► Unknown ──(next cycle)──► Offline
```

- Green pin = accepting patients **right now**
- Amber pin = status unconfirmed (>4 hours since last check-in)
- Gray pin = offline / not accepting

No stale directories. No weekly updates. **Live or not live.**

</details>

<details>
<summary><strong>💊 Cost Transparency</strong></summary>
<br/>

Every provider page shows the real cost of treatment:

| Pharmacy | Monthly Cost | Savings |
|---|---|---|
| Retail MAT | **$185.00** | — |
| 💙 Mark Cuban Cost Plus Drugs | **$45.37** | **$139.63/month** |

NCPDP ID: `5755167` · [costplusdrugs.com](https://costplusdrugs.com)

</details>

<details>
<summary><strong>🤝 Proof of Presence (PoP)</strong></summary>
<br/>

Peer specialists generate single-use QR codes (5-minute window) for warm handoffs. When scanned:

1. System records an anonymous handoff event
2. ZIP-code counter increments
3. Token expires immediately after use
4. **No names, no IDs, no trace**

This creates real epidemiological intelligence from aggregated anonymous data.

</details>

---

## ✨ Features

<details>
<summary><strong>🗺️ Live Provider Map</strong></summary>
<br/>

- **MapLibre GL** interactive map with real-time provider pins
- Filter by type: MAT Clinic · Narcan Pharmacy · Emergency Room
- Heatmap layer showing handoff density by ZIP code
- 3D building toggle
- Weather overlay
- Click any pin for provider detail, cost comparison, and ride-share links

</details>

<details>
<summary><strong>🤖 Sentinel AI Chat</strong></summary>
<br/>

Real-time Claude claude-opus-4-6 assistant embedded in the bottom corner. Knows:
- Who is **live right now** (reads from canister at message time)
- Exact Cost Plus Drugs pricing
- How Proof of Presence works
- Crisis line numbers (hard-coded escape hatch for emergency keywords)

→ See [Sentinel AI](#-sentinel-ai) for full details.

</details>

<details>
<summary><strong>🏥 Provider Registration & Verification</strong></summary>
<br/>

- Self-service provider registration with NPI lookup
- Admin verification workflow (Internet Identity auth)
- Reputation score system (0–100, starts at 50, +25 on verification)
- One-click "Seed 18 Ohio Providers" for demo/testing

</details>

<details>
<summary><strong>👥 Helper / Peer Specialist Network</strong></summary>
<br/>

Community helpers register with:
- First name + ZIP + phone + help type (Narcan carrier, Peer support, Transportation, General)
- Generate QR codes for warm handoffs
- Upload proof-of-presence events
- Anonymous — no patient identifiers ever collected

</details>

<details>
<summary><strong>🛡️ Admin Dashboard</strong></summary>
<br/>

Protected by Internet Identity (ICP's decentralized auth — no passwords):
- Approve/reject provider registrations
- Toggle any provider live/offline
- View canister state (active count, high-risk window flag)
- Submit risk packets for provider risk scoring
- Run heartbeat decay manually

</details>

<details>
<summary><strong>📍 Location Pages</strong></summary>
<br/>

SEO-optimized city-specific pages for:
Cleveland · Akron · Youngstown · Toledo · Dayton · Columbus · Canton · Lorain · Elyria · Mentor · Parma · Lakewood · Warren · Niles · Boardman

</details>

---

## 🧠 Sentinel AI

Sentinel is the Claude-powered chat assistant built into every page. It replaces the original hardcoded response map with a live language model that reads actual canister data before every response.

### How It Works

```
User message
    │
    ▼
Crisis keyword check ──► 🚨 Hardcoded crisis numbers (no AI)
    │
    ▼
buildSentinelContext()
    ├── getAllProviders()      → Who is live right now
    ├── getHandoffCountsByZip() → Where people are seeking help
    └── Static: Cost Plus pricing + crisis lines
    │
    ▼
Claude claude-opus-4-6 (streaming, 512 token cap)
    │
    ▼
Token-by-token response in chat UI
```

### Privacy Guarantees

- ❌ No conversation history stored anywhere
- ❌ No user identifiers sent to Anthropic
- ❌ No PHI in the system prompt (ZIP aggregates only)
- ✅ Every session is completely fresh
- ✅ Crisis escalation bypasses AI entirely for overdose/emergency keywords

### Setup

Add to `src/frontend/.env`:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

The app degrades gracefully without it — falls back to static "call Ohio MAR NOW" responses.

> ⚠️ The API key is browser-visible. For production, route through a server-side proxy.

---

## 🛠️ Tech Stack

<details>
<summary><strong>Backend</strong></summary>
<br/>

| Component | Technology |
|---|---|
| Runtime | Internet Computer Protocol (ICP) |
| Language | Motoko 1.2.0 |
| Package manager | Mops |
| Auth library | `caffeineai-authorization` 0.1.0 |
| State | Native Motoko stable Maps (no database) |
| Compiler | Caffeine Labs custom Motoko build |

</details>

<details>
<summary><strong>Frontend</strong></summary>
<br/>

| Component | Technology |
|---|---|
| Framework | React 19.1.0 |
| Language | TypeScript 5.x |
| Routing | TanStack React Router 1.131.8 |
| Data fetching | TanStack React Query 5.24.0 |
| Styling | Tailwind CSS 3.4.17 |
| UI components | Radix UI (40+ components) |
| Maps | MapLibre GL |
| 3D | Three.js + React Three Fiber |
| Charts | Recharts 2.15.1 |
| State | Zustand 5.0.5 |
| Forms | React Hook Form 7.53.0 |
| Build | Vite 5.4.1 |
| Linting | Biome 1.9.0 |

</details>

<details>
<summary><strong>AI & Infrastructure</strong></summary>
<br/>

| Component | Technology |
|---|---|
| AI model | Claude claude-opus-4-6 (Anthropic) |
| AI SDK | `@anthropic-ai/sdk` |
| ICP identity | `@dfinity/auth-client` + Internet Identity |
| ICP agent | `@dfinity/agent` |
| ICP bindings | `caffeine-bindgen` (auto-generated from Motoko IDL) |
| Platform | Caffeine.ai (managed ICP hosting) |
| Font | Plus Jakarta Sans |

</details>

### Color Palette

| Role | Color | Usage |
|---|---|---|
| 🟢 Live | `oklch(0.62 0.17 155)` ≈ `#00C47C` | Live status indicators |
| 🔵 Primary | `oklch(0.62 0.12 218)` ≈ `#3B6FD4` | Buttons, links, rings |
| 🟡 Amber | `oklch(0.75 0.14 55)` ≈ `#D4A017` | Unknown status, warnings |
| 🔴 Emergency | `oklch(0.52 0.19 27)` ≈ `#B94040` | Crisis banner, destructive actions |
| ⬛ Navy | `oklch(0.14 0.008 240)` ≈ `#12131D` | Background |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (for local ICP development)

### Install

```bash
git clone <repo>
cd live-now-recovery
pnpm install
```

### Environment Variables

Create `src/frontend/.env`:

```env
# Sentinel AI — get your key at console.anthropic.com
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Populated automatically by dfx deploy or Caffeine.ai
CANISTER_ID_BACKEND=
DFX_NETWORK=local
II_URL=http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/
```

### Run Locally

```bash
# 1. Start local ICP replica
dfx start --background

# 2. Deploy the backend canister
dfx deploy backend

# 3. Get your canister ID (for env.json)
dfx canister id backend

# 4. Start frontend dev server
cd src/frontend && pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### env.json

`src/frontend/env.json` is auto-populated by Caffeine.ai on deploy. Locally, fill in the canister ID from step 3 above:

```json
{
  "backend_host": "http://127.0.0.1:4943",
  "backend_canister_id": "<output of dfx canister id backend>",
  "project_id": "live-now-recovery",
  "ii_derivation_origin": "http://localhost:5173"
}
```

### Deploy to Production

Push to `main` — Caffeine.ai handles canister upgrade and frontend hosting automatically.

---

## 🔌 Backend API

All functions are on the single ICP canister (`main.mo`).

<details>
<summary><strong>Query Functions (read-only, free)</strong></summary>
<br/>

| Function | Returns | Description |
|---|---|---|
| `getAllProviders()` | `[ProviderWithStatus]` | All providers with computed status |
| `getEmergencyActive()` | `[ProviderWithStatus]` | Live + recently active only |
| `getMarketplaceGeoJSON()` | GeoJSON | Map-ready FeatureCollection |
| `getHandoffCountsByZip()` | `[(zip, count)]` | Anonymous handoff counts |
| `getTotalHandoffs()` | `Nat` | Lifetime handoff total |
| `getCanisterState()` | `CanisterStateSummary` | Active count + high-risk flag |
| `getCallerUserProfile()` | `?UserProfile` | Caller's profile |
| `getAllHelpers()` | `[Helper]` | Admin only: volunteer list |

</details>

<details>
<summary><strong>Update Functions (require auth, cost cycles)</strong></summary>
<br/>

| Function | Auth | Description |
|---|---|---|
| `registerProvider(id, name, lat, lng, type)` | User | Register new provider |
| `toggleLive(id, status)` | Admin | Set provider live/offline |
| `verifyProvider(id)` | Admin | Verify provider (+25 reputation) |
| `generateHandoffToken(zipCode)` | User | Create 5-min QR token |
| `verifyHandoff(token)` | Any | Consume token, increment ZIP count |
| `registerHelper(firstName, zip, phone, note)` | User | Register peer specialist |
| `receiveRiskPacket(packet)` | Admin | Submit risk assessment |
| `heartbeat()` | Admin | Trigger status decay + risk alerts |
| `saveCallerUserProfile(profile)` | User | Store user profile |

</details>

<details>
<summary><strong>Data Types</strong></summary>
<br/>

```typescript
ProviderWithStatus {
  id:            string
  name:          string
  lat/lng:       number
  status:        "Live" | "Offline" | "Unknown"
  isLive:        boolean
  lastVerified:  bigint   // nanoseconds
  providerType:  "MAT" | "Narcan" | "ER" | "Pharmacy" | "General"
  isVerified:    boolean
  reputationScore: number  // 0.0–100.0
}

HandoffToken {
  token:     string
  zipCode:   string
  createdAt: bigint
  used:      boolean
}

RiskPacket {
  provider_id:       string
  data_source:       string
  risk_score:        Nat      // 0–100
  last_update_time:  Nat
  status:            boolean
}
```

</details>

---

## 🔒 Privacy Architecture

Live Now Recovery is built around a single principle: **you cannot breach data that was never collected.**

| What we collect | What we don't collect |
|---|---|
| Provider name + coordinates + phone | Patient names |
| Provider type + live status | Dates of birth |
| ZIP-level handoff counts (aggregated) | Insurance information |
| Volunteer first name + ZIP + phone | IP addresses of patients |
| Anonymous PoP event timestamps | Session cookies for patients |

**Technical guarantees:**
- 🔐 All state lives in the ICP canister — no cloud database, no S3, no Postgres
- 🕵️ Patients never create accounts or authenticate
- ⏱️ Handoff QR tokens expire in 5 minutes and are single-use
- 📍 ZIP codes are the smallest geographic unit stored (never street addresses)
- 🤖 Sentinel AI conversations are ephemeral — not logged to Anthropic or anywhere else
- 🏛️ Decentralized infrastructure eliminates single-point breach risk

---

## 🗺️ Region Served

**Northeast Ohio — Region 13 Behavioral Health Network**

| County | Major Cities |
|---|---|
| Cuyahoga | Cleveland, Lakewood, Parma |
| Lorain | Lorain, Elyria |
| Lake | Mentor, Willoughby |
| Geauga | Chardon |
| Medina | Medina, Brunswick |
| Summit | Akron, Barberton |

Crisis Line: **Ohio MAR NOW · 833-234-6343 · 24/7**

---

## ⚖️ License

<div align="center">

### ⛔ PROPRIETARY SOFTWARE — ALL RIGHTS RESERVED

</div>

```
Copyright © 2025 Live Now Recovery. All Rights Reserved.

This software, including all source code, documentation, design assets,
data structures, and associated files (collectively, the "Software"),
is the exclusive proprietary property of Live Now Recovery.

UNAUTHORIZED USE STRICTLY PROHIBITED:

  • No copying, reproduction, or duplication of any kind
  • No modification, adaptation, or derivative works
  • No distribution, publishing, or public disclosure
  • No sublicensing, selling, or transferring of any rights
  • No reverse engineering, decompiling, or disassembly
  • No use in whole or in part for any commercial or non-commercial purpose

This Software is provided solely for the operation of the Live Now Recovery
platform. Access to this repository does not grant any license, right, or
permission to use the Software for any other purpose.

Any unauthorized use, reproduction, or distribution of this Software,
or any portion of it, may result in severe civil and criminal penalties,
and will be prosecuted to the maximum extent possible under the law.

For licensing inquiries, contact the project owner directly.
```

<div align="center">

---

<br/>

**❤️ Live Now Recovery**

*Built with [Caffeine.ai](https://caffeine.ai) · Powered by [Internet Computer](https://internetcomputer.org) · AI by [Anthropic](https://anthropic.com)*

*Serving Northeast Ohio — Region 13 Behavioral Health Network*

**Crisis Line: [833-234-6343](tel:833-234-6343) · Available 24/7**

<br/>

</div>
