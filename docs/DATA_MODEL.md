# DSA Data Model Reference

**Source of truth**: `src/data/types.ts`  
**Mock implementations**: `src/data/mock/*.ts`  
**Store**: `src/data/store/useAppStore.ts`

All entities are TypeScript interfaces. There is no real database — data lives in Zustand's `persist` store (localStorage key `dsa-app-store`) and is seeded from mock generators on first load or when the store version changes.

> **Note:** `src/data/mock/waitlist.ts` was removed. The `WaitlistEntry` type and its separate queue concept were replaced — waitlisted sessions are now regular `Booking` records with `status: "waitlisted"`.

---

## Entity Overview

| Entity | File | Seeded Count | Purpose |
|---|---|---|---|
| `Customer` | `mock/customers.ts` | 150 | People who book sessions |
| `Instructor` | `mock/instructors.ts` | 11 | Staff who deliver sessions |
| `Booking` | `mock/bookings.ts` | ~3,000 | A scheduled training session (includes waitlisted bookings) |
| `InstructorAvailability` | `mock/schedule.ts` | ~900 | Available time slots per instructor per date |
| `OperatingHours` | `mock/schedule.ts` | 7 | Facility open/close per day of week |
| `Blackout` | `mock/schedule.ts` | 0 (empty) | Dates when facility is closed |
| `NotificationRecord` | `mock/notifications.ts` | ≤300 | Log of emails/SMS/calendar events sent |
| `FacilitySettings` | `types.ts` only | — | Singleton facility config (no mock data) |

---

## Customer

**File**: `src/data/mock/customers.ts`  
**Seed**: 150 deterministic records, seeded with `RNG(42)`  
**Store key**: `customers[]`

Represents a person who books sessions at the facility. Customers are created automatically when someone completes the public booking wizard (deduplication by email).

```ts
type Customer = {
  id: string;                    // "c1" … "c150"
  firstName: string;
  lastName: string;
  email: string;                 // Unique. Lowercase. Used for deduplication.
  phone: string;                 // Format: "(443) 555-XXXX"
  isActive: boolean;             // false = deactivated; future bookings auto-cancelled
  isFlagged: boolean;            // Auto-set: noShowCount ≥ 2 OR lateCancellationCount ≥ 3
  noShowCount: number;           // Incremented by admin on "no show" status
  lateCancellationCount: number; // Incremented when cancelled within 24 h of session
  smsOptOut: boolean;            // If true, no SMS reminders are sent
  source: "online_booking" | "admin_booking" | "import";
  createdAt: string;             // ISO 8601 UTC
  deactivatedAt?: string;        // Set when isActive → false. Never cleared.
};
```

**Business rules**:
- `isFlagged` can be toggled manually by admin (Flag/Unflag button) or set automatically when the increment buttons cross a threshold: `noShowCount ≥ 2 OR lateCancellationCount ≥ 3`. Auto-flagging fires only in the `incrementNoShow` / `incrementLateCancel` handlers in `admin/customers/page.tsx` — `MockDataService.updateCustomer()` itself does not recalculate it
- Deactivated customers' future **confirmed and waitlisted** bookings are all cancelled when `isActive` is set to false; a cancellation notification is sent for each
- Email matching is case-insensitive; `test@EMAIL.com` and `test@email.com` are the same customer
- `source` is cosmetic — it does not restrict any operations

---

## Instructor

**File**: `src/data/mock/instructors.ts`  
**Seed**: 11 hand-authored records (i1–i11; i4 is inactive)  
**Store key**: `instructors[]`

Represents a coach or trainer. Instructors have a weekly recurring availability template plus per-date overrides.

