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

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    firstName: "Tyler",
    lastName: "Morrison",
    email: "tyler.morrison@email.com",
    phone: "(410) 555-0192",
    isActive: true,
    isFlagged: false,
    noShowCount: 0,
    lateCancellationCount: 0,
    smsOptOut: false,
    source: "online_booking",
    createdAt: "2025-03-10T10:00:00Z",
  },
  {
    id: "c2",
    firstName: "Brianna",
    lastName: "Hayes",
    email: "brianna.hayes@email.com",
    phone: "(443) 555-0234",
    isActive: true,
    isFlagged: true,
    noShowCount: 3,
    lateCancellationCount: 1,
    smsOptOut: false,
    source: "online_booking",
    createdAt: "2025-04-01T10:00:00Z",
  },
  {
    id: "c3",
    firstName: "Jason",
    lastName: "Park",
    email: "jason.park@email.com",
    phone: "(301) 555-0311",
    isActive: true,
    isFlagged: false,
    noShowCount: 1,
    lateCancellationCount: 0,
    smsOptOut: true,
    source: "admin_booking",
    createdAt: "2025-04-15T10:00:00Z",
  },
  {
    id: "c4",
    firstName: "Destiny",
    lastName: "Wallace",
    email: "destiny.w@email.com",
    phone: "(410) 555-0487",
    isActive: true,
    isFlagged: false,
    noShowCount: 0,
    lateCancellationCount: 2,
    smsOptOut: false,
    source: "import",
    createdAt: "2025-05-01T10:00:00Z",
  },
  {
    id: "c5",
    firstName: "Carlos",
    lastName: "Reyes",
    email: "carlos.reyes@email.com",
    phone: "(443) 555-0562",
    isActive: false,
    isFlagged: false,
    noShowCount: 0,
    lateCancellationCount: 0,
    smsOptOut: false,
    source: "online_booking",
    createdAt: "2025-02-20T10:00:00Z",
    deactivatedAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "c6",
    firstName: "Olivia",
    lastName: "Grant",
    email: "olivia.grant@email.com",
    phone: "(301) 555-0619",
    isActive: true,
    isFlagged: false,
    noShowCount: 0,
    lateCancellationCount: 0,
    smsOptOut: false,
    source: "online_booking",
    createdAt: "2025-05-05T10:00:00Z",
  },
];
