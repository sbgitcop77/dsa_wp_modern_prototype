"use client";
import { useState, useMemo } from "react";
import { MOCK_INSTRUCTORS, DEFAULT_AVAILABILITY } from "@/data/mock/instructors";
import type { Instructor, InstructorSchedule, DaySlot } from "@/data/mock/instructors";
import Toast from "@/components/Toast";
import { Calendar, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

type PageTab = "instructors" | "slots";
type SortCol = "name" | "speciality" | "type" | "status";
type SortDir = "asc" | "desc";

const INSTRUCTOR_TYPES = ["Lane Instructor", "Wait Room"];

const TYPE_HINTS: Record<string, string> = {
  "Lane Instructor": "Has a dedicated lane — booking checks lane capacity before confirming.",
  "Wait Room": "No lane required — can be booked even when all lanes are occupied.",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const opts = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const value = `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${m === 0 ? "00" : "30"} ${ampm}`;
      opts.push({ value, label });
    }
  }
  return opts;
})();

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", speciality: "", type: "Lane Instructor" };

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthStart(offset: number): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + offset, 1);
}

// Returns 42 cells (6 rows × 7 cols): null = empty leading/trailing cell
function computeCalendarCells(offset: number): (Date | null)[] {
  const start = getMonthStart(offset);
  const year = start.getFullYear();
  const month = start.getMonth();
  const firstDow = start.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatMonthHeader(offset: number): string {
  return getMonthStart(offset).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildMonthDraft(inst: Instructor, cells: (Date | null)[]): Record<string, DaySlot> {
  const draft: Record<string, DaySlot> = {};
  cells.forEach(date => {
    if (!date) return;
    const dateStr = toDateStr(date);
    const scheduled = inst.availability.scheduledDates[dateStr];
    draft[dateStr] = scheduled ? { ...scheduled } : { ...inst.availability.recurring[date.getDay()] };
  });
  return draft;
}

function formatHourRange(start: string, end: string): string {
  const fmtH = (t: string) => { const h = parseInt(t); return { h: h % 12 || 12, p: h >= 12 ? "PM" : "AM" }; };
  const s = fmtH(start); const e = fmtH(end);
  return s.p === e.p ? `${s.h}–${e.h} ${e.p}` : `${s.h} ${s.p}–${e.h} ${e.p}`;
}

function deepCopyRecurring(r: InstructorSchedule["recurring"]): InstructorSchedule["recurring"] {
  const copy: InstructorSchedule["recurring"] = {};
  for (let d = 0; d <= 6; d++) copy[d] = { ...r[d] };
  return copy;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function InstructorsPage() {
  const [pageTab, setPageTab] = useState<PageTab>("instructors");

  // ── Instructors tab state ────────────────────────────────────────────────
  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);
  const [search, setSearch] = useState("");
  const [typeFilter] = useState("All");
  const [sortCol, setSortCol] = useState<SortCol>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Instructor | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // ── Slots tab state ──────────────────────────────────────────────────────
  const [slotInstId, setSlotInstId] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [dateDraft, setDateDraft] = useState<Record<string, DaySlot>>({});
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const calendarCells = useMemo(() => computeCalendarCells(monthOffset), [monthOffset]);

  const filtered = useMemo(() => {
    let result = instructors.filter(i => {
      if (typeFilter !== "All" && i.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${i.firstName} ${i.lastName} ${i.speciality}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return [...result].sort((a, b) => {
      let av = "", bv = "";
      switch (sortCol) {
        case "name":       av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}`; break;
        case "speciality": av = a.speciality; bv = b.speciality; break;
        case "type":       av = a.type; bv = b.type; break;
        case "status":     av = a.isActive ? "0" : "1"; bv = b.isActive ? "0" : "1"; break;
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [instructors, search, typeFilter, sortCol, sortDir]);

  // ── Instructors tab functions ────────────────────────────────────────────
  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditTarget(null); setFormMode("add"); }

  function openEdit(inst: Instructor) {
    setForm({ firstName: inst.firstName, lastName: inst.lastName, email: inst.email, phone: inst.phone, speciality: inst.speciality, type: inst.type });
    setEditTarget(inst);
    setFormMode("edit");
  }

  function handleDelete(id: string) {
    setInstructors(prev => prev.filter(i => i.id !== id));
    if (editTarget?.id === id) setFormMode(null);
    if (slotInstId === id) { setSlotInstId(""); setDateDraft({}); setSelectedDateStr(null); }
    setToast({ message: "Instructor removed.", type: "info" });
  }

  function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.speciality.trim()) return;
    if (formMode === "add") {
      const newInst: Instructor = {
        id: `i${Date.now()}`,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        speciality: form.speciality.trim(),
        type: form.type,
        instructor_type: "lane",
        isActive: true,
        totalSessionsDelivered: 0,
        upcomingSessions: 0,
        createdAt: new Date().toISOString(),
        availability: {
          recurring: deepCopyRecurring(DEFAULT_AVAILABILITY.recurring),
          scheduledDates: {},
          frozen: false,
        },
      };
      setInstructors(prev => [...prev, newInst]);
      setToast({ message: `${newInst.firstName} ${newInst.lastName} added.`, type: "success" });
    } else if (editTarget) {
      setInstructors(prev => prev.map(i =>
        i.id === editTarget.id
          ? { ...i, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim(), speciality: form.speciality.trim(), type: form.type }
          : i
      ));
      setToast({ message: "Instructor updated.", type: "success" });
    }
    setFormMode(null);
    setEditTarget(null);
  }

  function goToSlots(instId: string) {
    loadInstructorSchedule(instId);
    setPageTab("slots");
  }

  // ── Slots tab functions ──────────────────────────────────────────────────
  function loadInstructorSchedule(id: string) {
    setSlotInstId(id);
    setMonthOffset(0);
    setSelectedDateStr(null);
    if (!id) { setDateDraft({}); return; }
    const inst = instructors.find(i => i.id === id);
    if (!inst) return;
    setDateDraft(buildMonthDraft(inst, computeCalendarCells(0)));
  }

  function goToPrevMonth() {
    if (monthOffset <= 0) return;
    const newOffset = monthOffset - 1;
    setSelectedDateStr(null);
    setMonthOffset(newOffset);
    const inst = instructors.find(i => i.id === slotInstId);
    if (!inst) return;
    const cells = computeCalendarCells(newOffset);
    setDateDraft(prev => {
      const next = { ...prev };
      cells.forEach(date => {
        if (!date) return;
        const dateStr = toDateStr(date);
        if (!(dateStr in next)) {
          const scheduled = inst.availability.scheduledDates[dateStr];
          next[dateStr] = scheduled ? { ...scheduled } : { ...inst.availability.recurring[date.getDay()] };
        }
      });
      return next;
    });
  }

  function goToNextMonth() {
    const newOffset = monthOffset + 1;
    setSelectedDateStr(null);
    setMonthOffset(newOffset);
    const inst = instructors.find(i => i.id === slotInstId);
    if (!inst) return;
    const cells = computeCalendarCells(newOffset);
    setDateDraft(prev => {
      const next = { ...prev };
      cells.forEach(date => {
        if (!date) return;
        const dateStr = toDateStr(date);
        if (!(dateStr in next)) {
          const scheduled = inst.availability.scheduledDates[dateStr];
          next[dateStr] = scheduled ? { ...scheduled } : { ...inst.availability.recurring[date.getDay()] };
        }
      });
      return next;
    });
  }

  function handleDayClick(dateStr: string) {
    const day = dateDraft[dateStr];
    if (!day) return;
    if (!day.active) {
      setDateDraft(prev => ({
        ...prev,
        [dateStr]: { active: true, start: day.start ?? "09:00", end: day.end ?? "17:00" },
      }));
      setSelectedDateStr(dateStr);
    } else if (selectedDateStr !== dateStr) {
      setSelectedDateStr(dateStr);
    } else {
      setDateDraft(prev => ({ ...prev, [dateStr]: { ...prev[dateStr], active: false } }));
      setSelectedDateStr(null);
    }
  }

  function applyToActiveDays() {
    if (!selectedDateStr) return;
    const sel = dateDraft[selectedDateStr];
    if (!sel?.start || !sel?.end) return;
    const visibleDates = new Set(calendarCells.filter(Boolean).map(d => toDateStr(d!)));
    setDateDraft(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(dateStr => {
        if (visibleDates.has(dateStr) && next[dateStr].active) {
          next[dateStr] = { ...next[dateStr], start: sel.start, end: sel.end };
        }
      });
      return next;
    });
  }

  function handleSaveSchedule() {
    if (!slotInstId) return;
    setInstructors(prev => prev.map(i =>
      i.id !== slotInstId ? i : {
        ...i,
        availability: {
          ...i.availability,
          scheduledDates: { ...i.availability.scheduledDates, ...dateDraft },
        },
      }
    ));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  // ── Sort header helper ───────────────────────────────────────────────────
  function sortTh(col: SortCol, label: string, cls = "") {
    const active = sortCol === col;
    return (
      <th
        onClick={() => handleSort(col)}
        className={`text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide cursor-pointer select-none hover:text-[#212529] transition-colors ${cls}`}
      >
        {label}
        <span className={`ml-1 ${active ? "text-[#337C99]" : "text-gray-300"}`}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </th>
    );
  }

  const todayStr = toDateStr(new Date());

  const tabBar = (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      {(["instructors", "slots"] as PageTab[]).map(key => (
        <button
          key={key}
          type="button"
          onClick={() => setPageTab(key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            pageTab === key
              ? "border-[#337C99] text-[#337C99]"
              : "border-transparent text-[#6c757d] hover:text-[#212529]"
          }`}
        >
          {key === "instructors" ? "Instructors" : "Availability Slots"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">Instructors</h1>
      </div>

      {tabBar}

      {/* ── Instructors tab ─────────────────────────────────────────────── */}
      {pageTab === "instructors" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="Search by name or speciality…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              type="button"
              onClick={openAdd}
              className="btn-primary text-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Instructor
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-y-auto" style={{ maxHeight: "344px" }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                  <tr>
                    {sortTh("name",       "Name",       "w-[30%]")}
                    {sortTh("speciality", "Speciality", "w-[25%]")}
                    {sortTh("type",       "Type",       "w-[18%]")}
                    {sortTh("status",     "Status",     "w-[15%]")}
                    <th className="w-[12%] px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#6c757d]">No instructors found</td>
                    </tr>
                  ) : filtered.map(inst => (
                    <tr key={inst.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: "#337C99" }}
                          >
                            {inst.firstName[0]}{inst.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-[#212529] truncate block">{inst.firstName} {inst.lastName}</span>
                            {inst.email && <span className="text-xs text-[#6c757d] truncate block">{inst.email}</span>}
                            {inst.phone && <span className="text-xs text-[#6c757d] truncate block">{inst.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#6c757d] truncate max-w-0">
                        <span className="truncate block">{inst.speciality}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-gray">{inst.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: inst.isActive ? "#22c55e" : "#9ca3af" }} />
                          <span className={`text-sm ${inst.isActive ? "text-green-700" : "text-[#6c757d]"}`}>
                            {inst.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => goToSlots(inst.id)} title="Manage availability slots" className="text-[#6c757d] hover:text-[#337C99] transition-colors">
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => openEdit(inst)} title="Edit instructor" className="text-[#6c757d] hover:text-[#337C99] transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(inst.id)} title="Remove instructor" className="text-[#6c757d] hover:text-[#b6070e] transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-[#6c757d]">
              <span>
                {filtered.length < instructors.length
                  ? `${filtered.length} shown of ${instructors.length}`
                  : `${filtered.length} instructor${filtered.length !== 1 ? "s" : ""}`}
              </span>
              {filtered.length > 4 && <span>↓ Scroll to see more</span>}
            </div>
          </div>

          {formMode && (
            <div className="card p-5 mt-4">
              <h3 className="font-semibold text-[#212529] mb-4">
                {formMode === "add" ? "New Instructor" : "Edit Instructor"}
              </h3>
              <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="instructor@diamondsports.com" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(443) 555-0000" />
                  </div>
                  <div>
                    <label className="label">Speciality</label>
                    <input className="input" value={form.speciality} onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))} placeholder="e.g. Hitting & Pitching" />
                  </div>
                  <div>
                    <label className="label">Instructor Type</label>
                    <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {INSTRUCTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {TYPE_HINTS[form.type] && (
                      <p className="text-xs text-[#6c757d] mt-1.5">{TYPE_HINTS[form.type]}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button type="button" onClick={() => { setFormMode(null); setEditTarget(null); }} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" className="btn-primary text-sm">Save</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Availability Slots tab ───────────────────────────────────────── */}
      {pageTab === "slots" && (
        <div>
          <div className="mb-6">
            <label className="label">Instructor</label>
            <select
              className="input w-full max-w-sm"
              value={slotInstId}
              onChange={e => loadInstructorSchedule(e.target.value)}
            >
              <option value="">Select an instructor…</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
              ))}
            </select>
          </div>

          {slotInstId && (
            <>
              <div className="card p-5 mb-5">
                {/* Month header + navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#212529]">{formatMonthHeader(monthOffset)}</h2>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={goToPrevMonth}
                      disabled={monthOffset === 0}
                      className="p-1.5 rounded-lg border border-gray-200 text-[#6c757d] hover:text-[#212529] hover:border-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-1.5 rounded-lg border border-gray-200 text-[#6c757d] hover:text-[#212529] hover:border-gray-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wide text-[#6c757d] py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-5">
                  {calendarCells.map((date, idx) => {
                    if (!date) return <div key={`e-${idx}`} />;
                    const dateStr = toDateStr(date);
                    const ds = dateDraft[dateStr] ?? { active: false, start: null, end: null };
                    const isToday = todayStr === dateStr;
                    const isSelected = selectedDateStr === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleDayClick(dateStr)}
                        className={`rounded-lg py-1.5 flex flex-col items-center justify-start transition-all min-h-[48px] ${
                          ds.active && isSelected
                            ? "bg-[#1e5c73] text-white shadow-sm ring-2 ring-white ring-offset-1"
                            : ds.active
                            ? "bg-[#337C99] text-white hover:bg-[#265d73]"
                            : isToday
                            ? "ring-2 ring-[#337C99] text-[#337C99] hover:bg-[#337C99]/10"
                            : "bg-gray-50 text-[#6c757d] hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs font-semibold leading-none mt-1">{date.getDate()}</span>
                        {ds.active && ds.start && ds.end && (
                          <span className="text-[9px] leading-tight mt-1 opacity-90 px-0.5 text-center">
                            {formatHourRange(ds.start, ds.end)}
                          </span>
                        )}
                        {ds.active && (!ds.start || !ds.end) && (
                          <span className="text-[9px] leading-tight mt-1 opacity-75">?</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Per-day time pickers */}
                <div className="pt-4 border-t border-gray-100">
                  {selectedDateStr && dateDraft[selectedDateStr]?.active ? (() => {
                    const sel = dateDraft[selectedDateStr];
                    const [sy, sm, sd] = selectedDateStr.split("-").map(Number);
                    const selLabel = new Date(sy, sm - 1, sd).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return (
                      <div className="flex items-end gap-3 flex-wrap">
                        <div>
                          <label className="label">Hours for <span className="text-[#337C99]">{selLabel}</span></label>
                          <div className="flex items-center gap-2">
                            <select
                              className="input"
                              value={sel.start ?? "09:00"}
                              onChange={e => setDateDraft(prev => ({ ...prev, [selectedDateStr]: { ...prev[selectedDateStr], start: e.target.value } }))}
                            >
                              {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <span className="text-sm text-[#6c757d]">to</span>
                            <select
                              className="input"
                              value={sel.end ?? "17:00"}
                              onChange={e => setDateDraft(prev => ({ ...prev, [selectedDateStr]: { ...prev[selectedDateStr], end: e.target.value } }))}
                            >
                              {TIME_OPTIONS.filter(o => !sel.start || o.value > sel.start).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <button type="button" onClick={applyToActiveDays} className="btn-secondary text-sm">
                          Apply to all active days
                        </button>
                      </div>
                    );
                  })() : (
                    <p className="text-sm text-[#6c757d]">Click a day to activate it and set its hours.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <span
                  className="text-sm font-medium text-green-600 transition-opacity duration-700"
                  style={{ opacity: savedFeedback ? 1 : 0 }}
                >
                  ✓ Saved
                </span>
                <button type="button" onClick={handleSaveSchedule} className="btn-primary text-sm">
                  Save schedule
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
