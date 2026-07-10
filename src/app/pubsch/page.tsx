"use client";
import { useState } from "react";
import { useAppStore } from "@/data/store/useAppStore";

const TIME_SLOTS: string[] = [];
for (let h = 6; h < 24; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const COLOR_PALETTE = [
  { bg: "bg-blue-100 border-blue-300 text-blue-800",   accent: "#3b82f6" },
  { bg: "bg-purple-100 border-purple-300 text-purple-800", accent: "#a855f7" },
  { bg: "bg-green-100 border-green-300 text-green-800",  accent: "#22c55e" },
  { bg: "bg-rose-100 border-rose-300 text-rose-800",    accent: "#f43f5e" },
  { bg: "bg-orange-100 border-orange-300 text-orange-800", accent: "#f97316" },
  { bg: "bg-cyan-100 border-cyan-300 text-cyan-800",    accent: "#06b6d4" },
  { bg: "bg-amber-100 border-amber-300 text-amber-800", accent: "#eab308" },
  { bg: "bg-indigo-100 border-indigo-300 text-indigo-800", accent: "#6366f1" },
  { bg: "bg-teal-100 border-teal-300 text-teal-800",   accent: "#14b8a6" },
  { bg: "bg-pink-100 border-pink-300 text-pink-800",   accent: "#ec4899" },
];

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
  return ((timeToMins(t) - 6 * 60) / 30) * SLOT_HEIGHT;
}

export default function SchedulePage() {
  const { phone, phoneHref } = useAppStore(s => s.facilitySettings);
  const storeBookings = useAppStore(s => s.bookings);
  const storeInstructors = useAppStore(s => s.instructors);
  const [instructorFilter, setInstructorFilter] = useState("all");

  const _n = new Date();
  const today = `${_n.getFullYear()}-${String(_n.getMonth() + 1).padStart(2, "0")}-${String(_n.getDate()).padStart(2, "0")}`;
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const activeInstructors = storeInstructors.filter(i => i.isActive);

  // Assign a stable color per instructor based on their index in the active list
  const instructorColorMap = new Map(
    activeInstructors.map((inst, idx) => [inst.id, COLOR_PALETTE[idx % COLOR_PALETTE.length]])
  );

  const todayBookings = storeBookings.filter(b => b.date === today && b.status !== "cancelled");
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
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/the-diamond-sports-academy-facility.webp')" }}
        />
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

          {instrList.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap ml-2 border-l border-gray-100 pl-4">
              {instrList.map(([id, name]) => {
                const color = instructorColorMap.get(id);
                return (
                  <span key={id} className="flex items-center gap-1.5 text-xs text-[#6c757d]">
                    <span
                      className={`w-5 h-3.5 rounded-sm border flex-shrink-0 ${color?.bg ?? "bg-gray-100 border-gray-300"}`}
                      style={{ borderLeftColor: color?.accent ?? "#9ca3af", borderLeftWidth: 3 }}
                    />
                    {name}
                  </span>
                );
              })}
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
                {TIME_SLOTS.map((slot, i) => (
                  <div
                    key={slot}
                    className="absolute w-full border-b border-gray-100"
                    style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  />
                ))}

                {filteredBookings.map(b => {
                  const ci = colIdx.get(b.instructorId) ?? 0;
                  const color = instructorColorMap.get(b.instructorId);
                  return (
                    <div
                      key={b.id}
                      className={`absolute rounded border text-xs overflow-hidden px-2 py-1 select-none ${color?.bg ?? "bg-gray-100 border-gray-300 text-gray-700"}`}
                      style={{
                        top: timeToTop(b.startTime) + 2,
                        height: (b.durationMinutes / 30) * SLOT_HEIGHT - 4,
                        left: `calc(${(ci / numCols) * 100}% + 4px)`,
                        width: `calc(${(1 / numCols) * 100}% - 8px)`,
                        borderLeftColor: color?.accent ?? "#9ca3af",
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

        <p className="text-center text-xs text-[#6c757d] mt-6">
          Schedule is updated by the facility. For questions call{" "}
          <a href={phoneHref} className="hover:underline" style={{ color: "#337C99" }}>
            {phone}
          </a>
        </p>
      </div>
    </div>
  );
}
