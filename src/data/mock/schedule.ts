import { addDays, format } from "date-fns";

export type OperatingHours = {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type Blackout = {
  id: string;
  type: "facility" | "instructor";
  instructorId?: string;
  instructorName?: string;
  date: string;
  reason: string;
};

export type InstructorAvailability = {
  id: string;
  instructorId: string;
  instructorName: string;
  date: string;
  slots: string[];
  frozen: boolean; // stub for upcoming Freeze button feature
};

export const OPERATING_HOURS: OperatingHours[] = [
  { id: "oh1", dayOfWeek: "Monday",    openTime: "09:00", closeTime: "21:00", isClosed: false },
  { id: "oh2", dayOfWeek: "Tuesday",   openTime: "09:00", closeTime: "21:00", isClosed: false },
  { id: "oh3", dayOfWeek: "Wednesday", openTime: "09:00", closeTime: "21:00", isClosed: false },
  { id: "oh4", dayOfWeek: "Thursday",  openTime: "09:00", closeTime: "21:00", isClosed: false },
  { id: "oh5", dayOfWeek: "Friday",    openTime: "09:00", closeTime: "21:00", isClosed: false },
  { id: "oh6", dayOfWeek: "Saturday",  openTime: "09:00", closeTime: "21:00", isClosed: false },
  { id: "oh7", dayOfWeek: "Sunday",    openTime: "09:00", closeTime: "21:00", isClosed: false },
];

const ALL_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30",
];

const MORNING = ["09:00","09:30","10:00","10:30","11:00","11:30"];
const AFTERNOON = ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];
const EVENING = ["17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30"];

const WEEKS_OF_DATA = 13;

// All mock schedule data below is generated relative to "today" so the
// prototype never goes stale — every date is in the future, no matter
// when this app is opened.
const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function nextWeekday(from: Date, targetDow: number, minDaysOut: number): Date {
  let d = addDays(from, minDaysOut);
  while (d.getDay() !== targetDow) d = addDays(d, 1);
  return d;
}

// Day-of-week indices: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
type InstructorPattern = { id: string; name: string; daySlots: Record<number, string[]> };

const INSTRUCTOR_PATTERNS: InstructorPattern[] = [
  { id: "i1",  name: "Marcus Johnson",  daySlots: { 1: [...MORNING, ...AFTERNOON], 3: [...AFTERNOON, ...EVENING], 5: ALL_SLOTS } },
  { id: "i2",  name: "Sofia Chen",      daySlots: { 2: [...MORNING, ...AFTERNOON], 3: ALL_SLOTS, 5: [...MORNING, ...AFTERNOON] } },
  { id: "i3",  name: "Derek Williams",  daySlots: { 1: [...AFTERNOON, ...EVENING], 2: ALL_SLOTS, 4: [...MORNING, ...AFTERNOON], 6: [...MORNING, ...AFTERNOON] } },
  { id: "i6",  name: "Ryan Torres",     daySlots: { 1: [...MORNING, ...AFTERNOON], 4: [...AFTERNOON, ...EVENING], 6: ALL_SLOTS } },
  { id: "i7",  name: "Priya Patel",     daySlots: { 2: [...MORNING, ...AFTERNOON], 5: ALL_SLOTS, 6: [...MORNING, ...AFTERNOON] } },
  { id: "i8",  name: "James Okafor",    daySlots: { 1: ALL_SLOTS, 3: [...MORNING, ...AFTERNOON], 5: [...AFTERNOON, ...EVENING] } },
  { id: "i9",  name: "Lauren Kim",      daySlots: { 2: [...AFTERNOON, ...EVENING], 4: ALL_SLOTS, 6: [...MORNING, ...AFTERNOON] } },
  { id: "i10", name: "Carlos Mendes",   daySlots: { 1: [...MORNING, ...AFTERNOON], 2: [...AFTERNOON, ...EVENING], 5: ALL_SLOTS } },
  { id: "i11", name: "Taylor Brooks",   daySlots: { 3: [...MORNING, ...AFTERNOON], 4: [...MORNING, ...AFTERNOON], 6: ALL_SLOTS } },
];

export const BLACKOUTS: Blackout[] = [];

function isFacilityBlackout(dateStr: string): boolean {
  return BLACKOUTS.some(b => b.type === "facility" && b.date === dateStr);
}

function isInstructorBlackout(dateStr: string, instructorId: string): boolean {
  return BLACKOUTS.some(b => b.type === "instructor" && b.date === dateStr && b.instructorId === instructorId);
}

function generateInstructorAvailability(): InstructorAvailability[] {
  const result: InstructorAvailability[] = [];
  let counter = 1;
  const totalDays = WEEKS_OF_DATA * 7;
  for (let offset = 0; offset < totalDays; offset++) {
    const date = addDays(TODAY, offset);
    const dow = date.getDay();
    const dateStr = toDateStr(date);
    if (isFacilityBlackout(dateStr)) continue;
    for (const pattern of INSTRUCTOR_PATTERNS) {
      const slots = pattern.daySlots[dow];
      if (!slots || isInstructorBlackout(dateStr, pattern.id)) continue;
      result.push({ id: `av${counter++}`, instructorId: pattern.id, instructorName: pattern.name, date: dateStr, slots, frozen: false });
    }
  }
  return result;
}

export const INSTRUCTOR_AVAILABILITY: InstructorAvailability[] = generateInstructorAvailability();

export const LANE_CONFIG = {
  totalActiveLanes: 4,
  location: "Odenton, Maryland",
};

export const LANE_UTILIZATION: Record<string, { used: number; total: number }> = {
  "09:00": { used: 4, total: 4 },
  "09:30": { used: 3, total: 4 },
  "10:00": { used: 4, total: 4 },
  "10:30": { used: 3, total: 4 },
  "11:00": { used: 2, total: 4 },
  "11:30": { used: 1, total: 4 },
  "12:00": { used: 2, total: 4 },
  "12:30": { used: 3, total: 4 },
  "13:00": { used: 4, total: 4 },
  "13:30": { used: 4, total: 4 },
  "14:00": { used: 3, total: 4 },
  "14:30": { used: 2, total: 4 },
  "15:00": { used: 1, total: 4 },
  "15:30": { used: 2, total: 4 },
  "16:00": { used: 3, total: 4 },
  "16:30": { used: 2, total: 4 },
  "17:00": { used: 4, total: 4 },
  "17:30": { used: 2, total: 4 },
  "18:00": { used: 1, total: 4 },
  "18:30": { used: 1, total: 4 },
  "19:00": { used: 0, total: 4 },
  "19:30": { used: 0, total: 4 },
  "20:00": { used: 2, total: 4 },
  "20:30": { used: 0, total: 4 },
};
