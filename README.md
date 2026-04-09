# Live Now Recovery

**Real-time, privacy-first medication-assisted treatment (MAT) provider discovery for Northeast Ohio.**

Built on [Caffeine.ai](https://caffeine.ai) — decentralized infrastructure powered by the Internet Computer Protocol (ICP).

---

## What It Does

Live Now Recovery shows people in crisis **who is accepting patients right now** — not last week, not from a static directory. Providers toggle their live status every 4 hours or they auto-expire. The map updates in real time.

Key principles:
- **Zero PHI** — no patient names, no dates of birth, no insurance. Patients browse anonymously.
- **Cost transparency** — every provider view shows the Cost Plus Drugs price ($45.37/month generic Suboxone vs. $185 retail, saving patients $139.63/month).
- **Decentralized** — runs on ICP canisters, no cloud provider, no central breach risk.
- **Real-time** — 4-hour max staleness. Providers go Live → Unknown → Offline automatically.

---

## Features

| Feature | Description |
|---|---|
| Live provider map | MapLibre GL map with color-coded status (green = live, amber = unknown, gray = offline) |
| Filter by type | MAT clinic, Narcan pharmacy, Emergency Room |
| Sentinel AI | Claude-powered chat assistant — answers questions using live canister data |
| Proof of Presence | Peer specialists generate 5-minute QR codes for anonymous warm handoffs |
| Cost Plus Drugs | Mandatory price comparison on every provider page |
| Admin dashboard | Internet Identity auth, provider verification, risk monitoring |
| Helper network | Community volunteers register to carry Narcan and assist with referrals |
| Location pages | SEO-optimized pages for Cleveland, Akron, Youngstown, Toledo, and 11 more cities |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Motoko smart contracts on Internet Computer Protocol (ICP) |
| Frontend | React 19 + TypeScript + TanStack Router |
| Maps | MapLibre GL |
| AI | Claude claude-opus-4-6 via `@anthropic-ai/sdk` (Sentinel AI) |
| Auth | Internet Identity (decentralized, no passwords) |
| Styling | Tailwind CSS + Radix UI |
| Platform | Caffeine.ai (managed ICP hosting + build tooling) |

---

## Project Structure

```
live-now-recovery/
├── src/
│   ├── backend/          # Motoko smart contract (ICP canister)
│   │   └── main.mo       # Provider management, handoff tokens, risk packets
│   └── frontend/         # React TypeScript app
│       └── src/
│           ├── components/   # SentinelChat, EnhancedRecoveryMap, etc.
│           ├── hooks/        # useAllProviders, useHandoffCountsByZip, etc.
│           ├── lib/          # sentinelContext.ts (Sentinel AI system prompt builder)
│           └── pages/        # HomePage, AdminPage, HelperPage, ProviderPage, etc.
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (for local ICP development)

### Install

```bash
pnpm install
```

### Environment Variables

Create `src/frontend/.env`:

```env
# Required for Sentinel AI chat (get from console.anthropic.com)
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Set automatically by Caffeine.ai or dfx deploy — leave blank for local dev
CANISTER_ID_BACKEND=
DFX_NETWORK=local
II_URL=http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/
```

> **Note:** `VITE_ANTHROPIC_API_KEY` is exposed to the browser. For production, route API calls through a server-side proxy. The app degrades gracefully without it (falls back to static responses).

### Run Locally

```bash
# Start local ICP replica
dfx start --background

# Deploy the backend canister
dfx deploy backend

# Start the frontend dev server
cd src/frontend && pnpm dev
```

The app will be available at `http://localhost:5173`.

### env.json

The `src/frontend/env.json` file is populated automatically by Caffeine.ai on deploy. For local development, `dfx deploy` outputs the canister ID:

```bash
dfx canister id backend
```

---

## Deployment

This project is deployed via [Caffeine.ai](https://caffeine.ai). Push to `main` and Caffeine handles the ICP canister upgrade and frontend hosting.

---

## How the AI Works (Sentinel AI)

`SentinelChat` connects to Claude claude-opus-4-6 at runtime. Before each message, `sentinelContext.ts` builds a system prompt injecting:

- Current live provider list (from `getAllProviders()`)
- Handoff counts by ZIP (from `getHandoffCountsByZip()`)
- Cost Plus Drugs pricing
- Crisis line numbers

Conversations are **ephemeral** — nothing is stored. Crisis keywords (overdose, emergency, etc.) trigger an immediate hardcoded response with crisis line numbers before the AI is called.

---

## Backend API (Motoko Canister)

| Function | Type | Description |
|---|---|---|
| `getAllProviders()` | query | All providers with live status |
| `getEmergencyActive()` | query | Live + recently active providers |
| `getMarketplaceGeoJSON()` | query | GeoJSON for map rendering |
| `getHandoffCountsByZip()` | query | Anonymous handoff counts by ZIP |
| `getTotalHandoffs()` | query | Total handoff count |
| `getCanisterState()` | query | Admin summary (active count, high-risk flag) |
| `registerProvider(...)` | update | Register a new provider |
| `toggleLive(id, status)` | update | Admin: set provider live/offline |
| `verifyProvider(id)` | update | Admin: verify provider (+25 reputation) |
| `generateHandoffToken(zip)` | update | Generate 5-minute QR token |
| `verifyHandoff(token)` | update | Consume token, increment ZIP count |
| `registerHelper(...)` | update | Register peer specialist volunteer |
| `receiveRiskPacket(...)` | update | Admin: submit risk assessment |
| `heartbeat()` | update | Admin: trigger status decay + risk alerts |

---

## Privacy Architecture

- Patients never create accounts
- No names, addresses, or insurance collected
- Handoff tracking is ZIP-code only (aggregated counts)
- QR tokens expire in 5 minutes and are single-use
- All state lives in the ICP canister — no cloud database, no third-party analytics

---

## Region Served

Northeast Ohio — Region 13 Behavioral Health Network
Counties: Cuyahoga, Lorain, Lake, Geauga, Medina, Summit

---

## License

Exported from [Caffeine.ai](https://caffeine.ai). See `caffeine.toml` for project configuration.
