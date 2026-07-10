# DSA Prototype — Requirements, Constraints & Validations

Reference for the real NeonDB + API implementation. Every rule here was discovered, built, or corrected during prototype development. The **Source** column distinguishes original design from bugs caught in testing — bugs are highest priority to enforce server-side.

> UI-level enforcement is a convenience layer only. **All rules must be re-enforced server-side.**

---

## 1. Facility Settings

| # | Rule | Source |
|---|---|---|
| FS-01 | Single record per deployment — no multi-tenant support needed. | Original |
| FS-02 | Fields: facility name, address (2 lines), email, phone (display + `tel:` href), website, timezone, active lane count. | Original |
| FS-03 | `activeLanes` drives lane conflict logic — changing it affects all slot availability calculations. | Original |
| FS-05 | Reducing `activeLanes` must check for future confirmed bookings assigned to lanes above the new count. If any exist, admin must be shown a conflict modal listing affected bookings and must explicitly confirm ("Save Anyway") before the change is persisted. **Implemented in prototype** (`src/app/admin/settings/page.tsx`). Real DB must enforce the same check server-side. | Enhancement |
| FS-04 | Admin credentials (username + hashed password) belong in this config, not hardcoded. Prototype uses `admin / diamond123` hardcoded — this must change in production. | Enhancement |

---

## 2. Facility & Operating Hours

| # | Rule | Source |
|---|---|---|
| F-01 | 7 records — one per day of week (Monday–Sunday). | Original |
| F-02 | **Saturday is a working day** (default 9 AM–5 PM). **Sunday is closed** by default. | Enhancement |
| F-03 | Admin can mark any day closed; closed days block all bookings and instructor availability for that weekday. | Original |
| F-04 | Close time must be strictly greater than open time. Reject at API level if `closeTime <= openTime`. | Original |
| F-05 | Changing open time must cascade a reset of close time if `existingClose <= newOpen`. | Original |
| F-06 | Operating hours are day-of-week scoped, not date-specific. Date-specific closures are handled via Blackout Dates. | Original |

---

## 3. Blackout Dates

| # | Rule | Source |
|---|---|---|
| B-01 | Blackout dates block **all** bookings and instructor availability for that date — facility-wide. | Original |
| B-02 | Two types: **non-recurring** (exact YYYY-MM-DD) and **yearly recurring** (MM-DD matched across any year). | Original |
| B-03 | Admin cannot create a blackout date in the past. | Original |
| B-04 | Blackout dates (both types) must be excluded from the **public booking calendar**. | Bug fix |
| B-05 | Blackout dates must be excluded from the **admin Reschedule dialog** date picker. | Bug fix |
| B-06 | Blackout dates must be disabled (non-clickable) in the **instructor availability calendar**. | Original |
| B-07 | Recurring booking series validation must flag any future week landing on a blackout as a conflict. | Bug fix |
| B-08 | When computing blackout date offsets from a base date, **skip Sundays** (and any other closed days). A blackout on a permanently closed day is meaningless. | Bug fix |
| B-09 | Yearly recurring blackout matching: compare only MM-DD of the blackout `date` field against the candidate date. The YYYY portion is ignored for recurring entries. | Original |

---

## 4. Instructor Management

| # | Rule | Source |
|---|---|---|
| I-01 | All fields required on create/edit: First Name, Last Name, Email, Phone, Speciality, Instructor Type. | Enhancement |
| I-02 | Email must be unique and valid format. | Enhancement |
| I-03 | Phone must match `(###) ###-####` or common variants. | Enhancement |
| I-04 | Instructor Type is required; no default — must be explicitly selected. Options: **Lane Instructor** or **Non-Lane Instructor**. | Enhancement |
| I-05 | Non-Lane Instructors do not consume a lane (`laneAssigned = NULL`). | Bug fix |
| I-06 | Lane assignment must not be shown in booking detail dialogs for Non-Lane Instructors. | Bug fix |
| I-07 | Only **active** instructors appear in booking and rescheduling dropdowns. | Original |
| I-08 | Instructor dropdowns show name + speciality: `"Chris Ford — Owner & Founder"`. | Enhancement |
| I-09 | Deactivating an instructor does not cancel their existing confirmed bookings — admin must handle those separately. | Original |
| I-10 | `totalSessionsDelivered` and `upcomingSessions` are computed counters — derive from bookings table in real DB, do not store as mutable fields. | Original |

