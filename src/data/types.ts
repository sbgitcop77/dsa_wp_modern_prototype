// Canonical entity types for the DSA app.
// These are the source of truth — mock files and future NeonDB adapter both conform to these.

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isFlagged: boolean;
  noShowCount: number;
  lateCancellationCount: number;
  smsOptOut: boolean;
  source: "online_booking" | "admin_booking" | "import";
  createdAt: string;
  deactivatedAt?: string;
};

export type DaySlot = {
  active: boolean;
  start: string | null; // HH:MM
  end: string | null;   // HH:MM
};

export type InstructorSchedule = {
  recurring: Record<number, DaySlot>; // 0 = Sun … 6 = Sat
  scheduledDates: Record<string, DaySlot>; // YYYY-MM-DD overrides
  frozen: boolean;
};

export type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  speciality: string;
  type: string;
  instructor_type: string;
  isActive: boolean;
  totalSessionsDelivered: number;
  upcomingSessions: number;
  createdAt: string;
  deactivatedAt?: string;
  availability: InstructorSchedule;
};

export type Booking = {
  id: string;
  bookingReference: string;
  cancellationToken: string;
  customerId: string;
  customerName: string;       // denormalized for display
  instructorId: string;
  instructorName: string;     // denormalized for display
  date: string;               // YYYY-MM-DD
  startTime: string;          // HH:MM
  endTime: string;            // HH:MM
  durationMinutes: 30 | 60;
  status: "confirmed" | "cancelled" | "no_show" | "completed" | "waitlisted";
  isForChild: boolean;
  childName?: string;
  childAge?: number;
  relationshipToCustomer?: string;
  bookedByName?: string;
  isRecurring: boolean;
  recurringSeriesId?: string;
  isWalkIn: boolean;
  cancelledBy?: "customer" | "admin";
  cancellationReason?: string;
  conflictReason?: "instructor_conflict";
  laneAssigned?: number;      // 1–4; undefined for Non-Lane Instructors
  notes?: string;             // additional instructions from the participant at booking time
  createdAt: string;
};

export type OperatingHours = {
  id: string;
  dayOfWeek: string;
  openTime: string;   // HH:MM
  closeTime: string;  // HH:MM
  isClosed: boolean;
};

export type Blackout = {
  id: string;
  date: string;       // YYYY-MM-DD; for recurring entries only MM-DD is used for matching
  isRecurring: boolean;
  reason: string;
};

export type InstructorAvailability = {
  id: string;
  instructorId: string;
  instructorName: string;     // denormalized for display
  date: string;               // YYYY-MM-DD
  slots: string[];            // HH:MM start times (30-min intervals)
  endTime: string;            // HH:MM — bookings must end by this time
  frozen: boolean;
};

export type NotificationRecord = {
  id: string;
  bookingId: string;
  bookingReference: string;   // denormalized for display
  recipientType: "customer" | "instructor" | "admin";
  recipientName: string;
  recipientEmail: string;
  notificationType:
    | "confirmation"
    | "waitlist"
    | "reminder_24hr"
    | "reminder_2hr_sms"
    | "change"
    | "cancellation"
    | "calendar_invite";
  channel: "email" | "sms" | "calendar";
  sentAt: string;
  deliveryStatus: "sent" | "pending" | "failed";
};

// ── Input types (for create operations) ──────────────────────────────────────
// These omit server-generated fields (id, createdAt, denormalized names).

export type NewCustomer = Omit<Customer, "id" | "createdAt" | "noShowCount" | "lateCancellationCount">;

export type NewInstructor = Omit<Instructor, "id" | "createdAt" | "totalSessionsDelivered" | "upcomingSessions">;

export type NewBooking = Omit<Booking, "id" | "bookingReference" | "cancellationToken" | "createdAt" | "customerName" | "instructorName" | "endTime">;

export type NewBlackout = Omit<Blackout, "id">; // just { date, reason }

export type NewNotification = Omit<NotificationRecord, "id" | "sentAt">;

export type FacilitySettings = {
  facilityName: string;
  addressLine1: string;  // e.g. "8274 Lokus Rd"
  addressLine2: string;  // e.g. "Odenton, MD 21113"
  email: string;
  phone: string;         // display form e.g. "(443) 865-1639"
  phoneHref: string;     // tel: href e.g. "tel:+14438651639"
  website: string;
  timezone: string;
  activeLanes: number;
  adminUsername: string;
  adminPassword: string;
};

// ── Filter types ──────────────────────────────────────────────────────────────

export type BookingFilters = {
  date?: string;
  instructorId?: string;
  customerId?: string;
  status?: Booking["status"];
  fromDate?: string;
  toDate?: string;
};
