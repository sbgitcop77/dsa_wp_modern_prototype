# DSA Prototype — Full Test Suite

All tests run in the browser preview against Zustand in-memory store (localStorage).
Reset store between runs: open DevTools → Application → localStorage → delete `dsa-app-store` → reload.

---

## Last Full Run Results — 2026-07-05

| Group | Test | Result | Method |
|---|---|---|---|
| A | A7 — Recurring series blocked by annual blackout | ✓ | UI |
| A | A8 — Today's past time slots hidden | ✓ | Code verified |
| C | C2 — Completed booking → NotFound | ✓ | UI |
| C | C3 — Within 24h → read-only | ✓ | UI (prev session) |
| C | C4 — Past booking → NotFound | ✓ | UI |
| C | C5 — Invalid ref → NotFound | ✓ | UI |
| C | C6 — Cancelled booking → AlreadyCancelled | ✓ | UI |
| C | C7 — Reschedule with no slots available | ✓ | UI (prev session) |
| C | C8 — Child booking shows child details | ✓ | UI |
| D | D8+D9 — New customer created; same email deduplicates | ✓ | UI |
| E2E | E2E-1 — Public book → visible in Admin Bookings | ✓ | UI |
| E2E | E2E-2 — Admin cancels → manage shows AlreadyCancelled | ✓ | UI |
| E2E | E2E-3 — Admin reschedules → manage shows new date | ✓ | UI |
| E2E | E2E-4 — Admin adds blackout → wizard blocks date | ✓ | UI |
| E2E | E2E-5 — Recurring series → admin cancels all | ✓ | UI |
| E2E | E2E-6 — Deactivate customer → bookings cancelled → manage AlreadyCancelled | ✓ | UI |
| E2E | E2E-7 — Waitlisted confirmed → manage shows Confirmed | ✓ | UI |
| E2E | E2E-8 — New public booking → customer in Admin Customers | ✓ | UI |
| N | N1 — Confirmation: email+SMS+calendar→customer, email→admin (4 records) | ✓ | UI |
| N | N2 — Cancellation: email+SMS→customer, email→admin (3 records, no calendar) | ✓ | Code |
| N | N3 — Change/reschedule: email+SMS→customer, email→admin (3 records, no calendar) | ✓ | Code |
| N | N4 — SMS opt-out: email+calendar→customer, email→admin (3 records on confirmation) | ✓ | UI |
| N | N5 — Waitlisted booking at creation: email+SMS→customer, email→admin (type "waitlist") | ✓ | Code |
| W | W4 — 3 waitlisted same slot; confirm one → others disabled | ✓ | UI |
| W | W5 — Remove entry cancels booking, others unaffected | ✓ | Data |
| W | W6 — Multiple groups render independently | ✓ | UI |
| W | W7 — Recurring series mixed confirmed/waitlisted | ✓ | Data |
| W | W8 — Manage page for waitlisted booking renders | ✓ | UI |
| W | W9 — Search filter on waitlist page | ✓ | UI |
| W | W10 — Past tab shows only past entries | ✓ | UI |
| X | X1 — Email case-insensitive dedup | ✓ | Data |
| X | X2 — Series count integrity (cancelled siblings counted) | ✓ | Data |
| X | X3 — Cancel series skips pre-cancelled siblings | ✓ | Data |
| X | X4 — Delete instructor → no crash | ✓ | UI |
| X | X5 — Reduce lane count → no crash | ✓ | UI |
| X | X6 — Cancel series hits waitlisted siblings | ✓ | Data |
| X | X7 — Walk-in booking on manage page renders | ✓ | UI |
| X | X8 — Reschedule to sibling date collision | ✓ | UI (prev session) |
| X | X9 — Narrowed availability: existing booking survives | ✓ | UI (prev session) |
| X | X10 — Saturday hours enforced in wizard | ✓ | Code verified |
| X | X11 — Flagged customer not blocked by wizard | ✓ | Code+Data |
| X | X12 — Back-navigation preserves wizard state | ✓ | Code verified |
| X | X13 — Deactivated customer re-book: stays inactive | ✓ | Data |
| X | X14 — Delete blackout: no auto-promote | ✓ | Code verified |

