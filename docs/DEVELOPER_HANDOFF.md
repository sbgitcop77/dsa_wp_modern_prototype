# Developer Handoff — Diamond Sports Academy Platform

**Document purpose:** Complete technical reference for building the production DB-backed version of this application. Every rule, constraint, API contract, data model decision, and test result from the prototype is recorded here. Read this before touching a single schema file.

---

## 1. What Was Built

A full-featured Next.js 14 (App Router) prototype for **The Diamond Sports Academy** — a 1-on-1 sports training facility in Odenton, MD. The prototype covers:

- Public booking wizard (5-step: instructor → date/time → options → participant → review)
- Manage Booking page (cancel / reschedule via reference link — no login required)
- Admin panel: dashboard, bookings, customers, instructors, schedule, waitlist, notifications, settings
- Recurring series booking with per-week conflict detection
- Waitlisted booking status (distinct from "join waitlist" entries)
- In-memory mock data layer with a `DataService` interface that a real DB adapter will implement

**There is no real database.** All data lives in Zustand + localStorage via `persist`. The architecture is specifically designed so swapping `MockDataService` → `NeonDataService` requires zero call-site changes in the UI.

---

## 2. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS v3 + custom CSS in `globals.css` |
| State | Zustand with `persist` middleware (store key: `dsa-app-store`) |
| Data service | `DataService` interface → `MockDataService` (swap to `NeonDataService` for prod) |
| Icons | `lucide-react` (admin only), inline SVGs (public) |
| Utilities | `clsx`, `date-fns` |
| Target DB | NeonDB (PostgreSQL serverless) via `@neondatabase/serverless` HTTP driver |
| ORM option | `drizzle-orm/neon-http` (recommended for type safety) |

---

## 3. File Structure (relevant to data layer)

```
src/
  data/
    types.ts                  ← canonical entity types (source of truth)
    siteConfig.ts             ← static public-facing config
    store/
      useAppStore.ts          ← Zustand store (all entities)
    service/
      DataService.ts          ← interface (the contract)
      MockDataService.ts      ← localStorage implementation
      index.ts                ← exports `db` (swap this import for production)
    mock/
      bookings.ts             ← seed bookings
      customers.ts            ← seed customers
      instructors.ts          ← seed instructors
      schedule.ts             ← seed availability, blackouts, operating hours
      notifications.ts        ← seed notifications
  components/
    StoreHydration.tsx        ← hydrates Zustand from localStorage on mount
```

---

## 4. Entity Types (`src/data/types.ts`)

These are the **canonical** shapes. The NeonDB adapter must map DB rows to these exactly.

### 4.1 Booking

```typescript
type Booking = {
  id: string;
  bookingReference: string;           // format: DSA-YYYY-NNNNN
  cancellationToken: string;          // UUID used in /manage/[ref] URL
  customerId: string;
  customerName: string;               // denormalized — join in production
  instructorId: string;
  instructorName: string;             // denormalized — join in production
  date: string;                       // YYYY-MM-DD
  startTime: string;                  // HH:MM (24h)
  endTime: string;                    // HH:MM (24h) — computed from startTime + durationMinutes
  durationMinutes: 30 | 60;
  status: "confirmed" | "cancelled" | "no_show" | "completed" | "waitlisted";
  isForChild: boolean;
  childAge?: number;
  relationshipToCustomer?: string;
  bookedByName?: string;
  isRecurring: boolean;
  recurringSeriesId?: string;
  isWalkIn: boolean;
  cancelledBy?: "customer" | "admin";
  cancellationReason?: string;
  conflictReason?: "instructor_conflict";  // set on waitlisted bookings
  laneAssigned?: number;              // 1–activeLanes; undefined for non-lane instructors
  createdAt: string;                  // ISO timestamp
};
```

**Key notes on `status`:**
- `confirmed` — active, upcoming session
- `waitlisted` — booking created but instructor is already booked at this slot. Customer or admin must explicitly confirm when slot opens. `conflictReason` is always set to `"instructor_conflict"`.
- `cancelled` — cancelled by customer or admin
- `no_show` — set manually by admin after the session date
- `completed` — set manually by admin after delivery

**`conflictReason` on waitlisted bookings:**
- `instructor_conflict` — the instructor is already confirmed for an overlapping slot on that date

### 4.2 Customer

```typescript
type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;                      // unique; used as lookup key at booking time
  phone: string;
  isActive: boolean;
  isFlagged: boolean;
  noShowCount: number;
  lateCancellationCount: number;
  smsOptOut: boolean;
  source: "online_booking" | "admin_booking" | "import";
  createdAt: string;
  deactivatedAt?: string;
};
```

### 4.3 Instructor

```typescript
type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  speciality: string;
  instructor_type: string;            // "lane" | "non_lane"
  isActive: boolean;
  totalSessionsDelivered: number;     // computed in production — COUNT(bookings WHERE status='completed')
  upcomingSessions: number;           // computed in production — COUNT(bookings WHERE status='confirmed' AND date >= today)
  createdAt: string;
  deactivatedAt?: string;
};
```

**Instructor type matters for lane logic:**
- `lane` — bookings consume a physical lane. `laneAssigned` is set. Lane capacity checks apply.
- `non_lane` — bookings do not consume a lane. `laneAssigned` is null. Lane capacity checks do NOT apply to or count these bookings.

