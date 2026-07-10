"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/data/store/useAppStore";
import { db } from "@/data/service";
import { notifyBoth } from "@/data/service/notifyUtils";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import type { Booking } from "@/data/types";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}-${day}-${y}`;
}

function StatusBadge({ status, conflictReason }: { status: Booking["status"]; conflictReason?: Booking["conflictReason"] }) {
  const map: Record<string, string> = {
    confirmed: "badge-green",
    cancelled: "badge-red",
    no_show: "badge-yellow",
    completed: "badge-gray",
    waitlisted: "badge-orange",
  };
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className={map[status] ?? "badge-gray"}>{status.replace("_", " ")}</span>
      {status === "waitlisted" && conflictReason && (
        <span className="text-[10px] text-amber-700">
          {conflictReason === "instructor_conflict" ? "Instructor conflict" : "Lane at capacity"}
        </span>
      )}
    </span>
  );
}

const _d = new Date();
const TODAY = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;


const PAGE_SIZE = 20;

export default function BookingsPage() {
  const storeBookings = useAppStore(s => s.bookings);
  const storeInstructors = useAppStore(s => s.instructors);
  const [timeframe, setTimeframe] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [instFilter, setInstFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [cancelScope, setCancelScope] = useState<"single" | "series" | "confirm-single" | "confirm-series">("single");
  const [cancelNote, setCancelNote] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", instructorId: "", duration: "60" });
  const storeAvailability = useAppStore(s => s.availability);
  const storeBlackouts = useAppStore(s => s.blackouts);
  const activeInstructors = useMemo(() => storeInstructors.filter(i => i.isActive), [storeInstructors]);
  const blackoutDates = useMemo(() => new Set(storeBlackouts.map(b => b.date)), [storeBlackouts]);

  const rescheduleAvailDates = useMemo(() => {
    if (!editBooking) return [];
    return storeAvailability
      .filter(a => a.instructorId === editForm.instructorId && a.date > TODAY && a.slots.length > 0 && !blackoutDates.has(a.date))
      .map(a => a.date)
      .sort();
  }, [storeAvailability, editForm.instructorId, editBooking, blackoutDates]);

  const facilitySettings = useAppStore(s => s.facilitySettings);

  const rescheduleAvailSlots = useMemo(() => {
    if (!editBooking) return [];
    const av = storeAvailability.find(a => a.instructorId === editForm.instructorId && a.date === editForm.date);
    if (!av) return [];
    const dur = editBooking.durationMinutes;
    const LANE_TOTAL = facilitySettings.activeLanes ?? 4;
    const laneInstructorIds = new Set(storeInstructors.filter(i => i.instructor_type !== "non_lane").map(i => i.id));
    return av.slots.filter(slot => {
      const [sh, sm] = slot.split(":").map(Number);
      const slotStart = sh * 60 + sm;
      const slotEnd = slotStart + dur;
      // Must fit within instructor's availability window
      if (av.endTime) {
        const [eh, em] = av.endTime.split(":").map(Number);
        if (slotEnd > eh * 60 + em) return false;
      }
      // Instructor conflict
      const instructorConflict = storeBookings.some(b =>
        b.id !== editBooking.id &&
        b.instructorId === editForm.instructorId &&
        b.date === editForm.date &&
        b.status === "confirmed" &&
        (() => {
          const [bh, bm] = b.startTime.split(":").map(Number);
          const [eh, em] = b.endTime.split(":").map(Number);
          return slotStart < eh * 60 + em && slotEnd > bh * 60 + bm;
        })()
      );
      if (instructorConflict) return false;
      // Lane capacity
      const laneCount = storeBookings.filter(b =>
        b.id !== editBooking.id &&
        b.date === editForm.date &&
        b.status === "confirmed" &&
        laneInstructorIds.has(b.instructorId) &&
        (() => {
          const [bh, bm] = b.startTime.split(":").map(Number);
          const [eh, em] = b.endTime.split(":").map(Number);
          return slotStart < eh * 60 + em && slotEnd > bh * 60 + bm;
        })()
      ).length;
      if (laneCount >= LANE_TOTAL) return false;
      return true;
    });
  }, [storeAvailability, editForm.instructorId, editForm.date, editBooking, storeBookings, storeInstructors, facilitySettings]);

  const filtered = useMemo(() => storeBookings.filter(b => {
    if (timeframe === "upcoming" && b.date < TODAY) return false;
    if (timeframe === "past" && b.date >= TODAY) return false;
    const q = search.toLowerCase();
    if (q && !b.customerName.toLowerCase().includes(q) && !b.bookingReference.toLowerCase().includes(q)) return false;
    if (instFilter !== "all" && b.instructorId !== instFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (dateFrom && b.date < dateFrom) return false;
    if (dateTo && b.date > dateTo) return false;
    return true;
  }).sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)),
  [storeBookings, timeframe, search, instFilter, statusFilter, dateFrom, dateTo]);

  function handleCancel() {
    if (!selected) return;
    const cancelSeries = cancelScope === "series" || cancelScope === "confirm-series";
    if (cancelSeries && selected.recurringSeriesId) {
      const cancelled = db.cancelSeries(selected.recurringSeriesId, TODAY, "admin", cancelNote || undefined);
      cancelled.forEach(b => {
        const customer = db.getCustomers().find(c => c.id === b.customerId);
        notifyBoth(db, {
          bookingId: b.id, bookingReference: b.bookingReference,
          recipientName: b.customerName, recipientEmail: customer?.email ?? "",
          notificationType: "cancellation", customerId: b.customerId,
        });
      });
    } else {
      db.cancelBooking(selected.id, "admin", cancelNote || undefined);
      const customer = db.getCustomers().find(c => c.id === selected.customerId);
      notifyBoth(db, {
        bookingId: selected.id, bookingReference: selected.bookingReference,
        recipientName: selected.customerName, recipientEmail: customer?.email ?? "",
        notificationType: "cancellation", customerId: selected.customerId,
      });
    }
    setToast({ message: cancelSeries ? "All series sessions cancelled." : "Booking cancelled.", type: "success" });
    setSelected(null);
    setCancelNote("");
    setCancelScope("single");
  }

  function handleConfirmWaitlisted() {
    if (!selected) return;
    db.confirmWaitlisted(selected.id);
    const customer = db.getCustomers().find(c => c.id === selected.customerId);
    notifyBoth(db, {
      bookingId: selected.id, bookingReference: selected.bookingReference,
      recipientName: selected.customerName, recipientEmail: customer?.email ?? "",
      notificationType: "confirmation", customerId: selected.customerId,
    });
    setToast({ message: "Waitlisted session confirmed.", type: "success" });
    setSelected(null);
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
    db.updateBooking(editBooking.id, { date: editForm.date, startTime: editForm.time, durationMinutes: dur });
    const customer = db.getCustomers().find(c => c.id === editBooking.customerId);
    notifyBoth(db, {
      bookingId: editBooking.id, bookingReference: editBooking.bookingReference,
      recipientName: editBooking.customerName, recipientEmail: customer?.email ?? "",
      notificationType: "change", customerId: editBooking.customerId,
    });
    setToast({ message: "Booking rescheduled.", type: "success" });
    setEditBooking(null);
  }

  function exportCSV() {
    const headers = ["Reference", "Customer", "Instructor", "Date", "Time", "Duration (min)", "Type", "Booked By", "Relationship", "Child's Age", "Status"];
    const rows = filtered.map(b => [
      b.bookingReference,
      b.customerName,
      b.instructorName,
      b.date,
      b.startTime,
      b.durationMinutes,
      b.isRecurring ? "Recurring" : "Single-session",
      b.bookedByName ?? "",
      b.relationshipToCustomer ?? "",
      b.childAge ?? "",
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

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#212529]">Bookings</h1>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(["upcoming", "past"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTimeframe(t); setPage(1); }}
                className={`px-4 py-1.5 font-medium transition-colors capitalize ${
                  timeframe === t ? "bg-[#337C99] text-white" : "bg-white text-[#6c757d] hover:text-[#212529]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm">Export CSV</button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
        <input className="input w-56 text-sm py-1.5" placeholder="Search by name or reference…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input w-44 text-sm py-1.5" value={instFilter} onChange={e => { setInstFilter(e.target.value); setPage(1); }}>
          <option value="all">All Instructors</option>
          {activeInstructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
        </select>
        <select className="input w-36 text-sm py-1.5" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
          <option value="completed">Completed</option>
          <option value="waitlisted">Waitlisted</option>
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
              {["Reference","Customer","Instructor","Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide whitespace-nowrap">
                <div>Time /</div>
                <div className="font-normal normal-case tracking-normal text-[#6c757d]/70">Duration</div>
              </th>
              {["Type","Child","Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">
                <div>Booked By /</div>
                <div className="font-normal normal-case tracking-normal text-[#6c757d]/70">Relationship</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6c757d] text-sm">No bookings found</td></tr>
            ) : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(b => (
              <tr key={b.id} onClick={() => { setSelected(b); setCancelScope("single"); setCancelNote(""); }} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs text-[#337C99]">{b.bookingReference}</td>
                <td className="px-4 py-3 font-medium text-[#212529]">{b.customerName}</td>
                <td className="px-4 py-3 text-[#6c757d]">{b.instructorName}</td>
                <td className="px-4 py-3 text-[#6c757d] whitespace-nowrap">{formatDate(b.date)}</td>
                <td className="px-4 py-3 text-[#6c757d]">
                  <div className="whitespace-nowrap">{formatTime(b.startTime)} – {formatTime(b.endTime)} /</div>
                  <div className="text-xs">{b.durationMinutes} min</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {b.isRecurring
                      ? <span className="badge-blue">Recurring</span>
                      : <span className="badge-orange" style={{ color: "#131313" }}>Single-session</span>}
                    {b.isForChild && <span className="text-[#6c757d] text-xs">/</span>}
                  </div>
                  {b.isForChild && <span className="badge-purple mt-0.5">Child</span>}
                </td>
                <td className="px-4 py-3 text-[#6c757d]">
                  {b.isForChild ? (
                    <>
                      {b.childName && <div className="text-[#212529] font-medium text-sm">{b.childName}</div>}
                      {b.childAge && <div className="text-xs">Age {b.childAge}</div>}
                    </>
                  ) : <span>—</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} conflictReason={b.conflictReason} /></td>
                <td className="px-4 py-3 text-[#6c757d]">
                  {b.isForChild && b.bookedByName ? (
                    <>
                      <div className="text-[#212529] font-medium">{b.bookedByName} /</div>
                      <div className="text-xs capitalize">{b.relationshipToCustomer}</div>
                    </>
                  ) : <span>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(() => {
          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
              <span className="text-[#6c757d]">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40">←</button>
                <span className="px-3 text-[#6c757d]">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40">→</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal title={`Booking ${selected.bookingReference}`} onClose={() => setSelected(null)}
          footer={
            <>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              {selected.status === "waitlisted" && (
                <button onClick={handleConfirmWaitlisted} className="btn-primary">
                  Confirm Session
                </button>
              )}
              {selected.status === "confirmed" && (
                <>
                  <button onClick={() => openEdit(selected)} className="btn-secondary">Reschedule</button>
                  {!cancelScope.startsWith("confirm") ? (
                    <button
                      onClick={() => selected.isRecurring ? setCancelScope("confirm-single") : handleCancel()}
                      className="btn-danger"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <button onClick={handleCancel} className="btn-danger">Confirm Cancel</button>
                  )}
                </>
              )}
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <Row label="Customer" value={selected.customerName} />
            <Row label="Instructor" value={selected.instructorName} />
            <Row label="Date" value={formatDate(selected.date)} />
            <Row label="Time" value={`${formatTime(selected.startTime)} – ${formatTime(selected.endTime)}`} />
            <Row label="Duration" value={`${selected.durationMinutes} min`} />
            {selected.laneAssigned && <Row label="Lane" value={`Lane ${selected.laneAssigned}`} />}
            {selected.isForChild && (
              <>
                {selected.childName && <Row label="Child's Name" value={selected.childName} />}
                <Row label="Child's Age" value={`${selected.childAge} yrs`} />
                <Row label="Booked By" value={selected.bookedByName ?? selected.customerName} />
                <Row label="Relationship" value={selected.relationshipToCustomer ?? ""} />
              </>
            )}
            <div className="flex gap-1 flex-wrap pt-1">
              {selected.isRecurring
                ? <span className="badge-blue">Recurring</span>
                : <span className="badge-orange" style={{ color: "#131313" }}>Single-session</span>}
              {selected.isForChild && <span className="badge-purple">Child</span>}
            </div>
            {selected.isRecurring && selected.status === "confirmed" && cancelScope.startsWith("confirm") && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <p className="font-medium text-[#212529]">What would you like to cancel?</p>
                {(["confirm-single", "confirm-series"] as const).map(scope => (
                  <label key={scope} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <input type="radio" checked={cancelScope === scope} onChange={() => setCancelScope(scope)} />
                    <div>
                      <p className="font-medium text-[#212529] text-sm">
                        {scope === "confirm-single" ? "This session only" : "All sessions in this series"}
                      </p>
                      <p className="text-xs text-[#6c757d]">
                        {scope === "confirm-single"
                          ? `Cancels the ${formatDate(selected.date)} session. Future sessions continue as scheduled.`
                          : "Cancels this and all remaining upcoming sessions in the series."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selected.status === "confirmed" && cancelScope.startsWith("confirm") && (
              <div className="pt-2">
                <label className="label">Cancellation Note <span className="text-[#6c757d] font-normal">(optional)</span></label>
                <textarea className="input resize-none" rows={2} value={cancelNote} onChange={e => setCancelNote(e.target.value)} placeholder="Reason for cancellation…" />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Booking Modal */}
      {editBooking && (
        <Modal title={`Reschedule Booking ${editBooking.bookingReference}`} onClose={() => setEditBooking(null)}
          footer={
            <>
              <button onClick={() => setEditBooking(null)} className="btn-secondary">Cancel</button>
              <button form="edit-booking-form" type="submit" className="btn-primary">Save Changes</button>
            </>
          }
        >
          <form id="edit-booking-form" onSubmit={handleEdit} className="space-y-4">
            {editBooking.isRecurring && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-medium mb-0.5">Part of a recurring series</p>
                <p>Rescheduling applies to this session only. To move the full series, cancel it and re-book a new recurring series.</p>
              </div>
            )}
            <div>
              <label className="label">Instructor</label>
              <p className="input bg-gray-50 text-[#6c757d] cursor-default">{editBooking.instructorName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date</label>
                <select
                  className="input"
                  required
                  value={editForm.date}
                  onChange={e => setEditForm(f => ({ ...f, date: e.target.value, time: "" }))}
                >
                  <option value="">— Select a date —</option>
                  {rescheduleAvailDates.map(d => (
                    <option key={d} value={d}>{formatDate(d)}</option>
                  ))}
                  {rescheduleAvailDates.length === 0 && (
                    <option disabled>No upcoming availability</option>
                  )}
                </select>
              </div>
              <div>
                <label className="label">Time</label>
                <select
                  className="input"
                  required
                  value={editForm.time}
                  onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                  disabled={!editForm.date}
                >
                  <option value="">— Select a time —</option>
                  {rescheduleAvailSlots.map(slot => (
                    <option key={slot} value={slot}>{formatTime(slot)}</option>
                  ))}
                  {rescheduleAvailSlots.length === 0 && editForm.date && (
                    <option disabled>No slots available for this date</option>
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Duration</label>
              <p className="input bg-gray-50 text-[#6c757d] cursor-default">{editForm.duration} minutes</p>
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