**Total: 44 tests — all ✓**

---

## Gap & Alternate Scenario Run — 2026-07-05

| # | Scenario | Result | Method | Notes |
|---|---|---|---|---|
| G1 | Customer reschedule via manage page — N3 channels correct | ✓ | Code | manage/[ref]/page.tsx:286 uses type "change"; notifyBoth: email+SMS→customer, email→admin, no calendar |
| G2 | Waitlist badge "waitlist · N waiting" in booking wizard | ✓ | Code | book/page.tsx:602–620; amber slot button with count text |
| G3 | Child booking via 5-step wizard | ✓ | Code | Step 4 "A Child" option → child fields → booking fields set correctly |
| G4 | D9 email dedup via second booking (same email) | ✓ | UI (prev session) | Covered in D8+D9 run |
| G5 | Recurring series with blackout mid-series | ✓ | Code | Blacked-out week → hard_block, skipped from booking |
| G6 | Admin deactivate: all future bookings cancelled (not just 1) | ✓ | Code | forEach loop over futureConfirmedBookings, notifyBoth per booking |
| G7 | Admin schedule cancel-slot: notifyBoth fires | ✓ | Code | admin/page.tsx:157–173, notifyBoth per cancelled booking |
| G8 | C3 — Within 24h guard | ✓ | UI (prev session) | Already in main suite |
| G9 | X8 — Reschedule to sibling date collision | ✓ | UI (prev session) | Already in main suite |
| G10 | Walk-in booking creation in admin | N/A | Finding | Feature does not exist — isWalkIn field exists in data but no admin creation UI |
| ALT-1 | Single-person waitlist group removed → group disappears | ✓ | UI | Toast shown, group gone, counter updated to "1 person waiting across 1 slot" |
| ALT-2 | Double-confirm guard (slot already filled) | ✓ | UI | Confirm button disabled:true when slot taken |
| ALT-3 | no_show booking → manage page shows NotFound | ✓ | UI | Same guard as completed/past |
| ALT-4 | Series cancel from mid-point (week 2 of 3) | ✓ | Data | Weeks 2+3 cancelled, week 1 (before fromDate) stays confirmed |
| ALT-5 | SMS opt-out toggle via admin customers UI | ✓ | Code | toggleSmsOptOut() calls updateCustomer({smsOptOut: !c.smsOptOut}) |
| ALT-6 | Reschedule to blackout date blocked | ✓ | Code | manage/[ref]/page.tsx:735–741; blackout dates excluded from availableDates |
| ALT-7 | Multiple instructors same slot — wizard shows all | ✓ | Code | Step 1 shows all activeInstructors; slot selection is per-instructor |

**Gap + alternate total: 17 scenarios — all ✓ (G10 N/A — feature not implemented)**

---

## How to Run

1. `npm run dev` → http://localhost:4000
2. Navigate to the page under test or use browser eval to seed data.
3. Admin credentials: `admin` / `diamond123`

---

## A — Availability / Scheduling Rules

### A7 — Recurring series blocked by annual blackout
- **Setup:** Add a blackout with `type: "annual"` matching the date pattern of a recurring series week (e.g., MM-DD = 07-04).
- **Action:** Attempt a recurring booking that spans that date.
- **Expect:** That week is skipped/blocked; remaining weeks book normally.

### A8 — Today's past time slots hidden in booking wizard
- **Setup:** It's 2 PM. Instructor has 9 AM, 11 AM, 2 PM, 4 PM slots today.
- **Action:** Select today's date in the booking wizard.
- **Expect:** Only 4 PM slot is shown; 9 AM, 11 AM, 2 PM are hidden (past).

---

## C — Customer-facing Manage Page

### C2 — Manage page for completed/no_show booking
- **Setup:** Booking with `status: "completed"` or `"no_show"`.
- **Expect:** "Booking Not Found" screen.

### C3 — Manage page within 24 hours
- **Setup:** Confirmed booking starting in < 24 h.
- **Expect:** Read-only "Within 24h" screen — no cancel/reschedule options.

