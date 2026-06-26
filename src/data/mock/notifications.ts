import { MOCK_BOOKINGS } from "./bookings";

export type NotificationRecord = {
  id: string;
  bookingId: string;
  bookingReference: string;
  recipientType: "customer" | "instructor" | "admin";
  recipientName: string;
  recipientEmail: string;
  notificationType:
    | "confirmation"
    | "reminder_24hr"
    | "reminder_2hr_sms"
    | "change"
    | "cancellation"
    | "calendar_invite";
  channel: "email" | "sms" | "calendar";
  sentAt: string;
  deliveryStatus: "sent" | "pending" | "failed";
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

const _today = new Date().toISOString().slice(0, 10);
const _windowStart = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

const windowBookings = MOCK_BOOKINGS.filter(b => b.date >= _windowStart && b.date <= _today);

function sentAtBeforeBooking(dateStr: string, daysBack: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setTime(d.getTime() - daysBack * 86400000);
  return d.toISOString().slice(0, 19) + "Z";
}

function generateNotifications(): NotificationRecord[] {
  const rng = new RNG(7777);
  const notifications: NotificationRecord[] = [];
  let counter = 1;

  for (const booking of windowBookings) {
    const custFirst = booking.customerName.split(" ")[0].toLowerCase();
    const custEmail = `${custFirst}@email.com`;
    const instFirst = booking.instructorName.split(" ")[0].toLowerCase();
    const instEmail = `${instFirst}@diamondsports.com`;

    const confirmDaysBack = 1 + rng.int(14);
    const confirmSentAt = sentAtBeforeBooking(booking.date, confirmDaysBack);

    // 1. Confirmation → email to customer
    notifications.push({
      id: `n${counter++}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      recipientType: "customer",
      recipientName: booking.customerName,
      recipientEmail: custEmail,
      notificationType: "confirmation",
      channel: "email",
      sentAt: confirmSentAt,
      deliveryStatus: "sent",
    });

    // 2. Calendar invite → calendar to instructor
    notifications.push({
      id: `n${counter++}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      recipientType: "instructor",
      recipientName: booking.instructorName,
      recipientEmail: instEmail,
      notificationType: "calendar_invite",
      channel: "calendar",
      sentAt: confirmSentAt,
      deliveryStatus: rng.bool(0.9) ? "sent" : "failed",
    });

    // 3. 24hr reminder → email to customer
    notifications.push({
      id: `n${counter++}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      recipientType: "customer",
      recipientName: booking.customerName,
      recipientEmail: custEmail,
      notificationType: "reminder_24hr",
      channel: "email",
      sentAt: sentAtBeforeBooking(booking.date, 1),
      deliveryStatus: "sent",
    });

    // 4. 40% chance: 2hr SMS reminder
    if (rng.bool(0.4)) {
      notifications.push({
        id: `n${counter++}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        recipientType: "customer",
        recipientName: booking.customerName,
        recipientEmail: custEmail,
        notificationType: "reminder_2hr_sms",
        channel: "sms",
        sentAt: sentAtBeforeBooking(booking.date, 0),
        deliveryStatus: "sent",
      });
    }

    // 5. If cancelled: cancellation notifications
    if (booking.status === "cancelled") {
      notifications.push({
        id: `n${counter++}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        recipientType: "customer",
        recipientName: booking.customerName,
        recipientEmail: custEmail,
        notificationType: "cancellation",
        channel: "email",
        sentAt: confirmSentAt,
        deliveryStatus: "sent",
      });

      notifications.push({
        id: `n${counter++}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        recipientType: "instructor",
        recipientName: booking.instructorName,
        recipientEmail: instEmail,
        notificationType: "cancellation",
        channel: "email",
        sentAt: confirmSentAt,
        deliveryStatus: rng.bool(0.8) ? "sent" : "failed",
      });
    }

    // 6. 5% random admin "change" notification
    if (rng.bool(0.05)) {
      notifications.push({
        id: `n${counter++}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        recipientType: "admin",
        recipientName: "Admin",
        recipientEmail: "admin@diamondsports.com",
        notificationType: "change",
        channel: "email",
        sentAt: confirmSentAt,
        deliveryStatus: "sent",
      });
    }
  }

  // Sort by sentAt descending, then cap at 300 while keeping all 6 types represented
  notifications.sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  const allTypes: NotificationRecord["notificationType"][] = [
    "confirmation", "reminder_24hr", "reminder_2hr_sms", "change", "cancellation", "calendar_invite",
  ];
  const kept: NotificationRecord[] = [];
  const usedIds = new Set<string>();
  for (const type of allTypes) {
    const match = notifications.find(n => n.notificationType === type);
    if (match) { kept.push(match); usedIds.add(match.id); }
  }
  for (const n of notifications) {
    if (kept.length >= 300) break;
    if (!usedIds.has(n.id)) { kept.push(n); usedIds.add(n.id); }
  }

  kept.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  return kept;
}

export const MOCK_NOTIFICATIONS: NotificationRecord[] = generateNotifications();