### 4.4 InstructorAvailability

```typescript
type InstructorAvailability = {
  id: string;
  instructorId: string;
  instructorName: string;             // denormalized
  date: string;                       // YYYY-MM-DD
  slots: string[];                    // HH:MM start times (30-min intervals)
  endTime: string;                    // HH:MM — all bookings must END by this time
  frozen: boolean;
};
```

In production: `slots` are **computed** from `start_time` to `end_time` using `generate_series`. Do not store the array — derive it on read.

### 4.5 Other Types (see `types.ts` for full definitions)

- `OperatingHours` — one record per day of week (0=Sun … 6=Sat), with `openTime`, `closeTime`, `isClosed`
- `Blackout` — `date` (YYYY-MM-DD), `isRecurring` (if true, only MM-DD matched), `reason`
- `NotificationRecord` — audit log of sent notifications
- `FacilitySettings` — name, address, phone, email, website, timezone, activeLanes, adminUsername, adminPassword

---

## 5. DataService Interface

This is the **only** interface the application ever depends on. Every page and component calls `db.*` methods. Swap the export in `src/data/service/index.ts` — zero UI changes required.

```typescript
interface DataService {
  // Customers
  getCustomers(): Customer[];
  getCustomerById(id: string): Customer | undefined;
  createCustomer(data: NewCustomer): Customer;
  updateCustomer(id: string, patch: Partial<Customer>): Customer;

  // Instructors
  getInstructors(): Instructor[];
  getInstructorById(id: string): Instructor | undefined;
  createInstructor(data: NewInstructor): Instructor;
  updateInstructor(id: string, patch: Partial<Instructor>): Instructor;
  deleteInstructor(id: string): void;

  // Bookings
  getBookings(filters?: BookingFilters): Booking[];
  getBookingByRef(ref: string): Booking | undefined;
  getBookingByCancellationToken(token: string): Booking | undefined;
  createBooking(data: NewBooking): Booking;
  updateBooking(id: string, patch: Partial<Booking>): Booking;
  cancelBooking(id: string, by: "customer" | "admin", reason?: string): Booking;
  cancelSeries(seriesId: string, fromDate: string, by: "customer" | "admin", reason?: string): Booking[];
  confirmWaitlisted(id: string): Booking;

  // Operating Hours
  getOperatingHours(): OperatingHours[];
  updateOperatingHours(id: string, patch: Partial<OperatingHours>): OperatingHours;

  // Blackouts
  getBlackouts(): Blackout[];
  createBlackout(data: NewBlackout): Blackout;
  deleteBlackout(id: string): void;

  // Instructor Availability
  getAvailability(filters?: { instructorId?: string; date?: string }): InstructorAvailability[];
  upsertAvailability(instructorId: string, date: string, slots: string[], endTime: string): InstructorAvailability;

  // Notifications
  getNotifications(): NotificationRecord[];
  createNotification(data: NewNotification): NotificationRecord;
  updateNotificationStatus(id: string, status: NotificationRecord["deliveryStatus"]): NotificationRecord;

  // Facility Settings
  getFacilitySettings(): FacilitySettings;
  updateFacilitySettings(patch: Partial<FacilitySettings>): FacilitySettings;
}
```

### Method notes

**`cancelSeries(seriesId, fromDate, by, reason?)`**
- Cancels all bookings in the series with `date >= fromDate` that have status `confirmed` OR `waitlisted`.
- Returns array of all updated bookings.
- Does not touch `completed`, `cancelled`, or `no_show` bookings.

**`confirmWaitlisted(id)`**
- Sets `status = "confirmed"` and clears `conflictReason`.
- **Production must re-verify availability before confirming.** The prototype does not re-check — this is a known gap. The server-side implementation must: (1) verify the instructor has no confirmed overlap, (2) verify lane capacity is not exceeded. If either check fails, return a 409 error so the UI can inform the user.

**`BookingFilters`**
```typescript
type BookingFilters = {
  date?: string;
  instructorId?: string;
  customerId?: string;
  status?: Booking["status"];         // now includes "waitlisted"
  fromDate?: string;
  toDate?: string;
};
```

---

## 6. Business Rules

Full rule set with source tags. Rules marked **Bug fix** were incorrect or missing in the initial prototype — these are highest priority to enforce server-side (the API must reject invalid states regardless of what the UI sends).

### 6.1 Facility Settings

| # | Rule | Source |
|---|---|---|
| FS-01 | Single settings record per facility. | Original |
| FS-02 | Fields: name, address, email, phone, website, timezone, activeLanes, adminUsername, adminPassword. | Original |
| FS-03 | `activeLanes` drives lane conflict logic. Changing it affects all slot availability calculations in real time. | Original |
| FS-04 | `adminUsername` / `adminPassword` stored in plaintext in Zustand; validated client-side. Production must use server-side bcrypt in a dedicated `Admin` entity. | By design (prototype) |

### 6.2 Operating Hours

| # | Rule | Source |
|---|---|---|
| F-01 | One record per day of week (Monday–Sunday). | Original |
| F-02 | Saturday is a **working day** (default 9 AM–5 PM). Sunday is **closed** by default. | Enhancement |
| F-03 | Admin can mark any day closed; closed days block all bookings and instructor availability for that weekday. | Original |
| F-04 | `closeTime` must be strictly greater than `openTime`. Reject at API level. | Original |
| F-05 | Changing `openTime` must cascade a reset of `closeTime` if `existingCloseTime <= newOpenTime`. | Original |
| F-06 | Operating hours are day-of-week scoped. Date-specific closures are blackout dates. | Original |