### C4 — Manage page for past booking
- **Setup:** Confirmed booking with `date < today`.
- **Expect:** "Booking Not Found" screen.

### C5 — Manage page with invalid ref
- **Action:** Navigate to `/manage/DSA-DOES-NOT-EXIST`.
- **Expect:** "Booking Not Found" screen.

### C6 — Manage page for already-cancelled booking
- **Setup:** Booking with `status: "cancelled"`.
- **Expect:** "Already Cancelled" screen.

### C7 — Manage reschedule with no available slots
- **Setup:** Instructor has no availability on the rescheduled date.
- **Action:** Select a date in the reschedule flow — no slots appear.
- **Expect:** "No available times" message shown.

### C8 — Manage page for child booking
- **Setup:** Booking with `isForChild: true`, `childAge`, `relationshipToCustomer` set.
- **Expect:** Child details (age, relationship) shown in booking summary.

---

## D — Customer Deduplication

### D8+D9 — New customer on first booking; same email deduplicates
- **D8:** Book with a brand-new email → new Customer record created in admin Customers.
- **D9:** Book again with the same email (case-insensitive) → existing customer reused, no duplicate created.

---

## E2E — End-to-End Cross-Page Flows

### E2E-1 — Public book → visible in Admin Bookings
- **Action:** Complete 5-step booking wizard with new customer.
- **Expect:** Booking appears in `/admin/bookings` immediately.

### E2E-2 — Admin cancels booking → manage page shows AlreadyCancelled
- **Action:** Admin cancels a booking in `/admin/bookings`.
- **Action:** Customer visits `/manage/[ref]`.
- **Expect:** "Already Cancelled" screen.

### E2E-3 — Admin reschedules → manage page shows new date
- **Action:** Admin edits booking date/time in `/admin/bookings`.
- **Action:** Customer visits `/manage/[ref]`.
- **Expect:** Manage page shows the new date/time.

### E2E-4 — Admin adds blackout → booking wizard blocks that date
- **Action:** Admin adds a blackout for a future date in `/admin/schedule`.
- **Action:** Customer tries to pick that date in `/book`.
- **Expect:** Date is greyed out / unavailable.

### E2E-5 — Public recurring series → Admin cancels entire series
- **Action:** Book a 4-week recurring series via wizard.
- **Action:** Admin cancels entire series from `/admin/bookings`.
- **Expect:** All 4 bookings show `status: "cancelled"`.

### E2E-6 — Admin deactivates customer → future bookings cancelled → manage shows AlreadyCancelled
- **Action:** Admin deactivates a customer in `/admin/customers`.
- **Expect:** All future confirmed bookings for that customer become cancelled.
- **Action:** Customer visits `/manage/[ref]` for one of those bookings.
- **Expect:** "Already Cancelled" screen.

### E2E-7 — Waitlisted booking confirmed by admin → manage page shows confirmed
- **Action:** Seed a waitlisted booking.
- **Action:** Admin confirms it from `/admin/waitlist`.
- **Action:** Customer visits `/manage/[ref]`.
- **Expect:** Booking shows `status: "confirmed"` with confirmed badge.

### E2E-8 — New public booking creates customer visible in Admin Customers
- **Action:** Complete booking with a new email address.
- **Expect:** New customer record appears in `/admin/customers`.

---

## X — Edge Cases

### X1 — Email case insensitivity
- **Action:** Book with `Test@Example.COM`, then book again with `test@example.com`.
- **Expect:** Second booking reuses the same customer (no duplicate).

### X2 — Series X of Y count integrity
- **Setup:** 4-week recurring series; cancel week 2.
- **Expect:** All remaining siblings still show "Session X of 4" — total count unchanged.

### X3 — Cancel series when some sessions already cancelled
- **Setup:** 4-week recurring series; week 2 already cancelled.
- **Action:** Cancel entire series from week 1.
- **Expect:** Weeks 1, 3, 4 cancelled. Week 2 stays cancelled (no double-cancel or error).

