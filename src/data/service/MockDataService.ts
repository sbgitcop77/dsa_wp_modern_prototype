import { format } from "date-fns";
import { useAppStore } from "../store/useAppStore";
import type { DataService } from "./DataService";
import type {
  Booking, BookingFilters, Blackout, Customer, FacilitySettings, Instructor,
  InstructorAvailability, NewBlackout, NewBooking, NewCustomer,
  NewInstructor, NewNotification, NotificationRecord,
  OperatingHours,
} from "../types";

// Reads directly from Zustand store state (not hooks — safe to call outside React).
const store = () => useAppStore.getState();

function uid(prefix: string): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function calcEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const existing = store().bookings;
  const maxSeq = existing.reduce((max, b) => {
    const match = b.bookingReference.match(/DSA-\d{4}-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `DSA-${year}-${String(maxSeq + 1).padStart(5, "0")}`;
}

function notFound(entity: string, id: string): never {
  throw new Error(`${entity} not found: ${id}`);
}

export class MockDataService implements DataService {
  // ── Customers ──────────────────────────────────────────────────────────────

  getCustomers(): Customer[] {
    return store().customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return store().customers.find((c) => c.id === id);
  }

  createCustomer(data: NewCustomer): Customer {
    const customer: Customer = {
      ...data,
      id: uid("c"),
      noShowCount: 0,
      lateCancellationCount: 0,
      createdAt: new Date().toISOString(),
    };
    store().setCustomers([...store().customers, customer]);
    return customer;
  }

  updateCustomer(id: string, patch: Partial<Customer>): Customer {
    const customers = store().customers;
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) notFound("Customer", id);
    const updated = { ...customers[idx], ...patch };
    store().setCustomers(customers.map((c) => (c.id === id ? updated : c)));
    return updated;
  }

  // ── Instructors ────────────────────────────────────────────────────────────

  getInstructors(): Instructor[] {
    return store().instructors;
  }

  getInstructorById(id: string): Instructor | undefined {
    return store().instructors.find((i) => i.id === id);
  }

  createInstructor(data: NewInstructor): Instructor {
    const instructor: Instructor = {
      ...data,
      id: uid("i"),
      totalSessionsDelivered: 0,
      upcomingSessions: 0,
      createdAt: new Date().toISOString(),
    };
    store().setInstructors([...store().instructors, instructor]);
    return instructor;
  }

  updateInstructor(id: string, patch: Partial<Instructor>): Instructor {
    const instructors = store().instructors;
    const idx = instructors.findIndex((i) => i.id === id);
    if (idx === -1) notFound("Instructor", id);
    const updated = { ...instructors[idx], ...patch };
    store().setInstructors(instructors.map((i) => (i.id === id ? updated : i)));
    return updated;
  }

  deleteInstructor(id: string): void {
    store().setInstructors(store().instructors.filter((i) => i.id !== id));
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  getBookings(filters?: BookingFilters): Booking[] {
    let result = store().bookings;
    if (!filters) return result;
    if (filters.date)         result = result.filter((b) => b.date === filters.date);
    if (filters.instructorId) result = result.filter((b) => b.instructorId === filters.instructorId);
    if (filters.customerId)   result = result.filter((b) => b.customerId === filters.customerId);
    if (filters.status)       result = result.filter((b) => b.status === filters.status);
    if (filters.fromDate)     result = result.filter((b) => b.date >= filters.fromDate!);
    if (filters.toDate)       result = result.filter((b) => b.date <= filters.toDate!);
    return result;
  }

  getBookingByRef(ref: string): Booking | undefined {
    return store().bookings.find((b) => b.bookingReference === ref);
  }

  getBookingByCancellationToken(token: string): Booking | undefined {
    return store().bookings.find((b) => b.cancellationToken === token);
  }

  createBooking(data: NewBooking): Booking {
    const instructor = this.getInstructorById(data.instructorId);
    const customer = this.getCustomerById(data.customerId);
    const booking: Booking = {
      ...data,
      id: uid("b"),
      bookingReference: generateBookingRef(),
      cancellationToken: `tok-${uid("ct")}`,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Unknown",
      instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown",
      endTime: calcEndTime(data.startTime, data.durationMinutes),
      createdAt: new Date().toISOString(),
    };
    store().setBookings([...store().bookings, booking]);
    return booking;
  }

  updateBooking(id: string, patch: Partial<Booking>): Booking {
    const bookings = store().bookings;
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) notFound("Booking", id);
    const updated: Booking = {
      ...bookings[idx],
      ...patch,
      // Recalculate endTime if startTime or duration changed.
      endTime: calcEndTime(
        patch.startTime ?? bookings[idx].startTime,
        patch.durationMinutes ?? bookings[idx].durationMinutes
      ),
    };
    store().setBookings(bookings.map((b) => (b.id === id ? updated : b)));
    return updated;
  }

  cancelBooking(id: string, by: "customer" | "admin", reason?: string): Booking {
    return this.updateBooking(id, {
      status: "cancelled",
      cancelledBy: by,
      cancellationReason: reason,
    });
  }

  cancelSeries(seriesId: string, fromDate: string, by: "customer" | "admin", reason?: string): Booking[] {
    const targets = store().bookings.filter(
      (b) => b.recurringSeriesId === seriesId && b.date >= fromDate &&
        (b.status === "confirmed" || b.status === "waitlisted")
    );
    const updated = targets.map((b) =>
      ({ ...b, status: "cancelled" as const, cancelledBy: by, cancellationReason: reason })
    );
    store().setBookings(
      store().bookings.map((b) => updated.find((u) => u.id === b.id) ?? b)
    );
    return updated;
  }

  confirmWaitlisted(id: string): Booking {
    return this.updateBooking(id, { status: "confirmed", conflictReason: undefined });
  }

  // ── Operating Hours ────────────────────────────────────────────────────────

  getOperatingHours(): OperatingHours[] {
    return store().operatingHours;
  }

  updateOperatingHours(id: string, patch: Partial<OperatingHours>): OperatingHours {
    const hours = store().operatingHours;
    const idx = hours.findIndex((h) => h.id === id);
    if (idx === -1) notFound("OperatingHours", id);
    const updated = { ...hours[idx], ...patch };
    store().setOperatingHours(hours.map((h) => (h.id === id ? updated : h)));
    return updated;
  }

  // ── Blackouts ──────────────────────────────────────────────────────────────

  getBlackouts(): Blackout[] {
    return store().blackouts;
  }

  createBlackout(data: NewBlackout): Blackout {
    const blackout: Blackout = { ...data, id: uid("bl") };
    store().setBlackouts([...store().blackouts, blackout]);
    return blackout;
  }

  deleteBlackout(id: string): void {
    store().setBlackouts(store().blackouts.filter((b) => b.id !== id));
  }

  // ── Instructor Availability ────────────────────────────────────────────────

  getAvailability(filters?: { instructorId?: string; date?: string }): InstructorAvailability[] {
    let result = store().availability;
    if (filters?.instructorId) result = result.filter((a) => a.instructorId === filters.instructorId);
    if (filters?.date)         result = result.filter((a) => a.date === filters.date);
    return result;
  }

  upsertAvailability(instructorId: string, date: string, slots: string[], endTime: string): InstructorAvailability {
    const instructor = this.getInstructorById(instructorId);
    const existing = store().availability.find(
      (a) => a.instructorId === instructorId && a.date === date
    );
    if (existing) {
      const updated = { ...existing, slots, endTime };
      store().setAvailability(
        store().availability.map((a) => (a.id === existing.id ? updated : a))
      );
      return updated;
    }
    const record: InstructorAvailability = {
      id: uid("av"),
      instructorId,
      instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown",
      date,
      slots,
      endTime,
      frozen: false,
    };
    store().setAvailability([...store().availability, record]);
    return record;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications(): NotificationRecord[] {
    return store().notifications;
  }

  createNotification(data: NewNotification): NotificationRecord {
    const notification: NotificationRecord = {
      ...data,
      id: uid("n"),
      sentAt: new Date().toISOString(),
    };
    store().setNotifications([...store().notifications, notification]);
    return notification;
  }

  updateNotificationStatus(id: string, status: NotificationRecord["deliveryStatus"]): NotificationRecord {
    const notifications = store().notifications;
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) notFound("Notification", id);
    const updated = { ...notifications[idx], deliveryStatus: status };
    store().setNotifications(notifications.map((n) => (n.id === id ? updated : n)));
    return updated;
  }

  // ── Facility Settings ──────────────────────────────────────────────────────
  getFacilitySettings(): FacilitySettings {
    return store().facilitySettings;
  }

  updateFacilitySettings(patch: Partial<FacilitySettings>): FacilitySettings {
    const updated = { ...store().facilitySettings, ...patch };
    store().setFacilitySettings(updated);
    return updated;
  }
}