### 6.3 Blackout Dates

| # | Rule | Source |
|---|---|---|
| B-01 | Blackout dates are **facility-wide** — no instructor-specific blackouts. | Original |
| B-02 | Two types: non-recurring (exact YYYY-MM-DD) and yearly recurring (MM-DD matched across any year). | Original |
| B-03 | Cannot create a blackout in the past. | Original |
| B-04 | Blackout dates must be disabled in the **public booking calendar**. | Bug fix |
| B-05 | Blackout dates must be disabled in the **admin reschedule dialog** date picker. | Bug fix |
| B-06 | Blackout dates must be disabled in the **instructor availability calendar**. | Original |
| B-07 | Recurring series validation must flag any future week landing on a blackout as a **hard block**. | Bug fix |
| B-08 | Yearly recurring blackout matching: compare only MM-DD of the `date` field. The YYYY is ignored for recurring entries. | Original |

### 6.4 Instructor Management

| # | Rule | Source |
|---|---|---|
| I-01 | All fields required: First Name, Last Name, Email, Phone, Speciality, Instructor Type. | Enhancement |
| I-02 | Email must be unique and valid format. | Enhancement |
| I-03 | `instructor_type` required; no default. Values: `lane` or `non_lane`. | Enhancement |
| I-04 | Non-Lane Instructors: `laneAssigned = null`; do not count against lane capacity. | Bug fix |
| I-05 | Lane number not shown in booking detail dialogs for Non-Lane Instructors. | Bug fix |
| I-06 | Only **active** instructors appear in booking and rescheduling dropdowns. | Original |
| I-07 | Deactivating an instructor does not cancel existing confirmed bookings — admin handles separately. | Original |
| I-08 | `totalSessionsDelivered` and `upcomingSessions` are computed aggregates, not stored fields. | Original |

### 6.5 Instructor Availability

| # | Rule | Source |
|---|---|---|
| IA-01 | Each instructor has a recurring weekly template (default schedule by day-of-week). | Original |
| IA-02 | Date-specific overrides take full precedence over the recurring template. | Original |
| IA-03 | `is_active = true` requires both `start_time` and `end_time` to be non-null and `end_time > start_time`. Enforce with DB CHECK constraint. | Bug fix |
| IA-04 | For today's date: start time must be ≥ the next 30-min interval from now. | Enhancement |
| IA-05 | Saturday availability must respect Saturday facility hours (09:00–17:00). | Enhancement |
| IA-06 | `frozen = true` blocks normal admin edits — requires explicit override. | Original |
| IA-07 | Past dates are not editable by admin. | Enhancement |
| IA-08 | Changing start time resets end time if `existingEnd <= newStart`. | Enhancement |
| IA-09 | Slot array is computed from `start_time` to `end_time` in 30-min intervals (not stored). | Original |
| IA-10 | One availability record per instructor per date — `UNIQUE(facility_id, instructor_id, date)`. | Original |

### 6.6 Public Booking — Slot Availability

| # | Rule | Source |
|---|---|---|
| PB-01 | Calendar shows only dates where the selected instructor has available slots. | Original |
| PB-02 | Blackout dates are disabled in the calendar. | Bug fix |
| PB-03 | Past dates are disabled in the calendar. | Original |
| PB-04 | For today: time slots at or before the current time are excluded. | Bug fix |
| PB-05 | Duration (30 min / 60 min) must be selected **before** the time slot list. Slots are computed for the selected duration. Default: 30 min. | Bug fix |
| PB-06 | A slot is valid only if the full session fits within the instructor's availability window: `slotStart + durationMinutes ≤ instructorEndTime`. | Bug fix |
| PB-07 | Instructor conflict detection uses overlap logic: `slotStart < existingEnd && slotEnd > existingStart`. Must account for both 30-min and 60-min existing bookings. | Bug fix |
| PB-08 | A slot is **hidden** (not available or waitlisted) if the selected instructor has a confirmed booking overlapping it. | Original |
| PB-09 | A slot moves to hidden if all lanes are at capacity: `count of confirmed lane-instructor bookings at that slot >= activeLanes`. Non-Lane bookings do not count. | Original |
| PB-10 | Flagged customers cannot book. Error shown on Step 4 (Participant Details). | Original |
| PB-11 | Inactive customers cannot book. Error shown on Step 4. | Original |
| PB-12 | Booking reference format: `DSA-YYYY-NNNNN` (zero-padded 5-digit sequence, auto-incremented). | Original |
| PB-13 | Each booking generates a unique `cancellationToken` (UUID). | Original |
| PB-14 | Child bookings require: `isForChild`, `childAge`, `relationshipToCustomer`. | Original |
| PB-15 | Walk-in bookings (`isWalkIn = true`) are admin-only and follow the same lane/conflict rules. | Original |

### 6.7 Recurring Series

This is the most complex part of the system. Read carefully.

