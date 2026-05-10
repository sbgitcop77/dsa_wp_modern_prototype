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

export const MOCK_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "n1",
    bookingId: "b1",
    bookingReference: "DSA-20260511-4821",
    recipientType: "customer",
    recipientName: "Tyler Morrison",
    recipientEmail: "tyler.morrison@email.com",
    notificationType: "confirmation",
    channel: "email",
    sentAt: "2026-05-07T14:02:00Z",
    deliveryStatus: "sent",
  },
  {
    id: "n2",
    bookingId: "b1",
    bookingReference: "DSA-20260511-4821",
    recipientType: "instructor",
    recipientName: "Marcus Johnson",
    recipientEmail: "marcus@diamondsports.com",
    notificationType: "calendar_invite",
    channel: "calendar",
    sentAt: "2026-05-07T14:02:00Z",
    deliveryStatus: "sent",
  },
  {
    id: "n3",
    bookingId: "b1",
    bookingReference: "DSA-20260511-4821",
    recipientType: "customer",
    recipientName: "Tyler Morrison",
    recipientEmail: "tyler.morrison@email.com",
    notificationType: "reminder_24hr",
    channel: "email",
    sentAt: "2026-05-10T09:00:00Z",
    deliveryStatus: "sent",
  },
  {
    id: "n4",
    bookingId: "b3",
    bookingReference: "DSA-20260512-7712",
    recipientType: "customer",
    recipientName: "Brianna Hayes",
    recipientEmail: "brianna.hayes@email.com",
    notificationType: "confirmation",
    channel: "email",
    sentAt: "2026-05-05T09:02:00Z",
    deliveryStatus: "sent",
  },
  {
    id: "n5",
    bookingId: "b3",
    bookingReference: "DSA-20260512-7712",
    recipientType: "customer",
    recipientName: "Brianna Hayes",
    recipientEmail: "brianna.hayes@email.com",
    notificationType: "reminder_2hr_sms",
    channel: "sms",
    sentAt: "",
    deliveryStatus: "pending",
  },
  {
    id: "n6",
    bookingId: "b6",
    bookingReference: "DSA-20260514-8834",
    recipientType: "customer",
    recipientName: "Tyler Morrison",
    recipientEmail: "tyler.morrison@email.com",
    notificationType: "cancellation",
    channel: "email",
    sentAt: "2026-05-09T08:00:00Z",
    deliveryStatus: "sent",
  },
  {
    id: "n7",
    bookingId: "b6",
    bookingReference: "DSA-20260514-8834",
    recipientType: "instructor",
    recipientName: "Derek Williams",
    recipientEmail: "derek@diamondsports.com",
    notificationType: "cancellation",
    channel: "email",
    sentAt: "2026-05-09T08:00:00Z",
    deliveryStatus: "failed",
  },
  {
    id: "n8",
    bookingId: "b5",
    bookingReference: "DSA-20260513-2298",
    recipientType: "customer",
    recipientName: "Destiny Wallace",
    recipientEmail: "destiny.w@email.com",
    notificationType: "confirmation",
    channel: "email",
    sentAt: "2026-05-08T08:32:00Z",
    deliveryStatus: "sent",
  },
  {
    id: "n9",
    bookingId: "b5",
    bookingReference: "DSA-20260513-2298",
    recipientType: "customer",
    recipientName: "Destiny Wallace",
    recipientEmail: "destiny.w@email.com",
    notificationType: "reminder_24hr",
    channel: "email",
    sentAt: "",
    deliveryStatus: "pending",
  },
  {
    id: "n10",
    bookingId: "b7",
    bookingReference: "DSA-20260515-1167",
    recipientType: "admin",
    recipientName: "Alexis Rivera",
    recipientEmail: "admin@diamondsports.com",
    notificationType: "change",
    channel: "email",
    sentAt: "2026-05-08T10:05:00Z",
    deliveryStatus: "sent",
  },
];
