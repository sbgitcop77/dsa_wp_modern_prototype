"use client";
export const runtime = "edge";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import type { Booking } from "@/data/mock/bookings";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

// Demo "now": May 8, 2026 at 10:00 AM Eastern
const DEMO_NOW = new Date("2026-05-08T10:00:00-04:00");
const LATE_CANCEL_HOURS = 24;

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function getSessionDateTime(booking: Booking): Date {
  const [h, m] = booking.startTime.split(":").map(Number);
  const d = new Date(`${booking.date}T00:00:00-04:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

type State = "valid" | "late" | "not_found" | "already_cancelled" | "cancelled";

export default function CancelPage() {
  const params = useParams();
  const ref = decodeURIComponent(params.ref as string);

  const booking = MOCK_BOOKINGS.find(b => b.bookingReference === ref);

  const [cancelled, setCancelled] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelScope, setCancelScope] = useState<"single" | "all">("single");

  function determineState(): State {
    if (cancelled) return "cancelled";
    if (!booking) return "not_found";
    if (booking.status === "cancelled") return "already_cancelled";
    if (booking.status === "completed") return "not_found";

    const sessionTime = getSessionDateTime(booking);
    const hoursUntil = (sessionTime.getTime() - DEMO_NOW.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 0) return "not_found"; // session has already passed
    if (hoursUntil < LATE_CANCEL_HOURS) return "late";
    return "valid";
  }

  const state = determineState();

  if (state === "not_found") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-[#6c757d]" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">Booking Not Found</h1>
          <p className="text-sm text-[#6c757d] mb-4">
            We couldn't find a booking for reference <strong>{ref}</strong>. The link may be expired, incorrect, or the session may have already passed.
          </p>
          <a href="/" className="btn-secondary text-sm inline-block">Return to Home</a>
        </div>
      </PageShell>
    );
  }

  if (state === "already_cancelled") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-[#6c757d]" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">Already Cancelled</h1>
          <p className="text-sm text-[#6c757d] mb-2">
            Booking <strong>{ref}</strong> has already been cancelled.
          </p>
          {booking!.cancellationReason && (
            <p className="text-sm text-[#6c757d]">Reason: {booking!.cancellationReason}</p>
          )}
          <div className="mt-5">
            <a href="/book" className="btn-primary text-sm inline-block">Book a New Session</a>
          </div>
        </div>
      </PageShell>
    );
  }

  if (state === "cancelled") {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#337C99" }}>
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#212529] mb-2">
            {cancelScope === "all" ? "Series Cancelled" : "Booking Cancelled"}
          </h1>
          <p className="text-sm text-[#6c757d] mb-6">
            {cancelScope === "all"
              ? `All remaining sessions in your series with ${booking!.instructorName} have been cancelled. A confirmation email has been sent to you.`
              : `Your session on ${booking!.date} with ${booking!.instructorName} has been cancelled. A confirmation email has been sent to you.`}
          </p>
          <a href="/book" className="btn-primary text-sm inline-block">Book a New Session</a>
        </div>
      </PageShell>
    );
  }

  if (state === "late") {
    return (
      <PageShell>
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#212529]">Online Cancellation Unavailable</h1>
              <p className="text-sm text-red-600">This session is within {LATE_CANCEL_HOURS} hours</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 text-sm text-red-800">
            <p className="font-medium mb-1">Cancellation Window Closed</p>
            <p>Online cancellations are only permitted more than {LATE_CANCEL_HOURS} hours before the session start time. Your session is within that window and cannot be cancelled online.</p>
          </div>

          <BookingDetails booking={booking!} />

          <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm text-[#212529]">
            <p className="font-medium mb-1">Need to cancel?</p>
            <p className="text-[#6c757d]">Please contact Diamond Sports Academy directly to request a late cancellation:</p>
            <p className="mt-2 font-semibold">📞 Call or text: <a href="tel:+14435550100" className="text-[#337C99] underline">(443) 555-0100</a></p>
            <p className="text-xs text-[#6c757d] mt-2">Late cancellations may be recorded on your account. Your booking reference is <strong>{booking!.bookingReference}</strong>.</p>
          </div>

          <div className="mt-5">
            <a href="/" className="btn-secondary w-full justify-center text-sm text-center block">Return to Home</a>
          </div>
        </div>
      </PageShell>
    );
  }

  // state === "valid"
  return (
    <PageShell>
      <div>
        <h1 className="text-xl font-bold text-[#212529] mb-1">Cancel Booking</h1>
        <p className="text-sm text-[#6c757d] mb-5">You're about to cancel the following session.</p>

        <BookingDetails booking={booking!} />

        {booking!.isRecurring && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-[#212529] mb-2">What would you like to cancel?</p>
            <div className="space-y-2">
              {(["single", "all"] as const).map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer text-sm">
                  <input type="radio" checked={cancelScope === s} onChange={() => setCancelScope(s)} />
                  <span>{s === "single" ? "This session only" : "All remaining sessions in this series"}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="label">Reason for cancellation <span className="text-[#6c757d] font-normal">(optional)</span></label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Let us know why you need to cancel…"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-5">
          <a href="/" className="btn-secondary flex-1 justify-center text-sm">Keep My Session</a>
          <button onClick={() => setCancelled(true)} className="btn-danger flex-1 justify-center text-sm">
            Confirm Cancellation
          </button>
        </div>
      </div>
    </PageShell>
  );
}

function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
      <Row label="Reference" value={booking.bookingReference} mono />
      <Row label="Customer" value={booking.customerName} />
      <Row label="Instructor" value={booking.instructorName} />
      <Row label="Date" value={booking.date} />
      <Row label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
      <Row label="Duration" value={`${booking.durationMinutes} min`} />
      {booking.isForChild && (
        <Row label="Session for" value={`Child (age ${booking.childAge})`} />
      )}
      {booking.isRecurring && (
        <div className="pt-1">
          <span className="badge-blue">Part of recurring series</span>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#6c757d] w-24 flex-shrink-0">{label}</span>
      <span className={`font-medium text-[#212529] ${mono ? "font-mono text-xs text-[#337C99]" : ""}`}>{value}</span>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#F7F7F7" }}>
      <section className="relative h-40 lg:h-52 flex items-end">
        <Image
          src="/images/batting-baseball-scaled.webp"
          alt="Cancel Booking"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 pb-6 lg:pb-8 w-full">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Booking Cancellation</h1>
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
