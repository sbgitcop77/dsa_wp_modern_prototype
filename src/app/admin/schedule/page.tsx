"use client";
import { useState } from "react";
import { OPERATING_HOURS, BLACKOUTS, LANE_CONFIG, LANE_UTILIZATION, INSTRUCTOR_AVAILABILITY } from "@/data/mock/schedule";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import type { OperatingHours, Blackout, InstructorAvailability } from "@/data/mock/schedule";
import type { Booking } from "@/data/mock/bookings";
import { Plus, X, Pencil, Check } from "lucide-react";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const ALL_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

type Tab = "hours" | "blackouts" | "lanes" | "slots";

export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>("hours");
  const [hours, setHours] = useState(OPERATING_HOURS);
  const [blackouts, setBlackouts] = useState(BLACKOUTS);
  const [availability, setAvailability] = useState<InstructorAvailability[]>(INSTRUCTOR_AVAILABILITY);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [newBlackout, setNewBlackout] = useState({ date: "", reason: "", type: "facility" as "facility" | "instructor", instructorId: "" });
  const [editHours, setEditHours] = useState<Record<string, Partial<OperatingHours>>>({});
  const [affectedBookings, setAffectedBookings] = useState<Booking[]>([]);
  const [showAffectedModal, setShowAffectedModal] = useState(false);
  const [affectedReason, setAffectedReason] = useState<"hours" | "blackout">("hours");
  const [pendingHours, setPendingHours] = useState<OperatingHours[] | null>(null);

  // Lane count config
  const [laneCount, setLaneCount] = useState(LANE_CONFIG.totalActiveLanes);
  const [editingLanes, setEditingLanes] = useState(false);
  const [laneInput, setLaneInput] = useState(String(LANE_CONFIG.totalActiveLanes));

  // Instructor slots tab
  const [slotInstId, setSlotInstId] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [editSlots, setEditSlots] = useState<Set<string>>(new Set());
  const [slotsDirty, setSlotsDirty] = useState(false);

  const activeInstructors = MOCK_INSTRUCTORS.filter(i => i.isActive);

  function loadSlots(instructorId: string, date: string) {
    const entry = availability.find(a => a.instructorId === instructorId && a.date === date);
    setEditSlots(new Set(entry?.slots ?? []));
    setSlotsDirty(false);
  }

  function handleSlotInstChange(id: string) {
    setSlotInstId(id);
    if (slotDate) loadSlots(id, slotDate);
  }

  function handleSlotDateChange(date: string) {
    setSlotDate(date);
    if (slotInstId) loadSlots(slotInstId, date);
  }

  function toggleSlot(slot: string) {
    setEditSlots(prev => {
      const next = new Set(prev);
      next.has(slot) ? next.delete(slot) : next.add(slot);
      return next;
    });
    setSlotsDirty(true);
  }

  function saveSlots() {
    if (!slotInstId || !slotDate) return;
    const instructor = MOCK_INSTRUCTORS.find(i => i.id === slotInstId);
    const newSlots = ALL_SLOTS.filter(s => editSlots.has(s));
    setAvailability(prev => {
      const existing = prev.find(a => a.instructorId === slotInstId && a.date === slotDate);
      if (existing) {
        return prev.map(a => a.instructorId === slotInstId && a.date === slotDate ? { ...a, slots: newSlots } : a);
      }
      return [...prev, {
        id: `av${Date.now()}`,
        instructorId: slotInstId,
        instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : slotInstId,
        date: slotDate,
        slots: newSlots,
      }];
    });
    setSlotsDirty(false);
    setToast({ message: `Availability saved for ${slotDate}.`, type: "success" });
  }

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

  function saveLaneCount() {
    const n = parseInt(laneInput, 10);
    if (!isNaN(n) && n >= 1 && n <= 20) {
      setLaneCount(n);
      setEditingLanes(false);
      setToast({ message: `Lane count updated to ${n}.`, type: "success" });
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "hours", label: "Operating Hours" },
    { key: "blackouts", label: "Blackout Dates" },
    { key: "lanes", label: "Lane Utilization" },
    { key: "slots", label: "Instructor Slots" },
  ];

  const laneSlots = Object.entries(LANE_UTILIZATION);

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

      {/* Lane Utilization */}
      {tab === "lanes" && (
        <div>
          <div className="card p-4 mb-5 flex items-center gap-4">
            <div className="flex items-center gap-3">
              {editingLanes ? (
                <>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="input w-20 text-2xl font-bold text-center py-1"
                    value={laneInput}
                    onChange={e => setLaneInput(e.target.value)}
                  />
                  <button onClick={saveLaneCount} className="btn-primary text-xs py-1 px-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />Save
                  </button>
                  <button onClick={() => { setEditingLanes(false); setLaneInput(String(laneCount)); }} className="btn-secondary text-xs py-1 px-2">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-2xl font-bold text-[#212529]">{laneCount}</p>
                    <p className="text-xs text-[#6c757d]">Active Lanes</p>
                  </div>
                  <button onClick={() => { setEditingLanes(true); setLaneInput(String(laneCount)); }} className="text-[#6c757d] hover:text-[#337C99]" title="Edit lane count">
                    <Pencil className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-sm font-medium text-[#212529]">{LANE_CONFIG.location}</p>
              <p className="text-xs text-[#6c757d]">Facility location</p>
            </div>
          </div>
          <div className="card overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-[#212529]">Today's Lane Utilization</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Time", "Used / Total", "Utilization"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laneSlots.map(([slot, { used, total }]) => {
                  const effectiveTotal = laneCount;
                  const pct = Math.round((used / effectiveTotal) * 100);
                  return (
                    <tr key={slot} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-[#6c757d]">{formatTime(slot)}</td>
                      <td className="px-4 py-2.5 font-medium text-[#212529]">{used} / {effectiveTotal}</td>
                      <td className="px-4 py-2.5 w-56">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: pct >= 100 ? "#f33b41" : pct >= 75 ? "#f59e0b" : "#337C99",
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#6c757d] w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructor Slots */}
      {tab === "slots" && (
        <div>
          <p className="text-sm text-[#6c757d] mb-5">
            Manually set the time slots an instructor is available on a specific date. Check a slot to mark it available; uncheck to remove it.
          </p>
          <div className="card p-5 mb-5">
            <div className="flex flex-wrap gap-4 mb-5">
              <div className="flex-1 min-w-44">
                <label className="label">Instructor</label>
                <select className="input" value={slotInstId} onChange={e => handleSlotInstChange(e.target.value)}>
                  <option value="">Select instructor…</option>
                  {activeInstructors.map(i => (
                    <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-44">
                <label className="label">Date</label>
                <input type="date" className="input" value={slotDate} onChange={e => handleSlotDateChange(e.target.value)} />
              </div>
            </div>

            {slotInstId && slotDate ? (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-5">
                  {ALL_SLOTS.map(slot => {
                    const checked = editSlots.has(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={`border rounded-lg px-2 py-1.5 text-xs transition-all text-center ${
                          checked
                            ? "border-[#337C99] bg-[#337C99]/10 text-[#337C99] font-semibold"
                            : "border-gray-200 text-[#6c757d] hover:border-gray-300"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveSlots}
                    disabled={!slotsDirty}
                    className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Slots
                  </button>
                  <span className="text-xs text-[#6c757d]">{editSlots.size} slot(s) selected</span>
                  {!slotsDirty && slotInstId && slotDate && (
                    <span className="text-xs text-green-600">Saved</span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#6c757d]">Select an instructor and date above to edit their available slots.</p>
            )}
          </div>

          {/* Current availability summary */}
          <div className="card overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-[#212529]">Configured Availability</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Instructor", "Date", "Slots Available", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {availability.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6c757d]">No availability configured</td></tr>
                ) : availability.slice().sort((a, b) => a.date.localeCompare(b.date)).map(av => (
                  <tr key={av.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#212529]">{av.instructorName}</td>
                    <td className="px-4 py-3 text-[#6c757d]">{av.date}</td>
                    <td className="px-4 py-3 text-[#6c757d]">{av.slots.length} slot(s)</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSlotInstId(av.instructorId); setSlotDate(av.date); loadSlots(av.instructorId, av.date); setTab("slots"); }}
                        className="text-xs text-[#337C99] hover:underline"
                      >
                        Edit
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
