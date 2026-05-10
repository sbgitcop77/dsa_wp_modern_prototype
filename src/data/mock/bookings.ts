export type Booking = {
  id: string;
  bookingReference: string;
  cancellationToken: string;
  customerId: string;
  customerName: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: 30 | 60;
  status: "confirmed" | "cancelled" | "no_show" | "completed";
  isForChild: boolean;
  childAge?: number;
  relationshipToCustomer?: string;
  isRecurring: boolean;
  recurringSeriesId?: string;
  isWalkIn: boolean;
  cancelledBy?: "customer" | "admin";
  cancellationReason?: string;
  laneAssigned: number;
  createdAt: string;
};

export const MOCK_BOOKINGS: Booking[] = [

  // ── Week of May 11 — individual ───────────────────────────────────────────
  {
    id: "b1", bookingReference: "DSA-20260511-4821", cancellationToken: "tok-b1-abc123",
    customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson",
    date: "2026-05-11", startTime: "09:00", endTime: "10:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 1,
    createdAt: "2026-05-07T14:00:00Z",
  },
  {
    id: "b2", bookingReference: "DSA-20260511-3344", cancellationToken: "tok-b2-def456",
    customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams",
    date: "2026-05-11", startTime: "14:00", endTime: "14:30", durationMinutes: 30,
    status: "confirmed", isForChild: true, childAge: 10, relationshipToCustomer: "Parent",
    isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-06T11:00:00Z",
  },
  {
    id: "b3", bookingReference: "DSA-20260512-7712", cancellationToken: "tok-b3-ghi789",
    customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen",
    date: "2026-05-12", startTime: "10:00", endTime: "11:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 1,
    createdAt: "2026-05-05T09:00:00Z",
  },
  {
    id: "b4", bookingReference: "DSA-20260512-5519", cancellationToken: "tok-b4-jkl012",
    customerId: "c6", customerName: "Olivia Grant", instructorId: "i3", instructorName: "Derek Williams",
    date: "2026-05-12", startTime: "13:00", endTime: "14:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: true, laneAssigned: 3,
    createdAt: "2026-05-12T12:55:00Z",
  },
  {
    id: "b5", bookingReference: "DSA-20260513-2298", cancellationToken: "tok-b5-mno345",
    customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson",
    date: "2026-05-13", startTime: "16:00", endTime: "17:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2,
    createdAt: "2026-05-08T08:30:00Z",
  },
  {
    id: "b6", bookingReference: "DSA-20260514-8834", cancellationToken: "tok-b6-pqr678",
    customerId: "c1", customerName: "Tyler Morrison", instructorId: "i3", instructorName: "Derek Williams",
    date: "2026-05-14", startTime: "09:30", endTime: "10:00", durationMinutes: 30,
    status: "cancelled", cancelledBy: "customer", cancellationReason: "Schedule conflict",
    isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 1,
    createdAt: "2026-05-07T16:00:00Z",
  },
  {
    id: "b7", bookingReference: "DSA-20260515-1167", cancellationToken: "tok-b7-stu901",
    customerId: "c3", customerName: "Jason Park", instructorId: "i2", instructorName: "Sofia Chen",
    date: "2026-05-15", startTime: "11:00", endTime: "12:00", durationMinutes: 60,
    status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent",
    isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-05-08T10:00:00Z",
  },
  {
    id: "b8", bookingReference: "DSA-20260516-9923", cancellationToken: "tok-b8-vwx234",
    customerId: "c4", customerName: "Destiny Wallace", instructorId: "i3", instructorName: "Derek Williams",
    date: "2026-05-16", startTime: "10:00", endTime: "11:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2,
    createdAt: "2026-05-07T13:00:00Z",
  },

  // ── Series 1: Tyler Morrison + Marcus Johnson — Tuesdays 09:00–10:00 ────
  {
    id: "r1a", bookingReference: "DSA-20260505-6610", cancellationToken: "tok-r1a-aaa",
    customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson",
    date: "2026-05-05", startTime: "09:00", endTime: "10:00", durationMinutes: 60,
    status: "completed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1",
    isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z",
  },
  {
    id: "r1b", bookingReference: "DSA-20260512-6611", cancellationToken: "tok-r1b-bbb",
    customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson",
    date: "2026-05-12", startTime: "09:00", endTime: "10:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1",
    isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z",
  },
  {
    id: "r1c", bookingReference: "DSA-20260519-6612", cancellationToken: "tok-r1c-ccc",
    customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson",
    date: "2026-05-19", startTime: "09:00", endTime: "10:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1",
    isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z",
  },
  {
    id: "r1d", bookingReference: "DSA-20260526-6613", cancellationToken: "tok-r1d-ddd",
    customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson",
    date: "2026-05-26", startTime: "09:00", endTime: "10:00", durationMinutes: 60,
    status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1",
    isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z",
  },
  { id: "r1e", bookingReference: "DSA-20260602-6614", cancellationToken: "tok-r1e", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-02", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1f", bookingReference: "DSA-20260609-6615", cancellationToken: "tok-r1f", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-09", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1g", bookingReference: "DSA-20260616-6616", cancellationToken: "tok-r1g", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-16", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1h", bookingReference: "DSA-20260623-6617", cancellationToken: "tok-r1h", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-23", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1i", bookingReference: "DSA-20260630-6618", cancellationToken: "tok-r1i", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-30", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1j", bookingReference: "DSA-20260707-6619", cancellationToken: "tok-r1j", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-07", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1k", bookingReference: "DSA-20260714-6620", cancellationToken: "tok-r1k", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-14", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1l", bookingReference: "DSA-20260721-6621", cancellationToken: "tok-r1l", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-21", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1m", bookingReference: "DSA-20260728-6622", cancellationToken: "tok-r1m", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-28", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },
  { id: "r1n", bookingReference: "DSA-20260804-6623", cancellationToken: "tok-r1n", customerId: "c1", customerName: "Tyler Morrison", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-08-04", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-1", isWalkIn: false, laneAssigned: 1, createdAt: "2026-04-30T09:00:00Z" },

  // ── Series 2: Brianna Hayes + Sofia Chen — Thursdays 14:00–14:30 ─────────
  {
    id: "r2a", bookingReference: "DSA-20260507-7710", cancellationToken: "tok-r2a-eee",
    customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen",
    date: "2026-05-07", startTime: "14:00", endTime: "14:30", durationMinutes: 30,
    status: "completed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2",
    isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "r2b", bookingReference: "DSA-20260514-7711", cancellationToken: "tok-r2b-fff",
    customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen",
    date: "2026-05-14", startTime: "14:00", endTime: "14:30", durationMinutes: 30,
    status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2",
    isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "r2c", bookingReference: "DSA-20260521-7712", cancellationToken: "tok-r2c-ggg",
    customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen",
    date: "2026-05-21", startTime: "14:00", endTime: "14:30", durationMinutes: 30,
    status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2",
    isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "r2d", bookingReference: "DSA-20260528-7713", cancellationToken: "tok-r2d-hhh",
    customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen",
    date: "2026-05-28", startTime: "14:00", endTime: "14:30", durationMinutes: 30,
    status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2",
    isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z",
  },
  { id: "r2e", bookingReference: "DSA-20260604-7714", cancellationToken: "tok-r2e", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-04", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2f", bookingReference: "DSA-20260611-7715", cancellationToken: "tok-r2f", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-11", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2g", bookingReference: "DSA-20260618-7716", cancellationToken: "tok-r2g", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-18", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2h", bookingReference: "DSA-20260625-7717", cancellationToken: "tok-r2h", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-25", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2i", bookingReference: "DSA-20260702-7718", cancellationToken: "tok-r2i", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-02", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2j", bookingReference: "DSA-20260709-7719", cancellationToken: "tok-r2j", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-09", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2k", bookingReference: "DSA-20260716-7720", cancellationToken: "tok-r2k", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-16", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2l", bookingReference: "DSA-20260723-7721", cancellationToken: "tok-r2l", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-23", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2m", bookingReference: "DSA-20260730-7722", cancellationToken: "tok-r2m", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-30", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },
  { id: "r2n", bookingReference: "DSA-20260806-7723", cancellationToken: "tok-r2n", customerId: "c2", customerName: "Brianna Hayes", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-08-06", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-2", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-01T10:00:00Z" },

  // ── Series 3: Jason Park + Derek Williams — Saturdays 10:00–11:00 ────────
  { id: "r3a", bookingReference: "DSA-20260606-8801", cancellationToken: "tok-r3a", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-06", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3b", bookingReference: "DSA-20260613-8802", cancellationToken: "tok-r3b", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-13", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3c", bookingReference: "DSA-20260620-8803", cancellationToken: "tok-r3c", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-20", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3d", bookingReference: "DSA-20260627-8804", cancellationToken: "tok-r3d", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-27", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3e", bookingReference: "DSA-20260704-8805", cancellationToken: "tok-r3e", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-04", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "cancelled", cancelledBy: "admin", cancellationReason: "Facility closed — Independence Day", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3f", bookingReference: "DSA-20260711-8806", cancellationToken: "tok-r3f", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-11", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3g", bookingReference: "DSA-20260718-8807", cancellationToken: "tok-r3g", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-18", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3h", bookingReference: "DSA-20260725-8808", cancellationToken: "tok-r3h", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-25", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3i", bookingReference: "DSA-20260801-8809", cancellationToken: "tok-r3i", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-01", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },
  { id: "r3j", bookingReference: "DSA-20260808-8810", cancellationToken: "tok-r3j", customerId: "c3", customerName: "Jason Park", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-08", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: true, recurringSeriesId: "series-3", isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-01T09:00:00Z" },

  // ── Series 4: Destiny Wallace + Marcus Johnson — Mondays 10:00–11:00 ─────
  { id: "r4a", bookingReference: "DSA-20260518-9101", cancellationToken: "tok-r4a", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-18", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4b", bookingReference: "DSA-20260525-9102", cancellationToken: "tok-r4b", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-25", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "cancelled", cancelledBy: "admin", cancellationReason: "Facility closed — Memorial Day", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4c", bookingReference: "DSA-20260601-9103", cancellationToken: "tok-r4c", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-01", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4d", bookingReference: "DSA-20260608-9104", cancellationToken: "tok-r4d", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-08", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4e", bookingReference: "DSA-20260615-9105", cancellationToken: "tok-r4e", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-15", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4f", bookingReference: "DSA-20260622-9106", cancellationToken: "tok-r4f", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-22", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4g", bookingReference: "DSA-20260629-9107", cancellationToken: "tok-r4g", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-29", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4h", bookingReference: "DSA-20260706-9108", cancellationToken: "tok-r4h", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-06", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4i", bookingReference: "DSA-20260713-9109", cancellationToken: "tok-r4i", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-13", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4j", bookingReference: "DSA-20260720-9110", cancellationToken: "tok-r4j", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-20", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4k", bookingReference: "DSA-20260727-9111", cancellationToken: "tok-r4k", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-27", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },
  { id: "r4l", bookingReference: "DSA-20260803-9112", cancellationToken: "tok-r4l", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-08-03", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-4", isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-10T10:00:00Z" },

  // ── Series 5: Olivia Grant + Sofia Chen — Wednesdays 09:00–10:00 ─────────
  { id: "r5a", bookingReference: "DSA-20260513-0501", cancellationToken: "tok-r5a", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-05-13", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5b", bookingReference: "DSA-20260520-0502", cancellationToken: "tok-r5b", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-05-20", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5c", bookingReference: "DSA-20260527-0503", cancellationToken: "tok-r5c", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-05-27", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5d", bookingReference: "DSA-20260603-0504", cancellationToken: "tok-r5d", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-03", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5e", bookingReference: "DSA-20260610-0505", cancellationToken: "tok-r5e", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-10", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5f", bookingReference: "DSA-20260617-0506", cancellationToken: "tok-r5f", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-17", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5g", bookingReference: "DSA-20260624-0507", cancellationToken: "tok-r5g", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-06-24", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5h", bookingReference: "DSA-20260701-0508", cancellationToken: "tok-r5h", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-01", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5i", bookingReference: "DSA-20260708-0509", cancellationToken: "tok-r5i", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-08", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5j", bookingReference: "DSA-20260715-0510", cancellationToken: "tok-r5j", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-15", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5k", bookingReference: "DSA-20260722-0511", cancellationToken: "tok-r5k", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-22", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5l", bookingReference: "DSA-20260729-0512", cancellationToken: "tok-r5l", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-07-29", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },
  { id: "r5m", bookingReference: "DSA-20260805-0513", cancellationToken: "tok-r5m", customerId: "c6", customerName: "Olivia Grant", instructorId: "i2", instructorName: "Sofia Chen", date: "2026-08-05", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: true, recurringSeriesId: "series-5", isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-10T09:00:00Z" },

  // ── Individual bookings — May ─────────────────────────────────────────────
  { id: "j1",  bookingReference: "DSA-20260514-1001", cancellationToken: "tok-j1",  customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-14", startTime: "15:00", endTime: "16:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-05-11T08:00:00Z" },
  { id: "j2",  bookingReference: "DSA-20260515-1002", cancellationToken: "tok-j2",  customerId: "c1", customerName: "Tyler Morrison",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-15", startTime: "14:00", endTime: "15:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-11T09:00:00Z" },
  { id: "j3",  bookingReference: "DSA-20260516-1003", cancellationToken: "tok-j3",  customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-16", startTime: "11:00", endTime: "12:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-05-12T10:00:00Z" },
  { id: "j4",  bookingReference: "DSA-20260522-1004", cancellationToken: "tok-j4",  customerId: "c2", customerName: "Brianna Hayes",   instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-22", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-05-18T11:00:00Z" },
  { id: "j5",  bookingReference: "DSA-20260523-1005", cancellationToken: "tok-j5",  customerId: "c3", customerName: "Jason Park",      instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-23", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: false, isWalkIn: false, laneAssigned: 1, createdAt: "2026-05-18T14:00:00Z" },
  { id: "j6",  bookingReference: "DSA-20260529-1006", cancellationToken: "tok-j6",  customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-05-29", startTime: "09:30", endTime: "10:30", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-05-25T10:00:00Z" },
  { id: "j7",  bookingReference: "DSA-20260530-1007", cancellationToken: "tok-j7",  customerId: "c1", customerName: "Tyler Morrison",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-05-30", startTime: "09:30", endTime: "10:00", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: true,  laneAssigned: 2, createdAt: "2026-05-30T09:20:00Z" },

  // ── Individual bookings — June ────────────────────────────────────────────
  { id: "j8",  bookingReference: "DSA-20260605-1008", cancellationToken: "tok-j8",  customerId: "c1", customerName: "Tyler Morrison",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-05", startTime: "14:00", endTime: "15:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: true,  laneAssigned: 3, createdAt: "2026-06-05T13:50:00Z" },
  { id: "j9",  bookingReference: "DSA-20260609-1009", cancellationToken: "tok-j9",  customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-09", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-06-06T08:00:00Z" },
  { id: "j10", bookingReference: "DSA-20260611-1010", cancellationToken: "tok-j10", customerId: "c1", customerName: "Tyler Morrison",  instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-11", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-08T09:00:00Z" },
  { id: "j11", bookingReference: "DSA-20260612-1011", cancellationToken: "tok-j11", customerId: "c3", customerName: "Jason Park",      instructorId: "i2", instructorName: "Sofia Chen",    date: "2026-06-12", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 10, relationshipToCustomer: "Parent", isRecurring: false, isWalkIn: false, laneAssigned: 1, createdAt: "2026-06-09T10:00:00Z" },
  { id: "j12", bookingReference: "DSA-20260616-1012", cancellationToken: "tok-j12", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-16", startTime: "11:00", endTime: "11:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-06-13T11:00:00Z" },
  { id: "j13", bookingReference: "DSA-20260619-1013", cancellationToken: "tok-j13", customerId: "c2", customerName: "Brianna Hayes",   instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-19", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-16T08:30:00Z" },
  { id: "j14", bookingReference: "DSA-20260619-1014", cancellationToken: "tok-j14", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i2", instructorName: "Sofia Chen",    date: "2026-06-19", startTime: "11:00", endTime: "12:00", durationMinutes: 60, status: "cancelled", cancelledBy: "customer", cancellationReason: "Schedule conflict", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-06-16T09:00:00Z" },
  { id: "j15", bookingReference: "DSA-20260623-1015", cancellationToken: "tok-j15", customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-06-23", startTime: "09:30", endTime: "10:00", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-06-20T14:00:00Z" },
  { id: "j16", bookingReference: "DSA-20260626-1016", cancellationToken: "tok-j16", customerId: "c3", customerName: "Jason Park",      instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-06-26", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 1, createdAt: "2026-06-23T10:00:00Z" },

  // ── Individual bookings — July ────────────────────────────────────────────
  { id: "j17", bookingReference: "DSA-20260702-1017", cancellationToken: "tok-j17", customerId: "c3", customerName: "Jason Park",      instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-02", startTime: "09:00", endTime: "09:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 1, createdAt: "2026-06-29T08:00:00Z" },
  { id: "j18", bookingReference: "DSA-20260703-1018", cancellationToken: "tok-j18", customerId: "c1", customerName: "Tyler Morrison",  instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-03", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-06-30T09:00:00Z" },
  { id: "j19", bookingReference: "DSA-20260703-1019", cancellationToken: "tok-j19", customerId: "c6", customerName: "Olivia Grant",    instructorId: "i2", instructorName: "Sofia Chen",    date: "2026-07-03", startTime: "14:00", endTime: "15:00", durationMinutes: 60, status: "cancelled", cancelledBy: "customer", cancellationReason: "Work conflict", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-06-30T11:00:00Z" },
  { id: "j20", bookingReference: "DSA-20260707-1020", cancellationToken: "tok-j20", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-07", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-07-04T10:00:00Z" },
  { id: "j21", bookingReference: "DSA-20260710-1021", cancellationToken: "tok-j21", customerId: "c3", customerName: "Jason Park",      instructorId: "i2", instructorName: "Sofia Chen",    date: "2026-07-10", startTime: "09:00", endTime: "10:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 12, relationshipToCustomer: "Parent", isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-07-07T08:00:00Z" },
  { id: "j22", bookingReference: "DSA-20260714-1022", cancellationToken: "tok-j22", customerId: "c6", customerName: "Olivia Grant",    instructorId: "i2", instructorName: "Sofia Chen",    date: "2026-07-14", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 1, createdAt: "2026-07-11T09:00:00Z" },
  { id: "j23", bookingReference: "DSA-20260717-1023", cancellationToken: "tok-j23", customerId: "c2", customerName: "Brianna Hayes",   instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-17", startTime: "14:00", endTime: "15:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-07-14T10:00:00Z" },
  { id: "j24", bookingReference: "DSA-20260721-1024", cancellationToken: "tok-j24", customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-07-21", startTime: "11:00", endTime: "11:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: true,  laneAssigned: 3, createdAt: "2026-07-21T10:55:00Z" },
  { id: "j25", bookingReference: "DSA-20260724-1025", cancellationToken: "tok-j25", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-24", startTime: "09:30", endTime: "10:30", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-07-21T11:00:00Z" },
  { id: "j26", bookingReference: "DSA-20260727-1026", cancellationToken: "tok-j26", customerId: "c3", customerName: "Jason Park",      instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-27", startTime: "08:30", endTime: "09:00", durationMinutes: 30, status: "no_show", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-07-24T09:00:00Z" },
  { id: "j27", bookingReference: "DSA-20260731-1027", cancellationToken: "tok-j27", customerId: "c3", customerName: "Jason Park",      instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-07-31", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: true, childAge: 10, relationshipToCustomer: "Parent", isRecurring: false, isWalkIn: false, laneAssigned: 1, createdAt: "2026-07-28T08:00:00Z" },

  // ── Individual bookings — August ──────────────────────────────────────────
  { id: "j28", bookingReference: "DSA-20260804-1028", cancellationToken: "tok-j28", customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-04", startTime: "11:00", endTime: "11:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-08-01T09:00:00Z" },
  { id: "j29", bookingReference: "DSA-20260806-1029", cancellationToken: "tok-j29", customerId: "c6", customerName: "Olivia Grant",    instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-06", startTime: "14:00", endTime: "14:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 4, createdAt: "2026-08-03T10:00:00Z" },
  { id: "j30", bookingReference: "DSA-20260807-1030", cancellationToken: "tok-j30", customerId: "c2", customerName: "Brianna Hayes",   instructorId: "i1", instructorName: "Marcus Johnson", date: "2026-08-07", startTime: "10:00", endTime: "11:00", durationMinutes: 60, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 2, createdAt: "2026-08-04T08:30:00Z" },
  { id: "j31", bookingReference: "DSA-20260808-1031", cancellationToken: "tok-j31", customerId: "c4", customerName: "Destiny Wallace", instructorId: "i3", instructorName: "Derek Williams", date: "2026-08-08", startTime: "11:00", endTime: "11:30", durationMinutes: 30, status: "confirmed", isForChild: false, isRecurring: false, isWalkIn: false, laneAssigned: 3, createdAt: "2026-08-05T11:00:00Z" },
];
