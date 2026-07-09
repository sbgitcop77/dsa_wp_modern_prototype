"use client";
import { useState, useMemo } from "react";
import { db } from "@/data/service";
import { useAppStore } from "@/data/store/useAppStore";
import type { Instructor, InstructorSchedule, DaySlot } from "@/data/types";
import Toast from "@/components/Toast";
import { Calendar, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

type PageTab = "instructors" | "slots";
type SortCol = "name" | "speciality" | "type" | "status";
type SortDir = "asc" | "desc";

const INSTRUCTOR_TYPES = ["Lane Instructor", "Non-Lane Instructor"];

const TYPE_HINTS: Record<string, string> = {
  "Lane Instructor": "Has a dedicated lane — booking checks lane capacity before confirming.",
  "Non-Lane Instructor": "No lane required — can be booked even when all lanes are occupied.",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DOW_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

// Full range 06:00–24:00 in 30-min increments
const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const opts = [];
  for (let h = 6; h <= 24; h++) {
    for (const m of [0, 30]) {
      if (h === 24 && m === 30) break;
      const value = h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
      const label = h === 24 ? "12:00 AM (Midnight)" : (() => {
        const hour12 = h % 12 || 12;
        const ampm = h < 12 ? "AM" : "PM";
        return `${hour12}:${m === 0 ? "00" : "30"} ${ampm}`;
      })();
      opts.push({ value, label });
    }
  }
  return opts;
})();

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", speciality: "", type: "" };

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
  const fmtH = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const label = m === 0 ? `${h % 12 || 12}` : `${h % 12 || 12}:${String(m).padStart(2, "0")}`;
    return { label, p: h >= 12 ? "PM" : "AM" };
  };
  const s = fmtH(start); const e = fmtH(end);
  return s.p === e.p ? `${s.label}–${e.label} ${e.p}` : `${s.label} ${s.p}–${e.label} ${e.p}`;
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
  const [instructors, setInstructors] = useState(db.getInstructors());
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

  // ── Operating hours (from store) ─────────────────────────────────────────
  const operatingHours = useAppStore(s => s.operatingHours);
  const blackouts = useAppStore(s => s.blackouts);

  const ohByDow = useMemo(() => {
    const map: Record<number, typeof operatingHours[0]> = {};
    operatingHours.forEach(oh => { map[DOW_MAP[oh.dayOfWeek]] = oh; });
    return map;
  }, [operatingHours]);

  const getOhForDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return ohByDow[dow];
  };

  const isBlackout = (dateStr: string): boolean => {
    const mmdd = dateStr.slice(5);
    return blackouts.some(bl => bl.isRecurring ? bl.date.slice(5) === mmdd : bl.date === dateStr);
  };

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
    db.deleteInstructor(id);
    setInstructors(db.getInstructors());
    if (editTarget?.id === id) setFormMode(null);
    if (slotInstId === id) { setSlotInstId(""); setDateDraft({}); setSelectedDateStr(null); }
    setToast({ message: "Instructor removed.", type: "info" });
  }

  function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.speciality.trim()) return;
    if (formMode === "add") {
      const newInst = db.createInstructor({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        speciality: form.speciality.trim(),
        type: form.type,
        instructor_type: form.type === "Non-Lane Instructor" ? "non_lane" : "lane",
        isActive: true,
        availability: {
          recurring: deepCopyRecurring({ 0:{active:false,start:null,end:null}, 1:{active:false,start:null,end:null}, 2:{active:false,start:null,end:null}, 3:{active:false,start:null,end:null}, 4:{active:false,start:null,end:null}, 5:{active:false,start:null,end:null}, 6:{active:false,start:null,end:null} }),
          scheduledDates: {},
          frozen: false,
        },
      });
      setInstructors(db.getInstructors());
      setToast({ message: `${newInst.firstName} ${newInst.lastName} added.`, type: "success" });
    } else if (editTarget) {
      db.updateInstructor(editTarget.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        speciality: form.speciality.trim(),
        type: form.type,
        instructor_type: form.type === "Non-Lane Instructor" ? "non_lane" : "lane",
      });
      setInstructors(db.getInstructors());
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
    const inst = db.getInstructorById(id);
    if (!inst) return;
    setDateDraft(buildMonthDraft(inst, computeCalendarCells(0)));
  }

  function goToPrevMonth() {
    if (monthOffset <= 0) return;
    const newOffset = monthOffset - 1;
    setSelectedDateStr(null);
    setMonthOffset(newOffset);
    const inst = db.getInstructorById(slotInstId);
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
    const inst = db.getInstructorById(slotInstId);
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

  function getMinStartForDate(dateStr: string): string | null {
    if (dateStr !== todayStr) return null;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const next = Math.ceil((mins + 1) / 30) * 30;
    return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
  }

  function handleDayClick(dateStr: string) {
    const oh = getOhForDate(dateStr);
    if (oh?.isClosed) return;
    if (isBlackout(dateStr)) return; // facility blackout
    const minStart = getMinStartForDate(dateStr);
    const day = dateDraft[dateStr] ?? { active: false, start: null, end: null };
    // For today: if saved start is in the past, reset to minStart (never null — keeps state in sync with dropdown display)
    const startIsPast = !!(minStart && day.start && day.start < minStart);
    const correctedStart = startIsPast ? minStart : day.start;
    // Keep existing end if still valid after start correction; otherwise default to facility close
    const correctedEnd = startIsPast
      ? (day.end && correctedStart && day.end > correctedStart ? day.end : oh?.closeTime ?? "17:00")
      : day.end;
    const defaultStart = correctedStart ?? minStart ?? oh?.openTime ?? "09:00";
    const defaultEnd = correctedEnd ?? oh?.closeTime ?? "17:00";
    if (!day.active) {
      setDateDraft(prev => ({
        ...prev,
        [dateStr]: { active: true, start: defaultStart, end: defaultEnd },
      }));
      setSelectedDateStr(dateStr);
    } else if (selectedDateStr !== dateStr) {
      // Correct stale past times in state when selecting today's already-active date
      if (startIsPast) {
        setDateDraft(prev => ({
          ...prev,
          [dateStr]: { ...prev[dateStr], start: correctedStart, end: correctedEnd },
        }));
      }
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

  function generateSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let current = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (current < endMin) {
      slots.push(`${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`);
      current += 30;
    }
    return slots;
  }

  function handleSaveSchedule() {
    if (!slotInstId) return;
    const inst = db.getInstructorById(slotInstId);
    if (!inst) return;

    // Save schedule on the instructor record
    db.updateInstructor(slotInstId, {
      availability: {
        ...inst.availability,
        scheduledDates: { ...inst.availability.scheduledDates, ...dateDraft },
      },
    });

    // Sync InstructorAvailability records so the Book page can see the slots
    Object.entries(dateDraft).forEach(([date, slot]) => {
      const slots = slot.active && slot.start && slot.end
        ? generateSlots(slot.start, slot.end)
        : [];
      db.upsertAvailability(slotInstId, date, slots, slot.end ?? "");
    });

    setInstructors(db.getInstructors());
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
                    <input required className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input required className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input required type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="instructor@diamondsports.com" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input required type="tel" pattern="\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}" title="Enter a valid US phone number, e.g. (443) 555-0000" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(443) 555-0000" />
                  </div>
                  <div>
                    <label className="label">Speciality</label>
                    <input required className="input" value={form.speciality} onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))} placeholder="e.g. Hitting & Pitching" />
                  </div>
                  <div>
                    <label className="label">Instructor Type</label>
                    <select className="input" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="">— Select One —</option>
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
                    const oh = getOhForDate(dateStr);
                    const isClosed = oh?.isClosed ?? false;
                    const isBlackedOut = isBlackout(dateStr);
                    const isPast = dateStr < todayStr;
                    const isDisabled = isClosed || isBlackedOut || isPast;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleDayClick(dateStr)}
                        disabled={isDisabled}
                        title={isBlackedOut ? "Blackout date — facility closed" : isClosed ? "Facility closed this day" : isPast ? "Past date" : undefined}
                        className={`rounded-lg py-1.5 flex flex-col items-center justify-start transition-all min-h-[48px] ${
                          isBlackedOut
                            ? "bg-[#b6070e]/10 text-[#b6070e] cursor-not-allowed"
                            : isClosed || isPast
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : ds.active && isSelected
                            ? "bg-[#1e5c73] text-white shadow-sm ring-2 ring-white ring-offset-1"
                            : ds.active
                            ? "bg-[#337C99] text-white hover:bg-[#265d73]"
                            : isToday
                            ? "ring-2 ring-[#337C99] text-[#337C99] hover:bg-[#337C99]/10"
                            : "bg-gray-50 text-[#6c757d] hover:bg-gray-100"
                        }`}
                      >
                        <span className={`text-xs font-semibold leading-none mt-1 ${isDisabled ? "line-through" : ""}`}>{date.getDate()}</span>
                        {isBlackedOut && <span className="text-[8px] leading-tight mt-0.5 opacity-80">Blackout</span>}
                        {!isBlackedOut && isClosed && <span className="text-[8px] leading-tight mt-0.5 opacity-60">Closed</span>}
                        {!isDisabled && ds.active && ds.start && ds.end && (
                          <span className="text-[9px] leading-tight mt-1 opacity-90 px-0.5 text-center">
                            {formatHourRange(ds.start, ds.end)}
                          </span>
                        )}
                        {!isDisabled && ds.active && (!ds.start || !ds.end) && (
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
                    const selOh = getOhForDate(selectedDateStr);
                    const minStartTime = getMinStartForDate(selectedDateStr);
                    const startOpts = TIME_OPTIONS.filter(o =>
                      (!selOh || o.value >= selOh.openTime) &&
                      (!selOh || o.value < selOh.closeTime) &&
                      (!minStartTime || o.value >= minStartTime)
                    );
                    const endOpts = TIME_OPTIONS.filter(o =>
                      o.value > (sel.start ?? "06:00") &&
                      (!selOh || o.value <= selOh.closeTime)
                    );
                    return (
                      <div className="flex items-end gap-3 flex-wrap">
                        <div>
                          <label className="label">
                            Hours for <span className="text-[#337C99]">{selLabel}</span>
                            {selOh && (
                              <span className="ml-2 text-xs text-[#6c757d] font-normal">
                                (facility open {selOh.openTime}–{selOh.closeTime})
                              </span>
                            )}
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              className="input"
                              value={sel.start ?? minStartTime ?? selOh?.openTime ?? "09:00"}
                              onChange={e => {
                                const newStart = e.target.value;
                                setDateDraft(prev => {
                                  const cur = prev[selectedDateStr];
                                  return {
                                    ...prev,
                                    [selectedDateStr]: {
                                      ...cur,
                                      start: newStart,
                                      end: cur.end && cur.end > newStart ? cur.end : null,
                                    },
                                  };
                                });
                              }}
                            >
                              {startOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <span className="text-sm text-[#6c757d]">to</span>
                            <select
                              className="input"
                              value={sel.end ?? selOh?.closeTime ?? "17:00"}
                              onChange={e => setDateDraft(prev => ({ ...prev, [selectedDateStr]: { ...prev[selectedDateStr], end: e.target.value } }))}
                            >
                              {endOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={applyToActiveDays}
                          className="btn-secondary text-sm"
                          title="Copies the start and end times from the selected day to all other active days in the current month view."
                        >
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
