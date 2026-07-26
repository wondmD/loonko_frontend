# Dairy Farm Tracker — Frontend Implementation Plan

**Product:** Loonkoo Dairy Farm Tracker (DFT)  
**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4  
**Workspace:** [`dft-frontend/`](.)  
**API:** Django DRF backend — see [`../dft_backend/IMPLEMENTATION_PLAN.md`](../dft_backend/IMPLEMENTATION_PLAN.md)

This document is the actionable frontend blueprint. Build pages and data hooks in lockstep with backend phases so each milestone is demoable end-to-end.

**Deployment model:** One dairy farm per installation. No multi-farm switcher.  
**App roles:** Farm Owner, Worker, Veterinarian.  
**Not an app role:** Django superuser (uses Django Admin only — no special frontend “Admin” role).

---

## 1. Goals and scope

### In scope

- Responsive, mobile-first UI for **Owner**, **Worker**, and **Veterinarian**
- JWT auth (register/login/refresh/logout/profile)
- Role-based nav, layouts, and route guards matching the module matrix
- Modules: dashboard, farm settings, cattle, milk, health, breeding, finance, alerts
- Charts for milk (and finance for Owner)
- English first; i18n stubs for Amharic / Afaan Oromo later

### Out of scope (v1)

- Machine learning UIs (milk yield prediction, disease prediction) — deferred
- Government Official role or government dashboard routes
- Custom Super Admin / System Admin UI role
- Multi-farm UI
- Native apps; payment UI

---

## 2. Roles and module access (UI)

Must match the backend matrix. Use this to drive **sidebar items**, **route guards**, and **button visibility**.

Legend: **F** = full UI · **R** = view only · **W** = limited write · **—** = hide route & nav

| Module / screen | Owner | Worker | Veterinarian |
|-----------------|:-----:|:------:|:------------:|
| **Dashboard** | F (all KPIs) | R (ops KPIs) | R (health KPIs) |
| **Farm profile** (`/settings` profile tab) | F | — (name in shell only) | — (name in shell only) |
| **Staff management** (workers & vets) | F | — | — |
| **Cattle** | F | R + limited W | R |
| **Milk** | F | F | R |
| **Health** | F | W basic logs + R | F |
| **Breeding** | F | W mating + R | R + W pregnancy notes |
| **Finance** | F | — | — |
| **Alerts** | F | Ops alerts | Health / breeding alerts |
| **Django Admin** | — | — | — |

### Nav by role (recommended)

**Owner:** Dashboard, Cattle, Milk, Health, Breeding, Finance, Alerts, Settings  

**Worker:** Dashboard, Cattle, Milk, Health, Breeding, Alerts  

**Veterinarian:** Dashboard, Cattle, Milk (read), Health, Breeding, Alerts  

---

## 3. Architecture overview

```
Browser
  │
  ▼
Next.js App Router
  ├── (auth)     login / register
  ├── (app)      shared shell; nav filtered by role
  └── middleware JWT + role redirects
  │
  ├── lib/api (Axios) + SWR
  └── AuthContext
  │
  ▼
Django /api/*
```

**State:** SWR for server data; `AuthProvider` for session; optional `useFarmProfile()` for singleton farm name. No farm switcher.

---

## 4. Project setup

### Dependencies

`axios`, `swr`, `chart.js` + `react-chartjs-2` (or `recharts`), `zod`, `clsx`/`tailwind-merge`, `date-fns`, `lucide-react`; Jest/RTL + Cypress later.

### Env

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 5. Folder structure

```
dft-frontend/
  IMPLEMENTATION_PLAN.md
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
      (auth)/
        login/page.tsx
        register/page.tsx
      (app)/
        layout.tsx                 # shell; filter nav by role
        dashboard/page.tsx
        cattle/...
        milk/...
        health/
          page.tsx
          vaccinations/page.tsx
        breeding/page.tsx
        finance/page.tsx           # Owner-only guard
        alerts/page.tsx
        settings/page.tsx          # Owner-only: farm profile + staff
    components/
      ui/
      layout/                      # AppShell, Sidebar (role-aware), Topbar
      cattle/ milk/ health/ breeding/ finance/ alerts/ auth/ settings/
    contexts/
      AuthContext.tsx
    hooks/
      useAuth.ts
      useFarmProfile.ts
      useStaff.ts
      useCattle.ts useMilk.ts useHealth.ts useBreeding.ts
      useFinance.ts useAlerts.ts
      useCanAccess.ts              # role × module helper
    lib/
      api/
        client.ts auth.ts farm.ts staff.ts
        cattle.ts milk.ts health.ts breeding.ts
        finance.ts alerts.ts
      auth/
        token.ts
        roles.ts                   # OWNER | WORKER | VETERINARIAN
        access.ts                  # module access map (mirror backend)
      utils/
    types/
      api.ts models.ts roles.ts
    middleware.ts
    messages/                      # en / am / om stubs
```

No `(government)/` route group.

---

## 6. Auth and RBAC routing

### Roles

```ts
type Role = 'OWNER' | 'WORKER' | 'VETERINARIAN';
```

Centralize access in `lib/auth/access.ts`:

