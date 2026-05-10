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
};

export const OPERATING_HOURS: OperatingHours[] = [
  { id: "oh1", dayOfWeek: "Monday",    openTime: "08:00", closeTime: "20:00", isClosed: false },
  { id: "oh2", dayOfWeek: "Tuesday",   openTime: "08:00", closeTime: "20:00", isClosed: false },
  { id: "oh3", dayOfWeek: "Wednesday", openTime: "08:00", closeTime: "20:00", isClosed: false },
  { id: "oh4", dayOfWeek: "Thursday",  openTime: "08:00", closeTime: "20:00", isClosed: false },
  { id: "oh5", dayOfWeek: "Friday",    openTime: "08:00", closeTime: "20:00", isClosed: false },
  { id: "oh6", dayOfWeek: "Saturday",  openTime: "09:00", closeTime: "17:00", isClosed: false },
  { id: "oh7", dayOfWeek: "Sunday",    openTime: "09:00", closeTime: "17:00", isClosed: true  },
];

export const BLACKOUTS: Blackout[] = [
  { id: "bl1", type: "facility",   date: "2026-05-25", reason: "Memorial Day — Facility Closed" },
  { id: "bl2", type: "instructor", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-14", reason: "Personal appointment" },
  { id: "bl3", type: "instructor", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-16", reason: "College recruiting event" },
];

const ALL_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
];

const MORNING = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30"];
const AFTERNOON = ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];
const EVENING = ["17:00","17:30","18:00","18:30","19:00","19:30"];

