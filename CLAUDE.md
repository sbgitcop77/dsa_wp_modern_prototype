# DSA Modern Prototype — Project Reference

## What This Is
A Next.js 14 (App Router) prototype redesign of the website for **The Diamond Sports Academy** — an elite sports training facility in Odenton, MD. This is a UI/UX prototype: all data is mock (no real database, no real payment or email integrations).

## Dev Commands
```bash
npm run dev      # http://localhost:4000
npm run build    # static output → /out
npm run lint
```

## Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS v3 + custom CSS classes in `globals.css`
- **Fonts**: Inter (body) + Figtree — both via `next/font/google`, CSS vars `--font-inter` / `--font-figtree`
- **Icons**: `lucide-react` (admin only), inline SVGs everywhere else
- **Utilities**: `clsx`, `date-fns`
- **No state management library** — all state is local `useState`

## Brand Colors (defined in `globals.css` as CSS vars)
| Token | Hex | Usage |
|---|---|---|
| `--bs-primary` | `#337C99` | Teal — primary buttons, accents |
| `--bs-danger` | `#b6070e` | Red — CTAs, stat badge, hero |
| `--bs-warning` | `#f33b41` | Bright red — Book button, headings on service pages |
| `--bs-info` | `#00141B` | Dark navy — section backgrounds |
| `--bs-light` | `#F7F7F7` | Off-white — card backgrounds |
| `--bs-dark` | `#131313` | Near-black |
| Body text | `#212529` | Default text |
| Muted text | `#6c757d` | Secondary/caption text |

Always use hex values directly in `style={{}}` props or Tailwind arbitrary values — do not invent new Tailwind config colors.

## File Structure
```
src/
  app/                        # Next.js App Router pages
    layout.tsx                # Root layout (Header + Footer wrapper)
    page.tsx                  # Home page (large, self-contained)
    globals.css               # All custom CSS classes + CSS vars
    api/admin/auth/route.ts   # Only API route (login/logout)
    admin/                    # Admin panel (protected by middleware)
      layout.tsx              # Admin layout (image strip + AdminContentArea)
      page.tsx                # Admin dashboard (schedule grid)
      login/page.tsx
      bookings/page.tsx
      customers/page.tsx
      instructors/page.tsx
      waitlist/page.tsx
      schedule/page.tsx
      reports/page.tsx
      notifications/page.tsx
      settings/page.tsx
    book/page.tsx             # 5-step booking wizard
    manage/[ref]/page.tsx     # Manage booking — cancel or reschedule
    [service]/page.tsx        # All service/marketing pages (see list below)
  components/
    Header.tsx                # Fixed nav, transparent→scrolled, mobile drawer
    Footer.tsx                # 4-col footer with social links
    ServicePageLayout.tsx     # Reusable template for all service pages
    AdminSidebar.tsx          # Admin nav sidebar
    AdminContentArea.tsx      # Admin layout wrapper (sidebar + content)
    Testimonials.tsx          # Testimonials section (used on many pages)
    CtaBanner.tsx             # Final CTA strip (used on many pages)
    InlineContactForm.tsx     # Contact form sidebar (on service pages)
    Modal.tsx                 # Generic modal
    Toast.tsx                 # Toast notification
  data/mock/                  # All mock data (no real DB)
    bookings.ts               # Booking[], MOCK_BOOKINGS
    customers.ts              # Customer[], MOCK_CUSTOMERS
    instructors.ts            # Instructor[], MOCK_INSTRUCTORS
    schedule.ts               # LANE_CONFIG, LANE_UTILIZATION, INSTRUCTOR_AVAILABILITY, OPERATING_HOURS, BLACKOUTS
    waitlist.ts               # WaitlistEntry[], MOCK_WAITLIST
    notifications.ts          # Notification[], MOCK_NOTIFICATIONS
  middleware.ts               # Protects /admin/* (cookie check)
```

## All Public Routes
| Route | Page |
|---|---|
| `/` | Home |
| `/about-us` | About |
| `/our-facility` | Facility |
| `/our-coaches` | Coaches |
| `/recruits` | Recruits list |
| `/recruits/jaxon-rivera` | Recruit profile |
| `/recruits/isaiah-thompson` | Recruit profile |
| `/recruits/mason-turner` | Recruit profile |
| `/recruits/jacob-delgado` | Recruit profile |
| `/our-alumni` | Alumni |
| `/training` | Training overview |
| `/camps` | Camps |
| `/clinics` | Clinics |
| `/1-on-1-training` | 1-on-1 Training |
| `/speed-agility` | Speed & Agility |
| `/golf-simulator` | Golf Simulator |
| `/weight-training` | Weight Training |
| `/team-facility-rentals` | Team Rentals |
| `/technology-tunnels` | Technology Tunnels |
| `/memberships` | Memberships |
| `/reviews` | Reviews |
| `/frequently-asked-questions` | FAQ |
| `/contact-us` | Contact |
| `/privacy` | Privacy Policy |
| `/book` | 5-step booking wizard |
| `/manage/[ref]` | Manage booking — cancel or reschedule |