```ts
const MODULE_ACCESS = {
  dashboard: ['OWNER', 'WORKER', 'VETERINARIAN'],
  cattle: ['OWNER', 'WORKER', 'VETERINARIAN'],
  milk: ['OWNER', 'WORKER', 'VETERINARIAN'], // write: Owner, Worker
  health: ['OWNER', 'WORKER', 'VETERINARIAN'],
  breeding: ['OWNER', 'WORKER', 'VETERINARIAN'],
  finance: ['OWNER'],
  settings: ['OWNER'],
  alerts: ['OWNER', 'WORKER', 'VETERINARIAN'],
} as const;
```

### Middleware

- Unauthenticated → `/login`
- `WORKER` or `VETERINARIAN` hitting `/finance` or `/settings` → `/dashboard`
- No government redirects

### Post-login landing

| Role | Landing |
|------|---------|
| OWNER | `/dashboard` |
| WORKER | `/dashboard` |
| VETERINARIAN | `/dashboard` (health-oriented widgets) |

---

## 7. Page inventory

### Auth

| Route | Purpose |
|-------|---------|
| `/` | Redirect if session |
| `/login` | Credentials |
| `/register` | First Owner + farm name bootstrap |

### App (role-gated)

| Route | Owner | Worker | Veterinarian |
|-------|:-----:|:------:|:------------:|
| `/dashboard` | Y | Y | Y (health focus) |
| `/cattle`, `/cattle/[id]`, `/cattle/new` | Y | Y (limited new) | Y (no new / read detail) |
| `/milk`, `/milk/new` | Y | Y | Y read `/milk` only |
| `/health`, `/health/vaccinations` | Y | Y | Y |
| `/breeding` | Y | Y | Y |
| `/finance` | Y | — | — |
| `/alerts` | Y | Y | Y |
| `/settings` | Y | — | — |

Shell shows farm name from `GET /api/farm/` for all roles.

---

## 8. Data layer

- Axios + JWT interceptors; no `?farm=` / `X-Farm-Id`
- SWR keys: `['cattle', query]` — no farm id
- Types: `User`, `Farm`, `Cattle`, … — no `FarmMembership`, no `GOVERNMENT`/`ADMIN` role
- Staff API for Owner settings page

---

## 9. UI system

- Farm-oriented CSS variables (deep green / soil — avoid generic purple / cream-terracotta clichés)
- Distinctive fonts via `next/font`
- Mobile-first; large touch targets
- Charts: milk trends for Owner/Worker; finance charts Owner only; Vet dashboard may show vaccination/treatment charts

---

## 10. Implementation phases

### Phase 0 — Foundation

- [ ] Deps, Axios, AuthContext, login/register  
- [ ] `access.ts` module map  
- [ ] Shell with role-filtered nav  
- [ ] Middleware guards for finance/settings  

### Phase 1 — Core UI

- [ ] Dashboard variants per role  
- [ ] Settings (Owner): farm profile + invite Worker/Veterinarian  
- [ ] Cattle, Milk, Health, Breeding, Alerts, Finance (Owner)  
- [ ] Hide write controls Vet should not have (e.g. milk new, finance)  

### Phase 2 — Charts and alerts polish

- [ ] Milk trend charts; finance charts (Owner)  
- [ ] Alerts inbox UX + badge  

### Phase 3 — Polish

- [ ] Empty/error/loading consistency  
- [ ] Zod validation  
- [ ] Jest role-guard tests; Cypress per role  

### Phase 4 — Hardening

- [ ] Bundle split, optional PWA, i18n stubs  

---

## 11. UX notes by role

### Owner

Full nav; Settings for profile + staff; primary CTA “Log today’s milk”; finance visible.

### Worker

No Finance / Settings; large forms for milk and basic health; cattle mostly view.

### Veterinarian

Health-first dashboard; full vaccination/treatment flows; cattle and milk read-only; breeding pregnancy notes; no finance or staff invites.

---

## 12. Testing strategy

**Critical cases**

1. Worker nav omits Finance and Settings  
2. Veterinarian nav omits Finance and Settings; Milk has no “Add”  
3. Owner sees all modules  
4. Direct URL `/finance` as Vet → redirect  
5. Expired token → `/login`  

---

## 13. API contract checklist

- [ ] Roles: `OWNER` | `WORKER` | `VETERINARIAN` only  
- [ ] No government or ML endpoints  
- [ ] Staff invite accepts `role: WORKER | VETERINARIAN`  
- [ ] Pagination + DRF errors  
- [ ] Singleton `/api/farm/`  
- [ ] Module permissions match backend matrix  

---

## 14. Definition of done (frontend v1)

1. Three roles log in and see correct nav/modules  
2. Owner/Worker/Vet happy paths work on mobile widths  
3. Finance and Settings Owner-only  
4. No government, custom admin, or ML UI  
5. Env-driven API base URL  

---

## 15. Build order

1. UI kit + auth + `access.ts`  
2. Role-aware shell + dashboard  
3. Settings (staff) → Cattle → Milk → Health → Breeding → Alerts → Finance  
4. Charts + alerts polish  
5. Tests and polish  