export const INSTRUCTOR_AVAILABILITY: InstructorAvailability[] = [
  // Marcus Johnson (i1) — Mon, Wed, Fri of demo week
  { id: "av1",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-11", slots: [...MORNING, ...AFTERNOON] },
  { id: "av2",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-13", slots: [...AFTERNOON, ...EVENING] },
  { id: "av3",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-15", slots: ALL_SLOTS },
  // Sofia Chen (i2) — Tue, Wed, Fri of demo week
  { id: "av4",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-12", slots: [...MORNING, ...AFTERNOON] },
  { id: "av5",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-13", slots: ALL_SLOTS },
  { id: "av6",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-15", slots: [...MORNING, ...AFTERNOON] },
  // Derek Williams (i3) — Mon, Tue, Thu, Sat of demo week
  { id: "av7",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-11", slots: [...AFTERNOON, ...EVENING] },
  { id: "av8",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-12", slots: ALL_SLOTS },
  { id: "av9",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-14", slots: [...MORNING, ...AFTERNOON] },
  { id: "av10", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-16", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 2 (May 18–23) ---
  { id: "av11", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-18", slots: [...MORNING, ...AFTERNOON] },
  { id: "av12", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-20", slots: [...AFTERNOON, ...EVENING] },
  { id: "av13", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-22", slots: ALL_SLOTS },
  { id: "av14", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-19", slots: [...MORNING, ...AFTERNOON] },
  { id: "av15", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-20", slots: ALL_SLOTS },
  { id: "av16", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-22", slots: [...MORNING, ...AFTERNOON] },
  { id: "av17", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-18", slots: [...AFTERNOON, ...EVENING] },
  { id: "av18", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-19", slots: ALL_SLOTS },
  { id: "av19", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-21", slots: [...MORNING, ...AFTERNOON] },
  { id: "av20", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-23", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 3 (May 25–30) — Memorial Day May 25: Marcus & Derek skip Mon; Sofia skips Fri ---
  { id: "av21", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-27", slots: [...AFTERNOON, ...EVENING] },
  { id: "av22", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-29", slots: ALL_SLOTS },
  { id: "av23", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-26", slots: [...MORNING, ...AFTERNOON] },
  { id: "av24", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-05-27", slots: ALL_SLOTS },
  // Sofia unavailable Fri May 29 (recruiting event) — no entry
  { id: "av25", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-26", slots: ALL_SLOTS },
  { id: "av26", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-28", slots: [...MORNING, ...AFTERNOON] },
  { id: "av27", instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-30", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 4 (Jun 1–6) ---
  { id: "av28", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-01", slots: [...MORNING, ...AFTERNOON] },
  { id: "av29", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-03", slots: [...AFTERNOON, ...EVENING] },
  { id: "av30", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-05", slots: ALL_SLOTS },
  { id: "av31", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-02", slots: [...MORNING, ...AFTERNOON] },
  { id: "av32", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-03", slots: ALL_SLOTS },
  { id: "av33", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-05", slots: [...MORNING, ...AFTERNOON] },
  { id: "av34", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-01", slots: [...AFTERNOON, ...EVENING] },
  { id: "av35", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-02", slots: ALL_SLOTS },
  { id: "av36", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-04", slots: [...MORNING, ...AFTERNOON] },
  { id: "av37", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-06", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 5 (Jun 8–13) ---
  { id: "av38", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-08", slots: [...MORNING, ...AFTERNOON] },
  { id: "av39", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-10", slots: [...AFTERNOON, ...EVENING] },
  { id: "av40", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-12", slots: ALL_SLOTS },
  { id: "av41", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-09", slots: [...MORNING, ...AFTERNOON] },
  { id: "av42", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-10", slots: ALL_SLOTS },
  { id: "av43", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-12", slots: [...MORNING, ...AFTERNOON] },
  { id: "av44", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-08", slots: [...AFTERNOON, ...EVENING] },
  { id: "av45", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-09", slots: ALL_SLOTS },
  { id: "av46", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-11", slots: [...MORNING, ...AFTERNOON] },
  { id: "av47", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-13", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 6 (Jun 15–20) ---
  { id: "av48", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-15", slots: [...MORNING, ...AFTERNOON] },
  { id: "av49", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-17", slots: [...AFTERNOON, ...EVENING] },
  { id: "av50", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-19", slots: ALL_SLOTS },
  { id: "av51", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-16", slots: [...MORNING, ...AFTERNOON] },
  { id: "av52", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-17", slots: ALL_SLOTS },
  { id: "av53", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-19", slots: [...MORNING, ...AFTERNOON] },
  { id: "av54", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-15", slots: [...AFTERNOON, ...EVENING] },
  { id: "av55", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-16", slots: ALL_SLOTS },
  { id: "av56", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-18", slots: [...MORNING, ...AFTERNOON] },
  { id: "av57", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-20", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 7 (Jun 22–27) ---
  { id: "av58", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-22", slots: [...MORNING, ...AFTERNOON] },
  { id: "av59", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-24", slots: [...AFTERNOON, ...EVENING] },
  { id: "av60", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-26", slots: ALL_SLOTS },
  { id: "av61", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-23", slots: [...MORNING, ...AFTERNOON] },
  { id: "av62", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-24", slots: ALL_SLOTS },
  { id: "av63", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-26", slots: [...MORNING, ...AFTERNOON] },
  { id: "av64", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-22", slots: [...AFTERNOON, ...EVENING] },
  { id: "av65", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-23", slots: ALL_SLOTS },
  { id: "av66", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-25", slots: [...MORNING, ...AFTERNOON] },
  { id: "av67", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-27", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 8 (Jun 29–Jul 4) — Derek skips Sat Jul 4 (holiday) ---
  { id: "av68", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-29", slots: [...MORNING, ...AFTERNOON] },
  { id: "av69", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-01", slots: [...AFTERNOON, ...EVENING] },
  { id: "av70", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-03", slots: ALL_SLOTS },
  { id: "av71", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-06-30", slots: [...MORNING, ...AFTERNOON] },
  { id: "av72", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-01", slots: ALL_SLOTS },
  { id: "av73", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-03", slots: [...MORNING, ...AFTERNOON] },
  { id: "av74", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-29", slots: [...AFTERNOON, ...EVENING] },
  { id: "av75", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-30", slots: ALL_SLOTS },
  { id: "av76", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-02", slots: [...MORNING, ...AFTERNOON] },
  // Derek unavailable Sat Jul 4 (holiday) — no entry

  // --- Week 9 (Jul 6–11) ---
  { id: "av77",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-06", slots: [...MORNING, ...AFTERNOON] },
  { id: "av78",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-08", slots: [...AFTERNOON, ...EVENING] },
  { id: "av79",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-10", slots: ALL_SLOTS },
  { id: "av80",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-07", slots: [...MORNING, ...AFTERNOON] },
  { id: "av81",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-08", slots: ALL_SLOTS },
  { id: "av82",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-10", slots: [...MORNING, ...AFTERNOON] },
  { id: "av83",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-06", slots: [...AFTERNOON, ...EVENING] },
  { id: "av84",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-07", slots: ALL_SLOTS },
  { id: "av85",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-09", slots: [...MORNING, ...AFTERNOON] },
  { id: "av86",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-11", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 10 (Jul 13–18) ---
  { id: "av87",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-13", slots: [...MORNING, ...AFTERNOON] },
  { id: "av88",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-15", slots: [...AFTERNOON, ...EVENING] },
  { id: "av89",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-17", slots: ALL_SLOTS },
  { id: "av90",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-14", slots: [...MORNING, ...AFTERNOON] },
  { id: "av91",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-15", slots: ALL_SLOTS },
  { id: "av92",  instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-17", slots: [...MORNING, ...AFTERNOON] },
  { id: "av93",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-13", slots: [...AFTERNOON, ...EVENING] },
  { id: "av94",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-14", slots: ALL_SLOTS },
  { id: "av95",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-16", slots: [...MORNING, ...AFTERNOON] },
  { id: "av96",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-18", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 11 (Jul 20–25) ---
  { id: "av97",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-20", slots: [...MORNING, ...AFTERNOON] },
  { id: "av98",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-22", slots: [...AFTERNOON, ...EVENING] },
  { id: "av99",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-24", slots: ALL_SLOTS },
  { id: "av100", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-21", slots: [...MORNING, ...AFTERNOON] },
  { id: "av101", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-22", slots: ALL_SLOTS },
  { id: "av102", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-24", slots: [...MORNING, ...AFTERNOON] },
  { id: "av103", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-20", slots: [...AFTERNOON, ...EVENING] },
  { id: "av104", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-21", slots: ALL_SLOTS },
  { id: "av105", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-23", slots: [...MORNING, ...AFTERNOON] },
  { id: "av106", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-25", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 12 (Jul 27 – Aug 1) ---
  { id: "av107", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-27", slots: [...MORNING, ...AFTERNOON] },
  { id: "av108", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-29", slots: [...AFTERNOON, ...EVENING] },
  { id: "av109", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-31", slots: ALL_SLOTS },
  { id: "av110", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-28", slots: [...MORNING, ...AFTERNOON] },
  { id: "av111", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-29", slots: ALL_SLOTS },
  { id: "av112", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-07-31", slots: [...MORNING, ...AFTERNOON] },
  { id: "av113", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-27", slots: [...AFTERNOON, ...EVENING] },
  { id: "av114", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-28", slots: ALL_SLOTS },
  { id: "av115", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-30", slots: [...MORNING, ...AFTERNOON] },
  { id: "av116", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-01", slots: [...MORNING, ...AFTERNOON] },

  // --- Week 13 (Aug 3–8) ---
  { id: "av117", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-08-03", slots: [...MORNING, ...AFTERNOON] },
  { id: "av118", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-08-05", slots: [...AFTERNOON, ...EVENING] },
  { id: "av119", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-08-07", slots: ALL_SLOTS },
  { id: "av120", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-08-04", slots: [...MORNING, ...AFTERNOON] },
  { id: "av121", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-08-05", slots: ALL_SLOTS },
  { id: "av122", instructorId: "i2", instructorName: "Sofia Chen",     date: "2026-08-07", slots: [...MORNING, ...AFTERNOON] },
  { id: "av123", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-03", slots: [...AFTERNOON, ...EVENING] },
  { id: "av124", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-04", slots: ALL_SLOTS },
  { id: "av125", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-06", slots: [...MORNING, ...AFTERNOON] },
  { id: "av126", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-08", slots: [...MORNING, ...AFTERNOON] },
];

export const LANE_CONFIG = {
  totalActiveLanes: 4,
  location: "Odenton, Maryland",
};

export const LANE_UTILIZATION: Record<string, { used: number; total: number }> = {
  "08:00": { used: 1, total: 4 },
  "08:30": { used: 2, total: 4 },
  "09:00": { used: 2, total: 4 },
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
  "17:00": { used: 1, total: 4 },
  "17:30": { used: 2, total: 4 },
  "18:00": { used: 1, total: 4 },
  "18:30": { used: 0, total: 4 },
  "19:00": { used: 0, total: 4 },
  "19:30": { used: 0, total: 4 },
};
