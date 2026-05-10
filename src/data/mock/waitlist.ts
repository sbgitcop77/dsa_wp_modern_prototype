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

export const MOCK_WAITLIST: WaitlistEntry[] = [
  // May
  {
    id: "w1",
    date: "2026-05-11",
    time: "10:00",
    instructorId: "i1",
    instructorName: "Marcus Johnson",
    firstName: "Ethan",
    lastName: "Brooks",
    email: "ethan.brooks@email.com",
    phone: "(410) 555-0721",
    createdAt: "2026-05-08T09:00:00Z",
    convertedBookingId: "BK-2026-0511",
  },
  {
    id: "w2",
    date: "2026-05-13",
    time: "13:00",
    instructorId: "i2",
    instructorName: "Sofia Chen",
    firstName: "Maya",
    lastName: "Thompson",
    email: "maya.t@email.com",
    phone: "(443) 555-0834",
    createdAt: "2026-05-08T11:00:00Z",
  },
  {
    id: "w3",
    date: "2026-05-15",
    time: "10:00",
    instructorId: "i3",
    instructorName: "Derek Williams",
    firstName: "Noah",
    lastName: "Kim",
    email: "noah.kim@email.com",
    phone: "(301) 555-0956",
    createdAt: "2026-05-09T08:30:00Z",
    convertedBookingId: "BK-2026-0515",
  },
  // June
  {
    id: "w4",
    date: "2026-06-10",
    time: "13:00",
    instructorId: "i2",
    instructorName: "Sofia Chen",
    firstName: "Ethan",
    lastName: "Brooks",
    email: "ethan.brooks@email.com",
    phone: "(410) 555-0721",
    createdAt: "2026-06-07T10:00:00Z",
  },
  {
    id: "w5",
    date: "2026-06-20",
    time: "10:00",
    instructorId: "i3",
    instructorName: "Derek Williams",
    firstName: "Maya",
    lastName: "Thompson",
    email: "maya.t@email.com",
    phone: "(443) 555-0834",
    createdAt: "2026-06-17T09:00:00Z",
  },
  {
    id: "w6",
    date: "2026-06-26",
    time: "09:00",
    instructorId: "i1",
    instructorName: "Marcus Johnson",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@email.com",
    phone: "(240) 555-0312",
    createdAt: "2026-06-23T11:00:00Z",
  },
  // July
  {
    id: "w7",
    date: "2026-07-09",
    time: "14:00",
    instructorId: "i3",
    instructorName: "Derek Williams",
    firstName: "Noah",
    lastName: "Kim",
    email: "noah.kim@email.com",
    phone: "(301) 555-0956",
    createdAt: "2026-07-06T08:30:00Z",
  },
  {
    id: "w8",
    date: "2026-07-15",
    time: "09:00",
    instructorId: "i2",
    instructorName: "Sofia Chen",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@email.com",
    phone: "(240) 555-0312",
    createdAt: "2026-07-12T10:00:00Z",
  },
  // August
  {
    id: "w9",
    date: "2026-08-05",
    time: "10:00",
    instructorId: "i1",
    instructorName: "Marcus Johnson",
    firstName: "Ethan",
    lastName: "Brooks",
    email: "ethan.brooks@email.com",
    phone: "(410) 555-0721",
    createdAt: "2026-08-02T09:00:00Z",
  },
];