| # | Rule | Source |
|---|---|---|
| R-01 | All future weeks in a recurring series are validated **before** the series is confirmed. | Original |
| R-02 | Per-week validation checks four conditions in order: (1) date is not a blackout, (2) instructor has availability with the requested slot, (3) requested slot fits within the instructor's end time, (4) instructor has no confirmed overlapping booking. | Bug fix |
| R-03 | A week with a **hard block** prevents the entire series from being confirmed. Hard blocks: blackout, instructor has no availability, slot window mismatch. | New feature |
| R-04 | A week with a **soft block (waitlisted)** does NOT prevent the series from being confirmed. Soft block: instructor conflict. The conflicting week is created as a `waitlisted` booking with `conflictReason: "instructor_conflict"`. | New feature |
| R-05 | Week 0 (the selected base date) is always `confirmed` — the wizard requires the base date to already be valid before reaching Step 3. | New feature |
| R-06 | All bookings in a series share the same `recurringSeriesId`. | Original |
| R-07 | Cancelling a series: customer or admin may cancel a single occurrence OR all future occurrences from a given date. `cancelSeries` cancels both `confirmed` and `waitlisted` bookings. | Bug fix |
| R-08 | Rescheduling from the manage page: single-occurrence reschedule only (reschedule all future is not currently implemented in the UI but is architecturally supported). | Original |
| R-09 | The manage page displays "Session X of Y" for recurring bookings and lists all sibling sessions with their status. | New feature |

#### WeeklyStatus (booking wizard internal type)

The wizard uses this to classify each future week before calling `confirm()`:

```typescript
type WeeklyStatus = {
  date: string;
  status: "confirmed" | "waitlisted" | "hard_block";
  reason?: "blackout" | "no_availability" | "slot_window" | "instructor_conflict";
};
```

Hard-block reasons → red error in Step 3 → Next button disabled.
Waitlisted reasons → amber info in Step 3 → Next button enabled, week created as `waitlisted`.

### 6.8 Manage Booking (Public Page)

| # | Rule | Source |
|---|---|---|
| MB-01 | Customer accesses manage page via booking reference in URL. No login required. | Original |
| MB-02 | Booking reference lookup: exact match on `bookingReference`. | Original |
| MB-03 | Past/completed bookings show a "link may be expired" message — no actions available. | Original |
| MB-04 | The **24-hour change window**: cancel and reschedule are blocked if `date` is within 24 hours. "Change Window Closed" is shown instead. A contact number is provided. | Original |
| MB-05 | **Exception for waitlisted bookings**: the 24-hour guard is bypassed for waitlisted sessions so customers can confirm them. | New feature |
| MB-06 | Already-cancelled bookings: no action form — message only. | Original |
| MB-07 | Recurring series management: cancel/reschedule shows options for "this session only" or "entire series". | Original |
| MB-08 | "Confirm This Session" CTA appears only when `booking.status === "waitlisted"`. | New feature |
| MB-09 | The "All Sessions in This Series" panel shows all sibling bookings with their status badges. | New feature |

### 6.9 Admin Reschedule

| # | Rule | Source |
|---|---|---|
| RS-01 | Instructor shown as read-only in reschedule form (cannot change instructor). To reassign, cancel and rebook. | By design |
| RS-02 | Calendar filtered to the booking's instructor's availability dates only. | Bug fix |
| RS-03 | Blackout dates disabled in the reschedule date picker. | Bug fix |
| RS-04 | Only future dates shown. | Original |
| RS-05 | Time slot picker shows only slots for the selected date within the instructor's window. | Bug fix |
| RS-06 | Admin cancellations record `cancelledBy = "admin"`. | Original |

### 6.10 Booking Status Filter

| # | Rule | Source |
|---|---|---|
| BF-01 | **Upcoming tab**: `date >= today`. **Past tab**: `date < today`. Today's bookings are in Upcoming. | Bug fix |
| BF-02 | Filter options: instructor, status, date range. | Original |
| BF-03 | Status values in the filter dropdown: `confirmed`, `waitlisted`, `cancelled`, `no_show`, `completed`. | New feature |

### 6.11 Waitlisted Booking — Admin View

| # | Rule | Source |
|---|---|---|
| WA-01 | Waitlisted bookings show an amber status badge with the conflict reason as a subtitle. | New feature |
| WA-02 | The booking detail modal shows a "Confirm Session" button when `status === "waitlisted"`. | New feature |
| WA-03 | Clicking "Confirm Session" calls `confirmWaitlisted(id)` → sets status to confirmed, clears `conflictReason`. | New feature |
| WA-04 | In production, `confirmWaitlisted` must re-verify slot availability before confirming (instructor conflict + lane capacity). Return 409 if still blocked. | Known gap |

### 6.12 Waitlist Entries (separate from Waitlisted Bookings)

A `waitlisted` booking is a `Booking` record with `status: "waitlisted"` — created when a recurring series slot has an instructor conflict. The session exists in the system; admin can confirm it to move it to `confirmed`. There is no separate `WaitlistEntry` entity — that concept was removed.

### 6.13 Display Rules

| # | Rule | Source |
|---|---|---|
| D-01 | Time range display includes minutes when non-zero: `"2–4:30 PM"` not `"2–4 PM"`. | Bug fix |
| D-02 | Lane number shown only for Lane Instructor bookings. | Bug fix |
| D-03 | Instructor dropdown shows name + speciality: `"Chris Ford — Owner & Founder"`. | Enhancement |
| D-04 | `bookingReference` and `cancellationToken` are system-generated — never user-supplied. | Original |

### 6.14 Customer Rules

