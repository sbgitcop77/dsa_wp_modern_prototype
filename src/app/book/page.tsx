"use client";
import { useState } from "react";
import Image from "next/image";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { INSTRUCTOR_AVAILABILITY, LANE_UTILIZATION, OPERATING_HOURS, BLACKOUTS } from "@/data/mock/schedule";
import { MOCK_CUSTOMERS } from "@/data/mock/customers";
import { Check } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

type BookingForm = {
  instructorId: string;
  instructorName: string;
  date: string;
  time: string;
  duration: 30 | 60;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isForChild: boolean;
  childAge: string;
  relationship: string;
  isRecurring: boolean;
  recurringWeeks: string;
  isWaitlist: boolean;
};

const INITIAL_FORM: BookingForm = {
  instructorId: "",
  instructorName: "",
  date: "",
  time: "",
  duration: 60,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  isForChild: false,
  childAge: "",
  relationship: "",
  isRecurring: false,
  recurringWeeks: "4",
  isWaitlist: false,
};

const DEMO_DAYS = [
  { label: "Mon May 11", date: "2026-05-11" },
  { label: "Tue May 12", date: "2026-05-12" },
  { label: "Wed May 13", date: "2026-05-13" },
  { label: "Thu May 14", date: "2026-05-14" },
  { label: "Fri May 15", date: "2026-05-15" },
  { label: "Sat May 16", date: "2026-05-16" },
];

const ACTIVE_INSTRUCTORS = MOCK_INSTRUCTORS.filter(i => i.isActive);

const INSTRUCTOR_SPECIALTIES: Record<string, string> = {
  i1: "Hitting & Pitching",
  i2: "Pitching & Defense",
  i3: "Catching & Fielding",
};

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function generateRef() {
  const now = new Date();
  const ds = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `DSA-${ds}-${num}`;
}

const STEPS = ["Instructor", "Date & Time", "Your Details", "Options", "Review"];

