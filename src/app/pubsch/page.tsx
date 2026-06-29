"use client";
import { useState } from "react";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";

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

const SLOT_HEIGHT = 56;

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function timeToTop(t: string) {
  return ((timeToMins(t) - 9 * 60) / 30) * SLOT_HEIGHT;
}

export default function SchedulePage() {
  const [instructorFilter, setInstructorFilter] = useState("all");

  const today = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const activeInstructors = MOCK_INSTRUCTORS.filter(i => i.isActive);
  const todayBookings = MOCK_BOOKINGS.filter(b => b.date === today && b.status !== "cancelled");
  const filteredBookings = instructorFilter === "all"
    ? todayBookings
    : todayBookings.filter(b => b.instructorId === instructorFilter);

  const instrMap = new Map<string, string>();
  filteredBookings.forEach(b => instrMap.set(b.instructorId, b.instructorName));
  const instrList = Array.from(instrMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const numCols = Math.max(1, instrList.length);
  const colIdx = new Map(instrList.map(([id], i) => [id, i]));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f7f7" }}>
      {/* Page header */}
      <div
        className="relative pt-24 lg:pt-28 pb-12 overflow-hidden"
        style={{ backgroundColor: "#00141B" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/the-diamond-sports-academy-facility.webp')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,20,27,0.78)" }} />

        <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: "#337C99" }}>
                The Diamond Sports Academy
              </p>
              <h1 className="text-3xl font-bold text-white">Today&apos;s Schedule</h1>
              <p className="text-white/60 mt-1 text-sm">{todayLabel}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70 text-sm">
                {todayBookings.length} session{todayBookings.length !== 1 ? "s" : ""} scheduled today
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
        {/* Filter + Legend bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 mb-5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#6c757d] whitespace-nowrap">Filter by instructor:</label>
            <select
              value={instructorFilter}
              onChange={e => setInstructorFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#337C99]/30 focus:border-[#337C99]"
            >
              <option value="all">All Instructors</option>
              {activeInstructors.map(i => (
                <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
              ))}
            </select>
          </div>

          {/* Color legend — only active instructors who have bookings today */}
          {instrList.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap ml-2 border-l border-gray-100 pl-4">
              {instrList.map(([id, name]) => (
                <span key={id} className="flex items-center gap-1.5 text-xs text-[#6c757d]">
                  <span
                    className={`w-5 h-3.5 rounded-sm border flex-shrink-0 ${INSTRUCTOR_COLORS[id] ?? "bg-gray-100 border-gray-300"}`}
                    style={{ borderLeftColor: INSTRUCTOR_ACCENT[id] ?? "#9ca3af", borderLeftWidth: 3 }}
                  />
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Schedule grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {todayBookings.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#6c757d] text-lg font-medium">No sessions scheduled for today</p>
              <p className="text-[#6c757d] text-sm mt-1">Check back later or contact the front desk.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto">
              {/* Sticky time column */}
              <div
                className="flex-shrink-0 border-r border-gray-200 sticky left-0 bg-white z-10"
                style={{ width: 80, height: TIME_SLOTS.length * SLOT_HEIGHT }}
              >
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

              {/* Booking grid */}
              <div
                className="relative flex-1"
                style={{ minWidth: numCols * 140, height: TIME_SLOTS.length * SLOT_HEIGHT }}
              >
                {/* Horizontal grid lines */}
                {TIME_SLOTS.map((slot, i) => (
                  <div
                    key={slot}
                    className="absolute w-full border-b border-gray-100"
                    style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  />
                ))}

                {/* Read-only booking cards */}
                {filteredBookings.map(b => {
                  const ci = colIdx.get(b.instructorId) ?? 0;
                  return (
                    <div
                      key={b.id}
                      className={`absolute rounded border text-xs overflow-hidden px-2 py-1 select-none ${INSTRUCTOR_COLORS[b.instructorId] ?? "bg-gray-100 border-gray-300 text-gray-700"}`}
                      style={{
                        top: timeToTop(b.startTime) + 2,
                        height: (b.durationMinutes / 30) * SLOT_HEIGHT - 4,
                        left: `calc(${(ci / numCols) * 100}% + 4px)`,
                        width: `calc(${(1 / numCols) * 100}% - 8px)`,
                        borderLeftColor: INSTRUCTOR_ACCENT[b.instructorId] ?? "#9ca3af",
                        borderLeftWidth: 4,
                        cursor: "default",
                      }}
                    >
                      <div className="font-bold leading-tight">
                        {b.instructorName} · {b.durationMinutes} min
                      </div>
                      <div className="opacity-80 leading-tight text-[11px] mt-0.5">
                        {b.customerName}{b.isRecurring ? " 🔁" : ""}
                      </div>
                      <div className="opacity-60 leading-tight text-[10px] mt-0.5">
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#6c757d] mt-6">
          Schedule is updated by the facility. For questions call{" "}
          <a href="tel:+14438651639" className="hover:underline" style={{ color: "#337C99" }}>
            (443) 865-1639
          </a>
        </p>
      </div>
    </div>
  );
}
