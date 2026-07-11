"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Booking, Blackout, Customer, FacilitySettings, Instructor,
  InstructorAvailability, NotificationRecord,
  OperatingHours,
} from "../types";

export const SEED_FACILITY_SETTINGS: FacilitySettings = {
  facilityName: "The Diamond Sports Academy",
  addressLine1: "8274 Lokus Rd",
  addressLine2: "Odenton, MD 21113",
  email: "info@thediamondsportsacademy.com",
  phone: "(443) 865-1639",
  phoneHref: "tel:+14438651639",
  website: "https://thediamondsportsacademy.com",
  timezone: "America/New_York",
  activeLanes: 4,
  adminUsername: "admin",
  adminPassword: "diamond123",
};

const DEFAULT_RECURRING: Instructor["availability"]["recurring"] = {
  0: { active: false, start: null, end: null },
  1: { active: false, start: null, end: null },
  2: { active: false, start: null, end: null },
  3: { active: false, start: null, end: null },
  4: { active: false, start: null, end: null },
  5: { active: false, start: null, end: null },
  6: { active: false, start: null, end: null },
};

const SEED_OPERATING_HOURS: OperatingHours[] = [
  { id: "oh1", dayOfWeek: "Monday",    openTime: "06:00", closeTime: "24:00", isClosed: false },
  { id: "oh2", dayOfWeek: "Tuesday",   openTime: "06:00", closeTime: "24:00", isClosed: false },
  { id: "oh3", dayOfWeek: "Wednesday", openTime: "06:00", closeTime: "24:00", isClosed: false },
  { id: "oh4", dayOfWeek: "Thursday",  openTime: "06:00", closeTime: "24:00", isClosed: false },
  { id: "oh5", dayOfWeek: "Friday",    openTime: "06:00", closeTime: "24:00", isClosed: false },
  { id: "oh6", dayOfWeek: "Saturday",  openTime: "09:00", closeTime: "17:00", isClosed: false },
  { id: "oh7", dayOfWeek: "Sunday",    openTime: "06:00", closeTime: "24:00", isClosed: true  },
];

function addDays(base: Date, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// Like addDays but skips forward past Sunday so blackouts never land on a closed day
function addWorkdays(base: Date, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function makeSlots(start: string, end: string): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const result: string[] = [];
  while (cur < endMin) {
    result.push(`${String(Math.floor(cur/60)).padStart(2,"0")}:${String(cur%60).padStart(2,"0")}`);
    cur += 30;
  }
  return result;
}

type AvSlot = [string, string] | null;

const INSTRUCTOR_NAMES: Record<string, string> = {
  "i_chris_ford":  "Chris Ford",
  "i_megan":       "Coach Megan",
  "i_syeed_mahdi": "Syeed Mahdi",
  "i_connor_hax":  "Connor Hax",
};

// Fixed patterns — ~15 active days out of 30 (~50% availability) across 5 weeks (Mon–Sat).
// Indices 0–29: [Mon–Sat W1, Mon–Sat W2, Mon–Sat W3, Mon–Sat W4, Mon–Sat W5]
// Saturday facility hours: 09:00–17:00. After 5 weeks the anchor rolls forward and repeats.
const AVAILABILITY_PATTERNS: Record<string, AvSlot[]> = {
  "i_chris_ford": [
    // W1: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       null,            null,            null,            ["09:00","13:00"], null,
    // W2: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       ["13:00","17:00"], null,          ["14:00","18:00"], null,          ["09:00","13:00"],
    // W3: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       null,            ["13:00","17:00"], null,          null,            ["10:00","14:00"],
    // W4: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       ["09:00","12:00"], null,          ["14:00","18:00"], ["10:00","13:30"], null,
    // W5: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       null,            null,            ["13:00","17:00"], null,          null,
    // W6: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       null,            ["13:00","17:00"], null,          ["09:00","13:00"], null,
    // W7: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       ["13:00","17:00"], null,          ["14:00","18:00"], null,          ["09:00","13:00"],
    // W8: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       null,            ["13:00","17:00"], null,          null,            ["10:00","14:00"],
    // W9: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       ["09:00","12:00"], null,          ["14:00","18:00"], ["10:00","13:30"], null,
    // W10: Mon              Tue              Wed              Thu              Fri              Sat
    ["09:00","12:00"],       null,            null,            ["13:00","17:00"], null,          null,
  ],
  "i_megan": [
    // W1: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    ["08:00","12:00"], null,          ["08:30","12:30"], null,          ["09:00","12:00"],
    // W2: Mon               Tue              Wed              Thu              Fri              Sat
    ["09:00","13:00"],       null,            ["08:00","11:30"], null,          ["09:00","12:30"], null,
    // W3: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    ["09:00","12:30"], ["08:00","11:00"], null,        ["10:00","14:00"], null,
    // W4: Mon               Tue              Wed              Thu              Fri              Sat
    ["08:30","12:00"],       null,            ["09:00","13:00"], null,          null,            ["10:00","14:00"],
    // W5: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    ["08:00","12:00"], null,          null,            ["09:00","12:30"], ["09:00","13:00"],
  ],
  "i_syeed_mahdi": [
    // W1: Mon               Tue              Wed              Thu              Fri              Sat
    ["13:00","17:00"],       null,            ["14:00","18:00"], null,          null,            ["10:00","14:00"],
    // W2: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    ["13:30","17:30"], null,          ["15:00","19:00"], ["13:00","16:30"], null,
    // W3: Mon               Tue              Wed              Thu              Fri              Sat
    ["13:00","17:00"],       null,            null,            ["14:00","18:00"], ["15:00","19:00"], ["09:30","13:30"],
    // W4: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    ["13:00","17:30"], null,          null,            ["14:00","17:30"], null,
    // W5: Mon               Tue              Wed              Thu              Fri              Sat
    ["13:00","17:00"],       null,            ["14:00","18:00"], null,          null,            ["10:00","14:00"],
  ],
  "i_connor_hax": [
    // W1: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    ["10:00","14:00"], null,          ["09:00","12:30"], ["11:00","15:00"], null,
    // W2: Mon               Tue              Wed              Thu              Fri              Sat
    ["10:00","14:00"],       null,            null,            ["09:30","13:30"], null,          ["09:00","13:00"],
    // W3: Mon               Tue              Wed              Thu              Fri              Sat
    ["11:00","15:00"],       null,            ["10:00","14:30"], null,          null,            null,
    // W4: Mon               Tue              Wed              Thu              Fri              Sat
    null,                    null,            ["09:00","13:00"], ["10:00","14:00"], null,        ["10:00","14:00"],
    // W5: Mon               Tue              Wed              Thu              Fri              Sat
    ["10:00","14:00"],       null,            null,            null,            ["09:00","12:30"], ["09:00","13:00"],
  ],
};

function getWeekdays(): string[] {
  // Anchor to Monday of the current week — stable all week, rolls every Monday.
  // Generates 30 work days (Mon–Sat × 5 weeks). After 5 weeks the anchor naturally
  // advances and the same pattern repeats from the new current week.
  const monday = getMonday();
  const weekdays: string[] = [];
  for (let i = 0; weekdays.length < 60; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d.getDay() !== 0) { // skip Sunday only
      weekdays.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
    }
  }
  return weekdays;
}

