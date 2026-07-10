import type {
  Booking, BookingFilters, Blackout, Customer, FacilitySettings, Instructor,
  InstructorAvailability, NewBlackout, NewBooking, NewCustomer,
  NewInstructor, NewNotification, NotificationRecord,
  OperatingHours,
} from "../types";

// The only interface the app ever depends on.
// MockDataService implements it today; NeonDataService will implement it when the DB is ready.
// Swap the export in index.ts — zero call-site changes required.
export interface DataService {
  // ── Customers ──────────────────────────────────────────────────────────────
  getCustomers(): Customer[];
  getCustomerById(id: string): Customer | undefined;
  createCustomer(data: NewCustomer): Customer;
  updateCustomer(id: string, patch: Partial<Customer>): Customer;

  // ── Instructors ────────────────────────────────────────────────────────────
  getInstructors(): Instructor[];
  getInstructorById(id: string): Instructor | undefined;
  createInstructor(data: NewInstructor): Instructor;
  updateInstructor(id: string, patch: Partial<Instructor>): Instructor;
  deleteInstructor(id: string): void;

  // ── Bookings ───────────────────────────────────────────────────────────────
  getBookings(filters?: BookingFilters): Booking[];
  getBookingByRef(ref: string): Booking | undefined;
  getBookingByCancellationToken(token: string): Booking | undefined;
  createBooking(data: NewBooking): Booking;
  updateBooking(id: string, patch: Partial<Booking>): Booking;
  cancelBooking(id: string, by: "customer" | "admin", reason?: string): Booking;
  cancelSeries(seriesId: string, fromDate: string, by: "customer" | "admin", reason?: string): Booking[];
  confirmWaitlisted(id: string): Booking;

  // ── Operating Hours ────────────────────────────────────────────────────────
  getOperatingHours(): OperatingHours[];
  updateOperatingHours(id: string, patch: Partial<OperatingHours>): OperatingHours;

  // ── Blackouts ──────────────────────────────────────────────────────────────
  getBlackouts(): Blackout[];
  createBlackout(data: NewBlackout): Blackout;
  deleteBlackout(id: string): void;

  // ── Instructor Availability ────────────────────────────────────────────────
  getAvailability(filters?: { instructorId?: string; date?: string }): InstructorAvailability[];
  upsertAvailability(instructorId: string, date: string, slots: string[], endTime: string): InstructorAvailability;

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications(): NotificationRecord[];
  createNotification(data: NewNotification): NotificationRecord;
  updateNotificationStatus(id: string, status: NotificationRecord["deliveryStatus"]): NotificationRecord;

  // ── Facility Settings ──────────────────────────────────────────────────────
  getFacilitySettings(): FacilitySettings;
  updateFacilitySettings(patch: Partial<FacilitySettings>): FacilitySettings;
}