---

## 5. Instructor Availability

### 5a. Recurring Weekly Schedule (default template)

| # | Rule | Source |
|---|---|---|
| IA-01 | Each instructor has a recurring weekly template: 7 day-of-week slots (0=Sun … 6=Sat), each with `active`, `start`, `end`. | Original |
| IA-02 | The recurring template acts as the fallback when no date-specific override exists. | Original |
| IA-03 | Recurring template slots must fall within facility operating hours for that day of week. | Original |

### 5b. Date-Specific Overrides (scheduled dates)

| # | Rule | Source |
|---|---|---|
| IA-04 | Date-specific overrides take precedence over the recurring template for a given date. | Original |
| IA-05 | An override can mark a date as **inactive** (instructor unavailable) even if the recurring template says active. | Original |
| IA-06 | `start` and `end` must both be non-null when `active = true`. API must reject `active = true && (start IS NULL OR end IS NULL)`. | Bug fix |
| IA-07 | For **today's date**: start time must be ≥ the next 30-minute interval from the current time. Admin cannot set a past start time for today. | Enhancement |
| IA-08 | For **today's date**: if an existing saved start is in the past, reset it to the next valid 30-minute interval on click. Never reset to null — always reset to a concrete time so state and display agree. | Bug fix |
| IA-09 | End time must be strictly greater than start time. | Original |
| IA-10 | Saturday availability slots must respect Saturday facility hours (9 AM–5 PM), not weekday hours. | Enhancement |
| IA-11 | Two computed representations of availability must be kept in sync: (1) the per-date slot array used by the booking page and (2) the start/end record used by the admin calendar. Both are derived from the same source. In production, the DB stores start/end; slots are computed on read. | Original |
| IA-12 | `frozen` flag: when true, the availability record cannot be modified by normal admin flow — requires explicit override. | Original |

### 5c. Admin Calendar UI Rules

| # | Rule | Source |
|---|---|---|
| IA-13 | Past dates are disabled — admin cannot set or edit them. | Enhancement |
| IA-14 | Blackout dates are disabled and shown distinctly (red). | Original |
| IA-15 | Facility-closed weekdays are disabled. | Original |
| IA-16 | "Apply to all active days" copies start/end to all currently visible, active dates in the same calendar month only. | Enhancement |
| IA-17 | Changing start time resets end time if `existingEnd <= newStart`. | Enhancement |

---

## 6. Public Booking — Date & Time Selection

| # | Rule | Source |
|---|---|---|
| PB-01 | Booking calendar shows only dates where the selected instructor has available slots. | Original |
| PB-02 | Blackout dates (exact and yearly recurring MM-DD) are disabled in the booking calendar for **all coaches**. | Bug fix |
| PB-03 | Past dates are disabled in the booking calendar. | Original |
| PB-04 | For **today**: time slots at or before the current time are excluded from both available and waitlist lists. | Bug fix |
| PB-05 | Duration picker (30 min / 60 min) must be presented **before** the time slot list. Slot availability is computed for the selected duration. Default: **30 min**. | Bug fix |
| PB-06 | A slot is valid only if the full session fits within the instructor's availability window: `slotStart + durationMinutes ≤ instructorEndTime`. | Bug fix |
| PB-07 | Instructor conflict detection uses overlap logic, not exact-time match: `slotStart < existingEnd && slotEnd > existingStart`. Must account for both 30-min and 60-min existing bookings. | Bug fix |
| PB-08 | A slot moves to **waitlist** (not available) if all lanes are at capacity: `confirmedBookingsAtSlot ≥ activeLanes`. Non-Lane Instructor bookings do not count against lane capacity. | Original |
| PB-09 | Flagged customers cannot book — blocked before confirmation. | Original |
| PB-10 | Inactive customers cannot book — blocked before confirmation. | Original |
| PB-11 | Booking reference format: `DSA-YYYY-NNNNN` (zero-padded 5-digit sequence). | Original |
| PB-12 | Each booking generates a unique `cancellationToken` used by the public Manage Booking page. | Original |
| PB-13 | Child bookings capture: `isForChild`, `childAge`, `relationshipToCustomer`. | Original |
| PB-14 | Walk-in bookings (`isWalkIn = true`) are created by admin only and follow the same lane/conflict rules. | Original |

