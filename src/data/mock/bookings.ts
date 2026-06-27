import { addDays, format } from "date-fns";
import { CUSTOMER_POOL } from "./customers";

export type Booking = {
  id: string;
  bookingReference: string;
  cancellationToken: string;
  customerId: string;
  customerName: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: 30 | 60;
  status: "confirmed" | "cancelled" | "no_show" | "completed";
  isForChild: boolean;
  childAge?: number;
  relationshipToCustomer?: string;
  bookedByName?: string;
  isRecurring: boolean;
  recurringSeriesId?: string;
  isWalkIn: boolean;
  cancelledBy?: "customer" | "admin";
  cancellationReason?: string;
  laneAssigned: number;
  createdAt: string;
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

const TODAY_D = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const TODAY = format(TODAY_D, "yyyy-MM-dd");
const _now = new Date();
const CURRENT_HOUR = _now.getHours();
const CURRENT_MIN = _now.getMinutes();

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

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00","20:30",
];

const CANCEL_REASONS = ["Schedule conflict","Personal reasons","Illness","Weather","Travel plans","Family commitment"];

function calcEnd(start: string, dur: 30 | 60): string {
  const [h, m] = start.split(":").map(Number);
  const t = h * 60 + m + dur;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function getStatus(dateStr: string, startTime: string, rng: RNG): Booking["status"] {
  if (dateStr < TODAY) {
    const r = rng.next();
    return r < 0.76 ? "completed" : r < 0.94 ? "cancelled" : "no_show";
  }
  if (dateStr === TODAY) {
    const [h] = startTime.split(":").map(Number);
    const past = h < CURRENT_HOUR || (h === CURRENT_HOUR && CURRENT_MIN > 15);
    if (past) return rng.bool(0.88) ? "completed" : "cancelled";
    return rng.bool(0.91) ? "confirmed" : "cancelled";
  }
  return rng.bool(0.88) ? "confirmed" : "cancelled";
}

function makeBooking(
  cnt: number,
  instId: string, instName: string,
  custId: string, custName: string,
  dateStr: string, startTime: string, dur: 30 | 60,
  isForChild: boolean, childAge: number | undefined, relationship: string | undefined,
  bookedByName: string | undefined,
  isRecurring: boolean, recurringSeriesId: string | undefined,
  lane: number
): Booking {
  const rng = new RNG(cnt * 1234567 + 89);
  const status = getStatus(dateStr, startTime, rng);
  const cancelled = status === "cancelled";
  const daysBeforeBooking = 1 + (cnt % 21);
  const bookingTs = new Date(dateStr).getTime();
  const createdTs = Math.min(Date.now() - 86400000, bookingTs - daysBeforeBooking * 86400000);
  return {
    id: `b${cnt}`,
    bookingReference: `DSA-${dateStr.slice(0, 4)}-${String(cnt).padStart(5, "0")}`,
    cancellationToken: `tok-b${cnt}-${((cnt * 2654435761) >>> 0).toString(16).slice(0, 8)}`,
    customerId: custId,
    customerName: custName,
    instructorId: instId,
    instructorName: instName,
    date: dateStr,
    startTime,
    endTime: calcEnd(startTime, dur),
    durationMinutes: dur,
    status,
    isForChild,
    childAge,
    relationshipToCustomer: relationship,
    bookedByName,
    isRecurring,
    recurringSeriesId,
    isWalkIn: false,
    cancelledBy: cancelled ? (rng.bool(0.65) ? "customer" : "admin") : undefined,
    cancellationReason: cancelled && rng.bool(0.6) ? rng.pick(CANCEL_REASONS) : undefined,
    laneAssigned: lane,
    createdAt: new Date(createdTs).toISOString().slice(0, 19) + "Z",
  };
}

function generateBookings(): Booking[] {
  const rangeStart = addDays(TODAY_D, -30);
  const rangeEnd = addDays(TODAY_D, 90);
  const totalDays = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000);

  let counter = 1;
  const result: Booking[] = [];

  // Step 1 — Recurring series
  const seriesRng = new RNG(9001);

  interface SeriesInfo {
    id: string;
    instId: string;
    instName: string;
    custId: string;
    custName: string;
    dow: number;
    slotIdx: number;
    dur: 30 | 60;
    isForChild: boolean;
    childAge: number | undefined;
    relationship: string | undefined;
    bookedByName: string | undefined;
    dates: string[];
  }

  const allSeries: SeriesInfo[] = [];

  for (let s = 0; s < 90; s++) {
    const inst = seriesRng.pick(INSTRUCTORS);
    const cust = seriesRng.pick(CUSTOMER_POOL);
    const dow = 1 + seriesRng.int(6); // 1-6 (Mon-Sat)
    const slotIdx = seriesRng.int(22); // 0-21
    const dur: 30 | 60 = seriesRng.bool(0.58) ? 60 : 30;
    const isForChild = seriesRng.bool(0.22);
    const childAge = isForChild ? (7 + seriesRng.int(10)) : undefined;
    const relationship = isForChild ? seriesRng.pick(["Parent", "Guardian", "Coach"]) : undefined;
    const bookedByName = isForChild ? seriesRng.pick(CUSTOMER_POOL).name : undefined;
    const sessionCount = 4 + seriesRng.int(9);
    const startOffsetDays = seriesRng.int(80);

    // Find first date in range that matches dow
    let firstDate = addDays(rangeStart, startOffsetDays);
    while (firstDate.getDay() !== dow) {
      firstDate = addDays(firstDate, 1);
    }

    const dates: string[] = [];
    for (let w = 0; w < sessionCount; w++) {
      const d = addDays(firstDate, w * 7);
      if (d > rangeEnd) break;
      dates.push(format(d, "yyyy-MM-dd"));
    }

    if (dates.length < 2) continue;

    allSeries.push({
      id: `series-${s + 1}`,
      instId: inst.id,
      instName: inst.name,
      custId: cust.id,
      custName: cust.name,
      dow,
      slotIdx,
      dur,
      isForChild,
      childAge,
      relationship,
      bookedByName,
      dates,
    });
  }

  // Step 2 — Build seriesByDate map
  const seriesByDate = new Map<string, Booking[]>();

  for (const series of allSeries) {
    const startTime = TIME_SLOTS[series.slotIdx];
    for (const dateStr of series.dates) {
      const booking = makeBooking(
        counter++,
        series.instId, series.instName,
        series.custId, series.custName,
        dateStr, startTime, series.dur,
        series.isForChild, series.childAge, series.relationship, series.bookedByName,
        true, series.id,
        0 // placeholder, will be set in day loop
      );
      const list = seriesByDate.get(dateStr) ?? [];
      list.push(booking);
      seriesByDate.set(dateStr, list);
    }
  }

  // Step 3 — Day loop
  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const date = addDays(rangeStart, dayOffset);
    const dateStr = format(date, "yyyy-MM-dd");
    const dow = date.getDay();

    const daySeed = (dayOffset * 1664525 + 1013904223) & 0x7fffffff;
    const dRng = new RNG(daySeed);

    const dt = dRng.next();
    let target: number;
    if (dt < 0.07) {
      target = 8 + dRng.int(10);
    } else if (dt < 0.14) {
      target = 42 + dRng.int(8);
    } else if (dow === 0) {
      target = 18 + dRng.int(14);
    } else if (dow === 6) {
      target = 32 + dRng.int(14);
    } else {
      target = 28 + dRng.int(16);
    }

    // Lane grid: 4 lanes x 24 time slots
    const lanes: boolean[][] = Array.from({ length: 4 }, () => new Array(24).fill(false));
    // Instructor occupancy: instId → 24-slot boolean array
    const instOccupied = new Map<string, boolean[]>();

    function tryAssignLane(si: number, numSlots: number, instId: string): number {
      if (!instOccupied.has(instId)) instOccupied.set(instId, new Array(24).fill(false));
      const instSlots = instOccupied.get(instId)!;
      // Instructor must be free across all required slots
      for (let k = 0; k < numSlots; k++) {
        if (si + k >= 24 || instSlots[si + k]) return -1;
      }
      // Find a free lane
      for (let lane = 0; lane < 4; lane++) {
        let free = true;
        for (let k = 0; k < numSlots; k++) {
          if (si + k >= 24 || lanes[lane][si + k]) { free = false; break; }
        }
        if (free) {
          for (let k = 0; k < numSlots; k++) {
            lanes[lane][si + k] = true;
            instSlots[si + k] = true;
          }
          return lane + 1;
        }
      }
      return -1;
    }

    const dayBookings: Booking[] = [];

    // Place series bookings first
    const seriesForDay = seriesByDate.get(dateStr) ?? [];
    for (const booking of seriesForDay) {
      const si = TIME_SLOTS.indexOf(booking.startTime);
      if (si < 0) continue;
      const numSlots = booking.durationMinutes / 30;
      const lane = tryAssignLane(si, numSlots, booking.instructorId);
      if (lane >= 1) {
        booking.laneAssigned = lane;
        dayBookings.push(booking);
      }
    }

    // Fill single-session bookings
    let attempts = 0;
    while (dayBookings.length < target && attempts < target * 4) {
      attempts++;
      const inst = dRng.pick(INSTRUCTORS);
      const cust = dRng.pick(CUSTOMER_POOL);
      const dur: 30 | 60 = dRng.bool(0.58) ? 60 : 30;
      const slotIdx = dRng.int(22);
      const startTime = TIME_SLOTS[slotIdx];
      const numSlots = dur / 30;
      const lane = tryAssignLane(slotIdx, numSlots, inst.id);
      if (lane < 1) continue;

      const isForChild = dRng.bool(0.2);
      const childAge = isForChild ? (7 + dRng.int(10)) : undefined;
      const relationship = isForChild ? dRng.pick(["Parent", "Guardian", "Coach"]) : undefined;
      const bookedByName = isForChild ? dRng.pick(CUSTOMER_POOL).name : undefined;

      const booking = makeBooking(
        counter++,
        inst.id, inst.name,
        cust.id, cust.name,
        dateStr, startTime, dur,
        isForChild, childAge, relationship, bookedByName,
        false, undefined,
        lane
      );
      dayBookings.push(booking);
    }

    result.push(...dayBookings);
  }

  return result;
}

export const MOCK_BOOKINGS: Booking[] = generateBookings();