### X4 — Remove instructor with future bookings
- **Action:** Delete an instructor who has future bookings via `/admin/instructors`.
- **Expect:** Admin panel doesn't crash; bookings referencing the deleted instructor still render.

### X5 — Reduce lane count below current bookings
- **Action:** In `/admin/settings`, reduce active lanes from 4 to 1 when 2+ confirmed bookings exist for the same slot.
- **Expect:** Setting saves; no crash; existing bookings remain (no auto-cancel).

### X6 — Waitlisted booking in recurring series: cancel series cancels waitlisted too
- **Setup:** 3-week recurring series; weeks 2 and 3 are waitlisted.
- **Action:** Cancel the series.
- **Expect:** Weeks 2 and 3 (waitlisted) are also cancelled — `cancelSeries` targets `confirmed` AND `waitlisted`.

### X7 — Walk-in booking on manage page
- **Setup:** Booking with `isWalkIn: true`.
- **Action:** Visit `/manage/[ref]`.
- **Expect:** Manage page renders correctly (no crash); walk-in label shown.

### X8 — Reschedule series session to date colliding with another sibling
- **Setup:** 3-week recurring series (weeks A, B, C).
- **Action:** Try to reschedule week A to the same date as week B.
- **Expect:** Collision detected; user shown error or sibling warning.

### X9 — Admin availability narrowed after booking: existing slot survives
- **Setup:** Instructor has 9 AM–5 PM availability. Customer books 2 PM slot.
- **Action:** Admin narrows availability to 9 AM–1 PM.
- **Expect:** Existing 2 PM booking survives (no auto-cancel); new bookings at 2 PM are blocked.

### X10 — Saturday hours enforced in booking wizard
- **Setup:** Operating hours: Mon–Fri 8 AM–8 PM, Sat 9 AM–5 PM.
- **Action:** Select a Saturday in the booking wizard.
- **Expect:** Only slots within 9 AM–5 PM window shown; no 8 AM slots.

### X11 — Flagged customer can still book
- **Setup:** Customer with `isFlagged: true`.
- **Action:** Customer books via public wizard.
- **Expect:** Booking succeeds — flag is admin-only visibility, doesn't block public wizard.

### X12 — Booking wizard back-navigation preserves state
- **Action:** Progress to Step 3 in booking wizard, click Back to Step 2, then Back to Step 1.
- **Expect:** All previously selected values (instructor, date, time, etc.) are preserved when navigating forward again.

### X13 — Deactivated customer re-books with same email
- **Setup:** Customer deactivated (`isActive: false`).
- **Action:** New booking submitted with that same email.
- **Expect:** Booking is created under the existing (inactive) customer record — account stays inactive.

### X14 — Blackout deleted: waitlisted bookings don't auto-promote
- **Setup:** Blackout on a date; waitlisted booking for that date.
- **Action:** Admin deletes the blackout.
- **Expect:** Waitlisted booking stays waitlisted — no automatic promotion triggered.

---

## W — Waitlist System

### W4 — 3 people waitlisted for the same slot; confirm one
- **Setup:** Seed 3 waitlisted bookings (Alice, Bob, Carol) for same instructor+date+time.
- **Action:** Admin confirms Alice from `/admin/waitlist`.
- **Expect:**
  - Alice: `status: "confirmed"`
  - Bob + Carol: `status: "waitlisted"` (unchanged)
  - "Slot filled" badge appears on group header
  - Bob + Carol's Confirm buttons disabled
  - Notifications: email + SMS + calendar sent to Alice (confirmation type); email-only to Admin
  - Bob and Carol receive NO notification

### W5 — Remove entry from waitlist
- **Action:** Admin clicks Remove on a waitlisted entry.
- **Expect:** Booking changes to `status: "cancelled"` (reason: "Removed from waitlist by admin"); entry disappears from waitlist page; remaining entries in the group unaffected.

### W6 — Multiple independent groups render separately
- **Setup:** Waitlisted bookings across 3 different instructor+date+time combinations.
- **Expect:** 3 separate group cards on waitlist page; each group's Confirm/Remove actions affect only their own group.

