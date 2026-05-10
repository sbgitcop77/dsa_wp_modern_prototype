"use client";
import { useState } from "react";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import { MOCK_INSTRUCTORS } from "@/data/mock/instructors";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-yellow-100 text-yellow-800",
};

type Range = "all" | "may2026";

export default function ReportsPage() {
  const [range, setRange] = useState<Range>("all");

  const scoped = range === "all"
    ? MOCK_BOOKINGS
    : MOCK_BOOKINGS.filter(b => b.date.startsWith("2026-05"));

  const total = scoped.length;
  const byStatus = Object.fromEntries(
    ["confirmed", "completed", "cancelled", "no_show"].map(s => [
      s, scoped.filter(b => b.status === s).length,
    ])
  );
  const activeSessions = scoped.filter(b => b.status !== "cancelled");
  const activeMins = activeSessions.reduce((sum, b) => sum + b.durationMinutes, 0);
  const cancelRate = total > 0 ? Math.round((byStatus.cancelled / total) * 100) : 0;
  const avgDuration = activeSessions.length > 0
    ? Math.round(activeMins / activeSessions.length)
    : 0;
  const delivered = byStatus.completed;

  const instructorStats = MOCK_INSTRUCTORS.map(inst => {
    const iBookings = scoped.filter(b => b.instructorId === inst.id && b.status !== "cancelled");
    const mins = iBookings.reduce((s, b) => s + b.durationMinutes, 0);
    return { inst, sessions: iBookings.length, mins };
  }).sort((a, b) => b.sessions - a.sessions);

  const customerMap: Record<string, { name: string; sessions: number; mins: number }> = {};
  activeSessions.forEach(b => {
    if (!customerMap[b.customerId]) customerMap[b.customerId] = { name: b.customerName, sessions: 0, mins: 0 };
    customerMap[b.customerId].sessions++;
    customerMap[b.customerId].mins += b.durationMinutes;
  });
  const topCustomers = Object.values(customerMap).sort((a, b) => b.sessions - a.sessions).slice(0, 5);

  const recurringCount = scoped.filter(b => b.isRecurring && b.status !== "cancelled").length;
  const walkInCount = scoped.filter(b => b.isWalkIn && b.status !== "cancelled").length;
  const childCount = scoped.filter(b => b.isForChild && b.status !== "cancelled").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212529]">Reports & Analytics</h1>
        <select
          className="input w-44 text-sm py-1.5"
          value={range}
          onChange={e => setRange(e.target.value as Range)}
        >
          <option value="all">All Time</option>
          <option value="may2026">May 2026</option>
        </select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: total },
          { label: "Sessions Delivered", value: delivered },
          { label: "Cancellation Rate", value: `${cancelRate}%` },
          { label: "Avg Session Length", value: `${avgDuration} min` },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className="text-2xl font-bold text-[#212529]">{m.value}</p>
            <p className="text-xs text-[#6c757d] mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Status breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-[#212529] mb-4">Bookings by Status</h2>
          <div className="space-y-3">
            {(["confirmed","completed","cancelled","no_show"] as const).map(s => {
              const count = byStatus[s];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</span>
                    <span className="text-[#6c757d]">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: s === "confirmed" ? "#22c55e" : s === "completed" ? "#337C99" : s === "cancelled" ? "#f33b41" : "#f59e0b",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session types */}
        <div className="card p-5">
          <h2 className="font-semibold text-[#212529] mb-4">Session Types</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: "Recurring series", value: recurringCount },
              { label: "Walk-ins", value: walkInCount },
              { label: "Child sessions", value: childCount },
              { label: "Standard (individual)", value: activeSessions.filter(b => !b.isRecurring && !b.isWalkIn && !b.isForChild).length },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-[#6c757d]">{r.label}</span>
                <span className="font-medium text-[#212529]">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructor performance */}
      <div className="card overflow-x-auto mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-[#212529]">Instructor Performance</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              {["Instructor", "Sessions", "Total Minutes", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {instructorStats.map(({ inst, sessions, mins }) => (
              <tr key={inst.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#212529]">{inst.firstName} {inst.lastName}</td>
                <td className="px-4 py-3 text-[#6c757d]">{sessions}</td>
                <td className="px-4 py-3 text-[#6c757d]">{mins} min</td>
                <td className="px-4 py-3">
                  {inst.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top customers */}
      <div className="card overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-[#212529]">Top Customers by Sessions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              {["Customer", "Sessions", "Total Minutes"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topCustomers.map(c => (
              <tr key={c.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#212529]">{c.name}</td>
                <td className="px-4 py-3 text-[#6c757d]">{c.sessions}</td>
                <td className="px-4 py-3 text-[#6c757d]">{c.mins} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