---

## 7. Recurring Bookings

| # | Rule | Source |
|---|---|---|
| R-01 | Before confirming a recurring series, **all future weeks** must be validated. | Original |
| R-02 | Per-week validation must check all four conditions: (1) instructor has the slot in their availability, (2) date is not a blackout, (3) instructor has no confirmed booking overlapping that time, (4) lanes are not full. | Bug fix |
| R-03 | Any week failing any check is flagged as a conflict. Conflicts block confirmation. | Original |
| R-04 | Recurring series is linked by a `recurringSeriesId` — all bookings in a series share the same series ID. | Original |
| R-05 | Cancelling a series must allow: cancel single occurrence vs. cancel all future occurrences from a date. | Original |
| R-06 | Rescheduling a series must allow: reschedule single occurrence vs. reschedule all future occurrences. | Original |

---

## 8. Manage Booking (Public — via Reference Link)

| # | Rule | Source |
|---|---|---|
| MB-01 | Customer accesses booking management via `cancellationToken` in the URL — no login required. | Original |
| MB-02 | Customer can cancel a single booking or a full recurring series from this page. | Original |
| MB-03 | Customer can reschedule a booking from this page (subject to same availability/blackout rules as new booking). | Original |
| MB-04 | Cancelled bookings show `cancelledBy = "customer"` and record `cancellationReason`. | Original |

---

## 9. Admin Reschedule Dialog

| # | Rule | Source |
|---|---|---|
| RS-01 | Instructor dropdown appears at the **top** of the reschedule dialog. | Enhancement |
| RS-02 | Instructor dropdown shows name + speciality. | Enhancement |
| RS-03 | Date picker shows only dates where the **selected instructor** has availability. | Bug fix |
| RS-04 | Blackout dates are excluded from the reschedule date picker. | Bug fix |
| RS-05 | Only future dates are shown. | Original |
| RS-06 | Time slot picker shows only the selected instructor's slots for the selected date. | Bug fix |
| RS-07 | Changing the instructor resets both the selected date and time. | Bug fix |
| RS-08 | Admin cancellations show `cancelledBy = "admin"`. | Original |

---

## 10. Bookings — Tabs & Filtering

| # | Rule | Source |
|---|---|---|
| BF-01 | **Upcoming** tab: `date >= today`. **Past** tab: `date < today`. Today's bookings are in **Upcoming**. | Bug fix |
| BF-02 | Bookings can be filtered by instructor, status, and date range. | Original |
| BF-03 | Booking status values: `confirmed`, `cancelled`, `no_show`, `completed`, `waitlisted`. | New feature |

---

## 11. Today's Schedule (Admin Dashboard)

| # | Rule | Source |
|---|---|---|
| TS-01 | Schedule grid runs from **6 AM to 9:30 PM**. | Enhancement |
| TS-02 | Today's bookings (`date = today`) must appear in the schedule grid. | Bug fix |
| TS-03 | Grid columns are per-lane; Non-Lane Instructor bookings span a separate column or are shown distinctly. | Original |

---

## 12. Waitlist

| # | Rule | Source |
|---|---|---|
| WL-01 | A customer can join the waitlist for a specific instructor + date + time slot when all lanes are full. | Original |
| WL-02 | Waitlist entry captures: date, time, instructorId, firstName, lastName, email, phone. Customer account not required. | Original |
| WL-03 | When a cancellation opens a slot, the waitlist entry can be converted to a confirmed booking (`convertedBookingId` set). | Original |
| WL-04 | SMS opt-out on a customer record must be respected for waitlist notifications. | Original |

---

## 13. Notifications

| # | Rule | Source |
|---|---|---|
| N-01 | Notification types: `confirmation`, `reminder_24hr`, `reminder_2hr_sms`, `change`, `cancellation`, `calendar_invite`. | Original |
| N-02 | Channels: `email`, `sms`, `calendar`. | Original |
| N-03 | Recipients: `customer`, `instructor`, `admin`. | Original |
| N-04 | Delivery status tracked: `sent`, `pending`, `failed`. | Original |
| N-05 | SMS notifications must check `customer.smsOptOut` before sending. | Original |
| N-06 | In production, notifications are written records created at send time — not derived at load time from bookings. | Original |

