import { addDays, format } from "date-fns";
import { CUSTOMER_POOL } from "./customers";

export type WaitlistEntry = {
  id: string;
  date: string;
  time: string;
  instructorId: string;
  instructorName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  convertedBookingId?: string;
};

class RNG {
  private s: number;
  constructor(seed: number) { this.s = ((seed >>> 0) || 1) & 0x7fffffff; }
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) & 0x7fffffff;
    return this.s / 0x7fffffff;
  }
  int(n: number) { return Math.floor(this.next() * n); }
  bool(p = 0.5) { return this.next() < p; }
  pick<T>(a: T[]): T { return a[this.int(a.length)]; }
}

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30",
];

const INSTRUCTORS = [
  { id: "i1",  name: "Marcus Johnson" },
  { id: "i2",  name: "Sofia Chen" },
  { id: "i3",  name: "Derek Williams" },
  { id: "i5",  name: "Alex Rivera" },
  { id: "i6",  name: "Ryan Torres" },
  { id: "i7",  name: "Priya Patel" },
  { id: "i8",  name: "James Okafor" },
  { id: "i9",  name: "Lauren Kim" },
  { id: "i10", name: "Carlos Mendes" },
  { id: "i11", name: "Taylor Brooks" },
];

function generateWaitlist(): WaitlistEntry[] {
  const rng = new RNG(5555);
  const entries: WaitlistEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = format(today, "yyyy-MM-dd");

  const weekStart = addDays(today, -2 * 7);
  const weekEnd = addDays(today, 10 * 7);
  const totalWeeks = 12;
  let counter = 1;

  for (let w = 0; w < totalWeeks; w++) {
    const weekDate = addDays(weekStart, w * 7);
    const entriesThisWeek = 3 + rng.int(2); // 3-4

    for (let e = 0; e < entriesThisWeek; e++) {
      const dayOffset = rng.int(7);
      const date = addDays(weekDate, dayOffset);
      const dateStr = format(date, "yyyy-MM-dd");

      const cust = rng.pick(CUSTOMER_POOL);
      const nameParts = cust.name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const email = `${firstName.toLowerCase()}@email.com`;

      const areaCode = rng.pick(["410","443","301","240","202"]);
      const phone = `(${areaCode}) 555-${String(rng.int(9000) + 1000)}`;

      const inst = rng.pick(INSTRUCTORS);
      const time = rng.pick(TIME_SLOTS);

      let convertedBookingId: string | undefined;
      if (dateStr < todayStr && rng.bool(0.55)) {
        convertedBookingId = `BK-${dateStr.replace(/-/g, "").slice(2)}`;
      }

      const daysBeforeEntry = 2 + rng.int(9); // 2-10 days before
      const entryDate = new Date(date.getTime() - daysBeforeEntry * 86400000);
      const createdAt = entryDate.toISOString().slice(0, 19) + "Z";

      entries.push({
        id: `w${counter++}`,
        date: dateStr,
        time,
        instructorId: inst.id,
        instructorName: inst.name,
        firstName,
        lastName,
        email,
        phone,
        createdAt,
        ...(convertedBookingId ? { convertedBookingId } : {}),
      });
    }
  }

  return entries;
}

export const MOCK_WAITLIST: WaitlistEntry[] = generateWaitlist();