```ts
type Instructor = {
  id: string;                     // "i1" … "i11"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  speciality: string;             // Display label, e.g. "Hitting & Pitching"
  type: string;                   // Display type for filter pills, e.g. "Lane Instructor"
  instructor_type: string;        // "lane" for all current instructors (stub for future non-lane types)
  isActive: boolean;
  totalSessionsDelivered: number; // Static display counter; not recalculated from bookings
  upcomingSessions: number;       // Static display counter; not recalculated from bookings
  createdAt: string;
  deactivatedAt?: string;
  availability: InstructorSchedule;
};

type InstructorSchedule = {
  recurring: Record<number, DaySlot>; // Keys 0 (Sun) through 6 (Sat) — weekly default template
  scheduledDates: Record<string, DaySlot>; // "YYYY-MM-DD" keys — per-date overrides
  frozen: boolean;                // UI stub: Freeze button exists but does not affect logic
};

type DaySlot = {
  active: boolean;      // false = not available that day
  start: string | null; // HH:MM, e.g. "09:00"
  end: string | null;   // HH:MM, e.g. "17:00"
};
```

**Notes**:
- `InstructorAvailability` records (used by the booking wizard) are derived from `INSTRUCTOR_PATTERNS` in `schedule.ts`, not from the `Instructor.availability` field. The two systems are currently independent.
- `type` and `instructor_type` are separate: `type` is the admin-visible display label; `instructor_type` is reserved for booking routing logic (currently all `"lane"`).

---

## Booking

**File**: `src/data/mock/bookings.ts`  
**Seed**: ~3,000 records covering 30 days back to 90 days forward  
**Store key**: `bookings[]`

The central entity. One booking = one training session between one customer and one instructor in one lane.

```ts
type Booking = {
  id: string;                    // "b1", "b2", …
  bookingReference: string;      // "DSA-YYYY-NNNNN" — shown to customer; used on manage page
  cancellationToken: string;     // "tok-bN-XXXXXXXX" — in the /manage/[ref] URL
  customerId: string;            // FK → Customer.id
  customerName: string;          // Denormalized from Customer at booking time
  instructorId: string;          // FK → Instructor.id
  instructorName: string;        // Denormalized from Instructor at booking time
  date: string;                  // "YYYY-MM-DD"
  startTime: string;             // "HH:MM" (30-minute aligned)
  endTime: string;               // "HH:MM" (computed: startTime + durationMinutes)
  durationMinutes: 30 | 60;
  status: "confirmed" | "cancelled" | "no_show" | "completed" | "waitlisted";
  isForChild: boolean;           // True when the booker is scheduling for another athlete
  childName?: string;            // Athlete's name when isForChild = true
  childAge?: number;             // Athlete's age (1–99) when isForChild = true
  relationshipToCustomer?: string; // "Parent", "Guardian", "Coach", etc.
  bookedByName?: string;         // The booking customer's name when isForChild = true
  isRecurring: boolean;          // Part of a multi-week recurring series
  recurringSeriesId?: string;    // "series-N" — shared by all siblings in the series
  isWalkIn: boolean;             // Legacy field — walk-in concept removed. Always false on new bookings. Retained in type to avoid breaking existing seed data.
  cancelledBy?: "customer" | "admin";
  cancellationReason?: string;
  conflictReason?: "instructor_conflict"; // Set when status = "waitlisted"
  laneAssigned?: number;         // 1–4; undefined or 0 for waitlisted bookings
  createdAt: string;             // ISO 8601 UTC
};
```

**Key behaviors**:
- The `/manage/[ref]` URL uses `bookingReference` (e.g. `/manage/DSA-20260711-4823`). Both the confirmation screen link and the manage page lookup use `bookingReference`.
- When `isForChild = true`, the admin Customer column shows `childName` (the participant) rather than `customerName` (the booker).
- `recurringSeriesId` links siblings. Cancelling a series cancels all future siblings with the same `recurringSeriesId` and `status !== "cancelled"`.
- `status = "waitlisted"` means the instructor was already booked at this slot. `conflictReason` is always `"instructor_conflict"` — lane capacity conflicts do not produce waitlisted bookings in the current implementation.

---

## InstructorAvailability

**File**: `src/data/mock/schedule.ts`  
**Seed**: ~900 records covering 13 weeks from today  
**Store key**: `availability[]`

Flattened date-keyed availability records. One record = one instructor on one date with a list of available 30-minute start times. This is what the public booking wizard queries to show available slots.