---

## 14. Customer Rules

| # | Rule | Source |
|---|---|---|
| C-01 | Customers are created by the booking flow (online) or by admin — no self-registration. | Original |
| C-02 | `source` values: `online_booking`, `admin_booking`, `import`. | Original |
| C-03 | Flagged customers cannot book. Flag reason should be recorded. | Original |
| C-03a | **Server-side enforcement required.** The flagged-customer booking block is currently implemented client-side only (`book/page.tsx` Step 4 check). In production, the booking creation API endpoint must re-validate `isFlagged` before persisting — client-side checks alone can be bypassed. | Testing (X11) |
| C-04 | Inactive customers cannot book. `deactivatedAt` timestamp recorded on deactivation. | Original |
| C-04a | **Server-side enforcement required.** The inactive-customer booking block is currently implemented client-side only (`book/page.tsx` Step 4 check). In production, the booking creation API endpoint must re-validate `isActive` before persisting — client-side checks alone can be bypassed. | Testing (X13) |
| C-05 | `noShowCount` and `lateCancellationCount` are incremented by admin action — not automatically. | Original |
| C-06 | Customer email must be unique — used as the lookup key at booking time. | Original |
| C-07 | `smsOptOut` must be checked before any SMS notification is sent. | Original |

---

## 15. Display & Formatting Rules

| # | Rule | Source |
|---|---|---|
| D-01 | Time range display must include minutes when non-zero: `"2–4:30 PM"` not `"2–4 PM"`. | Bug fix |
| D-02 | Lane number is shown in booking details only for Lane Instructor bookings. | Bug fix |
| D-03 | Instructor availability slots are 30-minute intervals computed from `start` to `end` (exclusive). | Original |
| D-04 | `bookingReference` and `cancellationToken` are system-generated — never user-supplied. | Original |

---

## 16. Public Booking — Test Scenarios

Covers the public booking wizard (`/book`) and manage-booking page (`/manage/[ref]`).
All scenarios run against **seed data only** — no pre-loaded bookings or customers.
Bookings are created progressively through the wizard during the test run.

**Seed data baseline (as of Jul 4, 2026)**

| Item | Detail |
|---|---|
| Instructors | Chris Ford, Coach Megan, Syeed Mahdi, Connor Hax |
| Active lanes | 4 |
| Blackout dates | Jul 9 (Facility Maintenance), Jul 16 (Staff Training), Jul 23 (Private Event), Aug 3 (Annual Deep Clean — recurring) |
| Bookings at start | Empty |
| Customers at start | Empty |

**Key availability windows used in scenarios**

| Instructor | Date | Window |
|---|---|---|
| Chris Ford | Jul 8 | 13:00–17:00 |
| Chris Ford | Jul 25 | 10:00–13:30 |
| Syeed Mahdi | Jul 8 | 13:30–17:30 |
| Syeed Mahdi | Jul 10 | 15:00–19:00 |
| Syeed Mahdi | Jul 14 | 13:00–17:00 |
| Syeed Mahdi | Jul 25 | 14:00–17:30 |
| Connor Hax | Jul 4 | 11:00–15:00 (today — partially past) |
| Connor Hax | Jul 7 | 10:00–14:00 |
| Connor Hax | Jul 12 | 09:00–13:00 |
| Connor Hax | Jul 14 | 11:00–15:00 |
| Coach Megan | Jul 9 | 08:00–11:30 (blackout — no slots shown) |

---

### Group A — Booking Wizard