export default function BookPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [recurringConflicts, setRecurringConflicts] = useState<string[]>([]);
  const [flagError, setFlagError] = useState(false);

  function set(field: keyof BookingForm, value: string | boolean | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function getOperatingHoursForDate(dateStr: string) {
    const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dow = new Date(dateStr + "T00:00:00").getDay();
    return OPERATING_HOURS.find(oh => oh.dayOfWeek === DAY_NAMES[dow]);
  }

  function isSlotWithinHours(slot: string, dateStr: string): boolean {
    const oh = getOperatingHoursForDate(dateStr);
    if (!oh || oh.isClosed) return false;
    return slot >= oh.openTime && slot < oh.closeTime;
  }

  function isFacilityBlackout(dateStr: string): boolean {
    return BLACKOUTS.some(bl => bl.type === "facility" && bl.date === dateStr);
  }

  function isInstructorBlackout(dateStr: string, instructorId: string): boolean {
    return BLACKOUTS.some(bl => bl.type === "instructor" && bl.date === dateStr && bl.instructorId === instructorId);
  }

  function availableSlots() {
    if (!form.instructorId || !form.date) return [];
    if (isFacilityBlackout(form.date) || isInstructorBlackout(form.date, form.instructorId)) return [];
    const av = INSTRUCTOR_AVAILABILITY.find(a => a.instructorId === form.instructorId && a.date === form.date);
    if (!av) return [];
    return av.slots.filter(slot => {
      if (!isSlotWithinHours(slot, form.date)) return false;
      const lane = LANE_UTILIZATION[slot];
      return !lane || lane.used < lane.total;
    });
  }

  function waitlistSlots() {
    if (!form.instructorId || !form.date) return [];
    if (isFacilityBlackout(form.date) || isInstructorBlackout(form.date, form.instructorId)) return [];
    const av = INSTRUCTOR_AVAILABILITY.find(a => a.instructorId === form.instructorId && a.date === form.date);
    if (!av) return [];
    return av.slots.filter(slot => {
      if (!isSlotWithinHours(slot, form.date)) return false;
      const lane = LANE_UTILIZATION[slot];
      return lane && lane.used >= lane.total;
    });
  }

  function handleStep3Next() {
    const match = MOCK_CUSTOMERS.find(c => c.email.toLowerCase() === form.email.toLowerCase());
    if (match && (!match.isActive || match.isFlagged)) {
      setFlagError(true);
      return;
    }
    setFlagError(false);
    setStep(4);
  }

  function addWeeks(dateStr: string, weeks: number): string {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString().slice(0, 10);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  }

  function validateRecurringSeries(): string[] {
    const weeks = parseInt(form.recurringWeeks, 10);
    const conflicts: string[] = [];
    for (let w = 1; w < weeks; w++) {
      const futureDate = addWeeks(form.date, w);
      const av = INSTRUCTOR_AVAILABILITY.find(
        a => a.instructorId === form.instructorId && a.date === futureDate
      );
      if (!av || !av.slots.includes(form.time)) {
        conflicts.push(futureDate);
      }
    }
    return conflicts;
  }

  function handleStep4Next() {
    if (form.isRecurring) {
      const conflicts = validateRecurringSeries();
      setRecurringConflicts(conflicts);
      if (conflicts.length > 0) return;
    }
    setRecurringConflicts([]);
    setStep(5);
  }

  function endTime() {
    if (!form.time) return "";
    const [h, m] = form.time.split(":").map(Number);
    const total = h * 60 + m + form.duration;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function confirm() {
    const ref = generateRef();
    setBookingRef(ref);
    setConfirmed(true);
  }

  function reset() {
    setForm(INITIAL_FORM);
    setStep(1);
    setConfirmed(false);
    setBookingRef("");
  }

  if (confirmed) {
    return (
      <div style={{ backgroundColor: "#F7F7F7" }}>
        <PageHero />
        <div className="py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: form.isWaitlist ? "#f59e0b" : "#337C99" }}
            >
              <Check className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#212529] mb-2">
              {form.isWaitlist ? "Added to Waitlist!" : "Booking Confirmed!"}
            </h1>
            <p className="text-[#6c757d] text-sm mb-6">
              {form.isWaitlist
                ? <>You're on the waitlist for {form.instructorName} on {form.date} at {formatTime(form.time)}. We'll notify <strong>{form.email}</strong> if a spot opens.</>
                : <>Your session has been booked. A confirmation email has been sent to <strong>{form.email}</strong>.</>
              }
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6c757d]">Reference</span>
                <span className="font-mono font-semibold text-[#337C99]">{bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c757d]">Instructor</span>
                <span className="font-medium text-[#212529]">{form.instructorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c757d]">Date</span>
                <span className="font-medium text-[#212529]">{form.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c757d]">Time</span>
                <span className="font-medium text-[#212529]">{formatTime(form.time)} – {formatTime(endTime())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c757d]">Duration</span>
                <span className="font-medium text-[#212529]">{form.duration} min</span>
              </div>
            </div>
            {!form.isWaitlist && (
              <p className="text-xs text-[#6c757d] mb-6">
                To cancel this booking, use the cancellation link in your confirmation email.
              </p>
            )}
            <button onClick={reset} className="btn-primary w-full justify-center">
              {form.isWaitlist ? "Done" : "Book Another Session"}
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F7F7F7" }}>
      <PageHero />
      <div className="px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done ? "text-white" : active ? "text-white" : "text-[#6c757d] bg-gray-200"
                    }`}
                    style={done || active ? { backgroundColor: "#337C99" } : {}}
                  >
                    {done ? <Check className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${active ? "text-[#337C99] font-medium" : "text-[#6c757d]"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > n ? "bg-[#337C99]" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="card p-6 lg:p-8">
          {/* Step 1: Instructor */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-[#212529] mb-1">Choose an Instructor</h2>
              <p className="text-sm text-[#6c757d] mb-5">Select the coach you'd like to train with.</p>
              <div className="space-y-3">
                {ACTIVE_INSTRUCTORS.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => { set("instructorId", inst.id); set("instructorName", `${inst.firstName} ${inst.lastName}`); set("date", ""); set("time", ""); }}
                    className={`w-full text-left border rounded-xl p-4 transition-all ${
                      form.instructorId === inst.id
                        ? "border-[#337C99] bg-[#337C99]/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: "#337C99" }}
                      >
                        {inst.firstName[0]}{inst.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#212529]">{inst.firstName} {inst.lastName}</p>
                        <p className="text-sm text-[#6c757d]">{INSTRUCTOR_SPECIALTIES[inst.id] ?? inst.speciality}</p>
                      </div>
                      {form.instructorId === inst.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#337C99" }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.instructorId}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-[#212529] mb-1">Select Date & Time</h2>
              <p className="text-sm text-[#6c757d] mb-5">Choose from {form.instructorName}'s available slots.</p>

              <div className="mb-5">
                <label className="label">Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEMO_DAYS.map(d => {
                    const hasSlots = INSTRUCTOR_AVAILABILITY.some(a => a.instructorId === form.instructorId && a.date === d.date && a.slots.length > 0);
                    return (
                      <button
                        key={d.date}
                        onClick={() => { if (hasSlots) { set("date", d.date); set("time", ""); } }}
                        disabled={!hasSlots}
                        className={`border rounded-lg px-3 py-2 text-sm transition-all ${
                          form.date === d.date
                            ? "border-[#337C99] bg-[#337C99]/5 text-[#337C99] font-medium"
                            : hasSlots
                              ? "border-gray-200 hover:border-gray-300 text-[#212529]"
                              : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.date && (
                <div className="mb-5">
                  <label className="label">Available Times</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots().map(slot => (
                      <button
                        key={slot}
                        onClick={() => { set("time", slot); set("isWaitlist", false); }}
                        className={`border rounded-lg px-2 py-1.5 text-sm transition-all ${
                          form.time === slot && !form.isWaitlist
                            ? "border-[#337C99] bg-[#337C99]/5 text-[#337C99] font-medium"
                            : "border-gray-200 hover:border-gray-300 text-[#212529]"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                    {waitlistSlots().map(slot => (
                      <button
                        key={`wl-${slot}`}
                        onClick={() => { set("time", slot); set("isWaitlist", true); set("isRecurring", false); }}
                        className={`border rounded-lg px-2 py-1.5 text-xs transition-all leading-tight ${
                          form.time === slot && form.isWaitlist
                            ? "border-amber-400 bg-amber-100 text-amber-900 font-medium"
                            : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {formatTime(slot)}
                        <span className="block text-[10px] opacity-75">waitlist</span>
                      </button>
                    ))}
                  </div>
                  {availableSlots().length === 0 && waitlistSlots().length === 0 && (
                    <p className="text-sm text-[#6c757d] mt-2">No available slots on this date.</p>
                  )}
                </div>
              )}

              {form.time && (
                <div className="mb-5">
                  <label className="label">Duration</label>
                  <div className="flex gap-3">
                    {([30, 60] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => set("duration", d)}
                        className={`border rounded-lg px-5 py-2 text-sm transition-all ${
                          form.duration === d
                            ? "border-[#337C99] bg-[#337C99]/5 text-[#337C99] font-medium"
                            : "border-gray-200 hover:border-gray-300 text-[#212529]"
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.date || !form.time}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-[#212529] mb-1">Your Details</h2>
              <p className="text-sm text-[#6c757d] mb-5">We'll send your confirmation to the email below.</p>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input className="input" required value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="First name" />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input className="input" required value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" required value={form.email} onChange={e => { set("email", e.target.value); setFlagError(false); }} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="label">Phone <span className="text-[#6c757d] font-normal">(optional)</span></label>
                  <input className="input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="443-555-0000" />
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={form.isForChild} onChange={e => set("isForChild", e.target.checked)} className="rounded" />
                    <span className="font-medium text-[#212529] text-sm">This session is for a child</span>
                  </label>
                  {form.isForChild && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="label">Child's Age</label>
                        <input className="input" type="number" min="5" max="18" value={form.childAge} onChange={e => set("childAge", e.target.value)} placeholder="Age" />
                      </div>
                      <div>
                        <label className="label">Your Relationship</label>
                        <select className="input" value={form.relationship} onChange={e => set("relationship", e.target.value)}>
                          <option value="">Select…</option>
                          <option value="parent">Parent</option>
                          <option value="guardian">Guardian</option>
                          <option value="coach">Coach</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {flagError && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3 text-sm text-red-800">
                  We're unable to process bookings for this account. Please contact us directly for assistance.
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                <button
                  onClick={handleStep3Next}
                  disabled={!form.firstName || !form.lastName || !form.email}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Recurring Options */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-[#212529] mb-1">Session Frequency</h2>
              {form.isWaitlist ? (
                <>
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-800 mb-5">
                    You're joining the waitlist for a fully-booked slot. Recurring series is not available for waitlist entries — this will be a single-session request.
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => { setStep(3); setRecurringConflicts([]); }} className="btn-secondary">← Back</button>
                    <button onClick={() => setStep(5)} className="btn-primary">Next →</button>
                  </div>
                </>
              ) : (
              <>
              <p className="text-sm text-[#6c757d] mb-5">Would you like to book a recurring series?</p>
              <div className="space-y-3">
                <button
                  onClick={() => { set("isRecurring", false); setRecurringConflicts([]); }}
                  className={`w-full text-left border rounded-xl p-4 transition-all ${
                    !form.isRecurring ? "border-[#337C99] bg-[#337C99]/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${!form.isRecurring ? "border-[#337C99] bg-[#337C99]" : "border-gray-300"}`} />
                    <div>
                      <p className="font-semibold text-[#212529]">Single Session</p>
                      <p className="text-sm text-[#6c757d]">Book just this one session</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => set("isRecurring", true)}
                  className={`w-full text-left border rounded-xl p-4 transition-all ${
                    form.isRecurring ? "border-[#337C99] bg-[#337C99]/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${form.isRecurring ? "border-[#337C99] bg-[#337C99]" : "border-gray-300"}`} />
                    <div>
                      <p className="font-semibold text-[#212529]">Recurring Series</p>
                      <p className="text-sm text-[#6c757d]">Repeat weekly at the same time</p>
                    </div>
                  </div>
                </button>
              </div>
              {form.isRecurring && (
                <div className="mt-4">
                  <label className="label">Number of Weeks</label>
                  <select className="input w-40" value={form.recurringWeeks} onChange={e => { set("recurringWeeks", e.target.value); setRecurringConflicts([]); }}>
                    <option value="2">2 weeks</option>
                    <option value="4">4 weeks</option>
                    <option value="6">6 weeks</option>
                    <option value="8">8 weeks</option>
                  </select>
                  <p className="text-xs text-[#6c757d] mt-2">
                    All sessions in the series will be booked at {form.time ? formatTime(form.time) : "the same time"} on the same weekday.
                  </p>
                </div>
              )}

              {recurringConflicts.length > 0 && (
                <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-red-800 mb-1">
                    {form.instructorName} is not available at {formatTime(form.time)} on:
                  </p>
                  <ul className="list-disc list-inside text-red-700 space-y-0.5 mb-2 text-xs">
                    {recurringConflicts.map(d => <li key={d}>{formatDate(d)}</li>)}
                  </ul>
                  <p className="text-red-600 text-xs">
                    Please go back and choose a different time, or reduce the number of weeks.
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button onClick={() => { setStep(3); setRecurringConflicts([]); }} className="btn-secondary">← Back</button>
                <button onClick={handleStep4Next} className="btn-primary">Next →</button>
              </div>
              </>
              )}
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold text-[#212529] mb-1">Review & Confirm</h2>
              <p className="text-sm text-[#6c757d] mb-5">Please review your booking details before confirming.</p>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm mb-6">
                <SummaryRow label="Instructor" value={form.instructorName} />
                <SummaryRow label="Date" value={form.date} />
                <SummaryRow label="Time" value={`${formatTime(form.time)} – ${formatTime(endTime())}`} />
                <SummaryRow label="Duration" value={`${form.duration} minutes`} />
                <div className="border-t border-gray-200 pt-3">
                  <SummaryRow label="Name" value={`${form.firstName} ${form.lastName}`} />
                  <SummaryRow label="Email" value={form.email} />
                  {form.phone && <SummaryRow label="Phone" value={form.phone} />}
                  {form.isForChild && (
                    <SummaryRow label="Session for" value={`Child (age ${form.childAge}) — ${form.relationship}`} />
                  )}
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <SummaryRow
                    label="Frequency"
                    value={form.isRecurring ? `Recurring — ${form.recurringWeeks} weeks` : "Single session"}
                  />
                </div>
              </div>

              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs text-amber-800 mb-6">
                By confirming, you agree to our cancellation policy. Cancellations made less than 24 hours before the session may be marked as late cancellations.
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(4)} className="btn-secondary">← Back</button>
                <button onClick={confirm} className={form.isWaitlist ? "btn-secondary" : "btn-primary"}>
                  {form.isWaitlist ? "Join Waitlist" : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

function PageHero() {
  return (
    <section className="relative h-40 lg:h-52 flex items-end">
      <Image
        src="/images/baseball-training-with-coach.webp"
        alt="Book a Session"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 pb-6 lg:pb-8 w-full">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Book a Session</h1>
        <p className="text-white/80 mt-1 text-sm lg:text-base">Reserve your 1-on-1 training at Diamond Sports Academy</p>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-[#6c757d] w-28 flex-shrink-0">{label}</span>
      <span className="text-[#212529] font-medium">{value}</span>
    </div>
  );
}
