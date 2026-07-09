"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  startOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, format, isBefore, isSameMonth, isToday,
} from "date-fns";
import { useAppStore } from "@/data/store/useAppStore";
import { db } from "@/data/service";
import { notifyBoth } from "@/data/service/notifyUtils";
import type { Booking } from "@/data/types";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Phone, CalendarDays } from "lucide-react";

const LATE_WINDOW_HOURS = 24;

function isSlotInPast(dateStr: string, slot: string): boolean {
  const _n = new Date();
  const today = `${_n.getFullYear()}-${String(_n.getMonth() + 1).padStart(2, "0")}-${String(_n.getDate()).padStart(2, "0")}`;
  if (dateStr !== today) return false;
  const now = new Date();
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(d: string) {
  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${months[parseInt(m)]} ${parseInt(day)}, ${y}`;
}

function getSessionDateTime(b: Booking): Date {
  const [h, m] = b.startTime.split(":").map(Number);
  const d = new Date(b.date + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d;
}

type Mode = "options" | "cancel" | "cancelled" | "reschedule" | "rescheduled" | "waitlist_confirmed";

export default function ManagePage() {
  const params = useParams();
  const ref = decodeURIComponent(params.ref as string);

  const storeBookings = useAppStore(s => s.bookings);
  const storeAvailability = useAppStore(s => s.availability);
  const storeBlackouts = useAppStore(s => s.blackouts);
  const storeInstructors = useAppStore(s => s.instructors);
  const facilitySettings = useAppStore(s => s.facilitySettings);

  const booking = useMemo(
    () => storeBookings.find(b => b.bookingReference === ref),
    [storeBookings, ref]
  );

  // Series siblings — sorted by date for Session X of Y display
  const seriesBookings = useMemo(() => {
    if (!booking?.recurringSeriesId) return [];
    return [...storeBookings]
      .filter(b => b.recurringSeriesId === booking.recurringSeriesId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [booking, storeBookings]);
  const sessionIndex = seriesBookings.findIndex(b => b.id === booking?.id);
  const sessionTotal = seriesBookings.length;

  const [mode, setMode] = useState<Mode>("options");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelScope, setCancelScope] = useState<"single" | "series">("single");
  const [cancelledSeries, setCancelledSeries] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // ── Reschedule slot lookup (must be before any early returns — Rules of Hooks) ──
  const rescheduleSlots = useMemo(() => {
    if (!newDate || !booking) return [];
    const dur = booking.durationMinutes;
    const LANE_TOTAL = facilitySettings.activeLanes ?? 4;
    const av = storeAvailability.find(
      a => a.instructorId === booking.instructorId && a.date === newDate
    );
    const allSlots = av?.slots ?? [];
    return allSlots.filter(slot => {
      if (isSlotInPast(newDate, slot)) return false;
      const [sh, sm] = slot.split(":").map(Number);
      const slotStart = sh * 60 + sm;
      const slotEnd = slotStart + dur;
      // Must fit within instructor's availability window
      if (av?.endTime) {
        const [eh, em] = av.endTime.split(":").map(Number);
        if (slotEnd > eh * 60 + em) return false;
      }
      const instructorConflict = storeBookings.some(b =>
        b.id !== booking.id &&
        b.instructorId === booking.instructorId &&
        b.date === newDate &&
        b.status === "confirmed" &&
        (() => {
          const [bh, bm] = b.startTime.split(":").map(Number);
          const [eh, em] = b.endTime.split(":").map(Number);
          return slotStart < eh * 60 + em && slotEnd > bh * 60 + bm;
        })()
      );
      if (instructorConflict) return false;
      const laneInstructorIds = new Set(
        storeInstructors.filter(i => i.instructor_type !== "non_lane").map(i => i.id)
      );
      if (laneInstructorIds.has(booking.instructorId)) {
        const laneCount = storeBookings.filter(b =>
          b.id !== booking.id &&
          b.date === newDate &&
          b.status === "confirmed" &&
          laneInstructorIds.has(b.instructorId) &&
          (() => {
            const [bh, bm] = b.startTime.split(":").map(Number);
            const [eh, em] = b.endTime.split(":").map(Number);
            return slotStart < eh * 60 + em && slotEnd > bh * 60 + bm;
          })()
        ).length;
        if (laneCount >= LANE_TOTAL) return false;
      }
      return true;
    });
  }, [newDate, booking, storeAvailability, storeBookings, storeInstructors, facilitySettings]);

  // Show success screens before guard checks so store reactive updates don't
  // redirect to "AlreadyCancelled" immediately after writing the cancellation.
  if (mode === "cancelled") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#337C99" }}>
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">
            {cancelledSeries ? "Series Cancelled" : "Booking Cancelled"}
          </h1>
          <p className="text-sm text-[#6c757d] mb-6">
            {cancelledSeries
              ? <>All upcoming sessions in your recurring series with <strong>{booking?.instructorName}</strong> have been cancelled. A confirmation email has been sent.</>
              : <>Your session on <strong>{formatDate(booking?.date ?? "")}</strong> at{" "}
                <strong>{booking ? formatTime(booking.startTime) : ""}</strong> with{" "}
                <strong>{booking?.instructorName}</strong> has been cancelled. A confirmation email has been sent.</>
            }
          </p>
          <a href="/book" className="btn-primary text-sm inline-block">Book a New Session</a>
        </div>
      </PageShell>
    );
  }

  if (mode === "rescheduled") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#337C99" }}>
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">Session Rescheduled!</h1>
          <p className="text-sm text-[#6c757d] mb-5">
            Your booking has been moved. A confirmation email has been sent.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2.5 text-sm mb-6">
            <DetailRow label="Reference" value={ref} mono />
            <DetailRow label="Instructor" value={booking?.instructorName ?? ""} />
            <DetailRow label="New Date" value={formatDate(newDate)} />
            <DetailRow label="New Time" value={formatTime(newTime)} />
            <DetailRow label="Duration" value={`${booking?.durationMinutes ?? 60} min`} />
          </div>
          <a href="/" className="btn-secondary text-sm inline-block">Return to Home</a>
        </div>
      </PageShell>
    );
  }

  if (mode === "waitlist_confirmed") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#337C99" }}>
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">Session Confirmed!</h1>
          <p className="text-sm text-[#6c757d] mb-5">
            Your waitlisted session has been confirmed. A confirmation email has been sent.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2.5 text-sm mb-6">
            <DetailRow label="Reference" value={ref} mono />
            <DetailRow label="Instructor" value={booking?.instructorName ?? ""} />
            <DetailRow label="Date" value={formatDate(booking?.date ?? "")} />
            <DetailRow label="Time" value={booking ? `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}` : ""} />
          </div>
          <a href="/" className="btn-secondary text-sm inline-block">Return to Home</a>
        </div>
      </PageShell>
    );
  }

  // ── Guard states ──────────────────────────────────────────────────────────

  if (!booking || booking.status === "completed" || booking.status === "no_show") {
    return <NotFound refStr={ref} />;
  }

  if (booking.status === "cancelled") {
    return <AlreadyCancelled booking={booking} />;
  }

  const now = new Date();
  const sessionTime = getSessionDateTime(booking);
  const hoursUntil = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 0) {
    return <NotFound refStr={ref} />;
  }

  // Waitlisted sessions bypass the 24h guard — the slot hasn't been confirmed yet
  if (hoursUntil < LATE_WINDOW_HOURS && booking.status !== "waitlisted") {
    return <Within24h booking={booking} />;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleConfirmWaitlisted() {
    if (!booking) return;
    db.confirmWaitlisted(booking.id);
    const customer = db.getCustomers().find(c => c.id === booking.customerId);
    notifyBoth(db, {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      recipientName: booking.customerName,
      recipientEmail: customer?.email ?? "",
      notificationType: "confirmation",
      customerId: booking.customerId,
    });
    setMode("waitlist_confirmed");
  }

  function confirmCancel() {
    if (!booking) return;
    const customer = db.getCustomers().find(c => c.id === booking.customerId);
    if (cancelScope === "series" && booking.recurringSeriesId) {
      const _n2 = new Date();
      const today = `${_n2.getFullYear()}-${String(_n2.getMonth() + 1).padStart(2, "0")}-${String(_n2.getDate()).padStart(2, "0")}`;
      const cancelled = db.cancelSeries(booking.recurringSeriesId, today, "customer", cancelReason || undefined);
      cancelled.forEach(b => {
        notifyBoth(db, {
          bookingId: b.id,
          bookingReference: b.bookingReference,
          recipientName: b.customerName,
          recipientEmail: customer?.email ?? "",
          notificationType: "cancellation",
          customerId: b.customerId,
        });
      });
      setCancelledSeries(true);
    } else {
      db.cancelBooking(booking.id, "customer", cancelReason || undefined);
      notifyBoth(db, {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        recipientName: booking.customerName,
        recipientEmail: customer?.email ?? "",
        notificationType: "cancellation",
        customerId: booking.customerId,
      });
      setCancelledSeries(false);
    }
    setMode("cancelled");
  }

  function confirmReschedule() {
    if (!booking) return;
    const [h, m] = newTime.split(":").map(Number);
    const endMins = h * 60 + m + booking.durationMinutes;
    const endTime = `${String(Math.floor(endMins / 60)).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;
    db.updateBooking(booking.id, { date: newDate, startTime: newTime, endTime });
    const customer = db.getCustomers().find(c => c.id === booking.customerId);
    notifyBoth(db, {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      recipientName: booking.customerName,
      recipientEmail: customer?.email ?? "",
      notificationType: "change",
      customerId: booking.customerId,
    });
    setMode("rescheduled");
  }

  // ── Options (landing) ─────────────────────────────────────────────────────

  if (mode === "options") {
    return (
      <PageShell>
        <h1 className="text-xl font-bold text-[#212529] mb-1">Manage Your Booking</h1>
        <p className="text-sm text-[#6c757d] mb-5">What would you like to do with this session?</p>

        <BookingDetails booking={booking} sessionIndex={sessionIndex} sessionTotal={sessionTotal} />

        {/* Confirm waitlisted CTA */}
        {booking.status === "waitlisted" && (
          <div className="mt-4 border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm">
            <p className="font-semibold text-amber-800 mb-1">Slot Available — Confirm Now</p>
            <p className="text-amber-700 text-xs mb-3">
              A spot has opened for this session. Confirm to secure your place, or it may be taken by another customer.
            </p>
            <button
              onClick={handleConfirmWaitlisted}
              className="btn-primary text-sm justify-center w-full"
            >
              Confirm This Session
            </button>
          </div>
        )}

        <div className={`grid gap-3 mt-6 ${booking.status === "waitlisted" ? "grid-cols-2" : "grid-cols-2"}`}>
          <button
            onClick={() => { setNewDate(""); setNewTime(""); setMode("reschedule"); }}
            className="flex flex-col items-center gap-2 border-2 border-[#337C99] rounded-xl p-4 text-[#337C99] hover:bg-[#337C99]/5 transition-colors"
          >
            <CalendarDays className="w-6 h-6" />
            <span className="font-semibold text-sm">Reschedule</span>
            <span className="text-xs text-[#6c757d] text-center">Pick a new date &amp; time</span>
          </button>
          <button
            onClick={() => { setCancelReason(""); setCancelScope("single"); setMode("cancel"); }}
            className="flex flex-col items-center gap-2 border-2 border-[#b6070e] rounded-xl p-4 text-[#b6070e] hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-6 h-6" />
            <span className="font-semibold text-sm">Cancel</span>
            <span className="text-xs text-[#6c757d] text-center">Remove this session</span>
          </button>
        </div>

        {/* Sibling sessions in series */}
        {seriesBookings.length > 1 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#6c757d] uppercase tracking-wider mb-2">All Sessions in This Series</p>
            <div className="space-y-2">
              {seriesBookings.map((s, idx) => {
                const isCurrent = s.id === booking.id;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                      isCurrent ? "bg-[#337C99]/10 border border-[#337C99]/30" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-[#6c757d]">
                      Session {idx + 1} · {formatDate(s.date)} {formatTime(s.startTime)}
                      {isCurrent && <span className="ml-1 text-[#337C99] font-medium">(this session)</span>}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-full font-medium text-[10px]"
                      style={
                        s.status === "confirmed" ? { backgroundColor: "#d1fae5", color: "#065f46" }
                        : s.status === "waitlisted" ? { backgroundColor: "#fef3c7", color: "#92400e" }
                        : { backgroundColor: "#fee2e2", color: "#991b1b" }
                      }
                    >
                      {s.status === "confirmed" ? "Confirmed" : s.status === "waitlisted" ? "Waitlisted" : "Cancelled"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PageShell>
    );
  }

  // ── Cancel form ───────────────────────────────────────────────────────────

  if (mode === "cancel") {
    return (
      <PageShell>
        <BackLink onClick={() => setMode("options")} />
        <h1 className="text-xl font-bold text-[#212529] mb-1">Cancel Booking</h1>
        <p className="text-sm text-[#6c757d] mb-5">You're about to cancel the following session.</p>

        <BookingDetails booking={booking} sessionIndex={sessionIndex} sessionTotal={sessionTotal} />

        {booking.isRecurring && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-[#212529]">What would you like to cancel?</p>
            {(["single", "series"] as const).map(scope => (
              <label
                key={scope}
                className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  cancelScope === scope ? "border-[#b6070e] bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  className="mt-0.5"
                  checked={cancelScope === scope}
                  onChange={() => setCancelScope(scope)}
                />
                <div>
                  <p className="text-sm font-medium text-[#212529]">
                    {scope === "single" ? "This session only" : "Entire series (all upcoming sessions)"}
                  </p>
                  <p className="text-xs text-[#6c757d] mt-0.5">
                    {scope === "single"
                      ? "Only this date is cancelled. Other sessions in your series remain scheduled."
                      : "Cancels this and all remaining upcoming sessions in the series."}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-5">
          <label className="label">
            Reason <span className="text-[#6c757d] font-normal">(optional)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Let us know why you need to cancel…"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setMode("options")} className="btn-secondary flex-1 text-sm justify-center">
            Keep Session
          </button>
          <button onClick={confirmCancel} className="btn-danger flex-1 text-sm justify-center">
            {cancelScope === "series" && booking.isRecurring ? "Cancel Entire Series" : "Confirm Cancellation"}
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Reschedule form ───────────────────────────────────────────────────────

  return (
    <PageShell>
      <BackLink onClick={() => setMode("options")} />
      <h1 className="text-xl font-bold text-[#212529] mb-1">Reschedule Session</h1>
      <p className="text-sm text-[#6c757d] mb-1">
        Currently: <strong>{formatDate(booking.date)}</strong> at{" "}
        <strong>{formatTime(booking.startTime)}</strong> with {booking.instructorName}
      </p>
      <p className="text-sm text-[#6c757d] mb-4">
        Duration: <strong>{booking.durationMinutes} min</strong>
      </p>

      {booking.isRecurring && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
          <p className="font-medium mb-0.5">This session only</p>
          <p>
            Rescheduling applies to this date only — your other sessions in the series remain unchanged.
            To move the entire series to a different day or time, cancel the series below and re-book.
          </p>
        </div>
      )}

      <label className="label">Select a New Date</label>
      <BookingCalendar
        selectedDate={newDate}
        instructorId={booking.instructorId}
        onSelect={d => { setNewDate(d); setNewTime(""); }}
      />

      {newDate && (
        <div className="mt-5">
          <label className="label">Available Times</label>
          {rescheduleSlots.length === 0 ? (
            <p className="text-sm text-[#6c757d]">No available slots on this date. Please choose another day.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {rescheduleSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setNewTime(slot)}
                  className={`border rounded-lg px-2 py-1.5 text-sm transition-all ${
                    newTime === slot
                      ? "border-[#337C99] bg-[#337C99]/5 text-[#337C99] font-medium"
                      : "border-gray-200 hover:border-gray-300 text-[#212529]"
                  }`}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {newDate && newTime && (
        <div className="mt-5 rounded-xl p-4 text-sm" style={{ backgroundColor: "#337C99" + "18", border: "1px solid " + "#337C99" + "33" }}>
          <p className="font-semibold mb-3" style={{ color: "#337C99" }}>New Session Summary</p>
          <div className="space-y-1.5">
            <SummaryRow label="Date" value={formatDate(newDate)} />
            <SummaryRow label="Time" value={formatTime(newTime)} />
            <SummaryRow label="Instructor" value={booking.instructorName} />
            <SummaryRow label="Duration" value={`${booking.durationMinutes} min`} />
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => setMode("options")} className="btn-secondary flex-1 text-sm justify-center">
          Back
        </button>
        <button
          onClick={confirmReschedule}
          disabled={!newDate || !newTime}
          className="btn-primary flex-1 text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Reschedule
        </button>
      </div>
    </PageShell>
  );
}

// ── Guard screens ─────────────────────────────────────────────────────────────

function NotFound({ refStr }: { refStr: string }) {
  return (
    <PageShell>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-[#6c757d]" />
        </div>
        <h1 className="text-xl font-bold text-[#212529] mb-2">Booking Not Found</h1>
        <p className="text-sm text-[#6c757d] mb-4">
          We couldn't find an active booking for reference <strong>{refStr}</strong>. The link may be expired or the session may have already passed.
        </p>
        <a href="/" className="btn-secondary text-sm inline-block">Return to Home</a>
      </div>
    </PageShell>
  );
}

function AlreadyCancelled({ booking }: { booking: Booking }) {
  return (
    <PageShell>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-[#6c757d]" />
        </div>
        <h1 className="text-xl font-bold text-[#212529] mb-2">Already Cancelled</h1>
        <p className="text-sm text-[#6c757d] mb-2">
          Booking <strong>{booking.bookingReference}</strong> has already been cancelled.
        </p>
        {booking.cancellationReason && (
          <p className="text-sm text-[#6c757d]">Reason on file: {booking.cancellationReason}</p>
        )}
        <div className="mt-5">
          <a href="/book" className="btn-primary text-sm inline-block">Book a New Session</a>
        </div>
      </div>
    </PageShell>
  );
}

function Within24h({ booking }: { booking: Booking }) {
  const { phone: DSA_PHONE, phoneHref: DSA_PHONE_HREF } = useAppStore(s => s.facilitySettings);
  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#212529]">Online Changes Unavailable</h1>
          <p className="text-sm text-red-600">This session is within {LATE_WINDOW_HOURS} hours</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 text-sm text-red-800">
        <p className="font-medium mb-1">Change Window Closed</p>
        <p>
          Cancellations and reschedules must be made more than {LATE_WINDOW_HOURS} hours before the session.
          Please contact us directly to make changes.
        </p>
      </div>

      <BookingDetails booking={booking} />

      <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm">
        <p className="font-medium text-[#212529] mb-1">Need to make a change?</p>
        <p className="text-[#6c757d] mb-3">Contact Diamond Sports Academy directly:</p>
        <a href={DSA_PHONE_HREF} className="flex items-center gap-2 font-semibold" style={{ color: "#337C99" }}>
          <Phone className="w-4 h-4" />
          {DSA_PHONE}
        </a>
        <p className="text-xs text-[#6c757d] mt-2">
          Please have your booking reference ready: <strong>{booking.bookingReference}</strong>
        </p>
      </div>

      <div className="mt-5">
        <a href="/" className="btn-secondary w-full text-sm text-center block">Return to Home</a>
      </div>
    </PageShell>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function BookingDetails({
  booking, sessionIndex, sessionTotal,
}: {
  booking: Booking;
  sessionIndex?: number;
  sessionTotal?: number;
}) {
  const hasSeriesInfo = booking.isRecurring && sessionTotal && sessionTotal > 1 && sessionIndex !== undefined && sessionIndex >= 0;
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
      <DetailRow label="Reference" value={booking.bookingReference} mono />
      <DetailRow label="Customer" value={booking.customerName} />
      <DetailRow label="Instructor" value={booking.instructorName} />
      <DetailRow label="Date" value={formatDate(booking.date)} />
      <DetailRow label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
      <DetailRow label="Duration" value={`${booking.durationMinutes} min`} />
      {booking.isForChild && (
        <>
          {booking.childName && <DetailRow label="Child's name" value={booking.childName} />}
          <DetailRow label="Child's age" value={`${booking.childAge} yrs`} />
          {booking.relationshipToCustomer && <DetailRow label="Relationship" value={booking.relationshipToCustomer} />}
        </>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {booking.status === "waitlisted" && (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
            Waitlisted
          </span>
        )}
        {booking.status === "confirmed" && (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
            Confirmed
          </span>
        )}
        {hasSeriesInfo && (
          <span className="badge-blue">
            Session {sessionIndex! + 1} of {sessionTotal}
          </span>
        )}
        {booking.isRecurring && !hasSeriesInfo && (
          <span className="badge-blue">Recurring series</span>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#6c757d] w-24 flex-shrink-0">{label}</span>
      <span className={`font-medium text-[#212529] ${mono ? "font-mono text-xs text-[#337C99]" : ""}`}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#6c757d]">{label}</span>
      <span className="font-medium text-[#212529]">{value}</span>
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm mb-5 hover:underline"
      style={{ color: "#337C99" }}
    >
      <ChevronLeft className="w-4 h-4" /> Back
    </button>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#F7F7F7" }}>
      <section className="relative h-40 lg:h-52 flex items-end">
        <Image
          src="/images/batting-baseball-scaled.webp"
          alt="Manage Booking"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 pb-6 lg:pb-8 w-full">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Manage Your Booking</h1>
          <p className="text-white/80 mt-1 text-sm lg:text-base">Diamond Sports Academy</p>
        </div>
      </section>
      <div className="px-4 py-10 flex justify-center">
        <div className="w-full max-w-md">
          <div className="card p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function BookingCalendar({
  selectedDate,
  instructorId,
  onSelect,
}: {
  selectedDate: string;
  instructorId: string;
  onSelect: (date: string) => void;
}) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selectedDate ? new Date(selectedDate + "T00:00:00") : today)
  );

  const storeAvailability = useAppStore(s => s.availability);
  const storeBlackouts = useAppStore(s => s.blackouts);

  const isBlackout = useMemo(() => (dateStr: string) => {
    const mmdd = dateStr.slice(5);
    return storeBlackouts.some(bl => bl.isRecurring ? bl.date.slice(5) === mmdd : bl.date === dateStr);
  }, [storeBlackouts]);

  const availableDates = useMemo(() => {
    const s = new Set<string>();
    storeAvailability
      .filter(a => a.instructorId === instructorId && a.slots.length > 0 && !isBlackout(a.date))
      .forEach(a => s.add(a.date));
    return s;
  }, [instructorId, storeAvailability, isBlackout]);

  const gridStart = startOfWeek(startOfMonth(viewMonth));
  const gridEnd = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const isCurrentMonth = isSameMonth(viewMonth, today);

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-1">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-[#212529]" />
        </button>
        <span className="text-sm font-semibold text-[#212529]">{format(viewMonth, "MMMM yyyy")}</span>
        <button
          type="button"
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4 text-[#212529]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#6c757d] mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const dateStr = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, viewMonth);
          const isPast = isBefore(d, today);
          const isSelected = dateStr === selectedDate;
          const hasSlots = availableDates.has(dateStr);
          const isBlackoutDate = isBlackout(dateStr);
          const isDisabled = !inMonth || isPast || !hasSlots || isBlackoutDate;
          return (
            <button
              type="button"
              key={dateStr}
              disabled={isDisabled}
              onClick={() => onSelect(dateStr)}
              className={`relative rounded-lg text-sm transition-all py-1.5 ${
                !inMonth
                  ? "invisible"
                  : isSelected
                    ? "text-white font-medium"
                    : isPast || !hasSlots || isBlackoutDate
                      ? "text-gray-300 cursor-not-allowed"
                      : isToday(d)
                        ? "border font-medium hover:bg-[#337C99]/5"
                        : "text-[#212529] hover:bg-gray-100"
              }`}
              style={
                isSelected
                  ? { backgroundColor: "#337C99" }
                  : isToday(d) && !isPast && hasSlots
                    ? { borderColor: "#337C99", color: "#337C99" }
                    : {}
              }
            >
              {format(d, "d")}
              {hasSlots && inMonth && !isPast && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : "#337C99" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-[#6c757d]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#337C99" }} />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block bg-gray-200" />
          No slots
        </span>
      </div>
    </div>
  );
}
