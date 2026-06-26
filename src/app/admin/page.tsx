"use client";
import { useState } from "react";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import { MOCK_CUSTOMERS } from "@/data/mock/customers";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { INSTRUCTOR_AVAILABILITY } from "@/data/mock/schedule";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import type { Booking } from "@/data/mock/bookings";


const TIME_SLOTS: string[] = [];
for (let h = 9; h < 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const INSTRUCTOR_COLORS: Record<string, string> = {
  i1:  "bg-blue-100 border-blue-300 text-blue-800",
  i2:  "bg-purple-100 border-purple-300 text-purple-800",
  i3:  "bg-green-100 border-green-300 text-green-800",
  i5:  "bg-rose-100 border-rose-300 text-rose-800",
  i6:  "bg-orange-100 border-orange-300 text-orange-800",
  i7:  "bg-cyan-100 border-cyan-300 text-cyan-800",
  i8:  "bg-amber-100 border-amber-300 text-amber-800",
  i9:  "bg-indigo-100 border-indigo-300 text-indigo-800",
  i10: "bg-teal-100 border-teal-300 text-teal-800",
  i11: "bg-pink-100 border-pink-300 text-pink-800",
};

const INSTRUCTOR_ACCENT: Record<string, string> = {
  i1:  "#3b82f6",
  i2:  "#a855f7",
  i3:  "#22c55e",
  i5:  "#f43f5e",
  i6:  "#f97316",
  i7:  "#06b6d4",
  i8:  "#eab308",
  i9:  "#6366f1",
  i10: "#14b8a6",
  i11: "#ec4899",
};

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}-${day}-${y}`;
}

const SLOT_HEIGHT = 56;

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function timeToTop(t: string) {
  return ((timeToMins(t) - 9 * 60) / 30) * SLOT_HEIGHT;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelScope, setCancelScope] = useState<"single" | "series" | "confirm-single" | "confirm-series">("single");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", instructorId: "", duration: "60" });
  const [rescheduleScope, setRescheduleScope] = useState<"single" | "series">("single");

  const today = new Date().toISOString().slice(0, 10);
  const activeInstructors = MOCK_INSTRUCTORS.filter(i => i.isActive);
  const todayBookings = bookings.filter(b => b.date === today && b.status !== "cancelled");
  const filteredTodayBookings = instructorFilter === "all" ? todayBookings : todayBookings.filter(b => b.instructorId === instructorFilter);

  function openEdit(b: Booking) {
    setEditBooking(b);
    setEditForm({ date: b.date, time: b.startTime, instructorId: b.instructorId, duration: String(b.durationMinutes) });
    setRescheduleScope("single");
    setSelectedBooking(null);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editBooking) return;
    const dur = parseInt(editForm.duration) as 30 | 60;
    const [h, m] = editForm.time.split(":").map(Number);
    const endTotal = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
    const instructor = activeInstructors.find(i => i.id === editForm.instructorId);
    const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : editBooking.instructorName;

    if (rescheduleScope === "series" && editBooking.recurringSeriesId) {
      setBookings(prev => prev.map(b => {
        if (b.recurringSeriesId !== editBooking.recurringSeriesId || b.date < today) return b;
        const sessionEnd = h * 60 + m + dur;
        return {
          ...b,
          startTime: editForm.time,
          endTime: `${String(Math.floor(sessionEnd / 60)).padStart(2, "0")}:${String(sessionEnd % 60).padStart(2, "0")}`,
          durationMinutes: dur,
          instructorId: editForm.instructorId,
          instructorName,
        };
      }));
      setToast({ message: "All upcoming sessions in this series have been updated.", type: "success" });
    } else {
      setBookings(prev => prev.map(b => b.id !== editBooking.id ? b : {
        ...b,
        date: editForm.date,
        startTime: editForm.time,
        endTime,
        durationMinutes: dur,
        instructorId: editForm.instructorId,
        instructorName,
      }));
      const av = INSTRUCTOR_AVAILABILITY.find(a => a.instructorId === editForm.instructorId && a.date === editForm.date);
      const available = av?.slots.includes(editForm.time) ?? false;
      setToast({
        message: available ? "Booking rescheduled." : "Booking rescheduled. Note: instructor availability not confirmed for this slot.",
        type: available ? "success" : "info",
      });
    }
    setEditBooking(null);
  }

  function handleCancelBooking() {
    if (!selectedBooking) return;
    const cancelSeries = cancelScope === "series" || cancelScope === "confirm-series";
    setBookings(prev => prev.map(b => {
      if (cancelSeries && selectedBooking.recurringSeriesId && b.recurringSeriesId === selectedBooking.recurringSeriesId) {
        return { ...b, status: "cancelled" as const, cancelledBy: "admin" as const };
      }
      if (b.id === selectedBooking.id) {
        return { ...b, status: "cancelled" as const, cancelledBy: "admin" as const };
      }
      return b;
    }));
    setToast({ message: cancelSeries ? "All series sessions cancelled." : "Booking cancelled.", type: "success" });
    setSelectedBooking(null);
    setCancelScope("single");
  }


  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();  // 297mm
    const pageH = pdf.internal.pageSize.getHeight(); // 210mm
    const margin = 8;
    const timeColW = 18;
    const contentX = margin + timeColW;
    const contentW = pageW - contentX - margin;

    // ── Same instructor-column layout as the UI ────────────────────────────
    const ACCENT_RGB: Record<string, [number, number, number]> = {
      i1:  [59, 130, 246],  i2:  [168, 85, 247],  i3:  [34, 197, 94],   i5:  [244, 63, 94],
      i6:  [249, 115, 22],  i7:  [6, 182, 212],   i8:  [234, 179, 8],   i9:  [99, 102, 241],
      i10: [20, 184, 166],  i11: [236, 72, 153],
    };
    const BG_RGB: Record<string, [number, number, number]> = {
      i1:  [219, 234, 254], i2:  [243, 232, 255], i3:  [220, 252, 231], i5:  [255, 228, 230],
      i6:  [255, 237, 213], i7:  [207, 250, 254], i8:  [254, 243, 199], i9:  [224, 231, 255],
      i10: [204, 251, 241], i11: [252, 231, 243],
    };

    // Build instructor column map from the visible bookings (mirrors UI logic)
    const instrMap = new Map<string, string>();
    filteredTodayBookings.forEach(b => instrMap.set(b.instructorId, b.instructorName));
    const instrList = Array.from(instrMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    const numCols = Math.max(1, instrList.length);
    const colIdx = new Map(instrList.map(([id], i) => [id, i]));
    const colW = contentW / numCols;

    // ── Title ──────────────────────────────────────────────────────────────
    const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(33, 37, 41);
    pdf.text(`DSA Daily Schedule — ${dateStr}`, margin, margin + 4);

    // ── Coach legend (only instructors visible in current filter) ──────────
    let lx = margin;
    let legendY = margin + 9;
    instrList.forEach(([id, name], idx) => {
      if (idx > 0 && idx % 5 === 0) { lx = margin; legendY += 6; }
      const ac = ACCENT_RGB[id] || [156, 163, 175] as [number, number, number];
      pdf.setFillColor(ac[0], ac[1], ac[2]);
      pdf.circle(lx + 1.5, legendY - 1.2, 1.5, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(80, 80, 80);
      pdf.text(name, lx + 4.5, legendY - 0.2);
      lx += 46;
    });

    // ── Schedule grid ──────────────────────────────────────────────────────
    const gridY = legendY + 8;
    const gridH = pageH - gridY - margin;
    const slotH = gridH / TIME_SLOTS.length;

    // Vertical column dividers
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.3);
    for (let c = 0; c <= numCols; c++) {
      const cx = contentX + c * colW;
      pdf.line(cx, gridY, cx, gridY + gridH);
    }

    // Time labels + horizontal grid lines
    TIME_SLOTS.forEach((slot, idx) => {
      const y = gridY + idx * slotH;
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.1);
      pdf.line(contentX, y, contentX + contentW, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(108, 117, 125);
      pdf.text(formatTime(slot), margin, y + slotH * 0.55);
    });

    // ── Booking cards — same column logic as UI ────────────────────────────
    filteredTodayBookings.forEach(b => {
      const ci = colIdx.get(b.instructorId) ?? 0;
      const slotIndex = (timeToMins(b.startTime) - 9 * 60) / 30;
      const cardY = gridY + slotIndex * slotH + 0.4;
      const cardH = (b.durationMinutes / 30) * slotH - 0.8;
      const cardX = contentX + ci * colW + 0.5;
      const cardW = colW - 1;

      const bg = BG_RGB[b.instructorId] || [243, 244, 246] as [number, number, number];
      const accent = ACCENT_RGB[b.instructorId] || [156, 163, 175] as [number, number, number];

      // Card fill + border
      pdf.setFillColor(bg[0], bg[1], bg[2]);
      pdf.setDrawColor(bg[0] - 20, bg[1] - 20, bg[2] - 20);
      pdf.setLineWidth(0.15);
      pdf.rect(cardX, cardY, cardW, cardH, "FD");

      // Left accent stripe
      pdf.setFillColor(accent[0], accent[1], accent[2]);
      pdf.rect(cardX, cardY, 1.5, cardH, "F");

      const textX = cardX + 3;
      const fs = Math.min(7.5, Math.max(5, slotH * 0.42));
      const lineH = fs * 0.3528 * 1.4;
      const line1Y = cardY + lineH * 0.6 + lineH;
      const line2Y = line1Y + lineH;
      const maxW = cardW - 4;

      const fitText = (text: string, fontSize: number): string => {
        pdf.setFontSize(fontSize);
        if (pdf.getTextWidth(text) <= maxW) return text;
        let t = text;
        while (t.length > 1 && pdf.getTextWidth(t.slice(0, -1) + "…") > maxW) t = t.slice(0, -1);
        return t + "…";
      };

      // Line 1: coach name · duration (bold — matches UI top line)
      if (line1Y < cardY + cardH) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(fs);
        pdf.setTextColor(33, 37, 41);
        pdf.text(fitText(`${b.instructorName} · ${b.durationMinutes} mins`, fs), textX, line1Y);
      }

      // Line 2: trainee name (matches UI second line)
      if (line2Y < cardY + cardH) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(fs - 0.5);
        pdf.setTextColor(90, 90, 90);
        pdf.text(fitText(`${b.customerName}${b.isRecurring ? " 🔁" : ""}`, fs - 0.5), textX, line2Y);
      }
    });

    pdf.save(`DSA-schedule-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const stats = [
    { label: "Bookings Today", value: todayBookings.length },
    { label: "Active Customers", value: MOCK_CUSTOMERS.filter(c => c.isActive).length },
    { label: "Active Instructors", value: MOCK_INSTRUCTORS.filter(i => i.isActive).length },
  ];

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">Today's Bookings</h1>
        <button onClick={handleExportPDF} className="btn-secondary text-sm">↓ Download Schedule</button>
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
      <div className="flex items-center gap-3 mb-4 flex-wrap">
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
        <div className="flex items-center gap-4 ml-2">
          {activeInstructors.filter(i => INSTRUCTOR_ACCENT[i.id]).map(i => (
            <span key={i.id} className="flex items-center gap-1.5 text-xs text-[#6c757d]">
              <span
                className={`w-5 h-3.5 rounded-sm border flex-shrink-0 ${INSTRUCTOR_COLORS[i.id]}`}
                style={{ borderLeftColor: INSTRUCTOR_ACCENT[i.id], borderLeftWidth: 3 }}
              />
              {i.firstName} {i.lastName}
            </span>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
          <div className="flex overflow-x-auto">
            {/* Time labels — sticky so they stay visible on horizontal scroll */}
            <div className="flex-shrink-0 border-r border-gray-200 sticky left-0 bg-white z-10"
              style={{ width: 80, height: TIME_SLOTS.length * SLOT_HEIGHT }}>
              {TIME_SLOTS.map(slot => (
                <div
                  key={slot}
                  className="border-b border-gray-100 px-3 text-xs text-[#6c757d] font-mono flex items-start pt-1.5"
                  style={{ height: SLOT_HEIGHT }}
                >
                  {formatTime(slot)}
                </div>
              ))}
            </div>

            {/* Booking area — min 120px per instructor column, scrolls horizontally */}
            {(() => {
              const instrMap = new Map<string, string>();
              filteredTodayBookings.forEach(b => instrMap.set(b.instructorId, b.instructorName));
              const instrList = Array.from(instrMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
              const numCols = Math.max(1, instrList.length);
              const colIdx = new Map(instrList.map(([id], i) => [id, i]));
              const MIN_COL_W = 120;
              return (
                <div className="relative flex-1" style={{ minWidth: numCols * MIN_COL_W, height: TIME_SLOTS.length * SLOT_HEIGHT }}>
                  {TIME_SLOTS.map((slot, i) => (
                    <div key={slot} className="absolute w-full border-b border-gray-100"
                      style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }} />
                  ))}
                  {filteredTodayBookings.map(b => {
                    const ci = colIdx.get(b.instructorId) ?? 0;
                    return (
                      <button
                        key={b.id}
                        onClick={() => { setSelectedBooking(b); setCancelScope("single"); }}
                        className={`absolute rounded border text-xs text-left overflow-hidden px-2 py-1 ${INSTRUCTOR_COLORS[b.instructorId] || "bg-gray-100 border-gray-300 text-gray-700"}`}
                        style={{
                          top: timeToTop(b.startTime) + 2,
                          height: (b.durationMinutes / 30) * SLOT_HEIGHT - 4,
                          left: `calc(${(ci / numCols) * 100}% + 4px)`,
                          width: `calc(${(1 / numCols) * 100}% - 8px)`,
                          borderLeftColor: INSTRUCTOR_ACCENT[b.instructorId] || "#9ca3af",
                          borderLeftWidth: 4,
                        }}
                      >
                        <div className="font-bold leading-tight underline">{b.instructorName} · {b.durationMinutes} mins</div>
                        <div className="opacity-80 leading-tight text-[11px] mt-0.5">
                          {b.customerName}{b.isRecurring && " 🔁"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
      </div>

      {/* Reschedule Modal */}
      {editBooking && (
        <Modal title={`Reschedule Booking ${editBooking.bookingReference}`} onClose={() => setEditBooking(null)}
          footer={
            <>
              <button onClick={() => setEditBooking(null)} className="btn-secondary">Cancel</button>
              <button form="reschedule-form" type="submit" className="btn-primary">Save Changes</button>
            </>
          }
        >
          <form id="reschedule-form" onSubmit={handleEdit} className="space-y-4">
            {editBooking.isRecurring && (
              <div className="space-y-2">
                <label className="label">Apply changes to</label>
                {(["single", "series"] as const).map(scope => (
                  <label key={scope} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <input type="radio" checked={rescheduleScope === scope} onChange={() => setRescheduleScope(scope)} />
                    <div>
                      <p className="font-medium text-[#212529] text-sm">
                        {scope === "single" ? "This session only" : "All upcoming sessions in this series"}
                      </p>
                      <p className="text-xs text-[#6c757d]">
                        {scope === "single"
                          ? "Only this booking will be updated. Other sessions in the series stay as scheduled."
                          : "Time, instructor, and duration will update for all future sessions. Each session keeps its original date."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  Date{rescheduleScope === "series" && <span className="text-[#6c757d] font-normal"> (this session only)</span>}
                </label>
                <input className="input" type="date" required value={editForm.date} disabled={rescheduleScope === "series"} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Time</label>
                <select className="input" required value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}>
                  {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{formatTime(slot)}</option>)}
                </select>
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

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          title={`Booking ${selectedBooking.bookingReference}`}
          onClose={() => setSelectedBooking(null)}
          footer={
            <>
              <button onClick={() => setSelectedBooking(null)} className="btn-secondary">Close</button>
              <button onClick={() => openEdit(selectedBooking)} className="btn-secondary">Reschedule</button>
              {!cancelScope.startsWith("confirm") ? (
                <button
                  onClick={() => selectedBooking.isRecurring ? setCancelScope("confirm-single") : handleCancelBooking()}
                  className="btn-danger"
                >
                  Cancel Booking
                </button>
              ) : (
                <button onClick={handleCancelBooking} className="btn-danger">Confirm Cancel</button>
              )}
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <Row label="Customer" value={selectedBooking.customerName} />
            <Row label="Instructor" value={selectedBooking.instructorName} />
            <Row label="Date" value={formatDate(selectedBooking.date)} />
            <Row label="Time" value={`${formatTime(selectedBooking.startTime)} – ${formatTime(selectedBooking.endTime)}`} />
            <Row label="Duration" value={`${selectedBooking.durationMinutes} min`} />
            {selectedBooking.isForChild && (
              <Row label="Child" value={`Age ${selectedBooking.childAge} (${selectedBooking.relationshipToCustomer})`} />
            )}
            <div className="flex gap-1 flex-wrap pt-1">
              {selectedBooking.isRecurring
                ? <span className="badge-blue">Recurring series</span>
                : <span className="badge-orange" style={{ color: "#131313" }}>Single-session</span>}
              {selectedBooking.isForChild && <span className="badge-purple">Child</span>}
            </div>
            {selectedBooking.isRecurring && cancelScope.startsWith("confirm") && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <p className="font-medium text-[#212529]">What would you like to cancel?</p>
                <div className="flex flex-col gap-2">
                  {(["confirm-single", "confirm-series"] as const).map(scope => (
                    <label key={scope} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <input type="radio" checked={cancelScope === scope} onChange={() => setCancelScope(scope)} />
                      <div>
                        <p className="font-medium text-[#212529] text-sm">
                          {scope === "confirm-single" ? "This session only" : "All sessions in this series"}
                        </p>
                        <p className="text-xs text-[#6c757d]">
                          {scope === "confirm-single"
                            ? `Cancels the ${formatDate(selectedBooking.date)} session. Future sessions continue as scheduled.`
                            : "Cancels this and all remaining upcoming sessions in the series."}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
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