function getMonday(): Date {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function generateSeedAvailability(): InstructorAvailability[] {
  const weekdays = getWeekdays(); // now 20 entries
  const records: InstructorAvailability[] = [];
  let n = 0;
  Object.entries(AVAILABILITY_PATTERNS).forEach(([instructorId, pattern]) => {
    pattern.forEach((slot, idx) => {
      if (!slot || idx >= weekdays.length) return;
      const [start, end] = slot;
      records.push({
        id: `av-seed-${++n}`,
        instructorId,
        instructorName: INSTRUCTOR_NAMES[instructorId] ?? instructorId,
        date: weekdays[idx],
        slots: makeSlots(start, end),
        endTime: end,
        frozen: false,
      });
    });
  });
  return records;
}

function generateSeedScheduledDates(): Record<string, Record<string, { active: boolean; start: string | null; end: string | null }>> {
  const weekdays = getWeekdays();
  const result: Record<string, Record<string, { active: boolean; start: string | null; end: string | null }>> = {};
  Object.entries(AVAILABILITY_PATTERNS).forEach(([instructorId, pattern]) => {
    result[instructorId] = {};
    pattern.forEach((slot, idx) => {
      if (idx >= weekdays.length) return;
      const date = weekdays[idx];
      if (slot) {
        result[instructorId][date] = { active: true, start: slot[0], end: slot[1] };
      } else {
        result[instructorId][date] = { active: false, start: null, end: null };
      }
    });
  });
  return result;
}

// Computed once at module load — after all patterns and functions are defined
const SEED_SCHEDULED_DATES = generateSeedScheduledDates();

const SEED_INSTRUCTORS: Instructor[] = [
  {
    id: "i_chris_ford",
    firstName: "Chris",
    lastName: "Ford",
    email: "chris@thediamondsportsacademy.com",
    phone: "(443) 865-1639",
    speciality: "Owner & Founder",
    type: "Lane Instructor",
    instructor_type: "lane",
    isActive: true,
    totalSessionsDelivered: 0,
    upcomingSessions: 0,
    createdAt: new Date().toISOString(),
    availability: { recurring: { ...DEFAULT_RECURRING }, scheduledDates: SEED_SCHEDULED_DATES["i_chris_ford"] ?? {}, frozen: false },
  },
  {
    id: "i_megan",
    firstName: "Coach",
    lastName: "Megan",
    email: "megan@thediamondsportsacademy.com",
    phone: "",
    speciality: "Pitching & Conditioning",
    type: "Lane Instructor",
    instructor_type: "lane",
    isActive: true,
    totalSessionsDelivered: 0,
    upcomingSessions: 0,
    createdAt: new Date().toISOString(),
    availability: { recurring: { ...DEFAULT_RECURRING }, scheduledDates: SEED_SCHEDULED_DATES["i_megan"] ?? {}, frozen: false },
  },
  {
    id: "i_syeed_mahdi",
    firstName: "Syeed",
    lastName: "Mahdi",
    email: "syeed@thediamondsportsacademy.com",
    phone: "",
    speciality: "Hitting & Fielding",
    type: "Lane Instructor",
    instructor_type: "lane",
    isActive: true,
    totalSessionsDelivered: 0,
    upcomingSessions: 0,
    createdAt: new Date().toISOString(),
    availability: { recurring: { ...DEFAULT_RECURRING }, scheduledDates: SEED_SCHEDULED_DATES["i_syeed_mahdi"] ?? {}, frozen: false },
  },
  {
    id: "i_connor_hax",
    firstName: "Connor",
    lastName: "Hax",
    email: "connor@thediamondsportsacademy.com",
    phone: "",
    speciality: "Baseball Instruction",
    type: "Lane Instructor",
    instructor_type: "lane",
    isActive: true,
    totalSessionsDelivered: 0,
    upcomingSessions: 0,
    createdAt: new Date().toISOString(),
    availability: { recurring: { ...DEFAULT_RECURRING }, scheduledDates: SEED_SCHEDULED_DATES["i_connor_hax"] ?? {}, frozen: false },
  },
];

function generateSeedBlackouts(): Blackout[] {
  const today = new Date();
  return [
    {
      id: "bl-seed-1",
      date: addWorkdays(today, 4),   // ~4 days out — General closure
      reason: "Facility Maintenance",
      isRecurring: false,
    },
    {
      id: "bl-seed-2",
      date: addWorkdays(today, 10),  // ~10 days out — General closure
      reason: "Annual Staff Training Day",
      isRecurring: false,
    },
    {
      id: "bl-seed-3",
      date: addWorkdays(today, 16),  // ~16 days out — General closure
      reason: "Private Event",
      isRecurring: false,
    },
    {
      id: "bl-seed-4",
      date: addWorkdays(today, 25),  // ~25 days out — Yearly blackout
      reason: "Facility Deep Clean (Annual)",
      isRecurring: true,
    },
  ];
}

export type AppState = {
  customers: Customer[];
  instructors: Instructor[];
  bookings: Booking[];
  operatingHours: OperatingHours[];
  blackouts: Blackout[];
  availability: InstructorAvailability[];
  notifications: NotificationRecord[];
  facilitySettings: FacilitySettings;

  setCustomers: (customers: Customer[]) => void;
  setInstructors: (instructors: Instructor[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setOperatingHours: (hours: OperatingHours[]) => void;
  setBlackouts: (blackouts: Blackout[]) => void;
  setAvailability: (availability: InstructorAvailability[]) => void;
  setNotifications: (notifications: NotificationRecord[]) => void;
  setFacilitySettings: (settings: FacilitySettings) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      customers: [],
      instructors: SEED_INSTRUCTORS,
      bookings: [],
      operatingHours: SEED_OPERATING_HOURS,
      blackouts: generateSeedBlackouts(),
      availability: generateSeedAvailability(),
      notifications: [],
      facilitySettings: SEED_FACILITY_SETTINGS,

      setCustomers:        (customers)        => set({ customers }),
      setInstructors:      (instructors)      => set({ instructors }),
      setBookings:         (bookings)         => set({ bookings }),
      setOperatingHours:   (hours)            => set({ operatingHours: hours }),
      setBlackouts:        (blackouts)        => set({ blackouts }),
      setAvailability:     (availability)     => set({ availability }),
      setNotifications:    (notifications)    => set({ notifications }),
      setFacilitySettings: (facilitySettings) => set({ facilitySettings }),
    }),
    {
      name: "dsa-app-store",
      version: 10,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      migrate: () => ({
        // On version mismatch, wipe persisted state and re-seed everything
        customers:       [],
        instructors:     SEED_INSTRUCTORS,
        bookings:        [],
        operatingHours:  SEED_OPERATING_HOURS,
        blackouts:       generateSeedBlackouts(),
        availability:    generateSeedAvailability(),
        notifications:   [],
        facilitySettings: SEED_FACILITY_SETTINGS,
      }),
      partialize: (state) => ({
        facilitySettings: state.facilitySettings,
        operatingHours:   state.operatingHours,
        blackouts:        state.blackouts,
        instructors:      state.instructors,
        availability:     state.availability,
        bookings:         state.bookings,
        customers:        state.customers,
        notifications:    state.notifications,
      }),
    }
  )
);
