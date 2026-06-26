# The Diamond Sports Academy — Functional Documentation

**Facility:** The Diamond Sports Academy  
**Address:** 8274 Lokus Rd, Odenton, MD 21113  
**Phone:** (443) 865-1639  
**Hours:** Defined in the Admin Panel → Academy Schedule (currently 9:00 AM – 9:00 PM, all days)  
**Website:** https://thediamondsportsacademy.com

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [User Roles](#2-user-roles)
3. [Public Website](#3-public-website)
4. [Online Booking Flow](#4-online-booking-flow)
5. [Managing a Booking (Customer Self-Service)](#5-managing-a-booking-customer-self-service)
6. [Admin Panel — Overview](#6-admin-panel--overview)
7. [Today's Schedule (Dashboard)](#7-todays-schedule-dashboard)
8. [Manage Bookings](#8-manage-bookings)
9. [Waitlist](#9-waitlist)
10. [Customers](#10-customers)
11. [Instructors](#11-instructors)
12. [Academy Schedule](#12-academy-schedule)
13. [Reports & Analytics](#13-reports--analytics)
14. [Notifications](#14-notifications)
15. [Settings](#15-settings)
16. [Business Rules & Policies](#16-business-rules--policies)
17. [Data Entities & Fields](#17-data-entities--fields)
18. [Notification Types Reference](#18-notification-types-reference)
19. [Key Workflows End-to-End](#19-key-workflows-end-to-end)

---

## 1. Application Overview

The Diamond Sports Academy web application serves two distinct audiences:

- **The public (customers/parents):** Browse services, learn about the facility and coaches, book training sessions online, and self-manage their bookings (cancel or reschedule).
- **The academy staff (admin):** Manage the day-to-day operations — view today's live schedule, manage all bookings, handle the waitlist, track customers and instructors, configure operating hours and blackouts, review analytics, and monitor outgoing notifications.

The application is a single platform that handles both the public-facing marketing website and the full internal admin panel.

---

## 2. User Roles

### Customer (Public)
- No login required
- Can browse all public pages
- Can book a session online (5-step wizard)
- Can cancel or reschedule their own booking using a unique link tied to their booking reference number
- Cannot access any admin functionality

### Admin (Staff)
- Logs in at `/admin/login` with credentials
- Has full access to all admin panel pages
- Can view, create, edit, cancel, and reschedule any booking
- Can manage customers, instructors, schedule, waitlist, settings, and reports
- Default credentials (prototype): username `admin`, password `diamond123`

---

## 3. Public Website

All public pages are accessible without login. They form the marketing website for the academy.

### 3.1 Home Page (`/`)
The main landing page. Contains:
- Hero section with headline and primary call-to-action to book a session
- Key stats: 150+ active athletes, 300+ program graduates, 10+ expert coaches
- Overview of core services (training, clinics, camps, memberships)
- Testimonials from athletes and parents
- Final call-to-action banner linking to the booking page

### 3.2 About Us (`/about-us`)
Background on the academy — founding story, mission, and values.

### 3.3 Our Facility (`/our-facility`)
Details about the physical training space, equipment, technology (HitTrax, Rapsodo, Blast Motion), and training environment.

### 3.4 Our Coaches (`/our-coaches`)
Profiles of the coaching staff including specialties and experience.

### 3.5 Recruits (`/recruits`)
A listing page of featured athlete recruit profiles. Each recruit has an individual detail page (e.g., `/recruits/jaxon-rivera`) with stats, position, graduation year, and recruiting highlights.

**Featured recruits:** Jaxon Rivera, Isaiah Thompson, Mason Turner, Jacob Delgado.

### 3.6 Our Alumni (`/our-alumni`)
Showcases athletes who trained at DSA and went on to play at the next level.

### 3.7 Services & Programs

| Page | URL | Description |
|---|---|---|
| Training Overview | `/training` | High-level overview of all training programs |
| Camps | `/camps` | Multi-day camp programs |
| Clinics | `/clinics` | Group clinic sessions |
| 1-on-1 Training | `/1-on-1-training` | Private individual sessions with an instructor |
| Speed & Agility | `/speed-agility` | Speed and agility training program |
| Golf Simulator | `/golf-simulator` | Golf simulator sessions |
| Weight Training | `/weight-training` | Strength and conditioning program |
| Team & Facility Rentals | `/team-facility-rentals` | Renting the facility for team practice |
| Technology Tunnels | `/technology-tunnels` | HitTrax / Rapsodo technology-enabled training |
| Memberships | `/memberships` | Membership plans and benefits |

Each service page follows the same layout: a hero image with a badge and headline, intro paragraphs, why-choose-us section, who-it's-for section, overview section, and a closing call-to-action. Each page also shows a sidebar contact form and links to related services.

### 3.8 Reviews (`/reviews`)
Customer and athlete testimonials and reviews.

### 3.9 FAQ (`/frequently-asked-questions`)
Common questions about sessions, policies, pricing, and the facility.

### 3.10 Contact Us (`/contact-us`)
Contact form, address, phone number, and a map or directions.

### 3.11 Privacy Policy (`/privacy`)
The academy's data privacy policy.

---

## 4. Online Booking Flow

The booking wizard is at `/book`. It is a 5-step process. Customers do not need to create an account or log in. The wizard guides them through each step in order.

### Step 1 — Select Instructor
- A grid of all **active instructors** is displayed.
- Each instructor card shows: photo, full name, specialty (e.g., "Hitting & Pitching"), and total sessions delivered.
- The customer clicks an instructor card to select them. The selected card is highlighted in teal.
- The customer cannot proceed until an instructor is selected.

**Active instructors available for booking:**
| Instructor | Specialty |
|---|---|
| Marcus Johnson | Hitting & Pitching |
| Sofia Chen | Pitching & Defense |
| Derek Williams | Catching & Fielding |
| Alex Rivera | Strength & Conditioning |
| Ryan Torres | Speed & Agility |
| Priya Patel | Batting & Strategy |
| James Okafor | Fielding & Defense |
| Lauren Kim | Speed & Conditioning |
| Carlos Mendes | Pitching Mechanics |
| Taylor Brooks | Catching & Blocking |

### Step 2 — Select Date & Time
- A **calendar** is shown for the selected instructor.
- Days on which the instructor has available slots are indicated with a small teal dot below the date number.
- Days with no available slots are greyed out and cannot be selected.
- Past dates are disabled.
- The customer can navigate forward or backward by month using arrow buttons. Navigating to a past month is disabled.
- Once a date is selected, a grid of **available time slots** appears for that date and instructor. Each slot is a 30-minute increment (e.g., 9:00 AM, 9:30 AM, etc.).
- If a slot is fully booked (lane capacity exceeded), it appears as a **waitlist** button (amber color with "waitlist" label underneath). The customer can join the waitlist for that slot.
- If no slots or waitlist slots are available on the chosen date, the message "No available slots on this date" is shown.
- Once a time is selected, the customer picks a **session duration**: 30 minutes or 60 minutes.

### Step 3 — Your Details
The customer enters personal information:
- **First Name** (required)
- **Last Name** (required)
- **Email Address** (required) — confirmation and manage-booking link sent here
- **Phone Number** (required)
- **Session for a child?** toggle — if yes:
  - **Child's Age** (required)
  - **Relationship to child** (e.g., Parent, Guardian) (required)

### Step 4 — Session Options
- **Recurring Session** toggle — if enabled:
  - The customer selects how many weeks to repeat (e.g., 4 weeks, 6 weeks, 8 weeks, 12 weeks)
  - The system checks for availability conflicts in future weeks for the same day/time/instructor
  - If a conflict is found in any week, a warning is shown listing the affected dates; the customer can proceed knowing those sessions will not be booked
- If the customer joined the **waitlist** in Step 2, this step shows a waitlist confirmation note. Recurring is not available for waitlist entries.

### Step 5 — Review & Confirm
- A full summary of the booking is displayed:
  - Instructor name
  - Date and time
  - Duration
  - Child session details (if applicable)
  - Recurring details (if applicable)
  - Customer name, email, phone
- Cancellation policy notice: cancellations made less than 24 hours before the session may be marked as late cancellations.
- The customer clicks **Confirm Booking**.

### Booking Confirmation
After confirming:
- A booking reference number is generated (format: `DSA-YYYY-NNNN`).
- A confirmation email is sent to the customer's email address.
- The confirmation screen displays:
  - Booking reference
  - Instructor
  - Date, time, duration
  - A **manage booking link**: `/manage/{booking-reference}` — this link allows the customer to cancel or reschedule without logging in.
  - Note: the link is also included in the confirmation email.

---

## 5. Managing a Booking (Customer Self-Service)

Customers access `/manage/{booking-reference}` using the link from their confirmation email or confirmation screen. No login is required — the booking reference serves as the access token.

### 5.1 What the Customer Sees First
The page shows the full booking details:
- Reference number
- Customer name
- Instructor
- Date, time, duration
- Child session info (if applicable)
- Recurring series badge (if applicable)

Two action buttons are presented:
- **Reschedule** — pick a new date and time (teal button)
- **Cancel** — remove the booking (red button)

### 5.2 24-Hour Window Block
If the session starts within 24 hours, **both actions are blocked**. The page shows:
- A red warning stating "Online Changes Unavailable — This session is within 24 hours"
- An explanation that changes must be made more than 24 hours in advance
- The DSA phone number **(443) 865-1639** to call for last-minute changes
- The booking reference number to have ready when calling

### 5.3 Reschedule Flow
1. Customer clicks **Reschedule**
2. A calendar is shown, filtered to the same instructor's available dates (teal dots indicate available days)
3. Customer selects a new date
4. Available time slots for that date and instructor appear
5. Customer selects a new time
6. A **New Session Summary** card shows: new date, new time, instructor, duration
7. Customer clicks **Confirm Reschedule**
8. A success screen shows the new booking details including a new reference number
9. A confirmation email is sent

**Important rule for recurring bookings:** Rescheduling via this self-service page applies to **this session only**. The rest of the recurring series is not affected. To reschedule the full series, the customer must call (443) 865-1639.

### 5.4 Cancel Flow
1. Customer clicks **Cancel**
2. The booking details are shown for confirmation
3. If the booking is part of a **recurring series**, an amber notice states: "This will cancel this session only. To cancel the full series, call us at (443) 865-1639."
4. An optional **reason for cancellation** text field is shown
5. Two buttons: **Keep Session** (go back) and **Confirm Cancellation**
6. On confirmation, a success screen shows which session was cancelled
7. A cancellation confirmation email is sent

### 5.5 Edge Cases
| Situation | What Happens |
|---|---|
| Booking reference not found | "Booking Not Found" screen with a return-to-home link |
| Session has already passed | "Booking Not Found" screen (treated as expired link) |
| Booking already cancelled | "Already Cancelled" screen showing the booking reference and any reason on file. Option to book a new session. |
| Session within 24 hours | "Online Changes Unavailable" screen with phone number |
| Booking is completed (session occurred) | "Booking Not Found" screen |

---

## 6. Admin Panel — Overview

The admin panel is accessed at `/admin`. It is protected — staff must log in at `/admin/login`.

**Login credentials:**
- Username: `admin`
- Password: `diamond123`

After logging in, the admin sees a sidebar on the left and the main content area on the right.

### Sidebar Navigation
| Menu Item | URL | Purpose |
|---|---|---|
| Today's Schedule | `/admin` | Live daily schedule grid |
| Manage Bookings | `/admin/bookings` | All bookings — search, filter, edit |
| Waitlist | `/admin/waitlist` | Upcoming and past waitlist entries |
| Customers | `/admin/customers` | Customer profiles and history |
| Instructors | `/admin/instructors` | Instructor management and availability |
| Academy Schedule | `/admin/schedule` | Operating hours and blackout dates |
| Reports | `/admin/reports` | Analytics and performance data |
| Notifications | `/admin/notifications` | Log of all outgoing notifications |
| Settings | `/admin/settings` | Facility info, policies, notification toggles |

---

## 7. Today's Schedule (Dashboard)

**URL:** `/admin`

This is the primary operational screen. It shows a live visual schedule of all bookings for the selected date.

### 7.1 Header Controls
- **Date filter:** Defaults to today. Admin can click to select any other date.
- **Instructor filter dropdown:** Defaults to "All Instructors". Can be filtered to show only one instructor's bookings. The schedule grid and PDF export both respect this filter.

### 7.2 Stats Cards
Three summary cards appear at the top:
- **Bookings Today:** Total number of bookings for the selected date (all statuses)
- **Active Customers:** Total number of active customers in the system
- **Active Instructors:** Total number of currently active instructors

### 7.3 Schedule Grid
- **Time axis:** Left column shows time labels from 9:00 AM to 8:30 PM in 30-minute increments
- **Columns:** One column per instructor who has a booking on the selected date (sorted alphabetically). If the instructor filter is active, only that instructor's column appears.
- **Horizontal scroll:** When many instructors are shown, the grid scrolls horizontally. The time labels remain fixed (sticky) on the left.
- **No overlapping bookings:** Each instructor has exactly one column, so bookings never visually overlap. Conflict prevention is enforced at the data level (an instructor cannot be double-booked at the same time).

### 7.4 Booking Cards
Each booking appears as a colored card positioned at its correct time and spanning its duration. The card height corresponds to the session length:
- 30-minute session = 1 slot height
- 60-minute session = 2 slot heights

**Card contents:**
- **Line 1 (bold):** Instructor name · duration (e.g., "Carlos Mendes · 60 mins")
- **Line 2:** Customer/trainee name (e.g., "Benjamin Morgan")

**Card color:** Each instructor has a unique color. The card background is a light tint of the instructor's color, and a bold colored left stripe matches the instructor's full color.

**Instructor color assignments:**
| Instructor | Color |
|---|---|
| Marcus Johnson | Blue |
| Sofia Chen | Purple |
| Derek Williams | Green |
| Alex Rivera | Red/Rose |
| Ryan Torres | Orange |
| Priya Patel | Cyan |
| James Okafor | Amber |
| Lauren Kim | Indigo |
| Carlos Mendes | Teal |
| Taylor Brooks | Pink |

**Badges on booking cards:**
| Badge | Color | Meaning |
|---|---|---|
| Single-session | Orange | One-time booking (not recurring) |
| Recurring | Blue | Part of a recurring weekly series |
| Child | Purple | Session is for a child (not the account holder) |

Badges can stack — for example, a card can show both "Recurring" and "Child" if both apply.

### 7.5 Instructor Legend
Below the filter controls, a row of colored chips shows each active instructor's name with their assigned color. These chips match the booking card colors for quick reference.

### 7.6 PDF Export
A **"Export PDF"** button generates a PDF version of the current schedule view.
- Format: A4 landscape
- Includes: date in header, instructor legend (only instructors visible in the current filter), the full schedule grid
- Columns match the UI exactly — one column per instructor, same ordering
- Card content matches the UI: instructor name · duration (bold) on top, trainee name below
- Colors match the booking card color scheme
- Filename: `DSA-schedule-YYYY-MM-DD.pdf`

---

## 8. Manage Bookings

**URL:** `/admin/bookings`

The central booking management page. Shows all bookings in the system across all dates and instructors.

### 8.1 Search & Filters
- **Search bar:** Search by customer name or booking reference number (e.g., `DSA-2026-00158`)
- **Instructor filter:** Dropdown — filter to a specific instructor or show all
- **Status filter:** Dropdown — All, Confirmed, Completed, Cancelled, No-Show
- **Date range:** Start date and end date pickers to narrow results to a specific period

### 8.2 Booking Table
Columns: Reference, Customer, Instructor, Date, Time, Duration, Status

Rows are sorted by date descending (most recent first). Pagination: **20 bookings per page**.

Click any row to open the **booking detail panel** on the right side.

### 8.3 Booking Statuses
| Status | Meaning |
|---|---|
| Confirmed | Future session, not yet occurred |
| Completed | Session occurred successfully |
| Cancelled | Session was cancelled (by customer or admin) |
| No-Show | Customer did not attend and did not cancel in advance |

### 8.4 Booking Detail Panel
Clicking a row opens a panel showing full booking details:
- Booking reference
- Customer name and ID
- Instructor name
- Date, start time, end time, duration
- Lane assigned (1–4)
- Child session info (if applicable)
- Recurring series info (if applicable)
- Walk-in indicator (if applicable)
- Created date
- Cancellation reason (if cancelled)

**Actions available in the panel:**

#### Reschedule (admin)
1. Admin clicks **Reschedule**
2. Selects new date and time
3. For recurring bookings, chooses scope: **This session only** or **This and all remaining sessions in the series**
4. System checks if the instructor has availability at the new slot
5. Confirms the change — a note appears if availability is not confirmed for the slot
6. The booking table updates to reflect the new date/time

#### Cancel (admin)
1. Admin clicks **Cancel Booking**
2. For recurring bookings, a confirmation asks scope: **This session only** or **All remaining sessions in the series**
3. Admin can add an optional cancellation note/reason
4. On confirmation, the booking status changes to "Cancelled" and `cancelledBy` is recorded as "admin"

### 8.5 CSV Export
A **"Export CSV"** button downloads a CSV file of all bookings currently visible with the active filters applied. Useful for external reporting or record-keeping.

---

## 9. Waitlist

**URL:** `/admin/waitlist`

Manages customers who have requested to be placed on a waitlist for a specific date, time, and instructor.

### 9.1 Tabs

#### Tab 1 — Upcoming
Shows waitlist entries for future dates (today and beyond).

Table columns: Date, Time, Instructor, First Name, Last Name, Email, Phone, Requested On, Status, Actions

**Status values:**
- **Waiting** — still on the list, no booking yet
- **Converted** — converted to a confirmed booking

**Actions:**
- **Convert to Booking** — creates a confirmed booking for this waitlist entry for the same date, time, and instructor. Status updates to "Converted".
- **Remove** — removes the entry from the waitlist permanently.

#### Tab 2 — Past
Shows waitlist entries for dates that have already passed. Actions are not available for past entries.

**Status values for past entries:**
- **Converted** — a booking was made before the date passed
- **Missed** — the date passed without the entry being converted

### 9.2 Pagination
20 entries per page on each tab.

---

## 10. Customers

**URL:** `/admin/customers`

A directory of all customers who have made a booking or been entered into the system.

### 10.1 Search & Filter
- **Search bar:** Search by customer name or email address
- **Status filter:** Show "Active Only" or "All" (including deactivated customers)

### 10.2 Customer Table
Columns: Name, Email, Phone, Source, Bookings, No-Shows, Late Cancels, Flagged, Status

Pagination: **20 customers per page**.

**Source values:**
| Source | Meaning |
|---|---|
| online_booking | Customer booked themselves online |
| admin_booking | Admin created the booking on behalf of the customer |
| import | Customer was imported via data import |

### 10.3 Customer Profile
Clicking a customer row opens their full profile:

**Contact info:**
- First name, last name, email, phone

**Account flags:**
- **Flagged:** A flag indicates the customer has a behavioral note. Admins can flag/unflag any customer. Flagged customers are highlighted in the list.
- **SMS Opt-Out:** If enabled, SMS reminders are not sent to this customer. Admins can toggle this.
- **No-Show Count:** Number of times the customer missed a session without cancelling.
- **Late Cancellation Count:** Number of times the customer cancelled within the late cancellation window.
- **Active / Inactive:** Deactivated customers cannot make new bookings.

**Actions on the profile:**
- **Edit Details** — update name, email, phone
- **Flag / Unflag** — mark or remove behavioral flag
- **Toggle SMS Opt-Out** — enable or disable SMS notifications for this customer
- **Deactivate / Reactivate** — disable or re-enable the customer's account

**Booking history tab:**
Shows all past and upcoming bookings for this customer. Columns: Reference, Date, Instructor, Status.

---

## 11. Instructors

**URL:** `/admin/instructors`

Manages the coaching staff. Has three tabs.

### Tab 1 — Instructors List

A responsive grid of instructor cards (1 to 4 columns depending on screen size).

**Each card shows:**
- Profile photo (or placeholder if no photo)
- Full name
- Specialty (e.g., "Hitting & Pitching")
- Total sessions delivered (lifetime)
- Upcoming sessions (count of confirmed future bookings)
- Status badge: **Active** (green) or **Inactive** (gray)

**Add Instructor button:** Opens a modal form to create a new instructor with: first name, last name, email, specialty, and active status.

**Clicking a card** opens the instructor's full profile view:

**Profile view contains:**
- Photo, name, specialty, email, status
- **Edit mode** toggle — allows editing name, email, and specialty inline
- **Deactivate / Reactivate** button — inactive instructors do not appear in the public booking wizard
- **Upcoming Sessions table** — lists all confirmed future bookings for this instructor: date, time, customer name, duration, status

### Tab 2 — Availability Slots

Used to configure which time slots an instructor is available on a given date.

**How it works:**
1. Select an **instructor** from the dropdown
2. Select a **date** (must be today or a future date)
3. A **legend** appears: teal-bordered box = Available, gray-bordered box = Unavailable
4. A grid of 30-minute time slots is shown for that date
   - For today's date: only future slots (slots that have already passed are hidden)
   - For future dates: all slots from 9:00 AM to 8:30 PM
5. Each slot button toggles between **Available** (teal, bold) and **Unavailable** (gray, light)
6. A counter shows how many slots are currently selected (e.g., "8 slot(s) selected")
7. Click **Save Slots** to save the configuration. A "Saved" confirmation appears.

**Configured Availability table** (below the slot editor):
Shows all saved availability records for future dates. Columns: Instructor, Date, Slots Available, Edit button.

Clicking Edit in this table loads that instructor + date into the slot editor above for modifications.

### Tab 3 — Lane Utilization

Shows a read-only snapshot of how lanes are being utilized across the standard time slots:
- Time slot column (9:00 AM – 8:30 PM)
- Used lanes / Total lanes (e.g., "3 / 4")
- A horizontal progress bar:
  - Blue: under 75% utilized
  - Amber: 75%–99% utilized
  - Red: 100% (fully booked)

An editable **Number of Lanes** field at the top allows the admin to update the total active lanes (1–10). This affects the overall capacity of the facility.

---

## 12. Academy Schedule

**URL:** `/admin/schedule`

Configures the operational calendar for the facility.

### Tab 1 — Operating Hours

A weekly table showing one row per day of the week (Monday through Sunday).

**Each row contains:**
- Day of the week
- **Open/Closed toggle** — if Closed, no bookings are accepted on this day
- **Open Time** picker — start of business hours (e.g., 9:00 AM)
- **Close Time** picker — end of business hours (e.g., 9:00 PM)

Changes are saved with a **Save Changes** button.

**Conflict detection:** If the new hours conflict with already-confirmed bookings (e.g., closing at 5 PM when a booking exists at 6 PM), the system will display an **Affected Bookings** table showing all conflicting bookings before saving is allowed. The admin must acknowledge these conflicts before the change takes effect.

**Footer display:** The public website footer automatically reflects the saved operating hours — no separate update is required.

### Tab 2 — Blackout Dates

Dates when the facility is closed or when a specific instructor is unavailable.

**Types of blackouts:**
- **Facility-wide:** Entire facility is closed on this date (e.g., holiday, renovation). No bookings can be made for any instructor on this date.
- **Instructor-specific:** A specific instructor is unavailable on this date (e.g., vacation, personal day). Only affects that instructor's availability.

**Blackout table columns:** Type, Instructor (if applicable), Date, Reason, Delete button.

**Add Blackout Date form:**
- Type: Facility or Instructor
- Instructor (dropdown, appears if type = Instructor)
- Date
- Reason (text field)

Adding a blackout shows an **Affected Bookings** preview — all confirmed bookings on that date that would be impacted. The admin can review these before confirming.

---

## 13. Reports & Analytics

**URL:** `/admin/reports`

Provides a business intelligence view of booking activity.

### Date Range Filter
Dropdown to scope all calculations to:
- **All Time** — includes all bookings in the system
- **May 2026** — scoped to a specific month (expandable to other months in production)

### Key Metrics (top row)
Four summary cards:
| Metric | Description |
|---|---|
| Total Sessions | Total bookings in the selected date range |
| Sessions Delivered | Bookings with status "Completed" |
| Cancellation Rate | Percentage of bookings that were cancelled |
| Avg Session Length | Average duration of non-cancelled sessions (in minutes) |

### Bookings by Status
A breakdown panel showing count and percentage for each status: Confirmed, Completed, Cancelled, No-Show. Each status has a color-coded progress bar.

### Session Types
A breakdown of what kinds of sessions are being booked:
- **Recurring series** — sessions that are part of a weekly recurring booking
- **Walk-ins** — sessions added directly by admin at the counter
- **Child sessions** — sessions booked for a child
- **Standard (individual)** — all other single, non-recurring, non-child sessions

### Instructor Performance Table
Lists all instructors (active and inactive) sorted by number of sessions delivered (highest first). Columns:
- Instructor name
- Sessions (non-cancelled bookings)
- Total Minutes (total session time delivered)
- Status (Active or Inactive badge)

### Top Customers by Sessions
A table of the 5 customers with the most sessions. Columns:
- Customer name
- Sessions (non-cancelled)
- Total Minutes

---

## 14. Notifications

**URL:** `/admin/notifications`

A log of all outgoing communications sent to customers and admins. Provides visibility into what was sent, when, and whether delivery succeeded.

### Summary Cards (top row)
- **Sent:** Count of successfully delivered notifications
- **Pending:** Count of notifications queued but not yet sent
- **Failed:** Count of notifications that failed to deliver

### Filters
- **Search:** By booking reference or recipient name
- **Status filter:** All, Sent, Pending, Failed
- **Type filter:** All Types, or filter to a specific notification type

### Notification Table
Columns: Reference (booking ref), Recipient, Type, Channel, Sent At, Status, Action

**Pagination:** 30 records per page.

**Action:** For failed or pending notifications, a **Retry** button allows the admin to re-queue the notification for delivery.

### Notification Data Window
The system stores notifications for the past 30 days only. Maximum of 300 total notification records are kept.

### Notification Types

| Type | Description | Channel |
|---|---|---|
| Confirmation | Sent when a booking is first created | Email |
| Calendar Invite | Sent with the booking confirmation | Email |
| 24hr Reminder | Sent 24 hours before the session | Email |
| 2hr SMS Reminder | Sent 2 hours before the session | SMS |
| Change | Sent when a booking is rescheduled | Email |
| Cancellation | Sent when a booking is cancelled | Email |

---

## 15. Settings

**URL:** `/admin/settings`

System configuration for the admin. Contains five tabs.

### Tab 1 — General
Facility-wide configuration:
- **Facility Name** — display name used across the system
- **Location** — facility address
- **Contact Email** — facility email for inbound inquiries
- **Phone** — facility phone number
- **Website** — facility website URL
- **Timezone** — timezone for all date/time display (e.g., America/New_York)

### Tab 2 — Lane Configuration
- **Number of Active Lanes** — sets the total booking capacity (currently 4 lanes). Each lane can hold one booking per 30-minute time slot. Accepted range: 1–10.

### Tab 3 — Notifications
Controls which automated notifications are sent.

**Customer notifications:**
- Send confirmation email on booking (on/off)
- Send 24-hour reminder email (on/off)
- Send 2-hour SMS reminder (on/off)
- Send calendar invite with confirmation (on/off)

**Admin notifications:**
- Notify admin on new booking (on/off)
- Notify admin on cancellation (on/off)
- **Admin notification email** — the email address where admin alerts are delivered

### Tab 4 — Cancellation Policy
- **Late Cancellation Window** — how many hours before a session marks a cancellation as "late". Options: 12 hours, 24 hours (default), 48 hours. This window also controls whether customers can cancel or reschedule online.
- **No-Show Policy** — free-text description of the academy's no-show policy. Displayed to customers during booking.
- **Allow customer self-cancellation** (on/off) — toggle whether the public `/manage/{ref}` page allows customers to cancel.
- **Require cancellation reason** (on/off) — if on, a reason field becomes required when cancelling.

### Tab 5 — Security
- **Change Password** — form with: current password, new password, confirm new password. Password must match to save.
- **Admin Account** — shows current admin username.

---

## 16. Business Rules & Policies

### 16.1 Cancellation & Reschedule Window
- Customers can cancel or reschedule online **only if the session is more than 24 hours away**
- If the session is within 24 hours, online self-service is blocked and the customer is directed to call (443) 865-1639
- The 24-hour threshold can be adjusted in Settings → Cancellation Policy (12, 24, or 48 hours)
- Admins can cancel or reschedule any booking at any time, regardless of the window

### 16.2 Recurring Sessions
- A recurring session is a weekly series booked on the same day, time, and instructor
- When a customer books recurring sessions, the system attempts to book the same slot for the specified number of weeks
- If any week has a conflict (instructor unavailable, lane full, facility blackout), that session is skipped and the customer is warned
- A customer cancelling or rescheduling their own booking via the self-service page affects **this session only**
- To cancel or modify the full recurring series, the customer must call the facility
- Admins can cancel or reschedule a single session or the entire remaining series from Manage Bookings

### 16.3 Child Sessions
- A booking can be designated as being for a child (not the account holder)
- Required fields when booking for a child: child's age, relationship (e.g., Parent, Guardian)
- Child sessions receive a purple "Child" badge on the schedule grid and booking details

### 16.4 Walk-In Bookings
- Walk-in bookings are created directly by admin (not through the public booking wizard)
- They follow the same slot and lane capacity rules
- They are created in the admin's Manage Bookings section

### 16.5 Lane Capacity
- The facility has 4 active lanes (configurable in Settings → Lane Configuration)
- Each lane holds one 30-minute or 60-minute booking per time slot
- A 60-minute session occupies a lane for 2 consecutive slots
- If all 4 lanes are booked for a given time slot, that slot becomes a waitlist slot only
- Lane assignment is done automatically and randomly — customers and admins do not choose a specific lane

### 16.6 Instructor Availability
- Instructors have pre-configured availability slots set via Admin → Instructors → Availability Slots
- A slot is only available for booking if both the instructor is available AND a lane is free
- An instructor cannot be double-booked — two bookings cannot be placed with the same instructor at the same time
- Blackout dates (facility or instructor) override all availability

### 16.7 No-Show Policy
- If a customer does not attend a session and did not cancel, the booking is marked as "No-Show"
- No-show count is tracked on each customer profile
- The no-show policy text is configurable in Settings → Cancellation Policy

### 16.8 Customer Flagging
- Admins can "flag" a customer to indicate a behavioral concern (excessive cancellations, no-shows, etc.)
- Flagged customers are visually highlighted in the customer list
- Flagging does not automatically restrict booking — it is an internal administrative note

### 16.9 SMS Opt-Out
- Customers can be marked as SMS opt-out on their profile
- Opted-out customers do not receive the 2-hour SMS reminder
- Admins toggle this on the customer profile page

### 16.10 Waitlist Logic
- When all lanes for a time slot are booked, customers can join the waitlist
- Waitlist entries are managed in Admin → Waitlist
- If a booking is cancelled and a lane opens up, the admin must manually review the waitlist and convert an entry to a booking — there is no automatic conversion
- Waitlist entries can be removed if the customer is no longer interested

---

## 17. Data Entities & Fields

### Booking
| Field | Description |
|---|---|
| id | Internal unique identifier |
| bookingReference | Public-facing reference (format: DSA-YYYY-NNNNN) |
| cancellationToken | Internal token used for secure self-service links |
| customerId | Link to the Customer record |
| customerName | Customer's full name |
| instructorId | Link to the Instructor record |
| instructorName | Instructor's full name |
| date | Session date (YYYY-MM-DD) |
| startTime | Session start (HH:MM, 24hr format) |
| endTime | Session end (HH:MM, 24hr format) |
| durationMinutes | 30 or 60 |
| status | confirmed / cancelled / no_show / completed |
| isForChild | Boolean — session is for a child |
| childAge | Child's age (if isForChild = true) |
| relationshipToCustomer | E.g., "Parent" (if isForChild = true) |
| isRecurring | Boolean — part of a recurring series |
| recurringSeriesId | Groups all sessions in a recurring series |
| isWalkIn | Boolean — created by admin as walk-in |
| cancelledBy | "customer" or "admin" (if cancelled) |
| cancellationReason | Optional reason text (if cancelled) |
| laneAssigned | Lane number 1–4 |
| createdAt | Timestamp when booking was created |

### Customer
| Field | Description |
|---|---|
| id | Internal unique identifier |
| firstName | First name |
| lastName | Last name |
| email | Email address |
| phone | Phone number |
| isActive | Boolean — can make new bookings |
| isFlagged | Boolean — admin behavioral flag |
| noShowCount | Number of no-show occurrences |
| lateCancellationCount | Number of late cancellation occurrences |
| smsOptOut | Boolean — do not send SMS |
| source | online_booking / admin_booking / import |
| createdAt | Date customer record was created |
| deactivatedAt | Date deactivated (if applicable) |

### Instructor
| Field | Description |
|---|---|
| id | Internal unique identifier |
| firstName | First name |
| lastName | Last name |
| email | Email address |
| speciality | Area of expertise (e.g., "Hitting & Pitching") |
| isActive | Boolean — appears in booking wizard if true |
| totalSessionsDelivered | Lifetime completed session count |
| upcomingSessions | Count of confirmed future bookings |
| createdAt | Date record was created |
| deactivatedAt | Date deactivated (if applicable) |

### Availability Slot Record
| Field | Description |
|---|---|
| id | Internal unique identifier |
| instructorId | Link to Instructor |
| instructorName | Instructor's full name |
| date | Date (YYYY-MM-DD) |
| slots | Array of available time strings (e.g., ["09:00", "09:30", "10:00"]) |

### Waitlist Entry
| Field | Description |
|---|---|
| id | Internal unique identifier |
| date | Requested session date |
| time | Requested session time |
| instructorId | Requested instructor |
| instructorName | Instructor's full name |
| firstName | Customer first name |
| lastName | Customer last name |
| email | Customer email |
| phone | Customer phone |
| createdAt | When the waitlist entry was created |
| convertedBookingId | If converted, the resulting booking reference |

### Notification Record
| Field | Description |
|---|---|
| id | Internal unique identifier |
| bookingReference | The booking this notification relates to |
| recipientName | Name of the recipient |
| recipientType | "customer" or "admin" |
| notificationType | See Notification Types Reference |
| channel | "email" or "sms" |
| deliveryStatus | "sent" / "pending" / "failed" |
| sentAt | Timestamp of delivery |

---

## 18. Notification Types Reference

| Type Key | Display Name | Trigger | Channel |
|---|---|---|---|
| confirmation | Booking Confirmation | Booking successfully created | Email |
| calendar_invite | Calendar Invite | Sent alongside confirmation | Email |
| reminder_24hr | 24hr Reminder | 24 hours before session start | Email |
| reminder_2hr_sms | 2hr SMS Reminder | 2 hours before session start | SMS |
| change | Booking Changed | Booking rescheduled | Email |
| cancellation | Cancellation Notice | Booking cancelled (by customer or admin) | Email |

---

## 19. Key Workflows End-to-End

### Workflow A: Customer Books a Session
1. Customer visits `/book`
2. Selects an active instructor
3. Selects an available date (calendar shows instructor's available days with teal dots)
4. Selects a time slot and duration
5. Enters personal details
6. Optionally enables recurring booking and sets number of weeks
7. Reviews and confirms
8. Receives confirmation email with booking reference and manage link
9. Admin sees the new booking appear on Today's Schedule and in Manage Bookings

### Workflow B: Customer Cancels Their Booking
1. Customer clicks the manage link from their email or confirmation screen (`/manage/DSA-YYYY-NNNNN`)
2. Booking details are shown with Cancel and Reschedule options
3. Customer clicks Cancel
4. If recurring: sees note that only this session is affected; series continues
5. Optionally enters a reason
6. Confirms cancellation
7. Booking status updates to "Cancelled" in the admin panel
8. Customer receives a cancellation confirmation email

### Workflow C: Customer Reschedules Their Booking
1. Customer opens their manage link
2. Clicks Reschedule
3. If recurring: sees amber notice that only this session will be rescheduled
4. Calendar shows same instructor's available dates
5. Selects a new date and time
6. Reviews the new session summary
7. Confirms — new booking reference is generated
8. Customer receives a change confirmation email

### Workflow D: Admin Cancels a Recurring Series
1. Admin goes to Manage Bookings
2. Finds any session in the series
3. Clicks Cancel
4. Chooses scope: "All remaining sessions in this series"
5. Optionally adds a note
6. Confirms — all future sessions in the series are cancelled
7. Cancellation notifications are sent for each affected session

### Workflow E: Converting a Waitlist Entry to a Booking
1. A lane opens up due to a cancellation
2. Admin goes to Waitlist → Upcoming tab
3. Finds the relevant waitlist entry for that date/time/instructor
4. Clicks Convert to Booking
5. Entry status changes to "Converted"
6. A confirmed booking is created
7. A confirmation notification is sent to the customer

### Workflow F: Adding a Blackout Date
1. Admin goes to Academy Schedule → Blackouts tab
2. Clicks Add Blackout Date
3. Selects type (Facility or Instructor), date, and reason
4. System previews any confirmed bookings affected by this blackout
5. Admin reviews affected bookings and confirms
6. Blackout is saved; those dates are no longer bookable

### Workflow G: Setting Instructor Availability
1. Admin goes to Instructors → Availability Slots tab
2. Selects an instructor and a date
3. Sees a grid of 30-minute time slots
4. Toggles available (teal) and unavailable (gray) slots
5. Clicks Save Slots
6. Those time slots now appear in the public booking wizard for that instructor on that date
