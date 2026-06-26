"use client";
export const runtime = "edge";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  startOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, format, isBefore, isSameMonth, isToday,
} from "date-fns";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import type { Booking } from "@/data/mock/bookings";
import { INSTRUCTOR_AVAILABILITY } from "@/data/mock/schedule";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Phone, CalendarDays } from "lucide-react";

const LATE_WINDOW_HOURS = 24;
const DSA_PHONE = "(443) 865-1639";
const DSA_PHONE_HREF = "tel:+14438651639";

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

function generateRescheduleRef(): string {
  const now = new Date();
  const ds = format(now, "MMdd");
  const n = String(Math.floor(1000 + Math.random() * 9000));
  return `DSA-${now.getFullYear()}-R${ds}-${n}`;
}

type Mode = "options" | "cancel" | "cancelled" | "reschedule" | "rescheduled";

export default function ManagePage() {
  const params = useParams();
  const ref = decodeURIComponent(params.ref as string);
  const booking = MOCK_BOOKINGS.find(b => b.bookingReference === ref);

  const [mode, setMode] = useState<Mode>("options");
  const [cancelReason, setCancelReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newRef, setNewRef] = useState("");

  // ── Guard states ────────────────────────────────────────────────────────

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

  if (hoursUntil < LATE_WINDOW_HOURS) {
    return <Within24h booking={booking} />;
  }

  // ── Reschedule slot lookup ──────────────────────────────────────────────

  const rescheduleSlots = newDate
    ? (INSTRUCTOR_AVAILABILITY.find(
        a => a.instructorId === booking.instructorId && a.date === newDate
      )?.slots ?? [])
    : [];

  // ── Handlers ───────────────────────────────────────────────────────────

  function confirmCancel() {
    setMode("cancelled");
  }

  function confirmReschedule() {
    setNewRef(generateRescheduleRef());
    setMode("rescheduled");
  }

  // ── Options (landing) ──────────────────────────────────────────────────

  if (mode === "options") {
    return (
      <PageShell>
        <h1 className="text-xl font-bold text-[#212529] mb-1">Manage Your Booking</h1>
        <p className="text-sm text-[#6c757d] mb-5">What would you like to do with this session?</p>

        <BookingDetails booking={booking} />

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => { setNewDate(""); setNewTime(""); setMode("reschedule"); }}
            className="flex flex-col items-center gap-2 border-2 border-[#337C99] rounded-xl p-4 text-[#337C99] hover:bg-[#337C99]/5 transition-colors"
          >
            <CalendarDays className="w-6 h-6" />
            <span className="font-semibold text-sm">Reschedule</span>
            <span className="text-xs text-[#6c757d] text-center">Pick a new date &amp; time</span>
          </button>
          <button
            onClick={() => { setCancelReason(""); setMode("cancel"); }}
            className="flex flex-col items-center gap-2 border-2 border-[#b6070e] rounded-xl p-4 text-[#b6070e] hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-6 h-6" />
            <span className="font-semibold text-sm">Cancel</span>
            <span className="text-xs text-[#6c757d] text-center">Remove this session</span>
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Cancel form ────────────────────────────────────────────────────────

  if (mode === "cancel") {
    return (
      <PageShell>
        <BackLink onClick={() => setMode("options")} />
        <h1 className="text-xl font-bold text-[#212529] mb-1">Cancel Booking</h1>
        <p className="text-sm text-[#6c757d] mb-5">You're about to cancel the following session.</p>

        <BookingDetails booking={booking} />

        {booking.isRecurring && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium mb-0.5">Part of a recurring series</p>
            <p>
              This will cancel this session only. To cancel the full series, call us at{" "}
              <a href={DSA_PHONE_HREF} className="underline font-medium">{DSA_PHONE}</a>.
            </p>
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
            Confirm Cancellation
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Cancelled success ──────────────────────────────────────────────────

  if (mode === "cancelled") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#337C99" }}>
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">Booking Cancelled</h1>
          <p className="text-sm text-[#6c757d] mb-6">
            Your session on <strong>{formatDate(booking.date)}</strong> at{" "}
            <strong>{formatTime(booking.startTime)}</strong> with{" "}
            <strong>{booking.instructorName}</strong> has been cancelled. A confirmation email has been sent.
          </p>
          <a href="/book" className="btn-primary text-sm inline-block">Book a New Session</a>
        </div>
      </PageShell>
    );
  }

  // ── Reschedule form ────────────────────────────────────────────────────

  if (mode === "reschedule") {
    return (
      <PageShell>
        <BackLink onClick={() => setMode("options")} />
        <h1 className="text-xl font-bold text-[#212529] mb-1">Reschedule Session</h1>
        <p className="text-sm text-[#6c757d] mb-4">
          Currently: <strong>{formatDate(booking.date)}</strong> at{" "}
          <strong>{formatTime(booking.startTime)}</strong> with {booking.instructorName}
        </p>

        {booking.isRecurring && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
            <p className="font-medium mb-0.5">This session only</p>
            <p>
              Rescheduling applies to this session only — your other sessions in the series remain unchanged.
              To reschedule the full series, call us at{" "}
              <a href={DSA_PHONE_HREF} className="underline font-medium">{DSA_PHONE}</a>.
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

  // ── Rescheduled success ────────────────────────────────────────────────

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
          <DetailRow label="New Reference" value={newRef} mono />
          <DetailRow label="Instructor" value={booking.instructorName} />
          <DetailRow label="New Date" value={formatDate(newDate)} />
          <DetailRow label="New Time" value={formatTime(newTime)} />
          <DetailRow label="Duration" value={`${booking.durationMinutes} min`} />
        </div>
        <a href="/" className="btn-secondary text-sm inline-block">Return to Home</a>
      </div>
    </PageShell>
  );
}

// ── Guard screens ──────────────────────────────────────────────────────────

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

// ── Shared sub-components ──────────────────────────────────────────────────

function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
      <DetailRow label="Reference" value={booking.bookingReference} mono />
      <DetailRow label="Customer" value={booking.customerName} />
      <DetailRow label="Instructor" value={booking.instructorName} />
      <DetailRow label="Date" value={formatDate(booking.date)} />
      <DetailRow label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
      <DetailRow label="Duration" value={`${booking.durationMinutes} min`} />
      {booking.isForChild && (
        <DetailRow label="Session for" value={`Child (age ${booking.childAge})`} />
      )}
      {booking.isRecurring && (
        <div className="pt-1"><span className="badge-blue">Recurring series</span></div>
      )}
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

// ── Calendar ───────────────────────────────────────────────────────────────

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

  const availableDates = useMemo(() => {
    const s = new Set<string>();
    INSTRUCTOR_AVAILABILITY
      .filter(a => a.instructorId === instructorId && a.slots.length > 0)
      .forEach(a => s.add(a.date));
    return s;
  }, [instructorId]);

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
          const isDisabled = !inMonth || isPast || !hasSlots;
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
                    : isPast || !hasSlots
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