```ts
type InstructorAvailability = {
  id: string;              // "av1", "av2", …
  instructorId: string;    // FK → Instructor.id
  instructorName: string;  // Denormalized
  date: string;            // "YYYY-MM-DD"
  slots: string[];         // HH:MM start times, e.g. ["09:00","09:30","10:00",…]
  endTime: string;         // HH:MM — bookings must end by this time
  frozen: boolean;         // UI stub for upcoming Freeze button feature; not enforced
};
```

**Notes**:
- `slots` are generated from `INSTRUCTOR_PATTERNS` in `schedule.ts`. The booking wizard filters these against existing bookings to determine which slots are still open.
- A slot is "full" when all 4 lanes are occupied at that time. Overflow slots get `status = "waitlisted"`.
- Facility blackout dates are excluded at generation time.

---

## OperatingHours

**File**: `src/data/mock/schedule.ts`  
**Seed**: 7 static records (one per day of week)  
**Store key**: `operatingHours[]`

Defines when the facility is open. The public booking wizard and schedule grids use these for grid boundaries.

```ts
type OperatingHours = {
  id: string;          // "oh1" … "oh7"
  dayOfWeek: string;   // "Monday", "Tuesday", … "Sunday"
  openTime: string;    // "HH:MM" — currently "06:00" for all days
  closeTime: string;   // "HH:MM" — currently "24:00" (midnight) for all days
  isClosed: boolean;   // true = facility closed that day; currently false for all days
};
```

**Current values**: Open 06:00–24:00 every day. Editable via Admin Settings.

---

## Blackout

**File**: `src/data/mock/schedule.ts`  
**Seed**: Empty array (`BLACKOUTS = []`)  
**Store key**: `blackouts[]`

Dates on which the facility is unavailable. The booking wizard filters blackout dates out of the calendar picker.

```ts
type Blackout = {
  id: string;
  date: string;         // "YYYY-MM-DD" for one-time; "MM-DD" for recurring annual blackouts
  isRecurring: boolean; // true = matches every year on the same MM-DD
  reason: string;       // Free text, shown to customer
};
```

**Notes**:
- Matching logic: `isRecurring ? b.date.slice(5) === dateStr.slice(5) : b.date === dateStr`
- Blackouts start empty and are added by admin via Settings → Blackout Dates.
- Deleting a blackout does **not** auto-confirm waitlisted bookings for that date.

---

## NotificationRecord

**File**: `src/data/mock/notifications.ts`  
**Seed**: ≤300 records derived from the past 30 days of bookings, seeded with `RNG(7777)`  
**Store key**: `notifications[]`

An immutable log entry representing one message sent (email, SMS, or calendar event). Created via `notifyBoth()` in `src/data/service/notifyUtils.ts`.

```ts
type NotificationRecord = {
  id: string;                  // "n1", "n2", …
  bookingId: string;           // FK → Booking.id
  bookingReference: string;    // Denormalized from Booking
  recipientType: "customer" | "instructor" | "admin";
  recipientName: string;
  recipientEmail: string;
  notificationType:
    | "confirmation"       // Booking created
    | "waitlist"           // Booking created but waitlisted
    | "reminder_24hr"      // 24-hour advance reminder
    | "reminder_2hr_sms"   // 2-hour advance SMS reminder
    | "change"             // Booking rescheduled or modified
    | "cancellation"       // Booking cancelled
    | "calendar_invite";   // iCal event sent to instructor
  channel: "email" | "sms" | "calendar";
  sentAt: string;              // ISO 8601 UTC
  deliveryStatus: "sent" | "pending" | "failed";
};
```

**Notification channel matrix** (what gets sent per event):

| Event | Customer email | Customer SMS | Admin email | Instructor calendar |
|---|---|---|---|---|
| Booking confirmed | ✓ | ✓ | ✓ | ✓ |
| Booking waitlisted | ✓ | ✓ | ✓ | — |
| Booking changed | ✓ | ✓ | ✓ | — |
| Booking cancelled | ✓ | ✓ | ✓ | — |
| 24hr reminder | ✓ | — | — | — |
| 2hr reminder | — | ✓ | — | — |

SMS is suppressed when `Customer.smsOptOut = true`.

---

## FacilitySettings

**File**: `src/data/types.ts` only  
**Store key**: `settings` (singleton object, not an array)

