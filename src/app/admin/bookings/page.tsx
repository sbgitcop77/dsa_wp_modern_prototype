"use client";
import { useState } from "react";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { INSTRUCTOR_AVAILABILITY } from "@/data/mock/schedule";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import type { Booking } from "@/data/mock/bookings";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const map = { confirmed: "badge-green", cancelled: "badge-red", no_show: "badge-yellow", completed: "badge-gray" };
  return <span className={map[status]}>{status.replace("_", " ")}</span>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [search, setSearch] = useState("");
  const [instFilter, setInstFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [cancelScope, setCancelScope] = useState<"single" | "series">("single");
  const [cancelNote, setCancelNote] = useState("");
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [walkInForm, setWalkInForm] = useState({ customerName: "", instructorId: "i1", date: "", time: "", duration: "60" });
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", instructorId: "", duration: "60" });

  const activeInstructors = MOCK_INSTRUCTORS.filter(i => i.isActive);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    if (q && !b.customerName.toLowerCase().includes(q) && !b.bookingReference.toLowerCase().includes(q)) return false;
    if (instFilter !== "all" && b.instructorId !== instFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (dateFrom && b.date < dateFrom) return false;
    if (dateTo && b.date > dateTo) return false;
    return true;
  });

  function handleCancel() {
    if (!selected) return;
    setBookings(prev => prev.map(b => {
      if (cancelScope === "series" && selected.recurringSeriesId && b.recurringSeriesId === selected.recurringSeriesId) {
        return { ...b, status: "cancelled" as const, cancelledBy: "admin" as const, cancellationReason: cancelNote };
      }
      if (b.id === selected.id) return { ...b, status: "cancelled" as const, cancelledBy: "admin" as const, cancellationReason: cancelNote };
      return b;
    }));
    setToast({ message: "Booking cancelled.", type: "success" });
    setSelected(null);
    setCancelNote("");
  }

  function openEdit(b: Booking) {
    setEditBooking(b);
    setEditForm({ date: b.date, time: b.startTime, instructorId: b.instructorId, duration: String(b.durationMinutes) });
    setSelected(null);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editBooking) return;
    const dur = parseInt(editForm.duration) as 30 | 60;
    const [h, m] = editForm.time.split(":").map(Number);
    const endTotal = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
    const instructor = activeInstructors.find(i => i.id === editForm.instructorId);
    setBookings(prev => prev.map(b => b.id !== editBooking.id ? b : {
      ...b,
      date: editForm.date,
      startTime: editForm.time,
      endTime,
      durationMinutes: dur,
      instructorId: editForm.instructorId,
      instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : b.instructorName,
    }));
    const av = INSTRUCTOR_AVAILABILITY.find(a => a.instructorId === editForm.instructorId && a.date === editForm.date);
    const available = av?.slots.includes(editForm.time) ?? false;
    setToast({
      message: available ? "Booking updated." : "Booking updated. Note: instructor availability not confirmed for this slot.",
      type: available ? "success" : "info",
    });
    setEditBooking(null);
  }

  function exportCSV() {
    const headers = ["Reference", "Customer", "Instructor", "Date", "Time", "Duration (min)", "Type", "Status"];
    const rows = filtered.map(b => [
      b.bookingReference,
      b.customerName,
      b.instructorName,
      b.date,
      b.startTime,
      b.durationMinutes,
      [b.isWalkIn && "Walk-in", b.isRecurring && "Recurring", b.isForChild && "Child"].filter(Boolean).join("|") || "Standard",
      b.status,
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleWalkIn(e: React.FormEvent) {
    e.preventDefault();
    setToast({ message: "Walk-in session logged.", type: "success" });
    setShowWalkIn(false);
    setWalkInForm({ customerName: "", instructorId: "i1", date: "", time: "", duration: "60" });
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">Bookings</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary text-sm">Export CSV</button>
          <button onClick={() => setShowWalkIn(true)} className="btn-secondary text-sm">Log Walk-in</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
        <input className="input w-56 text-sm py-1.5" placeholder="Search by name or reference…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-44 text-sm py-1.5" value={instFilter} onChange={e => setInstFilter(e.target.value)}>
          <option value="all">All Instructors</option>
          {activeInstructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
        </select>
        <select className="input w-36 text-sm py-1.5" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
          <option value="completed">Completed</option>
        </select>
        <div className="flex items-center gap-1.5">
          <input type="date" className="input text-sm py-1.5 w-36" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" />
          <span className="text-[#6c757d] text-xs">to</span>
          <input type="date" className="input text-sm py-1.5 w-36" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-[#6c757d] hover:text-[#212529] underline">Clear dates</button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              {["Reference","Customer","Instructor","Date","Time","Duration","Type","Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6c757d] text-sm">No bookings found</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} onClick={() => { setSelected(b); setCancelScope("single"); setCancelNote(""); }} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs text-[#337C99]">{b.bookingReference}</td>
                <td className="px-4 py-3 font-medium text-[#212529]">{b.customerName}</td>
                <td className="px-4 py-3 text-[#6c757d]">{b.instructorName}</td>
                <td className="px-4 py-3 text-[#6c757d]">{b.date}</td>
                <td className="px-4 py-3 text-[#6c757d]">{formatTime(b.startTime)}</td>
                <td className="px-4 py-3 text-[#6c757d]">{b.durationMinutes}m</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {b.isWalkIn && <span className="badge-orange">Walk-in</span>}
                    {b.isRecurring && <span className="badge-blue">Recurring</span>}
                    {b.isForChild && <span className="badge-purple">Child</span>}
                    {!b.isWalkIn && !b.isRecurring && !b.isForChild && <span className="text-[#6c757d]">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal title={`Booking ${selected.bookingReference}`} onClose={() => setSelected(null)}
          footer={
            <>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              {selected.status === "confirmed" && (
                <>
                  <button onClick={() => openEdit(selected)} className="btn-secondary">Edit</button>
                  <button onClick={handleCancel} className="btn-danger">Cancel Booking</button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <Row label="Customer" value={selected.customerName} />
            <Row label="Instructor" value={selected.instructorName} />
            <Row label="Date" value={selected.date} />
            <Row label="Time" value={`${formatTime(selected.startTime)} – ${formatTime(selected.endTime)}`} />
            <Row label="Duration" value={`${selected.durationMinutes} min`} />
            <Row label="Lane" value={`Lane ${selected.laneAssigned}`} />
            {selected.isForChild && <Row label="Child" value={`Age ${selected.childAge} (${selected.relationshipToCustomer})`} />}
            <div className="flex gap-1 flex-wrap pt-1">
              {selected.isWalkIn && <span className="badge-orange">Walk-in</span>}
              {selected.isRecurring && <span className="badge-blue">Recurring</span>}
              {selected.isForChild && <span className="badge-purple">Child</span>}
            </div>
            {selected.isRecurring && selected.status === "confirmed" && (
              <div className="pt-2 border-t border-gray-100">
                <p className="font-medium text-[#212529] mb-2">Cancellation Scope</p>
                <div className="flex gap-4">
                  {(["single","series"] as const).map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" checked={cancelScope === s} onChange={() => setCancelScope(s)} />
                      {s === "single" ? "This session only" : "Entire series"}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {selected.status === "confirmed" && (
              <div className="pt-2">
                <label className="label">Cancellation Note</label>
                <textarea className="input resize-none" rows={2} value={cancelNote} onChange={e => setCancelNote(e.target.value)} placeholder="Optional reason…" />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Booking Modal */}
      {editBooking && (
        <Modal title={`Edit Booking ${editBooking.bookingReference}`} onClose={() => setEditBooking(null)}
          footer={
            <>
              <button onClick={() => setEditBooking(null)} className="btn-secondary">Cancel</button>
              <button form="edit-booking-form" type="submit" className="btn-primary">Save Changes</button>
            </>
          }
        >
          <form id="edit-booking-form" onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" required value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Time</label>
                <input className="input" type="time" required value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Instructor</label>
              <select className="input" value={editForm.instructorId} onChange={e => setEditForm(f => ({ ...f, instructorId: e.target.value }))}>
                {activeInstructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))}>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Walk-in Modal */}
      {showWalkIn && (
        <Modal title="Log Walk-in" onClose={() => setShowWalkIn(false)}
          footer={
            <>
              <button onClick={() => setShowWalkIn(false)} className="btn-secondary">Cancel</button>
              <button form="walkin-form" type="submit" className="btn-primary">Log Walk-in</button>
            </>
          }
        >
          <form id="walkin-form" onSubmit={handleWalkIn} className="space-y-4">
            <div>
              <label className="label">Customer Name</label>
              <input className="input" required value={walkInForm.customerName} onChange={e => setWalkInForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Full name" />
            </div>
            <div>
              <label className="label">Instructor</label>
              <select className="input" value={walkInForm.instructorId} onChange={e => setWalkInForm(f => ({ ...f, instructorId: e.target.value }))}>
                {activeInstructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" required value={walkInForm.date} onChange={e => setWalkInForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Time</label>
                <input className="input" type="time" required value={walkInForm.time} onChange={e => setWalkInForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={walkInForm.duration} onChange={e => setWalkInForm(f => ({ ...f, duration: e.target.value }))}>
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