### W7 — Recurring series with mixed confirmed/waitlisted weeks
- **Setup:** 3-week recurring series: week 1 confirmed, weeks 2+3 waitlisted.
- **Expect:** Weeks 2+3 appear as separate groups on waitlist page (different dates = different groups).
- **Cancel series from week 2:** Both waitlisted weeks get cancelled (`cancelSeries` targets `confirmed` AND `waitlisted`).

### W8 — Manage page for a waitlisted booking
- **Action:** Visit `/manage/[ref]` for a waitlisted booking.
- **Expect:** Page renders with booking details, "Waitlisted" status badge, and appropriate messaging. No crash.

### W9 — Search filter on waitlist page
- **Action:** Type a customer name in the search box on `/admin/waitlist`.
- **Expect:** Only groups containing a matching customer are shown; other groups hidden.

### W10 — Past tab shows past waitlisted entries
- **Action:** Click "past" tab on `/admin/waitlist`.
- **Expect:** Only entries with `date < today` shown; upcoming entries hidden.

---

## N — Notification Channel Correctness

### N1 — Booking confirmation: email + SMS + calendar to customer, email to admin
- **Trigger:** Admin confirms a waitlisted booking.
- **Expect:** 4 notification records created:
  - `channel: "email"`, `recipientType: "customer"`
  - `channel: "sms"`, `recipientType: "customer"` (unless `smsOptOut: true`)
  - `channel: "calendar"`, `recipientType: "customer"` ← confirmation only
  - `channel: "email"`, `recipientType: "admin"` ← email only, no SMS or calendar

### N2 — Cancellation: email + SMS to customer (no calendar), email to admin
- **Trigger:** Admin or customer cancels a booking.
- **Expect:** 3 notification records with `notificationType: "cancellation"`:
  - `channel: "email"`, `recipientType: "customer"`
  - `channel: "sms"`, `recipientType: "customer"` (unless `smsOptOut: true`)
  - `channel: "email"`, `recipientType: "admin"`
  - No calendar invite — calendar is sent only on confirmation.

### N3 — Change/reschedule: email + SMS to customer (no calendar), email to admin
- **Trigger:** Customer or admin reschedules a booking (`notificationType: "change"`).
- **Expect:** Same 3-record pattern as N2 — no calendar.

### N4 — SMS opt-out respected
- **Setup:** Customer with `smsOptOut: true`.
- **Trigger:** Confirmation action (calls `notifyBoth` with type "confirmation").
- **Expect:** 3 notification records — email + calendar for customer, email for admin — no SMS.

### N5 — Waitlisted booking at creation: email + SMS to customer, email to admin
- **Action:** Customer books a slot with instructor conflict (gets waitlisted).
- **Expect:** 3 notification records created with `notificationType: "waitlist"`:
  - `channel: "email"`, `recipientType: "customer"`
  - `channel: "sms"`, `recipientType: "customer"` (unless `smsOptOut: true`)
  - `channel: "email"`, `recipientType: "admin"`
  - No calendar invite (calendar is confirmation-only).

---

## Notification Triggers by Page

| Page | Action | notifyBoth type | Customer channels | Admin channel |
|---|---|---|---|---|
_Customer always gets: email + SMS (if !smsOptOut) + calendar. Admin always gets: email only._

| Page | Action | notifyBoth type |
|---|---|---|
| `/admin/` (dashboard) | Admin cancels from schedule grid | cancellation |
| `/admin/bookings` | Admin cancels booking | cancellation |
| `/admin/bookings` | Admin reschedules booking | change |
| `/admin/customers` | Admin deactivates customer → future bookings | cancellation (per booking) |
| `/admin/schedule` | Admin cancels all bookings for a time slot | cancellation (per booking) |
| `/admin/waitlist` | Admin confirms waitlisted booking | confirmation |
| `/manage/[ref]` | Customer cancels booking | cancellation |
| `/manage/[ref]` | Customer reschedules booking | change |
| `/book` | New confirmed booking | confirmation |
| `/book` | New waitlisted booking | waitlist |
