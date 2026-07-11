# Developer Guide — Diamond Sports Academy Prototype

> **Audience:** Developers building on, maintaining, or migrating this codebase. For end-user documentation see [`USER_GUIDE.md`](./USER_GUIDE.md). For entity types and field definitions see [`DATA_MODEL.md`](./DATA_MODEL.md). For business rules and test scenarios see [`REQUIREMENTS_AND_VALIDATIONS.md`](./REQUIREMENTS_AND_VALIDATIONS.md).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Stack & Dependencies](#2-stack--dependencies)
3. [Local Development Environment Setup](#3-local-development-environment-setup)
4. [Dev Commands Reference](#4-dev-commands-reference)
5. [Development Tools & AI Workflow](#5-development-tools--ai-workflow)
6. [Repository Structure](#6-repository-structure)
7. [Data Architecture](#7-data-architecture)
   - 7.1 [Zustand Store](#71-zustand-store)
   - 7.2 [DataService Interface](#72-dataservice-interface)
   - 7.3 [MockDataService](#73-mockdataservice)
   - 7.4 [Seed Data](#74-seed-data)
   - 7.5 [Reading vs Writing Data in Components](#75-reading-vs-writing-data-in-components)
8. [Authentication & Middleware](#8-authentication--middleware)
9. [Public Routes — All Pages](#9-public-routes--all-pages)
10. [Component Library](#10-component-library)
11. [Booking Wizard — Technical Detail](#11-booking-wizard--technical-detail)
12. [Manage Booking Page](#12-manage-booking-page)
13. [Admin Panel — Page-by-Page](#13-admin-panel--page-by-page)
14. [Notifications System](#14-notifications-system)
15. [Brand & Styling System](#15-brand--styling-system)
16. [Images](#16-images)
17. [Deployment — Cloudflare Pages](#17-deployment--cloudflare-pages)
18. [Terminology Glossary](#18-terminology-glossary)
19. [Known Limitations & Gaps](#19-known-limitations--gaps)
20. [How to Extend the App](#20-how-to-extend-the-app)
21. [Migrating to a Real Database](#21-migrating-to-a-real-database)

---

## 1. Project Overview

This is a **Next.js 14 (App Router) prototype** redesigning the website for The Diamond Sports Academy — an elite baseball training facility in Odenton, MD. It serves as both the public marketing site and a full internal admin panel.

**What is prototype means:** All data is in-memory (Zustand + localStorage). There is no real database, no email/SMS sending, and no payment processing. The prototype validates the full product experience and data model before connecting a real backend (NeonDB/PostgreSQL is the planned target).

**Two audiences, one app:**
- **Public** — athletes and families browse the marketing site, book sessions online, and self-manage bookings via a unique link
- **Admin** — DSA staff manage all bookings, customers, instructors, availability, schedule, and settings through a protected admin panel

---

## 2. Stack & Dependencies

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14, App Router | `src/app/` directory structure |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS v3 | + custom classes in `globals.css` |
| State | Zustand (`zustand`) | `persist` middleware, localStorage |
| Fonts | `next/font/google` | Inter (body) + Figtree |
| Icons | `lucide-react` | Admin panel only |
| Utilities | `clsx`, `date-fns` | `clsx` for class merging; `date-fns` for date math |
| Images | `next/image` | `unoptimized: true` for static export |
| Deployment | Cloudflare Pages | Static export (`output: 'export'` in prod) |

**No test suite exists.** Testing is manual, documented in [`REQUIREMENTS_AND_VALIDATIONS.md`](./REQUIREMENTS_AND_VALIDATIONS.md) §16.

---

## 3. Local Development Environment Setup

This section walks a new developer through getting the project running from scratch on a Mac (the primary development machine). The steps translate directly to Windows/Linux with minor path differences.

### Prerequisites

| Tool | Minimum version | How to check | Install |
|---|---|---|---|
| **Node.js** | v18+ (v25 used in development) | `node --version` | [nodejs.org](https://nodejs.org) or `nvm` |
| **npm** | v9+ (v11 used in development) | `npm --version` | Bundled with Node.js |
| **Git** | Any recent version | `git --version` | [git-scm.com](https://git-scm.com) |

No database, no Docker, no external services, no `.env` file needed. The prototype is entirely self-contained — all state lives in the browser's localStorage.

### Step 1 — Clone the Repository

```bash
git clone <repository-url> dsa-wp-modern-prototype
cd dsa-wp-modern-prototype
```

### Step 2 — Install Dependencies

```bash
npm install
```

This installs all production and dev dependencies defined in `package.json`. The install takes roughly 30–60 seconds on first run. No post-install scripts or additional configuration are required.

**Key packages installed:**

| Package | Version | Purpose |
|---|---|---|
| `next` | ^15.5.2 | Framework (App Router) |
| `react` / `react-dom` | ^18 | UI library |
| `zustand` | ^5.0.14 | Client-side state management |
| `tailwindcss` | ^3.4.1 | Utility CSS framework |
| `typescript` | ^5 | Type checking |
| `lucide-react` | ^1.14.0 | Icons (admin panel only) |
| `clsx` | ^2.1.1 | Conditional className merging |
| `date-fns` | ^4.1.0 | Date arithmetic utilities |
| `jspdf` | ^4.2.1 | PDF generation (schedule export) |
| `html2canvas` | ^1.4.1 | DOM-to-canvas (used with jsPDF) |
| `@cloudflare/next-on-pages` | ^1.13.16 | Cloudflare Pages adapter |
| `wrangler` | ^4.90.0 | Cloudflare CLI (deploy only) |

### Step 3 — Start the Dev Server

```bash
npm run dev
```

Open **http://localhost:4000** in your browser. The server runs on port 4000 (not Next.js's default 3000) — this is set via the `-p 4000` flag in the `dev` script in `package.json`.

You should see the DSA home page. Hot Module Replacement (HMR) is active — most edits to `src/` are reflected in the browser within 1–2 seconds without a full page reload.

### Step 4 — Verify the Admin Panel

1. Go to **http://localhost:4000/admin/login**
2. Log in with username `admin`, password `diamond123`
3. You should land on the Today's Schedule dashboard

### Step 5 — Verify the Booking Wizard

1. Go to **http://localhost:4000/book**
2. Select a coach → pick a date with a teal dot → select a slot → complete Step 4 → confirm
3. Go to the admin Bookings page and verify the booking appears

### Resetting Data

All prototype data lives in the browser's `localStorage` under the key `dsa-app-store`. To wipe all session data and restore to the seed state:

**Option A — DevTools:**
1. Open DevTools (`Cmd+Option+I` on Mac, `F12` on Windows)
2. Go to **Application** → **Local Storage** → `http://localhost:4000`
3. Delete the `dsa-app-store` key
4. Reload the page

**Option B — Browser console:**
```js
localStorage.removeItem('dsa-app-store');
location.reload();
```

Data resets to the seed state: 4 instructors, 4 blackouts relative to today, 10 weeks of availability, no bookings, no customers.

### Common Issues

| Issue | Likely cause | Fix |
|---|---|---|
| Port 4000 already in use | Another process (or a previous dev server) | `lsof -i :4000` to find the process, `kill <PID>`, then re-run `npm run dev` |
| `Module not found` errors | Missing `npm install` or stale `.next` cache | Delete `.next/` and run `npm install` again |
| Admin panel redirects to login immediately | Cookie not set or expired | Log in again at `/admin/login` |
| Booking wizard shows no instructors | localStorage has no instructors (corrupt state) | Reset data as described above |
| Store hydration mismatch warning in console | Normal during development — server renders empty state, client hydrates from localStorage after mount | Can be ignored in dev; does not occur in production static export |

---

## 4. Dev Commands Reference

```bash
# Start development server on http://localhost:4000
npm run dev

# Type-check and build for production (outputs to /out)
npm run build

# Run ESLint across all src/ files
npm run lint

# Build Cloudflare Pages-compatible output (runs after npm run build)
npm run pages:build

# Full deploy pipeline: build → pages:build → wrangler deploy
npm run deploy
```

**Deployment note:** `npm run deploy` requires a Cloudflare account with `wrangler` authenticated (`wrangler login`). For local development, only `npm run dev` is needed.

---

## 5. Development Tools & AI Workflow

This section documents every tool used to design, build, test, and deploy the prototype. A new developer joining the project should install or have access to these.

### Core Development Environment

| Tool | Version used | Role |
|---|---|---|
| **macOS** | Sequoia 15.x | Primary development OS |
| **Node.js** | v25.8.1 | JavaScript runtime |
| **npm** | v11.11.0 | Package manager |
| **Git** | Latest | Version control |
| **VS Code** | Latest | Primary code editor (see extensions below) |

### VS Code Extensions (Recommended)

These extensions were used during development and make working with this codebase significantly easier:

| Extension | Purpose |
|---|---|
| **ESLint** (`dbaeumer.vscode-eslint`) | Inline lint errors and auto-fix on save |
| **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) | Autocomplete for Tailwind classes, hover previews of CSS values |
| **TypeScript + JavaScript** (built-in) | TypeScript language support, type-checking in editor |
| **Prettier** (`esbenp.prettier-vscode`) | Code formatting on save |
| **PostCSS Language Support** (`csstools.postcss`) | Syntax highlighting for `globals.css` PostCSS directives |
| **Auto Rename Tag** (`formulahendry.auto-rename-tag`) | Automatically renames paired JSX tags |
| **Path Intellisense** (`christian-kohler.path-intellisense`) | Autocomplete for file path imports |

### Browser DevTools

Chrome or Edge DevTools were used throughout development for:

- **Application → Local Storage** — inspecting and resetting the `dsa-app-store` Zustand state
- **Console** — reading store state: `JSON.parse(localStorage.getItem('dsa-app-store'))` to inspect the full state tree
- **Network tab** — verifying the login API cookie is set correctly (`admin_session=authenticated`)
- **Responsive mode** — testing mobile layout at 375px and 768px breakpoints

### AI-Assisted Development — Claude Code

The entire prototype was built using **Claude Code** (Anthropic's AI coding assistant, `claude-sonnet` model) as the primary development partner. Claude Code was used for:

- **Feature implementation** — all components, pages, business logic, and data layer were implemented through iterative prompting sessions in Claude Code
- **Bug fixing** — identifying and resolving logic errors in slot conflict detection, recurring series validation, blackout date filtering, lane capacity checks, and notification routing
- **Refactoring** — migrating from static mock data to the Zustand + DataService reactive layer; renaming the "child booking" concept to "Another Athlete" throughout the UI
- **Testing** — designing and running the full manual test suite documented in `REQUIREMENTS_AND_VALIDATIONS.md` (44 scenarios across Groups A–E, W, N, X, and E2E)
- **Documentation** — generating all files in the `docs/` folder including this guide, `USER_GUIDE.md`, `DATA_MODEL.md`, `REQUIREMENTS_AND_VALIDATIONS.md`, and the interactive `er_diagram.html`
- **Architecture decisions** — the `DataService` / `MockDataService` interface pattern, the `skipHydration` Zustand approach, the `notifyBoth()` notification utility, and the single-file DB swap strategy for the NeonDB migration

Claude Code was run inside **Claude.ai** (web) and the **Claude desktop app**, with the project directory open as the working context. Every session began by reading `CLAUDE.md` and relevant documentation files to re-establish context.

**How to work with Claude Code on this project:**

The project has a `CLAUDE.md` file at the root that Claude Code automatically reads at the start of every session. It contains brand colors, file structure, stack summary, and coding conventions. Keep `CLAUDE.md` up to date as the project evolves — it is the primary context handoff between sessions.

When starting a new session on a specific feature or bug, provide Claude Code with:
1. The relevant source file(s) to read
2. The specific behavior you want to change or the bug you observed
3. A reference to the relevant section in `REQUIREMENTS_AND_VALIDATIONS.md` if applicable

### Design & Planning

| Tool | Purpose |
|---|---|
| **Google Docs / Word** | Original business requirements (`DSA_Business_Requirements_v6.docx`) |
| **Excel / CSV** | Manual test plan (`Manual_Test_Plan.xlsx`, `Manual_Test_Plan.csv`) |
| **Markdown** | All documentation in `docs/` — readable in VS Code, GitHub, and any Markdown viewer |
| **HTML + vanilla JS** | Interactive ER diagram (`docs/er_diagram.html`) — self-contained, no dependencies |

### Deployment & Hosting

| Tool | Purpose |
|---|---|
| **Cloudflare Pages** | Hosting platform for the static export |
| **Wrangler CLI** (`wrangler` v4.90.0) | Cloudflare's CLI tool for deploying to Pages |
| **`@cloudflare/next-on-pages`** | Adapter that transforms Next.js App Router output into a Cloudflare Pages-compatible format |

**Deploy flow:**
```
npm run build          # Next.js static export → /out
npm run pages:build    # @cloudflare/next-on-pages adapts /out for Cloudflare
wrangler pages deploy  # Pushes to Cloudflare Pages
```

### Version Control & Branching

**Git** is used for version control. The branching convention followed during development:

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Never commit directly — merge from `develop` only. |
| `develop` | Integration branch. Features merge here first. |
| `feature/<name>` | Individual feature branches. Branch from `develop`, PR back to `develop`. |

Example: the current work lives on `feature/addInMemoryDbForDynamicMockData` before merging to `develop`.

---

## 6. Repository Structure

```
/
├── docs/                         ← All documentation
│   ├── DATA_MODEL.md             ← Entity types, fields, business rules
│   ├── DEVELOPER_GUIDE.md        ← This file
│   ├── USER_GUIDE.md             ← End-user guide (public + admin)
│   ├── REQUIREMENTS_AND_VALIDATIONS.md  ← Business rules + test scenarios
│   ├── er_diagram.html           ← Interactive ER diagram
│   └── DSA_Business_Requirements_v6.docx
├── public/
│   └── images/                   ← All .webp and .png assets
├── src/
│   ├── app/                      ← Next.js App Router pages
│   │   ├── layout.tsx            ← Root layout (Header + Footer)
│   │   ├── page.tsx              ← Home page
│   │   ├── globals.css           ← Custom CSS + CSS variables
│   │   ├── api/admin/auth/route.ts  ← Login/logout API (only API route)
│   │   ├── admin/                ← Admin panel (middleware-protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          ← Dashboard (Today's Schedule)
│   │   │   ├── login/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── instructors/page.tsx
│   │   │   ├── waitlist/page.tsx
│   │   │   ├── schedule/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── book/page.tsx         ← 5-step booking wizard
│   │   ├── manage/[ref]/page.tsx ← Booking self-service (cancel/reschedule)
│   │   └── [service]/page.tsx    ← All service/marketing pages (catch-all)
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ServicePageLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminContentArea.tsx
│   │   ├── StoreHydration.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CtaBanner.tsx
│   │   ├── InlineContactForm.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── data/
│   │   ├── types.ts              ← All entity TypeScript types (source of truth)
│   │   ├── siteConfig.ts         ← Static facility constants
│   │   ├── mock/                 ← Seed data generators (read-only)
│   │   │   ├── bookings.ts
│   │   │   ├── customers.ts
│   │   │   ├── instructors.ts
│   │   │   ├── schedule.ts
│   │   │   └── notifications.ts
│   │   ├── service/
│   │   │   ├── DataService.ts    ← Interface (the only contract the app uses)
│   │   │   ├── MockDataService.ts ← In-memory implementation
│   │   │   ├── index.ts          ← Exports `db` singleton
│   │   │   └── notifyUtils.ts    ← notifyBoth() helper
│   │   └── store/
│   │       └── useAppStore.ts    ← Zustand store (seed data + set* actions)
│   └── middleware.ts             ← Protects /admin/* routes
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 7. Data Architecture

### 7.1 Zustand Store

The store is defined in [`src/data/store/useAppStore.ts`](../src/data/store/useAppStore.ts) and is the **single source of truth for all reactive UI state**.

```ts
// Store key in localStorage:
"dsa-app-store"

// Current version:
version: 10
```

**Store shape (`AppState`):**

```ts
{
  // Data arrays (reactive — components re-render when these change)
  customers:        Customer[]
  instructors:      Instructor[]
  bookings:         Booking[]
  operatingHours:   OperatingHours[]
  blackouts:        Blackout[]
  availability:     InstructorAvailability[]
  notifications:    NotificationRecord[]
  facilitySettings: FacilitySettings

  // Setters (used by MockDataService after every write)
  setCustomers(customers: Customer[]): void
  setInstructors(instructors: Instructor[]): void
  setBookings(bookings: Booking[]): void
  setOperatingHours(hours: OperatingHours[]): void
  setBlackouts(blackouts: Blackout[]): void
  setAvailability(availability: InstructorAvailability[]): void
  setNotifications(notifications: NotificationRecord[]): void
  setFacilitySettings(settings: FacilitySettings): void
}
```

**Persistence config:**
- All slices are persisted (`partialize` includes everything)
- `skipHydration: true` — the store does NOT auto-hydrate from localStorage on mount; hydration is triggered manually by `<StoreHydration />` inside `useEffect`
- **Why `skipHydration`?** Without it, server-rendered HTML is seeded with empty state (store initializes server-side), then the client hydrates with localStorage data, causing a React hydration mismatch. With `skipHydration`, the server and initial client render both show empty state; after mount, `StoreHydration` calls `rehydrate()` and React re-renders with actual data.

**Version migration:** When the `version` number is bumped, `migrate()` wipes the old persisted state and re-seeds from scratch. This is the intentional behavior — it's simpler than writing field-level migrations for prototype data.

**Seed data at startup** (from `useAppStore.ts`):

| Slice | Seed value |
|---|---|
| `customers` | `[]` (empty — populated by bookings) |
| `instructors` | 4 instructors: Chris Ford, Coach Megan, Syeed Mahdi, Connor Hax |
| `bookings` | `[]` (empty — created by booking wizard) |
| `operatingHours` | Mon–Fri 06:00–24:00, Sat 09:00–17:00, Sun closed |
| `blackouts` | 4 generated blackouts at ~+4, +10, +16, +25 working days from today |
| `availability` | Generated from `AVAILABILITY_PATTERNS` for 10 weeks (Mon–Sat) |
| `notifications` | `[]` |
| `facilitySettings` | Hard-coded DSA values |

### 7.2 DataService Interface

[`src/data/service/DataService.ts`](../src/data/service/DataService.ts) defines the **only interface the app ever imports for data operations**. Components never reach into the store or mock files directly for writes.

```ts
interface DataService {
  // Customers
  getCustomers(): Customer[]
  getCustomerById(id: string): Customer | undefined
  createCustomer(data: NewCustomer): Customer
  updateCustomer(id: string, patch: Partial<Customer>): Customer

  // Instructors
  getInstructors(): Instructor[]
  getInstructorById(id: string): Instructor | undefined
  createInstructor(data: NewInstructor): Instructor
  updateInstructor(id: string, patch: Partial<Instructor>): Instructor
  deleteInstructor(id: string): void

  // Bookings
  getBookings(filters?: BookingFilters): Booking[]
  getBookingByRef(ref: string): Booking | undefined
  getBookingByCancellationToken(token: string): Booking | undefined
  createBooking(data: NewBooking): Booking
  updateBooking(id: string, patch: Partial<Booking>): Booking
  cancelBooking(id: string, by: "customer" | "admin", reason?: string): Booking
  cancelSeries(seriesId: string, fromDate: string, by: "customer" | "admin", reason?: string): Booking[]
  confirmWaitlisted(id: string): Booking

  // Operating Hours
  getOperatingHours(): OperatingHours[]
  updateOperatingHours(id: string, patch: Partial<OperatingHours>): OperatingHours

  // Blackouts
  getBlackouts(): Blackout[]
  createBlackout(data: NewBlackout): Blackout
  deleteBlackout(id: string): void

  // Instructor Availability
  getAvailability(filters?: { instructorId?: string; date?: string }): InstructorAvailability[]
  upsertAvailability(instructorId: string, date: string, slots: string[], endTime: string): InstructorAvailability

  // Notifications
  getNotifications(): NotificationRecord[]
  createNotification(data: NewNotification): NotificationRecord
  updateNotificationStatus(id: string, status: NotificationRecord["deliveryStatus"]): NotificationRecord

  // Facility Settings
  getFacilitySettings(): FacilitySettings
  updateFacilitySettings(patch: Partial<FacilitySettings>): FacilitySettings
}
```

**The singleton:** `src/data/service/index.ts` exports a single `db` constant:

```ts
export const db: DataService = new MockDataService();
```

All pages and components import `db` from this path. Swapping to a real DB implementation requires only changing this one file.

### 7.3 MockDataService

[`src/data/service/MockDataService.ts`](../src/data/service/MockDataService.ts) implements `DataService` against the Zustand store.

**Pattern for every write method:**

```ts
createCustomer(data: NewCustomer): Customer {
  const store = useAppStore.getState();
  const newCustomer: Customer = { id: generateId(), ...data };
  store.setCustomers([...store.customers, newCustomer]);
  return newCustomer;
}
```

Every write:
1. Calls `useAppStore.getState()` to get the current state snapshot
2. Produces the new immutable array/object
3. Calls the appropriate `set*` action to push it back into the store
4. Returns the created/updated entity

**Key business logic in MockDataService:**

- `createBooking`: generates `bookingReference` (`DSA-YYYY-NNNNN`), `cancellationToken` (UUID), assigns `laneAssigned` (1–`activeLanes` for lane instructors, `null` for non-lane), sets `endTime` from `startTime + durationMinutes`
- `cancelSeries`: cancels all bookings with matching `recurringSeriesId` AND `date >= fromDate` AND status in `["confirmed", "waitlisted"]` (skips already-cancelled)
- `confirmWaitlisted`: sets `status = "confirmed"`, clears `conflictReason`
- `createCustomer`: email deduplication is handled at call-site (booking wizard looks up existing customer by email before calling `createCustomer`)

### 7.4 Seed Data

Seed data generators live in `src/data/mock/` but are **only used by `useAppStore.ts`** to populate initial store state. They are never imported by pages or components directly.

| File | What it generates |
|---|---|
| `bookings.ts` | Not used for seeding (bookings start empty in the store) |
| `customers.ts` | Not used for seeding (customers start empty) |
| `instructors.ts` | Not used (instructors seeded inline in `useAppStore.ts`) |
| `schedule.ts` | Not used (operating hours and blackouts seeded inline) |
| `notifications.ts` | Not used |

> **Historical note:** These mock files were the original static data layer before the Zustand reactive layer was built. They remain as reference implementations and for use in testing scenarios, but the live app does not read from them.
>
> **Note:** `waitlist.ts` was removed. The `WaitlistEntry` type and separate waitlist queue were replaced — waitlisted sessions are now `Booking` records with `status: "waitlisted"`.

**Blackout seed dates** are generated dynamically relative to today using `addWorkdays()`. This means blackouts always appear ~4, 10, 16, and 25 working days into the future regardless of when the app is loaded. One blackout (`bl-seed-4`) has `isRecurring: true`.

**Availability seed data** is generated from `AVAILABILITY_PATTERNS` — a per-instructor array of 60 entries (Mon–Sat × 10 weeks), each entry being `[startTime, endTime]` or `null`. The anchor is the Monday of the current week, so the availability window rolls forward each week.

### 7.5 Reading vs Writing Data in Components

**Rule: use `useAppStore` for rendering; use `db.*` for writes and one-shot reads in event handlers.**

```tsx
// ✅ CORRECT — reactive read drives re-render
const bookings = useAppStore(s => s.bookings);

// ✅ CORRECT — write via db, which calls set* to update store
function handleCancel(id: string) {
  db.cancelBooking(id, "admin");
  // Store updates automatically → component re-renders
}

// ❌ WRONG — getState() is not reactive, component won't re-render
const bookings = useAppStore.getState().bookings;
```

The `db.get*` methods read from the store via `useAppStore.getState()` and are fine in event handlers and server-init contexts. For any value that drives rendered output, subscribe via the hook selector.

---

## 8. Authentication & Middleware

### Middleware

[`src/middleware.ts`](../src/middleware.ts) runs on Cloudflare's edge before every request matching `/admin/:path*`.

```ts
export const config = { matcher: "/admin/:path*" };
```

Logic:
- `/admin/login` is always allowed through (no cookie check)
- All other `/admin/*` paths require the cookie `admin_session=authenticated`
- If missing, redirect to `/admin/login`

### Login Flow

1. User submits credentials to `POST /api/admin/auth`
2. Route handler (`src/app/api/admin/auth/route.ts`) validates against hardcoded `admin` / `diamond123`
3. On success: sets cookie `admin_session=authenticated; Path=/; HttpOnly; SameSite=Lax` and returns `{ ok: true }`
4. Login page receives `ok: true` and navigates via `window.location.href = "/admin"` (full page reload — required so the middleware receives the new cookie in the next request)

**Important:** `router.push("/admin")` does NOT trigger middleware on a client-side navigation in Next.js App Router. Always use `window.location.href` for post-login navigation.

### Logout

`POST /api/admin/auth` with `{ action: "logout" }` clears the cookie and redirects to `/admin/login`.

### Security Note

This is prototype-only authentication. Credentials (`adminUsername`, `adminPassword`) are stored in plaintext in `FacilitySettings` inside the Zustand store and validated client-side in the login page. The API route (`/api/admin/auth`) only sets the session cookie — it does not check credentials. In production:
- Move credentials to a dedicated `Admin` entity with bcrypt-hashed passwords
- Validate credentials server-side, not client-side
- Use a signed/encrypted session token, not a plain string cookie value
- Consider NextAuth.js or a dedicated auth service

---

## 9. Public Routes — All Pages

All public pages are server components unless they need interactivity (`"use client"`). The `[service]` catch-all handles all marketing/service pages.

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | Large self-contained home page |
| `/about-us` | `app/[service]/page.tsx` | Server | Rendered via `ServicePageLayout` |
| `/our-facility` | `app/[service]/page.tsx` | Server | |
| `/our-coaches` | `app/[service]/page.tsx` | Server | |
| `/recruits` | `app/[service]/page.tsx` | Server | Lists 4 recruit cards |
| `/recruits/jaxon-rivera` | `app/[service]/page.tsx` | Server | Individual recruit profile |
| `/recruits/isaiah-thompson` | `app/[service]/page.tsx` | Server | |
| `/recruits/mason-turner` | `app/[service]/page.tsx` | Server | |
| `/recruits/jacob-delgado` | `app/[service]/page.tsx` | Server | |
| `/our-alumni` | `app/[service]/page.tsx` | Server | |
| `/training` | `app/[service]/page.tsx` | Server | Training overview |
| `/camps` | `app/[service]/page.tsx` | Server | |
| `/clinics` | `app/[service]/page.tsx` | Server | |
| `/1-on-1-training` | `app/[service]/page.tsx` | Server | |
| `/speed-agility` | `app/[service]/page.tsx` | Server | |
| `/golf-simulator` | `app/[service]/page.tsx` | Server | |
| `/weight-training` | `app/[service]/page.tsx` | Server | |
| `/team-facility-rentals` | `app/[service]/page.tsx` | Server | |
| `/technology-tunnels` | `app/[service]/page.tsx` | Server | |
| `/memberships` | `app/[service]/page.tsx` | Server | |
| `/reviews` | `app/[service]/page.tsx` | Server | |
| `/frequently-asked-questions` | `app/[service]/page.tsx` | Server | |
| `/contact-us` | `app/[service]/page.tsx` | Server | |
| `/privacy` | `app/[service]/page.tsx` | Server | |
| `/book` | `app/book/page.tsx` | Client | 5-step booking wizard |
| `/manage/[ref]` | `app/manage/[ref]/page.tsx` | Client | Booking self-service |

### The `[service]` Catch-All

`app/[service]/page.tsx` is a single file that maps `params.service` to the appropriate content and renders it through `ServicePageLayout`. To add a new marketing page:

1. Add its slug as a key in the page's content map object
2. Add the `ServicePageLayout` props for that key
3. Add it to `generateStaticParams()` so Next.js pre-renders it

### ServicePageLayout Props

```tsx
<ServicePageLayout
  badge="Short Label"           // Required — top badge text
  headline="Red subheadline"    // Required — shown in red (#f33b41)
  heroBg="/images/hero.webp"    // Required — hero background image path
  heroAlt="Alt text"            // Required
  introParagraphs={[            // Required — ContentItem[] (string | string[])
    "Paragraph text",
    ["Bullet 1", "Bullet 2"],   // Array renders as <ul>
  ]}
  whyTitle="Why Choose DSA"     // Required
  whyParagraphs={["..."]}       // Required — ContentItem[]
  whoText="Who benefits"        // Required — single paragraph
  overviewTitle="Overview"      // Required
  overviewParagraphs={["..."]}  // Required — ContentItem[]
  closingTagline="CTA headline" // Required
  closingParagraph="CTA text"   // Required
  contentImage="/images/x.webp" // Optional — sidebar image
  contentImageAlt="Alt"         // Optional
  ctaLabel="Custom CTA text"    // Optional — defaults to "Book a Session"
  relatedLinks={[               // Optional — sidebar links
    { label: "Other Service", href: "/other" }
  ]}
/>
```

---

## 10. Component Library

### Header (`src/components/Header.tsx`)

- `"use client"` — manages scroll state and mobile drawer
- Transparent on load; gains a dark background after scrolling 60px (`scrolled` state)
- Nav structure defined in `NAV` array at the top of the file — dropdowns are nested `children` arrays
- Phone number read from Zustand: `useAppStore(s => s.facilitySettings)` — so it reflects admin Settings changes
- Mobile: hamburger opens a full-screen drawer with the same nav items
- **To add a nav item:** add an entry to the `NAV` array

### Footer (`src/components/Footer.tsx`)

- Server component
- 4 columns: Quick Links, Programs, Services, Contact
- Contact info (phone, address, hours) imported from `siteConfig.ts`
- Social links: Facebook and Instagram (hardcoded URLs)

### StoreHydration (`src/components/StoreHydration.tsx`)

- Renders `null` — no visible output
- Mounted in `app/layout.tsx`
- On mount calls `useAppStore.persist.rehydrate()` to load localStorage data into the store
- Required because `skipHydration: true` is set in the store config

### AdminSidebar (`src/components/AdminSidebar.tsx`)

- `"use client"` — active link detection uses `usePathname()`
- Nav items are an array at the top of the file — add new admin pages there
- Sign out calls `POST /api/admin/auth` with `action: "logout"`

### AdminContentArea (`src/components/AdminContentArea.tsx`)

- Wraps every admin page: renders `AdminSidebar` on the left, children on the right
- Used in `app/admin/layout.tsx`

### Modal (`src/components/Modal.tsx`)

- Generic accessible modal with a backdrop
- Props: `open`, `onClose`, `title`, `children`
- Used throughout the admin panel for detail dialogs, confirmations, and forms

### Toast (`src/components/Toast.tsx`)

- Transient notification strip (success/error)
- Controlled by parent state — no global toast manager exists
- Pattern: `const [toast, setToast] = useState<{msg:string; type:"success"|"error"} | null>(null)`

### InlineContactForm (`src/components/InlineContactForm.tsx`)

- Sidebar contact form used on service pages
- Posts to `/api/contact` which does **not exist** (prototype limitation — form submission silently fails in prod; in dev it 404s)

### Testimonials / CtaBanner

- Shared sections used across public pages
- Static content — no props needed for most use cases

---

## 11. Booking Wizard — Technical Detail

**File:** [`src/app/book/page.tsx`](../src/app/book/page.tsx) — `"use client"`

The wizard manages a single state object for the full 5-step form. Step progression is controlled by a `step` integer (1–5, plus 6 for the confirmation screen).

### State Shape

```ts
{
  // Step 1
  selectedInstructor: Instructor | null

  // Step 2
  selectedDate: string | null        // YYYY-MM-DD
  selectedTime: string | null        // HH:MM (24hr)
  duration: 30 | 60

  // Step 3 — session frequency
  isRecurring: boolean
  recurringWeeks: 2 | 4 | 6 | 8
  weeklyStatuses: WeeklyStatus[]     // per-week conflict classification

  // Step 4 — participant details
  isForAnotherAthlete: boolean       // stored internally as isForChild in Booking
  childFirstName: string
  childLastName: string
  childAge: string
  relationshipToChild: string
  firstName: string
  lastName: string
  email: string
  phone: string

  // Step 5
  joinWaitlist: boolean              // true if selected a waitlist slot in Step 2
}
```

### Step 1 — Instructor Selection

Reads `instructors` from `useAppStore(s => s.instructors)`. Filters to `isActive === true`. Renders instructor cards. On select, sets `selectedInstructor` and advances to step 2.

### Step 2 — Date & Time

**Calendar:** Reads `availability` from the store. For the selected instructor, finds all `InstructorAvailability` records where `date >= today`. Dates with at least one availability record show a teal dot and are selectable. All others are disabled.

**Blackout filtering:** Reads `blackouts` from the store. Both exact-date blackouts and recurring (MM-DD) blackouts disable dates in the calendar. Recurring check: `blackout.isRecurring && blackout.date.slice(5) === candidateDate.slice(5)`.

**Duration picker:** Shown before the time slot list. Changing duration re-filters available slots.

**Slot list:** For the selected date and instructor:
1. Get the `InstructorAvailability` record → `.slots` array (30-min interval strings)
2. Filter slots where `slot + duration` fits within the availability window (`slot + duration <= endTime`)
3. Filter out slots where the instructor already has a confirmed booking overlapping the time range (overlap: `slotStart < existingEnd && slotEnd > existingStart`)
4. Filter out past slots when `selectedDate === today`
5. For each remaining slot, count confirmed lane-instructor bookings at that exact time → if `count >= activeLanes`, slot is **waitlist** (amber); otherwise **available** (teal)

**Waitlist slots:** Customer can click a waitlist slot to enter the waitlist flow. `joinWaitlist` is set to `true`.

### Step 3 — Session Frequency

Single session or recurring series (2, 4, 6, or 8 weeks).

**Recurring validation (`WeeklyStatus`):**

```ts
type WeeklyStatus = {
  date: string
  status: "confirmed" | "waitlisted" | "hard_block"
  reason?: string
}
```

For each future week (week 0 = base date is always `confirmed`):
- **Hard blocks** (prevent series from proceeding):
  - `blackout` — date matches any blackout
  - `no_availability` — instructor has no availability record for that date, or the slot isn't in their slots
  - `slot_window` — session would extend past the instructor's `endTime`
- **Soft blocks** (series proceeds, week is `waitlisted`):
  - `instructor_conflict` — instructor has a confirmed overlapping booking

UI: any hard block → red error banner, Next disabled. Only waitlisted weeks (no hard blocks) → amber info banner, Next enabled.

### Step 4 — Participant Details

Toggle: **Myself** vs **Another Athlete** (what the UI labels it; internally the field is `isForChild` on the `Booking` entity).

Required fields for "Myself": first name, last name, email.
Required fields for "Another Athlete": athlete first name, athlete last name, athlete age, relationship, guardian first name, last name, email, phone.

Email lookup: after valid email is entered, the wizard looks up an existing customer by email (case-insensitive). If found, it re-uses that `customerId`. If not, a new customer is created at booking time.

**Blocked customers:** Before advancing to Step 5, the wizard checks if the found customer has `isFlagged === true` or `isActive === false`. If so, an error is shown and the customer cannot proceed. **Note:** This is a client-side check only — in production, the booking API must re-validate server-side (see §17 Known Limitations).

### Step 5 — Confirmation

Calls `db.createBooking(...)` for each session in the series. For recurring series with waitlisted weeks, each week is created individually with the appropriate `status`.

After creation, `notifyBoth(db, {...})` is called per booking to record notification records.

### Confirmation Screen (step 6)

Shows the booking reference(s), confirmation details, and for recurring series shows all created sessions with their status and individual manage links.

**Important URL detail:** The manage booking URL uses the **`cancellationToken`**, not the `bookingReference`. The booking reference is for human reference; the cancellation token is the URL path parameter used by `manage/[ref]/page.tsx` to look up the booking via `db.getBookingByCancellationToken(ref)`.

---

## 12. Manage Booking Page

**File:** [`src/app/manage/[ref]/page.tsx`](../src/app/manage/[ref]/page.tsx) — `"use client"`

The `[ref]` URL segment is the `cancellationToken` (UUID), not the booking reference number. The page calls `db.getBookingByCancellationToken(ref)` to look up the booking.

### Page States

| State | Condition | What renders |
|---|---|---|
| NotFound | Token not found, or booking is `completed`/`no_show`, or date is in the past | "Booking Not Found" screen |
| AlreadyCancelled | `status === "cancelled"` | Shows cancellation details, offer to re-book |
| Within24Hours | Session starts within 24h AND `status !== "waitlisted"` | Read-only view with phone number to call |
| Waitlisted | `status === "waitlisted"` | Amber badge, conflict reason, "Confirm This Session" button, series siblings panel |
| Confirmed | `status === "confirmed"` and future date, more than 24h away | Full detail with Reschedule and Cancel buttons |

**Reschedule flow on this page:** Identical slot-filtering logic as the booking wizard (same availability, blackout, conflict, lane-capacity checks). Duration is locked to the original booking's duration. Only the selected instructor's available dates are shown. On confirm, calls `db.updateBooking(id, { date, startTime, endTime })` and `notifyBoth` with type `"change"`.

**Cancel flow:** For recurring series, shows scope options (this session only / entire series). On confirm for a series, calls `db.cancelSeries(recurringSeriesId, date, "customer", reason)`. For a single session, calls `db.cancelBooking(id, "customer", reason)`. Then calls `notifyBoth` with type `"cancellation"`.

**Waitlisted confirm:** Calls `db.confirmWaitlisted(id)` then `notifyBoth` with type `"confirmation"`.

**`useSearchParams` requirement:** Because this page uses `useSearchParams()` (or dynamic params), it must be wrapped in a `<Suspense>` boundary for Cloudflare Pages static export compatibility. This is already in place.

---

## 13. Admin Panel — Page-by-Page

All admin pages are `"use client"` and read from the Zustand store for rendering.

### Dashboard — Today's Schedule (`/admin`)

**File:** `src/app/admin/page.tsx`

Reads `bookings` and `instructors` from the store. Filters bookings to `date === selectedDate` (default: today). Renders a time-grid with columns per instructor who has at least one booking that day.

Grid spans **6 AM to midnight** (36 slots × 30 min). `TIME_SLOTS` is built with `for (let h = 6; h < 24; h++)`. Each booking card is positioned absolutely using CSS `top` (calculated from `startTime` relative to `GRID_START_MINS = 360`) and `height` (from `durationMinutes`). Cards are color-coded per instructor.

PDF export uses the browser's `window.print()` with a print stylesheet, generating an A4 landscape PDF. Filename: `DSA-schedule-YYYY-MM-DD.pdf`.

### Bookings (`/admin/bookings`)

**File:** `src/app/admin/bookings/page.tsx`

Reads all bookings from the store. Tabs: **Upcoming** (`date >= today`) and **Past** (`date < today`).

Filters: instructor dropdown, status dropdown (confirmed, waitlisted, cancelled, no_show, completed), date range pickers. Applied client-side.

Clicking a row opens a `Modal` with full booking details. The modal shows a "Confirm Session" button for `status === "waitlisted"` bookings. Cancel and Reschedule actions call `db.cancelBooking` / `db.updateBooking` and then `notifyBoth`.

CSV export uses `Blob` + `URL.createObjectURL` to download the filtered bookings as CSV.

### Customers (`/admin/customers`)

**File:** `src/app/admin/customers/page.tsx`

Lists all customers. Each customer row opens a detail panel (not a modal — a right-hand slide-in panel). Actions: flag/unflag, deactivate/reactivate, edit fields, increment no-show/late-cancel counts.

**Increment handlers (`incrementNoShow`, `incrementLateCancel`):** Bump the respective counter by 1 via `db.updateCustomer()`. After each increment, auto-flagging is evaluated: if `noShowCount ≥ 2 OR lateCancellationCount ≥ 3` and the customer is not already flagged, `isFlagged` is set to `true` in the same write. The toast message distinguishes between a plain count update and an auto-flag event. `MockDataService.updateCustomer()` does not enforce this threshold itself — the logic lives in the page handlers.

**Deactivation side effect:** When a customer is deactivated, all their `confirmed` and `waitlisted` future bookings are cancelled (`cancelledBy: "admin"`) and a cancellation notification is generated per affected booking. This is implemented in the customer panel's deactivate handler (`futureActiveBookings` memo), not in the DataService method.

### Instructors (`/admin/instructors`)

**File:** `src/app/admin/instructors/page.tsx`

Two tabs (`PageTab = "instructors" | "slots"`):

**Tab 1 — Instructors:** Grid of instructor cards. "+ Add Instructor" opens a modal form. Required fields: first name, last name, email, phone, speciality, instructor type (Lane / Non-Lane). Email must be unique. Clicking "Availability" on a card switches to the Slots tab pre-loaded with that instructor.

**Tab 2 — Slots (Availability):** Instructor dropdown + month calendar. Each date card shows the current availability (from `useAppStore(s => s.availability)` filtered by instructor). Clicking a date opens an inline editor: toggle active, set start/end time.

The editor validates:
- Past dates are read-only
- Today: start time must be ≥ next 30-min interval
- End time must be > start time
- Blackout dates are non-editable (shown in red)
- Saturday times must fall within 09:00–17:00

On save: calls `db.upsertAvailability(instructorId, date, slots, endTime)`. The `slots` array is computed client-side from `start` to `end` in 30-min increments. **Both representations must stay in sync** — the `slots` array is used by the booking wizard; the `endTime` field is used by the admin calendar display.

"Apply to all active days" copies start/end to all other active, non-blackout, future dates in the same calendar month.


### Waitlist (`/admin/waitlist`)

**File:** `src/app/admin/waitlist/page.tsx`

Two types of waitlist entries are shown together:

1. **Lane Unavailable** — customer requested waitlist through the public wizard (all lanes were full). No booking exists yet in the system.
2. **Instructor Unavailable** — recurring series booking where a future week had an instructor conflict. A booking record exists with `status: "waitlisted"`.

Actions per type:

| Type | Action | What happens |
|---|---|---|
| Lane Unavailable | Promote | Creates a confirmed booking via `db.createBooking`, sends confirmation via `notifyBoth`, removes the waitlist entry |
| Instructor Unavailable | Confirm | Calls `db.confirmWaitlisted(bookingId)`, sends confirmation via `notifyBoth`, removes from waitlist view |
| Either | Remove | Lane Unavailable: deletes the waitlist record. Instructor Unavailable: calls `db.cancelBooking` |

Tabs: Upcoming (future dates) / Past (past dates, no actions available). Search filters by customer name.

### Academy Schedule (`/admin/schedule`)

**File:** `src/app/admin/schedule/page.tsx`

Two tabs:

**Tab 1 — Operating Hours:** Table of 7 days. Each row: closed toggle, open time, close time. On save, calls `db.updateOperatingHours(id, patch)` for each changed row. Conflict detection: if new hours would exclude existing confirmed future bookings, shows an "Affected Bookings" table before saving.

**Tab 2 — Blackout Dates:** Table of existing blackouts with delete buttons. "+ Add Blackout Date" form: date picker, reason, recurring toggle. On add, shows affected bookings preview. On confirm, calls `db.createBlackout(data)`.

**Blackout delete rule:** Removing a blackout simply makes the date bookable again — it does NOT auto-promote any waitlisted bookings on that date.

### Reports (`/admin/reports`)

**File:** `src/app/admin/reports/page.tsx`

**This page is pending a full redesign and should not be treated as a reference implementation.**

Current state: reads from `MOCK_BOOKINGS` and `MOCK_INSTRUCTORS` static imports (not the Zustand store), so it does not reflect any bookings created during the session. The metrics, charts, and session-type breakdowns shown are based on seed data only.

Do not add features to this page or document its current behavior. The entire Reports section will be replaced with a new design. Remove or replace this page's implementation when the redesign begins.

### Notifications (`/admin/notifications`)

**File:** `src/app/admin/notifications/page.tsx`

Reads `notifications` from `useAppStore(s => s.notifications)`. Shows the log in a table with filters (search, status, type). Retry button on failed/pending entries calls `db.updateNotificationStatus(id, "sent")`.

All notification records in the prototype have `deliveryStatus: "sent"` (they are recorded as sent at creation time since no real sending happens).

### Settings (`/admin/settings`)

**File:** `src/app/admin/settings/page.tsx`

Five tabs (`Tab = "general" | "lanes" | "notifications" | "cancellation" | "security"`):

- **General** — facility name, address, phone, email, website, timezone. Writes to `facilitySettings` via `db.updateFacilitySettings(patch)`. Changes immediately reflected in Header (phone), Footer, and store subscribers.
- **Lane Configuration** — `activeLanes` field (1–10). Conflict check: if reducing lanes would leave confirmed bookings on lanes above the new count, a conflict modal appears listing affected bookings. "Save Anyway" proceeds; "Cancel" dismisses without saving.
- **Notifications** — read-only reference showing which channels and events the system fires automatically. No toggles; notifications always fire unconditionally via `notifyBoth()`.
- **Cancellation Policy** — read-only reference showing the current cancellation rules enforced by the system.
- **Security** — change password form. Validates current password against `facilitySettings.adminPassword`; persists new password via `db.updateFacilitySettings({ adminPassword })`. Also shows the current `adminUsername` in the Admin Account card.

> **Note:** Operating Hours and Blackout Dates are managed in the **Academy Schedule** page (`/admin/schedule`), not in Settings.

---

## 14. Notifications System

### notifyBoth()

[`src/data/service/notifyUtils.ts`](../src/data/service/notifyUtils.ts) exports the single utility for creating notifications.

```ts
function notifyBoth(db: MockDataService, {
  bookingId,
  bookingReference,
  recipientName,
  recipientEmail,
  notificationType,
  customerId?,  // used to check smsOptOut
}): void
```

What it creates per call:

| Channel | Recipient | When |
|---|---|---|
| email | customer | Always |
| sms | customer | Always, UNLESS customer has `smsOptOut: true` |
| calendar | customer | ONLY when `notificationType === "confirmation"` |
| email | admin | Always |

### Notification Types

| `notificationType` | Trigger |
|---|---|
| `"confirmation"` | New confirmed booking, or waitlisted booking promoted to confirmed |
| `"waitlist"` | Booking created with `status: "waitlisted"` (instructor conflict in recurring series) |
| `"change"` | Booking rescheduled (by customer or admin) |
| `"cancellation"` | Booking cancelled (by customer, admin, or deactivation cascade) |
| `"reminder_24hr"` | 24h before session — **not automated; requires a scheduled job** |
| `"reminder_2hr_sms"` | 2h before session — **not automated; requires a scheduled job** |

### Where notifyBoth is Called

| Event | Called from |
|---|---|
| New confirmed booking (public wizard) | `book/page.tsx` after `db.createBooking` |
| New waitlisted booking (public wizard) | `book/page.tsx` after `db.createBooking` |
| Customer cancel (manage page) | `manage/[ref]/page.tsx` |
| Customer reschedule (manage page) | `manage/[ref]/page.tsx` |
| Admin cancel (bookings modal) | `admin/bookings/page.tsx` |
| Admin reschedule (bookings modal) | `admin/bookings/page.tsx` |
| Admin confirm waitlisted booking | `admin/bookings/page.tsx` |
| Admin promote waitlist entry | `admin/waitlist/page.tsx` |
| Customer deactivation cascade | `admin/customers/page.tsx` (per affected booking) |

### Reminders — Production Gap

24h and 2h reminders are recorded in the seed notification data (`src/data/mock/notifications.ts`) for demonstration purposes, but are not automated in the prototype. In production, these require a cron job or scheduled serverless function that:

1. Queries all confirmed bookings where `date = tomorrow` (for 24h reminder)
2. Queries confirmed bookings where `startTime` is 2h from now (for 2h SMS)
3. Creates notification records and sends via email/SMS provider

---

## 15. Brand & Styling System

### CSS Variables (defined in `src/app/globals.css`)

```css
--bs-primary:   #337C99   /* Teal — buttons, links, accents */
--bs-danger:    #b6070e   /* Red — CTAs, hero elements */
--bs-warning:   #f33b41   /* Bright red — Book button, service page headlines */
--bs-info:      #00141B   /* Dark navy — section backgrounds */
--bs-light:     #F7F7F7   /* Off-white — card backgrounds */
--bs-dark:      #131313   /* Near-black */
```

Body text: `#212529`
Muted text: `#6c757d`

### Usage Pattern

Brand colors are applied via **inline `style={{}}` props or Tailwind arbitrary values** — not via Tailwind config. This is intentional to avoid Tailwind config bloat and to keep colors explicit at the usage site.

```tsx
// ✅ Correct patterns
<button style={{ backgroundColor: "#337C99" }}>Book</button>
<h2 className="text-[#f33b41]">Headline</h2>

// ❌ Don't add to tailwind.config.ts
// colors: { primary: "#337C99" }  ← avoid this
```

### Custom CSS Classes

Key reusable classes in `globals.css`:

```css
.card          { background white, rounded-xl, shadow-sm, border }
.btn-primary   { teal background, white text, rounded }
.btn-danger    { red background, white text, rounded }
.input         { standard text input styling }
.badge-green   { small green pill badge }
.badge-gray    { small gray pill badge }
.badge-amber   { small amber pill badge }
```

### Fonts

Both fonts loaded via `next/font/google` in `app/layout.tsx`:
- `--font-inter` — Inter, used for body text
- `--font-figtree` — Figtree, used for headings

Applied as CSS variables on `:root`, then referenced in `globals.css` via `font-family: var(--font-inter)`.

### Max Content Width

- Public pages: `max-w-[1320px] mx-auto px-4 sm:px-6`
- Admin pages: `max-w-7xl` (some pages), or full-width within the admin layout

---

## 16. Images

All images live in `public/images/` as `.webp` or `.png`.

**Rules:**
- Always use `<Image>` from `next/image` — never `<img>`
- `next.config.mjs` has `unoptimized: true` (required for static export to Cloudflare Pages)
- Remote images from `thediamondsportsacademy.com/wp-content/uploads/**` are allowed via `remotePatterns`

```js
// next.config.mjs
images: {
  unoptimized: true,
  remotePatterns: [{
    protocol: "https",
    hostname: "thediamondsportsacademy.com",
    pathname: "/wp-content/uploads/**",
  }],
}
```

**Placeholder:** `/images/placeholder-diamond-team-member.webp` — used for instructor photos when no photo is available.

---

## 17. Deployment — Cloudflare Pages

The app deploys as a **static export** to Cloudflare Pages. The build output goes to `/out`.

### Key Constraints

**No persistent server process.** Cloudflare Pages serves static files. There is no Node.js server between requests. All state must live in the browser (Zustand + localStorage). This is why the in-memory mock layer cannot be server-side.

**Edge runtime required on dynamic routes.** Any route that uses `useSearchParams()`, dynamic params, or other runtime-only APIs needs:

```ts
export const runtime = "edge";
```

Without this, the build fails on Cloudflare's edge environment.

**`<Suspense>` required around `useSearchParams()`.** Next.js 14 requires any component calling `useSearchParams()` to be wrapped in a `<Suspense>` boundary. This is already applied to `manage/[ref]/page.tsx`.

**`generateStaticParams()` required.** For the `[service]` and `manage/[ref]` dynamic routes, `generateStaticParams()` must return all possible slugs so Next.js pre-renders them at build time:

```ts
export async function generateStaticParams() {
  return [
    { service: "about-us" },
    { service: "our-facility" },
    // ... all service slugs
  ];
}
```

### Build Command

```bash
npm run build
# Output: /out directory
# Deploy /out to Cloudflare Pages
```

### The Only API Route

`app/api/admin/auth/route.ts` is the only server-side route. It runs as a Cloudflare Worker (edge function) separate from the static files. It handles login and logout via cookie.

---

## 18. Terminology Glossary

This glossary exists because several terms changed during development and the UI labels differ from the internal field names.

| UI Label | Internal Field / Type | Notes |
|---|---|---|
| "Another Athlete" | `isForChild: true` on `Booking` | UI changed from "A Child" to "Another Athlete" but field names were not renamed |
| "Athlete" | `childName`, `childAge`, `childFirstName`, `childLastName` | The person being booked for when `isForChild = true` |
| "Booking contact" | Customer fields (`firstName`, `lastName`, `email`, `phone`) | The adult who made the booking; may or may not be the athlete |
| "Cancellation token" | `cancellationToken: string` on `Booking` | UUID used in the manage booking URL — different from `bookingReference` |
| "Booking reference" | `bookingReference: string` | Human-readable `DSA-YYYY-NNNNN` format — shown to customers, NOT used in URLs |
| "Lane instructor" | `type: "Lane Instructor"` / `instructor_type: "lane"` | Assigns a physical lane; counts against lane capacity |
| "Non-lane instructor" | `type: "Non-Lane Instructor"` / `instructor_type: "nonlane"` | No lane assigned; does not count against lane capacity |
| "Waitlisted booking" | `Booking` with `status: "waitlisted"` | A booking with a soft instructor conflict; admin can confirm it to move it to `confirmed` |
| "Confirm" | Waitlist action | Change a `waitlisted` Booking to `confirmed` |
| "Hard block" | `WeeklyStatus.status === "hard_block"` | Prevents a recurring series from proceeding entirely |
| "Soft block" | `WeeklyStatus.status === "waitlisted"` | Series proceeds; affected week created as a waitlisted booking |
| "Seed data" | Initial store state | Data generated when no localStorage exists (or version changes) |
| "db" | `DataService` singleton | Imported from `src/data/service/index.ts` for all reads and writes |

---

## 19. Known Limitations & Gaps

These are documented gaps between the prototype and a production-ready system. They are tracked primarily in [`REQUIREMENTS_AND_VALIDATIONS.md`](./REQUIREMENTS_AND_VALIDATIONS.md).

### Security Gaps

| Gap | Detail |
|---|---|
| Client-side-only booking validation | Flagged/inactive customer check is in the UI only. A real API must re-validate before persisting (rules C-03a, C-04a). |
| Client-side credential validation | `adminUsername` / `adminPassword` stored in plaintext in Zustand store; validated in the browser, not server-side. API route sets the cookie without re-checking. Must move to server-side bcrypt validation in production. |
| Plain cookie session value | Cookie value `"authenticated"` is a fixed string, not a signed token. |

### Data Gaps

| Gap | Detail |
|---|---|
| Reports reads static data | `admin/reports/page.tsx` reads from `MOCK_BOOKINGS`/`MOCK_INSTRUCTORS` static imports, not the live Zustand store. Session-created bookings do not appear in reports. |
| Reminder notifications not automated | `reminder_24hr` and `reminder_2hr_sms` notification types are seeded but not triggered automatically. Requires a scheduled job in production. |
| Contact form has no API | `/api/contact` does not exist. The inline contact form on service pages will 404 on submit. |
| No real email/SMS delivery | All notifications are recorded in the store but not sent. |
| No payment processing | The booking wizard has no payment step. |
| No real booking persistence | Bookings exist only in localStorage. Clearing browser storage loses all data. |

### UI Gaps

| Gap | Detail |
|---|---|
| Reports date filter | Only "All Time" and "May 2026" are available. Production needs a real date range picker. |
| Reports page pending redesign | `admin/reports/page.tsx` reads from static mock data, not the live store. The entire page will be replaced — do not extend it. |
| Lane display for non-lane instructors | Lane number must not appear in booking details for non-lane instructors (rule I-06). Verify this is enforced in all detail views. |

---

## 20. How to Extend the App

### Add a New Admin Page

1. Create `src/app/admin/your-page/page.tsx` with `"use client"` at the top
2. Add the route to `AdminSidebar.tsx` nav array
3. Read data from `useAppStore(s => s.yourEntity)` for reactive rendering
4. Write via `db.yourMethod()` which updates the store automatically

### Add a New Public Marketing Page

1. Add the slug and content to the content map in `src/app/[service]/page.tsx`
2. Add the slug to the `generateStaticParams()` return array in the same file
3. Add the nav link to `Header.tsx`'s `NAV` array if needed

### Add a New Entity Type

1. Define the TypeScript type in `src/data/types.ts`
2. Add the entity slice to `AppState` in `useAppStore.ts` (data array + setter)
3. Add CRUD methods to the `DataService` interface in `DataService.ts`
4. Implement those methods in `MockDataService.ts`
5. Bump the store `version` number to trigger a fresh seed on next load
6. Add the entity to `partialize` in the store persist config so it's saved to localStorage

### Change a Brand Color

Update the CSS variable in `src/app/globals.css`. All inline `style={{ backgroundColor: "var(--bs-primary)" }}` usages update automatically. Tailwind arbitrary values (e.g. `text-[#337C99]`) require a find-and-replace if the hex changes.

---

## 21. Migrating to a Real Database

The data layer is architected specifically for this migration. The swap requires changing **one file**.

### The Swap

`src/data/service/index.ts` currently:
```ts
import { MockDataService } from "./MockDataService";
export const db: DataService = new MockDataService();
```

Change to:
```ts
import { NeonDataService } from "./NeonDataService";
export const db: DataService = new NeonDataService();
```

`NeonDataService` implements the same `DataService` interface with `fetch()` calls to Next.js API routes (or Server Actions) backed by NeonDB. No component or page changes are required.

### Implementation Steps

1. Set up NeonDB (PostgreSQL) with the schema from [`DATA_MODEL.md`](./DATA_MODEL.md)
2. Create `src/data/service/NeonDataService.ts` implementing `DataService`
3. Create API routes in `src/app/api/` for each entity (or use Server Actions)
4. Migrate each method: replace `useAppStore.getState()` reads with `SELECT` queries, replace `set*()` calls with `INSERT`/`UPDATE` queries
5. Handle auth on all write routes — validate `admin_session` cookie before mutating
6. Re-enforce all business rules server-side (see [`REQUIREMENTS_AND_VALIDATIONS.md`](./REQUIREMENTS_AND_VALIDATIONS.md) for the full list, especially rules marked "Bug fix")
7. For reminder notifications, add a Cloudflare Cron Worker that fires daily and generates `reminder_24hr` and `reminder_2hr_sms` records via a real email/SMS provider (e.g. SendGrid, Twilio)

### Key Business Rules to Enforce Server-Side

These rules are currently client-side only and **must** be validated by the API:

- Flagged customer cannot book (C-03a)
- Inactive customer cannot book (C-04a)
- Instructor conflict check on booking create/reschedule (PB-07)
- Lane capacity check on booking create/reschedule (PB-08)
- Slot window enforcement (`slotStart + duration ≤ instructorEndTime`) (PB-06)
- Blackout date exclusion on booking create/reschedule (PB-02)
- `confirmWaitlisted` must re-verify availability before confirming (WB-05)

Full rule list with IDs: [`REQUIREMENTS_AND_VALIDATIONS.md`](./REQUIREMENTS_AND_VALIDATIONS.md) §1–18.

---

*Last updated: July 2026*