| # | Scenario | Instructor / Date / Time | Expected Result |
|---|---|---|---|
| A1 | Single session, self, 30 min | Chris Ford / Jul 8 / 13:00 | Confirmation shows ref, name, date, time range 1:00–1:30 PM. Store: 1 confirmed booking, `endTime: "13:30"`. |
| A2 | Single session, self, 60 min | Syeed Mahdi / Jul 10 / 15:00 | Slot 15:00 present (ends 16:00 ≤ 19:00 window). Store: `endTime: "16:00"`. |
| A3 | 60 min slot window enforcement | Chris Ford / Jul 25 / 10:00–13:30 | Slots 10:00–12:30 present. Slot 13:00 **absent** (would end 14:00, past 13:30 endTime). |
| A4 | Single session, child booking | Connor Hax / Jul 14 / 11:00 | Review shows child name + booked-by name. Store: `isForChild: true`, `childAge`, `relationship` set. |
| A5 | Back-navigation preserves state | Any instructor / any date | Fill steps 1–4 → back to step 2 → change time → re-advance. Step 3 retains recurring choice. Step 4 fields still filled. Review shows updated time. |
| A6 | Blackout date not selectable | Coach Megan / Jul 9 | Jul 9 disabled in calendar. No slots shown. |
| A7 | Recurring blackout not selectable | Any instructor / Aug 3 | Aug 3 disabled via MM-DD match on `isRecurring: true` blackout. |
| A8 | Today's past slots excluded | Chris Ford / Jul 4 (today) | All Chris Ford slots (09:00–12:30) in the past — none shown. Connor Hax slots up to current time excluded. |
| A9 | Recurring series — blackout conflict | Coach Megan / Jul 2 / any time / 4 weeks | Week 2 lands Jul 9 (blackout). Conflict error shows Jul 9 in list. Next blocked. |
| A10 | Recurring series — no availability conflict | Connor Hax / Jul 7 / 11:00 / 2 weeks | Week 2 = Jul 14, Connor available 11:00–15:00. Both weeks valid. Store creates 2 bookings with matching `recurringSeriesId`. |
| A11 | Recurring series — reduce weeks to resolve conflict | Any conflict case from A9 | Reduce to 1 week → conflict clears → Next enabled → booking proceeds. |
| A12 | Flagged/inactive customer blocked | Any slot | Inject flagged customer via store eval. Enter their email on step 4. Error banner shown, cannot advance to step 5. |
| A13 | Required fields — self booking | Step 4 self | Next disabled until firstName + lastName + email filled. Phone omitted → Next still enables. |
| A14 | Required fields — child booking | Step 4 child | Next disabled until child firstName + lastName + age + relationship + guardian firstName + lastName + email + phone all filled. |
| A15 | Instructor conflict blocks slot | Chris Ford / Jul 8 / 13:00 (second attempt after A1) | Slot 13:00 absent — instructor already booked there. |
| A16 | Lane overbooking blocks slot | 4 different lane instructors / Jul 14 / 13:00 | After 4 bookings at same time, 5th attempt finds that slot absent (lane capacity reached). |

---

### Group B — Cancel Booking (`/manage/[ref]`)

*Prereq: create bookings via wizard before each scenario.*

| # | Scenario | Setup | Expected Result |
|---|---|---|---|
| B1 | Cancel single session | Chris Ford / Jul 8 / 13:30 | Cancelled confirmation screen. Store: `status: "cancelled"`, `cancelledBy: "customer"`. |
| B2 | Access already-cancelled booking | Booking from B1 | "Already cancelled" screen shown — no action form. |
| B3 | Invalid booking reference | Navigate to `/manage/FAKE-REF` | "Booking not found" screen. |
| B4 | Cancel within 24-hour window | Booking for Jul 5 (tomorrow — within 24h of Jul 4) | Cancel option replaced with "call us" message. No cancel button rendered. |
| B5 | Cancel single from recurring series | 2-week recurring: Connor Hax / Jul 7 + Jul 14 | Choose "this session only" → Jul 7 cancelled. Jul 14 remains `confirmed`. |
| B6 | Cancel entire recurring series | Same series as B5 | Choose "all sessions" → both Jul 7 and Jul 14 `cancelled`. Success screen shows series-specific copy. |

---

### Group C — Reschedule Booking (`/manage/[ref]`)