Singleton record holding facility-wide configuration. Editable via Admin Settings page.

```ts
type FacilitySettings = {
  facilityName: string;   // "The Diamond Sports Academy"
  addressLine1: string;   // "8274 Lokus Rd"
  addressLine2: string;   // "Odenton, MD 21113"
  email: string;
  phone: string;          // Display form: "(443) 865-1639"
  phoneHref: string;      // tel: href: "tel:+14438651639"
  website: string;
  timezone: string;       // "America/New_York"
  activeLanes: number;    // 4 — affects lane capacity checks in booking wizard
  adminUsername: string;  // "admin" — used to validate login
  adminPassword: string;  // "diamond123" default — changeable via Settings → Security
};
```

**Note on admin credentials**: `adminUsername` and `adminPassword` are stored in `FacilitySettings` as a prototype convenience — the credentials live alongside other facility config in the Zustand `persist` store. Validation happens client-side on the login page; the API route (`/api/admin/auth`) only sets the session cookie after the client confirms credentials match. When a real database is introduced, admin credentials should be extracted into a dedicated `Admin` entity (see future state below).

**Future state — Admin entity**: When a real DB is added, admin credentials and profile should move to a separate `Admin` table:

```ts
// Future — not yet implemented
type Admin = {
  id: string;
  username: string;
  passwordHash: string;   // bcrypt hash — never store plaintext
  displayName: string;
  email: string;
  role: "superadmin" | "staff";
  createdAt: string;
  lastLoginAt?: string;
};
```

---

## Input Types (create operations)

These strip server-generated fields and are used as parameters to `MockDataService` write methods.

| Input Type | Derived From | Omitted Fields |
|---|---|---|
| `NewCustomer` | `Customer` | `id`, `createdAt`, `noShowCount`, `lateCancellationCount` |
| `NewInstructor` | `Instructor` | `id`, `createdAt`, `totalSessionsDelivered`, `upcomingSessions` |
| `NewBooking` | `Booking` | `id`, `bookingReference`, `cancellationToken`, `createdAt`, `customerName`, `instructorName`, `endTime` |
| `NewBlackout` | `Blackout` | `id` |
| `NewNotification` | `NotificationRecord` | `id`, `sentAt` |

---

## Filter Types

```ts
type BookingFilters = {
  date?: string;           // Exact date match "YYYY-MM-DD"
  instructorId?: string;
  customerId?: string;
  status?: Booking["status"];
  fromDate?: string;       // Inclusive range start
  toDate?: string;         // Inclusive range end
};
```

---

## ID Conventions

| Entity | Pattern | Example |
|---|---|---|
| Customer | `c{N}` | `c42` |
| Instructor | `i{N}` | `i7` |
| Booking | `b{N}` | `b1234` |
| Booking reference | `DSA-{YYYY}-{NNNNN}` | `DSA-2026-00042` |
| Cancellation token | `tok-b{N}-{hex8}` | `tok-b42-a3f9c100` |
| InstructorAvailability | `av{N}` | `av301` |
| OperatingHours | `oh{N}` | `oh1` |
| Blackout | `bl{N}` | `bl1` |
| Notification | `n{N}` | `n88` |
| Recurring series | `series-{N}` | `series-14` |

---

## Denormalization

Several fields duplicate data from a related entity for display performance. These are set at write time and are not updated if the source entity changes later.

| Field | Source | Duplicated In |
|---|---|---|
| `customerName` | `Customer.firstName + lastName` | `Booking` |
| `instructorName` | `Instructor.firstName + lastName` | `Booking`, `InstructorAvailability` |
| `bookingReference` | `Booking.bookingReference` | `NotificationRecord` |
| `recipientName` | Derived at notification time | `NotificationRecord` |

---

## Store Version & Migration

The Zustand store uses `persist` middleware with key `dsa-app-store`.

- **Current version**: `10`
- **Migration behavior**: any stored version lower than `10` wipes all state and re-seeds from mock generators
- **To force a re-seed**: bump the `version` number in `useAppStore.ts`
- **`skipHydration: true`**: the store does not read from localStorage until `useAppStore.persist.rehydrate()` is called in the root layout, preventing SSR hydration mismatches