| # | Rule | Source |
|---|---|---|
| C-01 | Customers are created by the booking flow or by admin. No self-registration. | Original |
| C-02 | Customer lookup at booking time: match by email (case-insensitive). If found, use existing ID. If not, create new customer record. | Original |
| C-03 | Same email = same customer. Two bookings with the same email are linked to one customer record. | Original |
| C-04 | `isFlagged` blocks booking. Error shown on Step 4 (Participant Details). | Original |
| C-05 | `isActive = false` blocks booking. Error shown on Step 4. | Original |
| C-06 | `noShowCount` and `lateCancellationCount` incremented by admin action — not automatically. | Original |
| C-07 | `smsOptOut = true` must suppress all SMS notifications for that customer. | Original |

---

## 7. Production Database Schema

See [`DATA_MODEL.md`](DATA_MODEL.md) for the full ER diagram, table definitions, indexes, and constraints. Key additions not in that doc:

### 7.1 Additions from this session

**Bookings table — new columns:**

```sql
-- Add to bookings table
status TEXT NOT NULL DEFAULT 'confirmed'
  CHECK (status IN ('confirmed', 'cancelled', 'no_show', 'completed', 'waitlisted'));

conflict_reason TEXT
  CHECK (conflict_reason IN ('instructor_conflict'));

-- conflict_reason must be set when status = 'waitlisted'
-- Enforce application-side; optional DB trigger:
-- CREATE CONSTRAINT TRIGGER check_waitlisted_reason ...
```

**Recurring series table:** The prototype used a bare string `recurringSeriesId`. Production needs the `recurring_series` table from `DATA_MODEL.md`. Add a `status TEXT CHECK IN ('active', 'cancelled')` column.

### 7.2 confirmWaitlisted production implementation

```sql
-- API route: PATCH /api/bookings/:id/confirm-waitlisted
-- Steps:
-- 1. Fetch booking — verify status = 'waitlisted'
-- 2. Verify instructor has no confirmed overlapping booking on booking.date
-- 3. For lane instructors: verify lane count < activeLanes for that slot
-- 4. If either check fails: return 409 { error: "slot_still_blocked", conflictReason: "..." }
-- 5. If checks pass: UPDATE bookings SET status='confirmed', conflict_reason=NULL WHERE id=:id
-- 6. Return updated booking
```

---

## 7.3 Notification Trigger Reference

`db.createNotification()` is called at every action that warrants customer communication. In the prototype, notifications are written to the Zustand store only — no email or SMS is actually sent. When SendGrid/Twilio are wired up, replace the `deliveryStatus: "sent"` stub with a real API call and update the record on success/failure.