| # | Scenario | Setup | Expected Result |
|---|---|---|---|
| C1 | Reschedule single session | Syeed Mahdi / Jul 8 / 13:30 → Jul 14 / 13:00 | Store updated: `date: "2026-07-14"`, `startTime: "13:00"`, `endTime: "14:00"`. Confirmation shows new values. |
| C2 | Instructor locked | Any booking | Instructor displayed as read-only text. Calendar filtered to that instructor's dates only. |
| C3 | Duration locked | Any 30-min booking | Duration shown as "30 minutes" text, no select. Slot list enforces 30-min window. |
| C4 | Blackout date not selectable | Any Syeed Mahdi booking | Jul 9, Jul 16, Jul 23, Aug 3 all disabled in calendar. |
| C5 | Instructor conflict excluded | Syeed Mahdi / Jul 14 / 13:00 booked (60 min). Reschedule another booking to Jul 14. | Slots 13:00 and 13:30 absent (overlap 13:00–14:00). Slot 14:00 present. |
| C6 | Lane-full slot excluded | 4 lane bookings at Jul 14 / 14:00. Reschedule a 5th to Jul 14. | Slot 14:00 absent (lane capacity). |
| C7 | Slot window enforcement | Reschedule to Syeed Mahdi / Jul 25 (14:00–17:30 window) / 60 min | Slot 17:00 absent (ends 18:00 > 17:30). Slot 16:30 present (ends 17:30 ✓). |
| C8 | Past slots excluded (today) | Booking with reschedule target = today | Only future slots shown for today's date. |
| C9 | Reschedule within 24-hour window | Booking for Jul 5 (tomorrow) | Reschedule form replaced with "cancel and re-book" note. No date/time picker shown. |
| C10 | Reschedule single from recurring series | 2-week recurring: Connor Hax / Jul 7 + Jul 14 | Amber "this session only" notice shown. Move Jul 7 → Jul 12. Store: Jul 7 booking updated. Jul 14 unchanged. |
| C11 | UI matches store after reschedule | After C1 | Store `date`, `startTime`, `endTime` read via eval match exactly what confirmation screen displays. |

---

### Group D — Data Integrity

| # | Scenario | Expected Result |
|---|---|---|
| D1 | Store vs UI — booking confirmation | After any booking: store `date`, `startTime`, `endTime`, `durationMinutes`, `instructorName`, `customerName` all match confirmation screen exactly. |
| D2 | endTime — 30 min | 30-min at 13:00 → store `endTime: "13:30"`, UI shows "1:00 PM – 1:30 PM". |
| D3 | endTime — 60 min | 60-min at 15:00 → store `endTime: "16:00"`, UI shows "3:00 PM – 4:00 PM". |
| D4 | Recurring — correct weekday | 2-week series on Jul 7 (Monday) → second booking = Jul 14 (Monday). Not Jul 13 or Jul 15. |
| D5 | Recurring — all sessions same time | Both bookings in a series have identical `startTime` and `durationMinutes`. |
| D6 | Reschedule frees old slot | After rescheduling Syeed Mahdi from Jul 8 13:30 → Jul 14 13:00, slot Jul 8 13:30 reappears as available. |
| D7 | Cancel frees slot | After cancelling Connor Hax / Jul 7 / 11:00, that slot reappears as bookable in a new wizard attempt. |
| D8 | First booking creates customer | After A1, store customers has 1 entry with correct email, `isActive: true`, `source: "online_booking"`. |
| D9 | Same email = same customer | Two bookings with same email → store has 1 customer, 2 bookings linked to same `customerId`. |

---

## 17. Waitlisted Booking Status (new feature — added Jul 4 2026)

A booking with `status = "waitlisted"` is distinct from a `WaitlistEntry` (join-the-waitlist record). A waitlisted booking is created as part of a recurring series when a future week has a soft conflict that does not block the whole series.

| # | Rule | Source |
|---|---|---|
| WB-01 | Waitlisted status is only assigned during recurring series confirmation — never for single-session bookings. | New feature |
| WB-02 | `conflictReason` must always be set on waitlisted bookings: `"instructor_conflict"` or `"lane_at_capacity"`. | New feature |
| WB-03 | Hard blocks (blackout, no instructor availability, slot window mismatch) prevent series confirmation entirely. Soft blocks (instructor conflict, lane full) produce a waitlisted booking and allow the series to proceed. | New feature |
| WB-04 | Week 0 of a recurring series (the user-selected base date) is always `confirmed`. Conflict detection applies to weeks 1–N only. | New feature |
| WB-05 | `confirmWaitlisted(id)` sets `status = "confirmed"` and clears `conflictReason`. In production, re-verify availability before confirming (return 409 if still blocked). | New feature / Known gap |
| WB-06 | The 24-hour change window is **bypassed** for waitlisted bookings — customers can confirm at any time. | New feature |
| WB-07 | `cancelSeries` cancels bookings with status `confirmed` OR `waitlisted`. | Bug fix |
| WB-08 | The manage page for a waitlisted booking shows: amber status badge, conflict reason, "Confirm This Session" CTA, and a panel listing all sibling series sessions with their statuses. | New feature |
| WB-09 | The admin bookings modal shows a "Confirm Session" button for waitlisted bookings. | New feature |
| WB-10 | The booking confirmation screen for a recurring series lists all created sessions (both confirmed and waitlisted) with their status and individual manage links. | New feature |

