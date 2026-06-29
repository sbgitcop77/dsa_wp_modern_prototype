# Reactive In-Memory Mock Data Layer

## Goal

Evolve the current static mock data into a reactive in-memory layer so that any create, update, or delete operation made in one part of the app (e.g. admin dashboard) is immediately reflected everywhere else (e.g. booking flow, calendar, customer list) — without setting up a real database yet.

This validates the full data model and relationships before wiring in NeonDB (PostgreSQL) as the real backend.

---

## Why Not Server-Side?

Cloudflare Pages serves a **static export** — there is no persistent Node.js process between requests. A server-side in-memory store would reset on every page load. The store must live in the browser.

---

## Recommended Architecture: Service Layer + Client-Side Store

Two layers working together:

### 1. Client-Side Store (`src/store/`)

A React Context backed by `useReducer` that holds the live application state for the session. It is seeded from the existing mock files on first load. Any mutation dispatches a typed action; the context re-renders all subscribers automatically.

```
src/store/
  context.tsx     ← React Context + useReducer (the "database")
  types.ts        ← shared AppState type
```

**`context.tsx` — seeded from existing mock files:**
```ts
const initialState: AppState = {
  bookings:    MOCK_BOOKINGS,
  customers:   MOCK_CUSTOMERS,
  instructors: MOCK_INSTRUCTORS,
  waitlist:    MOCK_WAITLIST,
};
```

The root layout (`src/app/layout.tsx`) wraps the entire app in this provider so every page and component has access.

---

### 2. Service Layer (`src/services/`)

The only place in the app that reads or writes data. Components **never** import from `src/data/mock/` directly — they call service hooks instead.

```
src/services/
  bookings.ts     ← useBookings() hook
  customers.ts    ← useCustomers() hook
  instructors.ts  ← useInstructors() hook
  waitlist.ts     ← useWaitlist() hook
```

**Example — `services/bookings.ts`:**
```ts
export function useBookings() {
  const { state, dispatch } = useStore();
  return {
    bookings:   state.bookings,
    cancel:     (id: string) =>
                  dispatch({ type: "CANCEL_BOOKING", id }),
    reschedule: (id: string, date: string, time: string) =>
                  dispatch({ type: "RESCHEDULE_BOOKING", id, date, time }),
    create:     (booking: NewBooking) =>
                  dispatch({ type: "CREATE_BOOKING", booking }),
  };
}
```

**In a component — same ergonomics as today, fully reactive:**
```ts
const { bookings, cancel } = useBookings();
```

---

## Full Folder Structure

```
src/
  data/
    mock/               ← kept exactly as-is (seed data only, never mutated)
      bookings.ts
      customers.ts
      instructors.ts
      schedule.ts
      waitlist.ts
      notifications.ts
  store/
    context.tsx         ← AppStoreProvider, useStore hook
    types.ts            ← AppState, Action union type
  services/
    bookings.ts         ← useBookings()
    customers.ts        ← useCustomers()
    instructors.ts      ← useInstructors()
    waitlist.ts         ← useWaitlist()
```

---

## How the NeonDB Swap Works Later

The service layer is the **seam between the prototype and the real backend**. When ready to wire in NeonDB:

- Function signatures stay **identical** — components do not change
- Replace `dispatch()` calls inside the service with `fetch()` calls to Next.js API routes (or Server Actions) that hit NeonDB
- Optionally keep the `dispatch()` for optimistic UI updates

**Mock version (today):**
```ts
cancel: (id) => dispatch({ type: "CANCEL_BOOKING", id })
```

**NeonDB version (later):**
```ts
cancel: async (id) => {
  await fetch("/api/bookings/cancel", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  dispatch({ type: "CANCEL_BOOKING", id }); // optimistic update
}
```

Every component that already calls `useBookings()` continues to work unchanged.

---

## Trade-offs

| | This approach (Context + useReducer) | Alternative: Zustand |
|---|---|---|
| New dependencies | None | `zustand` (tiny, ~3 KB) |
| Boilerplate | Moderate | Very low |
| Survives page refresh | No — resets to mock seed | Yes — with `persist` middleware |
| Works in server components | No — client only | No — client only |
| Fits existing codebase style | Yes — matches current `useState` patterns | Small shift |

**Recommendation:** Start with Context + `useReducer` since it requires no new dependencies and matches the existing codebase patterns. If the boilerplate becomes unwieldy across many services, the backing store can be swapped to Zustand — the service layer interface stays the same either way.

---

## Implementation Steps (when ready)

1. Create `src/store/types.ts` — define `AppState` and the `Action` union
2. Create `src/store/context.tsx` — `AppStoreProvider` and `useStore` hook
3. Wrap `src/app/layout.tsx` in `AppStoreProvider`
4. Create service hooks in `src/services/` one entity at a time
5. Migrate each page/component to use service hooks instead of direct mock imports
6. Validate that mutations in the admin panel are reflected in the booking flow and vice versa

---

## Related Docs

- [`DATA_MODEL.md`](./DATA_MODEL.md) — existing data shapes and relationships
- [`functionality.md`](./functionality.md) — feature requirements
- [`CLAUDE.md`](../CLAUDE.md) — project conventions and stack reference