| # | Trigger | notificationType | Where | Notes |
|---|---------|-----------------|-------|-------|
| 1 | Customer completes booking wizard (confirmed) | `confirmation` | `src/app/book/page.tsx` | One notification per booking in the series |
| 2 | Customer joins slot-notification waitlist | `confirmation` | `src/app/book/page.tsx` | Single entry, no booking record |
| 3 | Customer cancels single booking | `cancellation` | `src/app/manage/[ref]/page.tsx` | |
| 4 | Customer cancels entire recurring series | `cancellation` | `src/app/manage/[ref]/page.tsx` | One notification per cancelled booking |
| 5 | Customer reschedules booking | `change` | `src/app/manage/[ref]/page.tsx` | |
| 6 | Admin cancels booking (Today's Schedule) | `cancellation` | `src/app/admin/page.tsx` | |
| 7 | Admin cancels booking (Bookings page, single) | `cancellation` | `src/app/admin/bookings/page.tsx` | |
| 8 | Admin cancels entire series (Bookings page) | `cancellation` | `src/app/admin/bookings/page.tsx` | One notification per cancelled booking |
| 9 | Admin reschedules booking (Today's Schedule) | `change` | `src/app/admin/page.tsx` | Single session and series both handled |
| 10 | Admin reschedules booking (Bookings page) | `change` | `src/app/admin/bookings/page.tsx` | |
| 11 | Admin confirms waitlisted booking (Bookings page) | `confirmation` | `src/app/admin/bookings/page.tsx` | |
| 12 | Admin promotes slot-notification waitlist entry | `confirmation` | `src/app/admin/waitlist/page.tsx` | Creates new booking first |
| 13 | Admin confirms waitlisted booking (Waitlist page) | `confirmation` | `src/app/admin/waitlist/page.tsx` | |
| 14 | Admin adds blackout — existing bookings auto-cancelled | `cancellation` | `src/app/admin/settings/page.tsx` | One notification per affected booking |
| 15 | Customer confirms waitlisted booking (Manage page) | `confirmation` | `src/app/manage/[ref]/page.tsx` | |

**Not implemented (future):** `reminder_24hr`, `reminder_2hr_sms`, `calendar_invite` — these require a scheduled job (cron) and are noted in the Notifications table but not yet triggered.

**Production wiring pattern:**
```ts
// Replace the stub call with:
const result = await sendgrid.send({ to: recipientEmail, subject: ..., html: ... });
db.updateNotificationStatus(notif.id, result.ok ? "sent" : "failed");
```

---

## 8. API Route Design

The prototype has only one real API route (`/api/admin/auth`). All other data is in-memory. For production, implement these REST routes. All protected routes require a valid session cookie.

### 8.1 Public routes (no auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/bookings/:ref` | Lookup booking by reference for manage page |
| `PATCH` | `/api/bookings/:id/cancel` | Customer cancel (validates cancellation token) |
| `PATCH` | `/api/bookings/:id/reschedule` | Customer reschedule |
| `PATCH` | `/api/bookings/:id/confirm-waitlisted` | Customer confirms waitlisted session |
| `POST` | `/api/bookings` | Create booking (full wizard submit) |
| `GET` | `/api/instructors` | List active instructors (for booking wizard step 1) |
| `GET` | `/api/availability` | Get slots by instructorId + date + duration |
| `POST` | `/api/waitlist` | Join the waitlist (slot-notification entry) |
| `POST` | `/api/contact` | Contact form (not yet implemented) |

### 8.2 Admin routes (session cookie required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/auth` | Login / logout |
| `GET` | `/api/admin/bookings` | List bookings with filters |
| `PATCH` | `/api/admin/bookings/:id/cancel` | Admin cancel |
| `PATCH` | `/api/admin/bookings/:id/reschedule` | Admin reschedule |
| `PATCH` | `/api/admin/bookings/:id/confirm-waitlisted` | Admin confirm waitlisted |
| `POST` | `/api/admin/bookings` | Create walk-in booking |
| `GET` | `/api/admin/customers` | List customers |
| `PATCH` | `/api/admin/customers/:id` | Update customer (flag, deactivate, edit) |
| `GET` | `/api/admin/instructors` | List all instructors |
| `POST` | `/api/admin/instructors` | Create instructor |
| `PATCH` | `/api/admin/instructors/:id` | Edit instructor |
| `DELETE` | `/api/admin/instructors/:id` | Deactivate instructor |
| `GET` | `/api/admin/availability` | Get instructor availability |
| `PUT` | `/api/admin/availability` | Upsert date-specific availability |
| `GET` | `/api/admin/blackouts` | List blackouts |
| `POST` | `/api/admin/blackouts` | Create blackout |
| `DELETE` | `/api/admin/blackouts/:id` | Delete blackout |
| `GET` | `/api/admin/operating-hours` | Get operating hours |
| `PATCH` | `/api/admin/operating-hours/:id` | Update operating hours |
| `GET` | `/api/admin/settings` | Get facility settings |
| `PATCH` | `/api/admin/settings` | Update facility settings |
| `GET` | `/api/admin/waitlist` | List waitlist entries |
| `DELETE` | `/api/admin/waitlist/:id` | Remove waitlist entry |
| `POST` | `/api/admin/waitlist/:id/promote` | Convert waitlist entry to booking |
| `GET` | `/api/admin/notifications` | List notifications |
| `GET` | `/api/admin/schedule` | Today's schedule grid data |

---

## 9. Zustand Store Shape

The store key is `dsa-app-store`. The shape of the state (for reference when implementing hydration or the store bridge):

```typescript
{
  bookings: Booking[];
  customers: Customer[];
  instructors: Instructor[];
  availability: InstructorAvailability[];
  blackouts: Blackout[];
  operatingHours: OperatingHours[];
  notifications: NotificationRecord[];
  facilitySettings: FacilitySettings;
  // setters for each:
  setBookings(b: Booking[]): void;
  setCustomers(c: Customer[]): void;
  // ... etc
}
```

`StoreHydration.tsx` handles hydration on mount (`useAppStore.persist.rehydrate()`). This is required because the store uses `skipHydration: true` to avoid SSR/client mismatch.

In production, the store is still useful as a **client cache** (React Query + Zustand). The `NeonDataService` would call the API routes and the store would be populated from server responses, not from localStorage.

---

## 10. Known Gaps & Production Priorities

| Gap | Severity | Description |
|---|---|---|
| `confirmWaitlisted` no re-verify | **High** | Prototype confirms without re-checking availability. Production API must validate before confirming (§7.2). |
| Client-side credential validation | **High** | `adminUsername` / `adminPassword` stored in plaintext in Zustand, validated client-side. API route sets the session cookie without checking credentials. Must use server-side bcrypt in a dedicated `Admin` entity in production. |
| No email/SMS sending | **High** | Notifications are written to store but never actually sent. Production needs Resend (email) + Twilio (SMS). |
| No real payment | **Medium** | No payment integration exists. Prototype assumes payment is collected at session time. |
| No booking reference link in email | **Medium** | The manage booking page URL (`/manage/[bookingRef]`) is never emailed to the customer. This must be sent in the booking confirmation email. |
| Recurring series `recurringSeriesId` | **Medium** | Prototype uses a bare string ID with no series metadata table. Production needs the `recurring_series` table (DATA_MODEL.md §Recurring series). |
| `noShowCount` / `lateCancellationCount` not auto-incremented | **Low** | Incremented manually by admin via the + No-Show / + Late Cancellation buttons. Consider automating on status change in production. |

---

## 11. Test Results

All scenarios tested against the mock data layer with the current seed. All passed except where noted.

### Group A — Booking Wizard

| Test | Result | Notes |
|------|--------|-------|
| A1: Single booking | ✅ | Created correctly, endTime computed |
| A2: 60-min booking | ✅ | Slot window respected |
| A3: Slot window enforcement | ✅ | Slots past instructor endTime hidden |
| A4: Child booking fields | ✅ | isForChild, childAge, relationship stored |
| A5: 60-min slot clipping | ✅ | Truncated correctly at window end |
| A6: Back-navigation preserves state | ✅ | All steps retain values |
| A7: Child booking required fields | ✅ | All child fields required |
| A8: Walk-in (admin) | ✅ | No customer lookup required |
| A9: Recurring — blackout hard block | ✅ | Jul 20 blackout → Step 3 blocked, Next disabled |
| A10: Recurring — both valid | ✅ | 2 confirmed bookings, "Session 1 of 2" / "Session 2 of 2" on confirmation |
| A11: Reduce weeks to clear conflict | ✅ | Reducing from 4→2 weeks clears the blackout hard block |
| A12: Flagged customer blocked | ✅ | "unable to process" message shown on Step 4 |
| A13: Self — empty fields blocked | ✅ | Next disabled until firstName + lastName + email filled |
| A14: Child — missing fields blocked | ✅ | All child-specific fields required |
| A15: Instructor conflict — slot hidden | ✅ | 1:00 PM absent after Chris Ford Jul 7 13:00 booked |
| A16: Lane full — slot hidden | ✅ | 10:00 AM absent after 4 confirmed lane bookings at that slot |

**Note on A9:** The valid select values for "number of weeks" are 2, 4, 6, 8 (not 1–8). Using an invalid value (e.g. "3") results in `parseInt("", 10) = NaN` and no weeks are checked — the series advances without validation. Production must validate this server-side.

### Group B — Cancel

| Test | Result |
|------|--------|
| B1: Customer self-cancel | ✅ |
| B2: Admin cancel via admin panel | ✅ |
| B3: Cancel entire series | ✅ Both confirmed + waitlisted cancelled |
| B4: Cancel single from series | ✅ Sibling unaffected |
| B5: Within 24h — blocked | ✅ "Change Window Closed" shown |
| B6: Already-cancelled booking | ✅ Message only, no action buttons |

### Group C — Reschedule

| Test | Result |
|------|--------|
| C1: Basic reschedule | ✅ Date/time updated in store |
| C2: Blackout dates disabled | ✅ Jul 8, 14, 20 all disabled |
| C3: No-availability dates disabled | ✅ |
| C4: Old slot freed after reschedule | ✅ |
| C5: Instructor conflict — slot absent | ✅ |
| C6: Within 24h — blocked | ✅ |
| C7: Past/completed booking | ✅ "session may have already passed" |
| C8: Invalid reference | ✅ Not-found message |
| C9: Duration preserved | ✅ |
| C10–C11: Lane count updated | ✅ |

### Group D — Data Integrity

| Test | Result |
|------|--------|
| D1: Unique booking references | ✅ |
| D2: Cancelled bookings free slots | ✅ |
| D3: No instructor double-booking from normal flows | ✅ |
| D4: Lane count ≤ capacity | ✅ |
| D5: Waitlisted bookings have conflictReason | ✅ |

### Group E — Recurring Series Waitlist (new feature)

| Test | Result | Notes |
|------|--------|-------|
| E1: Week 2 conflict → waitlisted | ✅ | instructor_conflict stored; confirmed screen shows both sessions |
| E2: Manage page shows waitlist badge + CTA | ✅ | "Confirm This Session" button shown |
| E3: Customer confirms waitlisted | ✅ | Status → confirmed, conflictReason cleared |
| E4: Admin confirms waitlisted | ✅ | "Confirm Session" button in booking modal |
| E5: Cancel series with mixed statuses | ✅ | Both confirmed + waitlisted cancelled |

---

## 12. Seed Data

The production seed should include:

**Instructors:** Chris Ford (Owner & Founder, lane), Coach Megan (Pitching & Conditioning, lane), Syeed Mahdi (Hitting & Fielding, lane), Connor Hax (Baseball, lane)

**Operating Hours:**
- Mon–Fri: 08:00–20:00
- Saturday: 09:00–17:00
- Sunday: closed

**Blackout Dates (from actual store):**
- 2026-07-08 — Facility Maintenance
- 2026-07-14 — Staff Training
- 2026-07-20 — Private Event
- 2026-07-29 — Annual Deep Clean (recurring, MM-DD = 07-29)

**Facility Settings:**
- Lane capacity: 4
- Cancellation window: 24 hours
- Name: The Diamond Sports Academy
- Address: 8274 Lokus Rd, Odenton, MD 21113
- Phone: (443) 865-1639

---

## 13. Migration Order

When building the production DB layer, implement in this order to avoid consuming-before-producing:

1. `facilities` table + seed one facility record
2. `operating_hours` table + seed 7 records
3. `blackouts` table + seed records
4. `admin_users` table + seed one admin
5. `instructors` table + seed 4 instructors
6. `instructor_schedules` table (recurring weekly template)
7. `instructor_availability` table (date-specific overrides)
8. `customers` table
9. `recurring_series` table
10. `bookings` table
11. `waitlist_entries` table
12. `notifications` table
13. `settings` table (misc key-value)

Then implement `NeonDataService` against these tables and swap the export in `src/data/service/index.ts`.

---

## 14. Extended Data-Integrity & Edge-Case Test Results (X1–X14)

These tests were run after the initial group tests (A–E) and specifically target data corruption risks, boundary conditions, and cross-system consistency.

| # | Scenario | Result | Key Finding |
|---|----------|--------|-------------|
| X1 | Email case-insensitivity dedup | ✅ PASS | `c.email.toLowerCase() === form.email.toLowerCase()` — both sides lowercased at `book/page.tsx:251`. Real DB must use `ILIKE` or store emails normalized to lowercase. |
| X2 | Series count includes cancelled siblings | ✅ PASS | `sessionTotal = seriesBookings.length` counts ALL siblings regardless of status. "Session 2 of 2" is correct even if session 1 is cancelled. |
| X3 | Cancel series with already-cancelled sessions | ✅ PASS | `cancelSeries` filter is `status === "confirmed" \|\| status === "waitlisted"` — skips already-cancelled sessions. No double-processing or status corruption. |
| X4 | Orphaned `instructorId` after instructor removed | ✅ PASS (no crash) | Admin bookings page renders using stored `instructorName` string — does not look up instructor by ID for display. No JS crash. Instructor filter dropdown loses the removed instructor. |
| X5 | Lane count reduced below existing bookings | ✅ FIXED | A conflict modal now intercepts the save when `newCount < currentCount` and future confirmed bookings exist on lanes above `newCount`. Modal lists affected bookings (reference, customer, date, lane). Admin chooses "Cancel (keep current count)" or "Save Anyway". See `src/app/admin/settings/page.tsx` — `saveGeneral` + `commitLaneSave`. Real DB must enforce the same check server-side. |
| X6 | Cancel series with waitlisted sibling | ✅ PASS | `cancelSeries` includes `status === "waitlisted"` in its filter — waitlisted sessions are cancelled along with confirmed ones. |
| X7 | Walk-in booking on manage page | ✅ PASS | `isWalkIn: true` bookings render the manage page correctly. Reschedule and Cancel actions are available. No special blocking. |
| X8 | Reschedule series session to sibling's date | ⚠ GAP | Same-time collision is blocked (instructor conflict check). Different-time on same date as a sibling IS allowed — both siblings can end up on the same date at different times. Real DB must add: `WHERE date = new_date AND recurring_series_id = series_id AND id != booking_id AND status = 'confirmed'` to the slot-filter query. |
| X9 | Admin narrows availability after booking exists | ✅ PASS | `upsertAvailability` overwrites the slots array; existing confirmed bookings are unaffected (stored independently). New bookings and reschedules correctly see only the new narrower slot set. |
| X10 | Saturday operating hours in booking wizard | ✅ PASS | `isSlotWithinHours` uses `slot >= oh.openTime && slot < oh.closeTime`. Saturday 09:00–17:00 correctly excludes 07:00, 08:00, 17:00, 18:00 from availability. |
| X11 | Flagged customer self-booking | ✅ PASS (blocks) | **Correction to original hypothesis.** Flag is NOT purely admin-visibility. `book/page.tsx:251`: `if (match && (!match.isActive \|\| match.isFlagged))` — flagged customers are blocked at Step 4 with "We're unable to process bookings for this account." Real DB must enforce this check server-side (not just client-side). |
| X12 | Wizard back-navigation state | ✅ PASS | Back from step 4 → 3 → 2 → 1 and forward again: all step state preserved. Changing instructor resets date/time (correct — different instructor has different availability). |
| X13 | Deactivated customer re-books same email | ✅ PASS (blocks) | Same code path as X11. `!match.isActive` triggers the same `flagError` block at Step 4. Customer record stays `isActive: false` — wizard never creates a new record when blocked. |
| X14 | Blackout deleted — waitlisted bookings not promoted | ✅ N/A — resolved by design | Waitlisted bookings cannot exist on a blackout date by design. The public wizard blocks all bookings (confirmed and waitlisted) on blackout dates. The "Add Blackout" conflict modal cancels any existing confirmed or waitlisted bookings on that date before the blackout is saved. Auto-promotion on blackout deletion is not required. |

### Fixes Applied to Prototype

| Gap | Fix | File |
|---|---|---|
| X5 — Lane count reduction | Conflict modal added: detects future confirmed bookings on lanes above new count, lists them, requires explicit "Save Anyway" to proceed | `src/app/admin/settings/page.tsx` |

### Remaining Gaps for Real DB Implementation (priority order)

1. **X11/X13** — Customer flag/inactive check must be enforced server-side (currently client-only)
2. **X8** — Reschedule allows same-date different-time sibling collision within a series (acceptable by design — documented only)

---

## 15. Admin Panel Overview

All admin pages are under `/admin/*`, protected by `src/middleware.ts` (checks `admin_session=authenticated` cookie set by `/api/admin/auth`).

| Page | Path | Features |
|---|---|---|
| Dashboard | `/admin` | Today's schedule grid (6 AM–9:30 PM), lane columns, quick stats |
| Bookings | `/admin/bookings` | Upcoming/past tabs, filter by instructor/status/date, booking detail modal, cancel/reschedule/confirm-waitlisted |
| Customers | `/admin/customers` | Customer list, flag/unflag, activate/deactivate, no-show count |
| Instructors | `/admin/instructors` | CRUD instructors, view stats, manage date-specific availability |
| Schedule | `/admin/schedule` | Visual grid of upcoming sessions |
| Waitlist | `/admin/waitlist` | Slot-notification waitlist entries, promote to booking |
| Notifications | `/admin/notifications` | Notification log with delivery status |
| Settings | `/admin/settings` | Facility info, operating hours, blackout management, lane count |
