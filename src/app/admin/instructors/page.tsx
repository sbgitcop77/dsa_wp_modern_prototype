"use client";
import { useState } from "react";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import { INSTRUCTOR_AVAILABILITY } from "@/data/mock/schedule";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import type { Instructor } from "@/data/mock/instructors";
import type { InstructorAvailability } from "@/data/mock/schedule";
import { Pencil, X, Check, Plus } from "lucide-react";

type PageTab = "instructors" | "slots";
type View = "list" | "profile";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", speciality: "" };

const ALL_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30",
];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}-${day}-${y}`;
}

function currentTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function InstructorsPage() {
  const [pageTab, setPageTab] = useState<PageTab>("instructors");

  // Instructors tab state
  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Instructor | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Instructor>>({});
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Availability slots tab state
  const [availability, setAvailability] = useState<InstructorAvailability[]>(INSTRUCTOR_AVAILABILITY);
  const [slotInstId, setSlotInstId] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [editSlots, setEditSlots] = useState<Set<string>>(new Set());
  const [slotsDirty, setSlotsDirty] = useState(false);

  // ── Instructor functions ─────────────────────────────────────────────────
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const newInstructor: Instructor = {
      id: `i${Date.now()}`,
      firstName: addForm.firstName.trim(),
      lastName: addForm.lastName.trim(),
      email: addForm.email.trim(),
      speciality: addForm.speciality.trim(),
      isActive: true,
      totalSessionsDelivered: 0,
      upcomingSessions: 0,
      createdAt: new Date().toISOString(),
    };
    setInstructors(prev => [...prev, newInstructor]);
    setAddForm(EMPTY_FORM);
    setShowAdd(false);
    setToast({ message: `${newInstructor.firstName} ${newInstructor.lastName} added as instructor.`, type: "success" });
  }

  function openProfile(inst: Instructor) {
    setSelected(inst);
    setView("profile");
    setEditing(false);
  }

  function startEdit() {
    if (!selected) return;
    setEditForm({ firstName: selected.firstName, lastName: selected.lastName, email: selected.email, speciality: selected.speciality });
    setEditing(true);
  }

  function saveEdit() {
    if (!selected) return;
    setInstructors(prev => prev.map(i => i.id === selected.id ? { ...i, ...editForm } : i));
    setSelected(prev => prev ? { ...prev, ...editForm } : prev);
    setEditing(false);
    setToast({ message: "Instructor updated.", type: "success" });
  }

  function toggleActive(id: string) {
    const now = new Date().toISOString();
    setInstructors(prev => prev.map(i => {
      if (i.id !== id) return i;
      return i.isActive
        ? { ...i, isActive: false, deactivatedAt: now }
        : { ...i, isActive: true, deactivatedAt: undefined };
    }));
    setSelected(prev => {
      if (!prev) return prev;
      return prev.isActive
        ? { ...prev, isActive: false, deactivatedAt: now }
        : { ...prev, isActive: true, deactivatedAt: undefined };
    });
    setToast({ message: selected?.isActive ? "Instructor deactivated." : "Instructor reactivated.", type: "info" });
    setDeactivateConfirm(false);
  }

  // ── Slot functions ───────────────────────────────────────────────────────
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
    const instructor = instructors.find(i => i.id === slotInstId);
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

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeInstructors = instructors.filter(i => i.isActive);
  const instructorBookings = selected
    ? MOCK_BOOKINGS.filter(b => b.instructorId === selected.id && b.status !== "cancelled")
    : [];
  const today = new Date().toISOString().slice(0, 10);
  const upcomingInstructorBookings = instructorBookings.filter(b => b.date >= today);
  const visibleSlots = slotDate === today
    ? ALL_SLOTS.filter(s => s > currentTimeStr())
    : ALL_SLOTS;

  // ── Tab bar (shared across all views) ───────────────────────────────────
  const tabBar = (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      {([
        { key: "instructors" as PageTab, label: "Instructors" },
        { key: "slots" as PageTab, label: "Availability Slots" },
      ]).map(t => (
        <button
          key={t.key}
          onClick={() => { setPageTab(t.key); if (t.key === "instructors") setView("list"); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            pageTab === t.key
              ? "border-[#337C99] text-[#337C99]"
              : "border-transparent text-[#6c757d] hover:text-[#212529]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  // ── Profile view ─────────────────────────────────────────────────────────
  if (pageTab === "instructors" && view === "profile" && selected) {
    return (
      <div className="p-6 lg:p-8">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#212529]">Instructors</h1>
        </div>
        {tabBar}
        <button onClick={() => setView("list")} className="text-sm text-[#337C99] hover:underline mb-5 flex items-center gap-1">
          ← Back to Instructors
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: "#337C99" }}>
                  {selected.firstName[0]}{selected.lastName[0]}
                </div>
                <button onClick={editing ? saveEdit : startEdit} className="text-[#6c757d] hover:text-[#212529]">
                  {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>
              {editing ? (
                <div className="space-y-2">
                  <input className="input text-sm py-1.5" value={editForm.firstName ?? ""} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                  <input className="input text-sm py-1.5" value={editForm.lastName ?? ""} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
                  <input className="input text-sm py-1.5" value={editForm.email ?? ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                  <input className="input text-sm py-1.5" value={editForm.speciality ?? ""} onChange={e => setEditForm(f => ({ ...f, speciality: e.target.value }))} placeholder="Specialty" />
                  <button onClick={() => setEditing(false)} className="btn-secondary text-xs w-full justify-center mt-1"><X className="w-3 h-3 mr-1" />Cancel</button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[#212529]">{selected.firstName} {selected.lastName}</h2>
                  <p className="text-sm text-[#6c757d]">{selected.speciality}</p>
                  <p className="text-sm text-[#6c757d]">{selected.email}</p>
                  <div className="mt-3">
                    {selected.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}
                  </div>
                </>
              )}
            </div>

            <div className="card p-5">
              <p className="font-semibold text-[#212529] mb-3">Session Stats</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Total Delivered</span>
                  <span className="font-medium">{selected.totalSessionsDelivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Upcoming</span>
                  <span className="font-medium">{selected.upcomingSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Member Since</span>
                  <span className="font-medium">{new Date(selected.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <button
                onClick={() => setDeactivateConfirm(true)}
                className={`w-full justify-center text-sm ${selected.isActive ? "btn-danger" : "btn-primary"}`}
                style={selected.isActive ? {} : { backgroundColor: "#337C99" }}
              >
                {selected.isActive ? "Deactivate Instructor" : "Reactivate Instructor"}
              </button>
            </div>
          </div>

          {/* Right: upcoming sessions */}
          <div className="lg:col-span-2">
            <div className="card overflow-x-auto">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-[#212529]">Upcoming Sessions</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100">
                  <tr>
                    {["Ref", "Customer", "Date", "Time", "Duration", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {instructorBookings.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-[#6c757d] text-sm">No upcoming sessions</td></tr>
                  ) : instructorBookings.map(b => (
                    <tr key={b.id}>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#337C99]">{b.bookingReference}</td>
                      <td className="px-4 py-2.5 font-medium text-[#212529]">{b.customerName}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{formatDate(b.date)}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{formatTime(b.startTime)}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{b.durationMinutes}m</td>
                      <td className="px-4 py-2.5">
                        <span className={{ confirmed: "badge-green", cancelled: "badge-red", no_show: "badge-yellow", completed: "badge-gray" }[b.status]}>
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {deactivateConfirm && (
          <Modal
            title={selected.isActive ? "Deactivate Instructor" : "Reactivate Instructor"}
            onClose={() => setDeactivateConfirm(false)}
            footer={
              <>
                <button onClick={() => setDeactivateConfirm(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => toggleActive(selected.id)} className={selected.isActive ? "btn-danger" : "btn-primary"}>Confirm</button>
              </>
            }
          >
            {selected.isActive ? (
              <div className="space-y-3">
                <p className="text-sm text-[#6c757d]">
                  {selected.firstName} {selected.lastName} will be removed from the booking flow. Existing bookings will not be automatically cancelled.
                </p>
                {upcomingInstructorBookings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[#212529] mb-2">
                      {upcomingInstructorBookings.length} upcoming {upcomingInstructorBookings.length === 1 ? "booking" : "bookings"} will be affected:
                    </p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            {["Reference", "Customer", "Date", "Time"].map(h => (
                              <th key={h} className="text-left px-3 py-2 font-medium text-[#6c757d]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {upcomingInstructorBookings.map(b => (
                            <tr key={b.id}>
                              <td className="px-3 py-2 font-mono text-[#337C99]">{b.bookingReference}</td>
                              <td className="px-3 py-2 text-[#212529]">{b.customerName}</td>
                              <td className="px-3 py-2 text-[#6c757d]">{formatDate(b.date)}</td>
                              <td className="px-3 py-2 text-[#6c757d]">{formatTime(b.startTime)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6c757d]">
                Reactivate {selected.firstName} {selected.lastName}? They will be available for new bookings.
              </p>
            )}
          </Modal>
        )}
      </div>
    );
  }

  // ── List + Slots view ────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">Instructors</h1>
        {pageTab === "instructors" && (
          <button onClick={() => { setAddForm(EMPTY_FORM); setShowAdd(true); }} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />Add Instructor
          </button>
        )}
      </div>

      {tabBar}

      {/* Instructors list tab */}
      {pageTab === "instructors" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {instructors.map(inst => (
            <div key={inst.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#337C99" }}>
                  {inst.firstName[0]}{inst.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#212529] truncate">{inst.firstName} {inst.lastName}</p>
                  <p className="text-xs text-[#6c757d] truncate">{inst.speciality}</p>
                </div>
              </div>
              <div className="text-xs text-[#6c757d] space-y-1">
                <div className="flex justify-between">
                  <span>Sessions delivered</span>
                  <span className="font-medium text-[#212529]">{inst.totalSessionsDelivered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Upcoming</span>
                  <span className="font-medium text-[#212529]">{inst.upcomingSessions}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-1">
                {inst.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}
                <button onClick={() => openProfile(inst)} className="text-[#337C99] hover:underline text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Availability slots tab */}
      {pageTab === "slots" && (
        <div>
          <p className="text-sm text-[#6c757d] mb-5">
            Manually set the time slots an instructor is available on a specific date. Toggle a slot to mark it available or unavailable.
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
                <input type="date" className="input" min={today} value={slotDate} onChange={e => handleSlotDateChange(e.target.value)} />
              </div>
            </div>

            {slotInstId && slotDate ? (
              <>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex items-center gap-1.5 text-xs text-[#6c757d]">
                    <span className="inline-block w-5 h-5 rounded border border-[#337C99] bg-[#337C99]/10" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#6c757d]">
                    <span className="inline-block w-5 h-5 rounded border border-gray-200 bg-white" />
                    Unavailable
                  </span>
                </div>
                {visibleSlots.length === 0 ? (
                  <p className="text-sm text-[#6c757d] mb-5">No remaining slots for today — all time slots have passed.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-5">
                    {visibleSlots.map(slot => {
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
                )}
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
                {availability.filter(av => av.date >= today).length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6c757d]">No upcoming availability configured</td></tr>
                ) : availability.slice().filter(av => av.date >= today).sort((a, b) => a.date.localeCompare(b.date)).map(av => (
                  <tr key={av.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#212529]">{av.instructorName}</td>
                    <td className="px-4 py-3 text-[#6c757d]">{formatDate(av.date)}</td>
                    <td className="px-4 py-3 text-[#6c757d]">{av.slots.length} slot(s)</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSlotInstId(av.instructorId); setSlotDate(av.date); loadSlots(av.instructorId, av.date); }}
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

      {showAdd && (
        <Modal
          title="Add Instructor"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              <button form="add-instructor-form" type="submit" className="btn-primary">Add Instructor</button>
            </>
          }
        >
          <form id="add-instructor-form" onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input
                  className="input"
                  required
                  value={addForm.firstName}
                  onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  className="input"
                  required
                  value={addForm.lastName}
                  onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                required
                value={addForm.email}
                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                placeholder="instructor@diamondsports.com"
              />
            </div>
            <div>
              <label className="label">Speciality</label>
              <input
                className="input"
                required
                value={addForm.speciality}
                onChange={e => setAddForm(f => ({ ...f, speciality: e.target.value }))}
                placeholder="e.g. Hitting & Pitching"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
