import type { MockDataService } from "./MockDataService";
import type { NotificationRecord } from "@/data/mock/notifications";

type NotifyParams = {
  bookingId: string;
  bookingReference: string;
  recipientName: string;
  recipientEmail: string;
  notificationType: NotificationRecord["notificationType"];
  customerId?: string; // used to check smsOptOut
};

/**
 * Sends notifications for a booking action.
 * Customer: email + SMS (always) + calendar (confirmation only — not waitlist/cancellation/change).
 * Admin: email only — no SMS, no calendar.
 * SMS to customer is skipped if smsOptOut = true.
 */
export function notifyBoth(db: MockDataService, params: NotifyParams): void {
  const customerBase = {
    bookingId: params.bookingId,
    bookingReference: params.bookingReference,
    recipientType: "customer" as const,
    recipientName: params.recipientName,
    recipientEmail: params.recipientEmail,
    notificationType: params.notificationType,
    deliveryStatus: "sent" as const,
  };

  db.createNotification({ ...customerBase, channel: "email" });

  const smsOptOut = params.customerId
    ? db.getCustomers().find(c => c.id === params.customerId)?.smsOptOut ?? false
    : false;

  if (!smsOptOut) {
    db.createNotification({ ...customerBase, channel: "sms" });
  }

  // Calendar invite to customer only when booking is confirmed
  if (params.notificationType === "confirmation") {
    db.createNotification({ ...customerBase, channel: "calendar" });
  }

  // Admin gets email only — no SMS, no calendar
  db.createNotification({
    bookingId: params.bookingId,
    bookingReference: params.bookingReference,
    recipientType: "admin",
    recipientName: "Admin",
    recipientEmail: "",
    notificationType: params.notificationType,
    channel: "email",
    deliveryStatus: "sent",
  });
}