All service/detail pages use `ServicePageLayout` — pass props, no bespoke layout needed.

## Admin Panel
- Route prefix: `/admin/*`
- Protected by `src/middleware.ts` — checks for `admin_session=authenticated` cookie
- Login page: `/admin/login` (bypasses middleware)
- **Credentials (hardcoded, prototype only)**: `admin` / `diamond123`
- API: `POST /api/admin/auth` with `{ action: "login"|"logout", username, password }`
- Sidebar nav defined in `AdminSidebar.tsx` — add new admin pages there

## Key Components Usage

### ServicePageLayout
Used by every service page. All props required except `contentImage`, `contentImageAlt`, `ctaLabel`, `relatedLinks`:
```tsx
<ServicePageLayout
  badge="Page Title"
  headline="Subheadline in red"
  heroBg="/images/some-image.webp"
  heroAlt="Alt text"
  introParagraphs={["Para text", ["bullet 1", "bullet 2"]]}
  whyTitle="Why section title"
  whyParagraphs={["..."]}
  whoText="Who can benefit paragraph"
  overviewTitle="Overview heading"
  overviewParagraphs={["..."]}
  closingTagline="Closing headline"
  closingParagraph="Closing paragraph"
  relatedLinks={[{ label: "Other Service", href: "/other" }]}
/>
```
`ContentItem = string | string[]` — strings render as `<p>`, arrays as `<ul>`.

### Header
- `"use client"` — handles scroll state and mobile drawer
- Nav structure defined in `NAV` array at top of file — add/remove nav items there
- Transparent on load, gains background on scroll (`scrolled` state)
- Phone: `(443) 865-1639`

### Mock Data Shapes
```ts
// bookings.ts
type Booking = { id, bookingReference, cancellationToken, customerId, customerName,
  instructorId, instructorName, date, startTime, endTime, durationMinutes: 30|60,
  status: "confirmed"|"cancelled"|"no_show"|"completed", isForChild, childAge?,
  relationshipToCustomer?, isRecurring, recurringSeriesId?, isWalkIn, cancelledBy?,
  cancellationReason?, laneAssigned, createdAt }

// customers.ts
type Customer = { id, firstName, lastName, email, phone, isActive, isFlagged,
  noShowCount, lateCancellationCount, smsOptOut,
  source: "online_booking"|"admin_booking"|"import", createdAt, deactivatedAt? }
```

## Business Info (use in copy/content)
- **Name**: The Diamond Sports Academy
- **Address**: 8274 Lokus Rd, Odenton, MD 21113
- **Phone**: (443) 865-1639
- **Hours**: Mon–Fri 8 AM–8 PM, Sat 9 AM–5 PM
- **Founded**: 2022
- **Stats**: 150+ active athletes, 300+ program graduates, 10+ expert coaches
- **Coaches**: Chris Ford (Owner & Founder), Coach Megan (Pitching & Conditioning), Syeed Mahdi (Hitting & Fielding Instructor), Connor Hax (Baseball Instructor)
- **Technology**: HitTrax, Rapsodo, Blast Motion
- **Social**: Facebook (`facebook.com/p/The-Diamond-Sports-Academy-100088094180071/`), Instagram (`instagram.com/the_diamond_sports_academy/`)
- **Site**: `https://thediamondsportsacademy.com` (existing WordPress site — this repo is the prototype replacement)

## Images
- All images live in `public/images/` as `.webp` or `.png`
- Remote images from `thediamondsportsacademy.com/wp-content/uploads/**` are allowed via `next.config.mjs`
- Always use `next/image` (`<Image>`) — never `<img>`
- Placeholder coach photo: `/images/placeholder-diamond-team-member.webp`

## Patterns & Conventions
- Pages are mostly server components; components that need interactivity use `"use client"` at the top
- No `useEffect` data fetching — all data comes from mock files imported directly
- Inline styles (`style={{}}`) are common for brand colors to avoid Tailwind config bloat — this is intentional
- `clsx` available but rarely used — prefer template literals
- Max content width: `max-w-[1320px] mx-auto px-4 sm:px-6` (public pages) or `max-w-7xl` (some admin/service pages)
- No test suite exists

## What Does NOT Exist (prototype limitations)
- No real database or ORM
- No real email/SMS sending (contact forms POST to `/api/contact` which doesn't exist)
- No real payment processing
- No authentication beyond the hardcoded admin cookie
- No real booking persistence (booking wizard generates a fake ref and shows confirmation)
- No CMS integration yet
