"use client";
import { useState } from "react";
import { OPERATING_HOURS, BLACKOUTS } from "@/data/mock/schedule";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import type { OperatingHours, Blackout } from "@/data/mock/schedule";
import type { Booking } from "@/data/mock/bookings";
import { Plus, X } from "lucide-react";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

type Tab = "hours" | "blackouts";

export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>("hours");
  const [hours, setHours] = useState(OPERATING_HOURS);
  const [blackouts, setBlackouts] = useState(BLACKOUTS);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [newBlackout, setNewBlackout] = useState({ date: "", reason: "", type: "facility" as "facility" | "instructor", instructorId: "" });
  const [editHours, setEditHours] = useState<Record<string, Partial<OperatingHours>>>({});
  const [affectedBookings, setAffectedBookings] = useState<Booking[]>([]);
  const [showAffectedModal, setShowAffectedModal] = useState(false);
  const [affectedReason, setAffectedReason] = useState<"hours" | "blackout">("hours");
  const [pendingHours, setPendingHours] = useState<OperatingHours[] | null>(null);

  function updateHour(id: string, field: keyof OperatingHours, value: string | boolean) {
    setEditHours(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function getHour(oh: OperatingHours, field: keyof OperatingHours) {
    const override = editHours[oh.id];
    if (override && field in override) return override[field as keyof typeof override];
    return oh[field];
  }

  function affectedByHours(newHours: OperatingHours[]): Booking[] {
    return MOCK_BOOKINGS.filter(b => {
      if (b.status === "cancelled") return false;
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
      // Show conflict modal BEFORE saving — user must acknowledge
      setPendingHours(newHours);
      setAffectedBookings(affected);
      setAffectedReason("hours");
      setShowAffectedModal(true);
    } else {
      setHours(newHours);
      setEditHours({});
      setToast({ message: "Operating hours saved.", type: "success" });
    }
  }

  function confirmSaveHours() {
    if (!pendingHours) return;
    setHours(pendingHours);
    setEditHours({});
    setPendingHours(null);
    setShowAffectedModal(false);
    setToast({ message: "Operating hours saved. Affected bookings require manual action.", type: "info" });
  }

  function dismissAffectedModal() {
    setPendingHours(null);
    setShowAffectedModal(false);
  }

  function removeBlackout(id: string) {
    setBlackouts(prev => prev.filter(b => b.id !== id));
    setToast({ message: "Blackout removed.", type: "info" });
  }

  function addBlackout(e: React.FormEvent) {
    e.preventDefault();
    const id = `bl${Date.now()}`;
    const blackoutDate = newBlackout.date;
    const instructor = newBlackout.type === "instructor"
      ? MOCK_INSTRUCTORS.find(i => i.id === newBlackout.instructorId)
      : undefined;
    const entry: Blackout = {
      id,
      date: newBlackout.date,
      reason: newBlackout.reason,
      type: newBlackout.type,
      ...(instructor ? { instructorId: instructor.id, instructorName: `${instructor.firstName} ${instructor.lastName}` } : {}),
    };
    setBlackouts(prev => [...prev, entry]);
    setNewBlackout({ date: "", reason: "", type: "facility", instructorId: "" });
    setShowAddBlackout(false);
    setToast({ message: "Blackout date added.", type: "success" });
    const affected = MOCK_BOOKINGS.filter(b => {
      if (b.status === "cancelled" || b.date !== blackoutDate) return false;
      if (newBlackout.type === "instructor") return b.instructorId === newBlackout.instructorId;
      return true;
    });
    if (affected.length > 0) {
      setAffectedBookings(affected);
      setAffectedReason("blackout");
      setShowAffectedModal(true);
    }
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
                      <input
                        type="time"
                        disabled={isClosed}
                        value={(getHour(oh, "openTime") as string) ?? oh.openTime}
                        onChange={e => updateHour(oh.id, "openTime", e.target.value)}
                        className="input text-sm py-1 w-32 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        disabled={isClosed}
                        value={(getHour(oh, "closeTime") as string) ?? oh.closeTime}
                        onChange={e => updateHour(oh.id, "closeTime", e.target.value)}
                        className="input text-sm py-1 w-32 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
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
                  {["Date", "Type", "Instructor", "Reason", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blackouts.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6c757d]">No blackout dates</td></tr>
                ) : blackouts.map(bl => (
                  <tr key={bl.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#212529]">{bl.date}</td>
                    <td className="px-4 py-3">
                      {bl.type === "facility"
                        ? <span className="badge-red">Facility</span>
                        : <span className="badge-blue">Instructor</span>}
                    </td>
                    <td className="px-4 py-3 text-[#6c757d]">{bl.instructorName ?? "—"}</td>
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

      {/* Affected Bookings Modal — for blackout (informational only) */}
      {showAffectedModal && affectedReason === "blackout" && (
        <Modal
          title="Affected Bookings"
          onClose={dismissAffectedModal}
          footer={<button onClick={dismissAffectedModal} className="btn-primary">OK</button>}
        >
          <div className="space-y-3">
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              The following confirmed bookings are scheduled on the newly blacked-out date. Review and reassign or cancel as needed.
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
                value={newBlackout.date}
                onChange={e => setNewBlackout(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={newBlackout.type}
                onChange={e => setNewBlackout(f => ({ ...f, type: e.target.value as "facility" | "instructor", instructorId: "" }))}
              >
                <option value="facility">Facility-wide</option>
                <option value="instructor">Instructor-specific</option>
              </select>
            </div>
            {newBlackout.type === "instructor" && (
              <div>
                <label className="label">Instructor</label>
                <select
                  className="input"
                  required
                  value={newBlackout.instructorId}
                  onChange={e => setNewBlackout(f => ({ ...f, instructorId: e.target.value }))}
                >
                  <option value="">Select instructor…</option>
                  {MOCK_INSTRUCTORS.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">Reason</label>
              <input
                className="input"
                required
                placeholder="e.g. Holiday, Personal appointment"
                value={newBlackout.reason}
                onChange={e => setNewBlackout(f => ({ ...f, reason: e.target.value }))}
              />
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
