"use client";
import { useState } from "react";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import { MOCK_CUSTOMERS } from "@/data/mock/customers";
import type { Customer } from "@/data/mock/customers";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { LANE_CONFIG, LANE_UTILIZATION } from "@/data/mock/schedule";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import type { Booking } from "@/data/mock/bookings";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // distance back to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function weekDays(weekStart: Date) {
  return DAY_LABELS.map((label, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { label: `${label} ${d.getDate()}`, date: d.toISOString().slice(0, 10) };
  });
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 5);
  const ms = weekStart.toLocaleDateString("en-US", { month: "short" });
  const me = end.toLocaleDateString("en-US", { month: "short" });
  const year = end.getFullYear();
  return ms === me
    ? `${ms} ${weekStart.getDate()} – ${end.getDate()}, ${year}`
    : `${ms} ${weekStart.getDate()} – ${me} ${end.getDate()}, ${year}`;
}

const TIME_SLOTS: string[] = [];
for (let h = 8; h < 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const INSTRUCTOR_COLORS: Record<string, string> = {
  i1: "bg-blue-100 border-blue-300 text-blue-800",
  i2: "bg-purple-100 border-purple-300 text-purple-800",
  i3: "bg-green-100 border-green-300 text-green-800",
};

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfCurrentWeek());
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelScope, setCancelScope] = useState<"single" | "series">("single");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [newForm, setNewForm] = useState({ customerId: "", customerName: "", customerQuery: "", instructorId: "i1", date: "", time: "", duration: "60" });
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);

  const days = weekDays(weekStart);
  const activeInstructors = MOCK_INSTRUCTORS.filter(i => i.isActive);
  const weekBookings = bookings.filter(b =>
    days.some(d => d.date === b.date) &&
    b.status !== "cancelled"
  );

  function prevWeek() {
    setWeekStart(d => { const p = new Date(d); p.setDate(d.getDate() - 7); return p; });
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n; });
  }

  const filtered = instructorFilter === "all" ? weekBookings : weekBookings.filter(b => b.instructorId === instructorFilter);

  function getBookingsForSlot(date: string, time: string) {
    return filtered.filter(b => b.date === date && b.startTime === time);
  }

  function handleCancelBooking() {
    if (!selectedBooking) return;
    setBookings(prev => prev.map(b => {
      if (cancelScope === "series" && selectedBooking.recurringSeriesId && b.recurringSeriesId === selectedBooking.recurringSeriesId) {
        return { ...b, status: "cancelled" as const, cancelledBy: "admin" as const };
      }
      if (b.id === selectedBooking.id) {
        return { ...b, status: "cancelled" as const, cancelledBy: "admin" as const };
      }
      return b;
    }));
    setToast({ message: "Booking cancelled.", type: "success" });
    setSelectedBooking(null);
  }

  function handleCustomerSearch(query: string) {
    setNewForm(f => ({ ...f, customerQuery: query, customerName: query, customerId: "" }));
    if (query.length < 2) { setCustomerSuggestions([]); return; }
    const q = query.toLowerCase();
    setCustomerSuggestions(
      MOCK_CUSTOMERS.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }

  function selectCustomer(c: Customer) {
    setNewForm(f => ({ ...f, customerId: c.id, customerName: `${c.firstName} ${c.lastName}`, customerQuery: `${c.firstName} ${c.lastName}` }));
    setCustomerSuggestions([]);
  }

  function handleNewBooking(e: React.FormEvent) {
    e.preventDefault();
    const dur = parseInt(newForm.duration) as 30 | 60;
    const [h, m] = newForm.time.split(":").map(Number);
    const endTotal = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
    const instructor = activeInstructors.find(i => i.id === newForm.instructorId);
    const now = new Date();
    const ds = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const ref = `DSA-${ds}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      bookingReference: ref,
      cancellationToken: `tok-${Date.now()}`,
      customerId: newForm.customerId || "unknown",
      customerName: newForm.customerName,
      instructorId: newForm.instructorId,
      instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : "",
      date: newForm.date,
      startTime: newForm.time,
      endTime,
      durationMinutes: dur,
      status: "confirmed",
      isForChild: false,
      isRecurring: false,
      isWalkIn: false,
      laneAssigned: 1,
      createdAt: now.toISOString(),
    };
    setBookings(prev => [...prev, newBooking]);
    setToast({ message: `Booking confirmed — ${ref}`, type: "success" });
    setShowNewBooking(false);
    setNewForm({ customerId: "", customerName: "", customerQuery: "", instructorId: "i1", date: "", time: "", duration: "60" });
    setCustomerSuggestions([]);
  }

  const stats = [
    { label: "Bookings This Week", value: weekBookings.length },
    { label: "Active Customers", value: MOCK_CUSTOMERS.filter(c => c.isActive).length },
    { label: "Active Instructors", value: MOCK_INSTRUCTORS.filter(i => i.isActive).length },
    { label: "Lanes Active", value: LANE_CONFIG.totalActiveLanes },
  ];

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={prevWeek} className="btn-secondary px-2 py-0.5 text-sm leading-none">←</button>
            <span className="text-sm text-[#6c757d]">Week of {formatWeekRange(weekStart)}</span>
            <button onClick={nextWeek} className="btn-secondary px-2 py-0.5 text-sm leading-none">→</button>
          </div>
        </div>
        <button onClick={() => setShowNewBooking(true)} className="btn-primary">+ New Booking</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-bold text-[#212529]">{s.value}</p>
            <p className="text-xs text-[#6c757d] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-[#6c757d]">Instructor:</label>
        <select
          value={instructorFilter}
          onChange={e => setInstructorFilter(e.target.value)}
          className="input w-auto text-sm py-1.5"
        >
          <option value="all">All Instructors</option>
          {activeInstructors.map(i => (
            <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
          ))}
        </select>
      </div>

      {/* Lane Utilization Strip */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#212529]">Lane Utilization — Today</h2>
          <span className="text-xs text-[#6c757d]">{LANE_CONFIG.totalActiveLanes} active lane{LANE_CONFIG.totalActiveLanes !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="text-[10px] min-w-max">
            <thead>
              <tr>
                <th className="text-left pr-3 pb-1 text-[#6c757d] font-medium w-12">Lane</th>
                {Object.keys(LANE_UTILIZATION).map(slot => {
                  const [h, m] = slot.split(":").map(Number);
                  const label = `${h % 12 || 12}${m === 0 ? "" : `:${String(m).padStart(2, "0")}`}${h >= 12 ? "p" : "a"}`;
                  return (
                    <th key={slot} className="text-center pb-1 px-0.5 text-[#6c757d] font-normal w-8">{label}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: LANE_CONFIG.totalActiveLanes }, (_, laneIdx) => (
                <tr key={laneIdx}>
                  <td className="pr-3 py-0.5 text-[#6c757d] font-semibold whitespace-nowrap">Lane {laneIdx + 1}</td>
                  {Object.entries(LANE_UTILIZATION).map(([slot, { used, total }]) => {
                    const occupied = laneIdx < used;
                    const allFull = used >= total;
                    const bg = occupied ? (allFull ? "#f33b41" : "#337C99") : "#f3f4f6";
                    return (
                      <td key={slot} className="px-0.5 py-0.5">
                        <div
                          className="rounded h-5 w-7"
                          style={{ backgroundColor: bg }}
                          title={`${slot} Lane ${laneIdx + 1}: ${occupied ? "Occupied" : "Free"}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-[#6c757d]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#337C99" }} />Occupied</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#f33b41" }} />Full (all lanes)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }} />Available</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-3 py-2.5 text-[#6c757d] font-medium w-16">Time</th>
              {days.map(d => (
                <th key={d.date} className="px-2 py-2.5 text-[#6c757d] font-medium text-center">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-3 py-1.5 text-[#6c757d] font-mono text-xs whitespace-nowrap">{formatTime(slot)}</td>
                {days.map(d => {
                  const slotBookings = getBookingsForSlot(d.date, slot);
                  return (
                    <td key={d.date} className="px-1 py-1 align-top">
                      {slotBookings.map(b => (
                        <button
                          key={b.id}
                          onClick={() => { setSelectedBooking(b); setCancelScope("single"); }}
                          className={`w-full text-left px-1.5 py-0.5 rounded border text-xs mb-0.5 truncate ${INSTRUCTOR_COLORS[b.instructorId] || "bg-gray-100 border-gray-300 text-gray-700"}`}
                        >
                          {b.customerName.split(" ")[0]} · {b.durationMinutes}m
                          {b.isWalkIn && " 🚶"}
                          {b.isRecurring && " 🔁"}
                        </button>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          title={`Booking ${selectedBooking.bookingReference}`}
          onClose={() => setSelectedBooking(null)}
          footer={
            <>
              <button onClick={() => setSelectedBooking(null)} className="btn-secondary">Close</button>
              <button onClick={handleCancelBooking} className="btn-danger">Cancel Booking</button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <Row label="Customer" value={selectedBooking.customerName} />
            <Row label="Instructor" value={selectedBooking.instructorName} />
            <Row label="Date" value={selectedBooking.date} />
            <Row label="Time" value={`${formatTime(selectedBooking.startTime)} – ${formatTime(selectedBooking.endTime)}`} />
            <Row label="Duration" value={`${selectedBooking.durationMinutes} min`} />
            {selectedBooking.isForChild && (
              <Row label="Child" value={`Age ${selectedBooking.childAge} (${selectedBooking.relationshipToCustomer})`} />
            )}
            {selectedBooking.isWalkIn && <span className="badge-orange">Walk-in</span>}
            {selectedBooking.isRecurring && (
              <div className="pt-2 border-t border-gray-100">
                <p className="font-medium text-[#212529] mb-2">Recurring Series</p>
                <div className="flex gap-3">
                  {(["single", "series"] as const).map(scope => (
                    <label key={scope} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={cancelScope === scope} onChange={() => setCancelScope(scope)} />
                      <span>{scope === "single" ? "Cancel this session" : "Cancel entire series"}</span>
                    </label>
                  ))}
                </div>
                {cancelScope === "series" && (
                  <p className="text-xs text-red-600 mt-2">All upcoming sessions in this series will be cancelled.</p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Booking Modal */}
      {showNewBooking && (
        <Modal title="New Booking" onClose={() => setShowNewBooking(false)}
          footer={
            <>
              <button onClick={() => setShowNewBooking(false)} className="btn-secondary">Cancel</button>
              <button form="new-booking-form" type="submit" className="btn-primary">Confirm</button>
            </>
          }
        >
          <form id="new-booking-form" onSubmit={handleNewBooking} className="space-y-4">
            <div className="relative">
              <label className="label">Customer</label>
              <input
                className="input"
                required
                autoComplete="off"
                value={newForm.customerQuery}
                onChange={e => handleCustomerSearch(e.target.value)}
                placeholder="Search by name or email…"
              />
              {customerSuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                  {customerSuggestions.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-[#212529]">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-[#6c757d]">{c.email}</p>
                    </button>
                  ))}
                </div>
              )}
              {newForm.customerId && (
                <p className="text-xs text-green-600 mt-1">Existing customer selected</p>
              )}
            </div>
            <div>
              <label className="label">Instructor</label>
              <select className="input" value={newForm.instructorId} onChange={e => setNewForm(f => ({ ...f, instructorId: e.target.value }))}>
                {activeInstructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" required value={newForm.date} onChange={e => setNewForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Time</label>
                <input className="input" type="time" required value={newForm.time} onChange={e => setNewForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={newForm.duration} onChange={e => setNewForm(f => ({ ...f, duration: e.target.value }))}>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#6c757d] w-24 flex-shrink-0">{label}</span>
      <span className="text-[#212529] font-medium">{value}</span>
    </div>
  );
}