---

## 18. Recurring Series — WeeklyStatus Classification

The booking wizard classifies each future week in a recurring series using a `WeeklyStatus` type before the user confirms.

```
WeeklyStatus = { date, status: "confirmed" | "waitlisted" | "hard_block", reason? }
```

**Hard block reasons** (prevent series from proceeding):
- `blackout` — date is a facility-wide blackout
- `no_availability` — instructor has no availability record for that date, or the slot is not in their available slots
- `slot_window` — the session would extend past the instructor's end time for that date

**Waitlisted reasons** (series proceeds; week created as waitlisted):
- `instructor_conflict` — instructor has a confirmed overlapping booking on that date
- `lane_at_capacity` — all facility lanes are full for that slot on that date

Step 3 UI behavior:
- Any hard block: red error listing the blocked dates, Next button disabled
- Only waitlisted weeks (no hard blocks): amber info listing the waitlisted dates, Next button enabled

---

### Group E — Recurring Series Waitlist (added Jul 4 2026)

*Prereq: Connor Hax must have an existing confirmed booking at the chosen slot (e.g. Jul 13 11:00) so week 2 triggers an instructor conflict.*

| # | Scenario | Setup | Expected Result |
|---|---|---|---|
| E1 | Recurring series — week 2 waitlisted due to instructor conflict | Connor Hax / Jul 6 / 11:00 / 2 weeks. Connor already has a confirmed booking Jul 13 at 11:00. | Step 3 shows amber notice for Jul 13. Next enabled. Confirmation shows Session 1 (confirmed) + Session 2 (waitlisted). Store: Jul 6 `status: "confirmed"`, Jul 13 `status: "waitlisted"`, `conflictReason: "instructor_conflict"`. |
| E2 | Manage page for waitlisted session | Navigate to manage page for the Jul 13 waitlisted booking. | Shows amber "Waitlisted" badge, "Confirm This Session" button, and "All Sessions in This Series" panel with both sessions listed. |
| E3 | Customer confirms waitlisted session | Click "Confirm This Session" on the manage page. | Store: `status: "confirmed"`, `conflictReason` cleared. Confirmation message shown. |
| E4 | Admin confirms waitlisted session | Open a waitlisted booking in the admin bookings modal. | Modal shows amber Waitlisted badge with conflict reason. "Confirm Session" button present. Clicking it updates status to confirmed. |
| E5 | Cancel series with mixed statuses | Create a 2-session recurring series: session 1 confirmed, session 2 waitlisted. Navigate to manage page for session 1 and cancel entire series. | Both sessions (confirmed + waitlisted) set to `status: "cancelled"`. Success screen shown. |

---

## Changelog

| Date | Entry |
|---|---|
| Jul 3 2026 | Initial document — sections 1–10 |
| Jul 3 2026 | F-01: Saturday enabled as working day; B-08: blackout offsets skip closed days |
| Jul 3 2026 | A-10–A-12: availability calendar state/display sync bug fixes |
| Jul 3 2026 | R-02: recurring series must check instructor conflicts and lane capacity per week |
| Jul 4 2026 | Availability window extended to 5 weeks Mon–Sat |
| Jul 4 2026 | Full restructure: gaps backfilled from all prototype work; 15 sections; Source column added |
| Jul 4 2026 | Section 16 added: 38 public booking test scenarios across Groups A–D (wizard, cancel, reschedule, data integrity) |
| Jul 4 2026 | Sections 17–18 added: waitlisted booking status, WeeklyStatus classification, confirmWaitlisted rules, cancelSeries fix |
| Jul 4 2026 | Section 16 Group E added: 5 recurring series waitlist test scenarios (all passed) |
| Jul 4 2026 | BF-03 updated to include "waitlisted" as a valid booking status filter value |

---

*Rules marked **Bug fix** were incorrect or missing in the initial implementation. These are highest priority for server-side enforcement — the API must reject invalid states regardless of what the UI sends.*
