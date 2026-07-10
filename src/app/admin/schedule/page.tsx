"use client";
import { useState } from "react";
import { db } from "@/data/service";
import { notifyBoth } from "@/data/service/notifyUtils";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import type { OperatingHours, Booking } from "@/data/types";
import { Plus, X } from "lucide-react";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function formatTime(t: string) {
  if (t === "24:00") return "12:00 AM (Midnight)";
  const [h, m] = t.split(":").map(Number);
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// 6:00 AM → 12:00 AM (Midnight) in 30-min increments
const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const opts = [];
  for (let h = 6; h <= 24; h++) {
    for (const m of [0, 30]) {
      if (h === 24 && m === 30) break;
      const value = `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
      const label = h === 24 ? "12:00 AM (Midnight)" : formatTime(value);
      opts.push({ value, label });
    }
  }
  return opts;
})();

type Tab = "hours" | "blackouts";

export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>("hours");
  const [hours, setHours] = useState(db.getOperatingHours());
  const [blackouts, setBlackouts] = useState(db.getBlackouts());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [newBlackout, setNewBlackout] = useState({ date: "", reason: "", isRecurring: false });
  const [editHours, setEditHours] = useState<Record<string, Partial<OperatingHours>>>({});
  const [affectedBookings, setAffectedBookings] = useState<Booking[]>([]);
  const [showAffectedModal, setShowAffectedModal] = useState(false);
  const [affectedReason, setAffectedReason] = useState<"hours" | "blackout">("hours");
  const [pendingHours, setPendingHours] = useState<OperatingHours[] | null>(null);
  const [pendingBlackout, setPendingBlackout] = useState<{ date: string; reason: string; isRecurring: boolean } | null>(null);

  function updateHour(id: string, field: keyof OperatingHours, value: string | boolean) {
    setEditHours(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function getHour(oh: OperatingHours, field: keyof OperatingHours) {
    const override = editHours[oh.id];
    if (override && field in override) return override[field as keyof typeof override];
    return oh[field];
  }

  function affectedByHours(newHours: OperatingHours[]): Booking[] {
    return db.getBookings({ status: "confirmed" }).filter(b => {
      const dow = new Date(b.date + "T00:00:00").getDay();
      const oh = newHours.find(h => h.dayOfWeek === DAY_NAMES[dow]);
      if (!oh) return false;
      return oh.isClosed || b.startTime < oh.openTime || b.startTime >= oh.closeTime;
    });
  }

  function saveHours() {
    const newHours = hours.map(oh => {
      const override = editHours[oh.id];
      return override ? { ...oh, ...override } : oh;
    });
    const affected = affectedByHours(newHours);
    if (affected.length > 0) {
      setPendingHours(newHours);
      setAffectedBookings(affected);
      setAffectedReason("hours");
      setShowAffectedModal(true);
    } else {
      newHours.forEach(oh => db.updateOperatingHours(oh.id, oh));
      setHours(db.getOperatingHours());
      setEditHours({});
      setToast({ message: "Operating hours saved.", type: "success" });
    }
  }

  function confirmSaveHours() {
    if (!pendingHours) return;
    pendingHours.forEach(oh => db.updateOperatingHours(oh.id, oh));
    setHours(db.getOperatingHours());
    setEditHours({});
    setPendingHours(null);
    setShowAffectedModal(false);
    setToast({ message: "Operating hours saved. Affected bookings require manual action.", type: "info" });
  }

  function dismissAffectedModal() {
    setPendingHours(null);
    setPendingBlackout(null);
    setShowAffectedModal(false);
  }

  function removeBlackout(id: string) {
    db.deleteBlackout(id);
    setBlackouts(db.getBlackouts());
    setToast({ message: "Blackout removed.", type: "info" });
  }

  function addBlackout(e: React.FormEvent) {
    e.preventDefault();
    const { date, reason, isRecurring } = newBlackout;
    // Check confirmed + waitlisted bookings BEFORE saving the blackout
    const allBookings = db.getBookings();
    const affected = allBookings.filter(
      b => b.date === date && (b.status === "confirmed" || b.status === "waitlisted")
    );
    if (affected.length > 0) {
      setPendingBlackout({ date, reason, isRecurring });
      setAffectedBookings(affected);
      setAffectedReason("blackout");
      setNewBlackout({ date: "", reason: "", isRecurring: false });
      setShowAddBlackout(false);
      setShowAffectedModal(true);
    } else {
      db.createBlackout({ date, reason, isRecurring });
      setBlackouts(db.getBlackouts());
      setNewBlackout({ date: "", reason: "", isRecurring: false });
      setShowAddBlackout(false);
      setToast({ message: "Blackout date added.", type: "success" });
    }
  }

  function cancelAllBlackoutBookings() {
    // Save the blackout first
    if (pendingBlackout) {
      db.createBlackout(pendingBlackout);
      setBlackouts(db.getBlackouts());
    }
    // Cancel every affected booking and log a notification for each
    const count = affectedBookings.length;
    affectedBookings.forEach(b => {
      db.cancelBooking(b.id, "admin", "Session cancelled — facility blackout date");
      const customer = db.getCustomers().find(c => c.id === b.customerId);
      notifyBoth(db, {
        bookingId: b.id,
        bookingReference: b.bookingReference,
        recipientName: b.customerName,
        recipientEmail: customer?.email ?? "",
        notificationType: "cancellation",
        customerId: b.customerId,
      });
    });
    setPendingBlackout(null);
    setShowAffectedModal(false);
    setAffectedBookings([]);
    setToast({ message: `Blackout added. ${count} booking${count !== 1 ? "s" : ""} cancelled and customers notified.`, type: "info" });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "hours", label: "Operating Hours" },
    { key: "blackouts", label: "Blackout Dates" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-[#212529] mb-6">Schedule & Availability</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[#337C99] text-[#337C99]"
                : "border-transparent text-[#6c757d] hover:text-[#212529]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Operating Hours */}
      {tab === "hours" && (
        <div className="card overflow-x-auto">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-[#212529]">Weekly Operating Hours</h2>
            <button onClick={saveHours} className="btn-primary text-sm py-1.5">Save Changes</button>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {["Day", "Status", "Open", "Close"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hours.map(oh => {
                const isClosed = getHour(oh, "isClosed") as boolean;
                return (
                  <tr key={oh.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#212529] w-36">{oh.dayOfWeek}</td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!isClosed}
                          onChange={e => updateHour(oh.id, "isClosed", !e.target.checked)}
                          className="rounded"
                        />
                        <span className={isClosed ? "text-[#6c757d]" : "text-[#212529]"}>
                          {isClosed ? "Closed" : "Open"}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        disabled={isClosed}
                        value={(getHour(oh, "openTime") as string) ?? oh.openTime}
                        onChange={e => {
                          const newOpen = e.target.value;
                          updateHour(oh.id, "openTime", newOpen);
                          const curClose = (getHour(oh, "closeTime") as string) ?? oh.closeTime;
                          if (curClose <= newOpen) updateHour(oh.id, "closeTime", "");
                        }}
                        className="input text-sm py-1 w-44 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {TIME_OPTIONS.slice(0, -1).map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const curOpen = (getHour(oh, "openTime") as string) ?? oh.openTime;
                        const closeOpts = TIME_OPTIONS.filter(o => o.value > curOpen);
                        return (
                          <select
                            disabled={isClosed}
                            value={(getHour(oh, "closeTime") as string) ?? oh.closeTime}
                            onChange={e => updateHour(oh.id, "closeTime", e.target.value)}
                            className="input text-sm py-1 w-44 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <option value="">— Select close time —</option>
                            {closeOpts.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Blackout Dates */}
      {tab === "blackouts" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddBlackout(true)} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" />Add Blackout
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  {["Date", "Recurrence", "Reason", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blackouts.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6c757d]">No blackout dates</td></tr>
                ) : blackouts.map(bl => (
                  <tr key={bl.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#212529]">
                      {bl.isRecurring
                        ? new Date(`2000-${bl.date.slice(5)}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : new Date(`${bl.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {bl.isRecurring
                        ? <span className="badge-blue">Every year</span>
                        : <span className="badge-gray">One-time</span>}
                    </td>
                    <td className="px-4 py-3 text-[#6c757d]">{bl.reason}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeBlackout(bl.id)} className="text-[#6c757d] hover:text-[#f33b41]">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Affected Bookings Modal — blackout date conflicts */}
      {showAffectedModal && affectedReason === "blackout" && (
        <Modal
          title="Active Bookings on This Date"
          onClose={dismissAffectedModal}
          footer={
            <>
              <button onClick={dismissAffectedModal} className="btn-secondary">Don't Add Blackout</button>
              <button onClick={cancelAllBlackoutBookings} className="btn-danger">
                Add Blackout &amp; Cancel All {affectedBookings.length} Booking{affectedBookings.length !== 1 ? "s" : ""}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <strong>{affectedBookings.length} booking{affectedBookings.length !== 1 ? "s" : ""}</strong> ({affectedBookings.filter(b => b.status === "confirmed").length} confirmed, {affectedBookings.filter(b => b.status === "waitlisted").length} waitlisted) exist on this date. Adding the blackout will cancel all of them and send a cancellation email to each customer. This cannot be undone.
            </p>
            <AffectedTable bookings={affectedBookings} />
          </div>
        </Modal>
      )}

      {/* Affected Bookings Modal — for hours (save blocked until acknowledged) */}
      {showAffectedModal && affectedReason === "hours" && (
        <Modal
          title="Conflict — Unsaved Changes"
          onClose={dismissAffectedModal}
          footer={
            <>
              <button onClick={dismissAffectedModal} className="btn-secondary">Cancel (keep old hours)</button>
              <button onClick={confirmSaveHours} className="btn-danger">Save Hours Anyway</button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              The following confirmed bookings fall outside the updated operating hours. The hours will <strong>not</strong> be saved until you acknowledge. You must action these bookings or click "Save Hours Anyway" to proceed.
            </p>
            <AffectedTable bookings={affectedBookings} />
          </div>
        </Modal>
      )}

      {/* Add Blackout Modal */}
      {showAddBlackout && (
        <Modal
          title="Add Blackout Date"
          onClose={() => setShowAddBlackout(false)}
          footer={
            <>
              <button onClick={() => setShowAddBlackout(false)} className="btn-secondary">Cancel</button>
              <button form="blackout-form" type="submit" className="btn-primary">Add</button>
            </>
          }
        >
          <form id="blackout-form" onSubmit={addBlackout} className="space-y-4">
            <div>
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={newBlackout.date}
                onChange={e => setNewBlackout(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Reason</label>
              <input
                className="input"
                required
                placeholder="e.g. 4th of July, Christmas"
                value={newBlackout.reason}
                onChange={e => setNewBlackout(f => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBlackout.isRecurring}
                  onChange={e => setNewBlackout(f => ({ ...f, isRecurring: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-[#212529]">Repeat every year</span>
              </label>
              {newBlackout.isRecurring && (
                <p className="text-xs text-[#6c757d] mt-1.5 ml-6">
                  Only the month and day are used — this blackout will apply on {newBlackout.date ? new Date(`2000-${newBlackout.date.slice(5)}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "the selected date"} every year.
                </p>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AffectedTable({ bookings }: { bookings: Booking[] }) {
  function fmt(t: string) {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  }
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            {["Reference", "Customer", "Instructor", "Date", "Time"].map(h => (
              <th key={h} className="text-left px-3 py-2 font-medium text-[#6c757d]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map(b => (
            <tr key={b.id}>
              <td className="px-3 py-2 font-mono text-[#337C99]">{b.bookingReference}</td>
              <td className="px-3 py-2 text-[#212529]">{b.customerName}</td>
              <td className="px-3 py-2 text-[#6c757d]">{b.instructorName}</td>
              <td className="px-3 py-2 text-[#6c757d]">{b.date}</td>
              <td className="px-3 py-2 text-[#6c757d]">{fmt(b.startTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
