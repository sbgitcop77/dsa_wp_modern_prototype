"use client";
import { useState } from "react";
import { MOCK_WAITLIST } from "@/data/mock/waitlist";
import Toast from "@/components/Toast";

const TODAY = new Date().toISOString().slice(0, 10);
const PAGE_SIZE = 20;

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}-${day}-${y}`;
}

function generateBookingRef(date: string) {
  return `BK-${date.replace(/-/g, "").slice(2)}`;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState(MOCK_WAITLIST);
  const [timeframe, setTimeframe] = useState<"upcoming" | "past">("upcoming");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [page, setPage] = useState(1);

  function promote(id: string) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const bookingRef = generateBookingRef(entry.date);
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, convertedBookingId: bookingRef } : e)
    );
    setToast({ message: `${entry.firstName} ${entry.lastName} promoted to confirmed booking (${bookingRef}).`, type: "success" });
  }

  function remove(id: string) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    setEntries(prev => prev.filter(e => e.id !== id));
    setToast({ message: "Waitlist entry removed.", type: "info" });
  }

  const filtered = entries
    .filter(e => timeframe === "upcoming" ? e.date > TODAY : e.date <= TODAY)
    .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time));

  const waitingCount = filtered.filter(e => !e.convertedBookingId).length;
  const convertedCount = filtered.filter(e => e.convertedBookingId).length;

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#212529]">Waitlist</h1>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {(["upcoming", "past"] as const).map(t => (
                <button key={t} onClick={() => { setTimeframe(t); setPage(1); }}
                  className={`px-4 py-1.5 font-medium transition-colors capitalize ${
                    timeframe === t ? "bg-[#337C99] text-white" : "bg-white text-[#6c757d] hover:text-[#212529]"
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <p className="text-sm text-[#6c757d] mt-0.5">
            {waitingCount} {waitingCount === 1 ? "entry" : "entries"} waiting
            {convertedCount > 0 && (
              <span className="ml-2 text-green-600">· {convertedCount} converted</span>
            )}
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              {["#", "Customer", "Email", "Phone", "Date", "Time", "Instructor", "Added", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-[#6c757d]">
                  {timeframe === "upcoming"
                    ? "No upcoming waitlist entries."
                    : "No past waitlist entries."}
                </td>
              </tr>
            ) : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((e, i) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-[#6c757d] font-medium">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-3 font-medium text-[#212529]">{e.firstName} {e.lastName}</td>
                <td className="px-4 py-3 text-[#6c757d]">{e.email}</td>
                <td className="px-4 py-3 text-[#6c757d]">{e.phone}</td>
                <td className="px-4 py-3 text-[#6c757d]">{formatDate(e.date)}</td>
                <td className="px-4 py-3 text-[#6c757d]">{formatTime(e.time)}</td>
                <td className="px-4 py-3 text-[#6c757d]">{e.instructorName}</td>
                <td className="px-4 py-3 text-[#6c757d] text-xs">
                  {new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  {e.convertedBookingId ? (
                    <span className="badge-green">Converted</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Waiting</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {e.convertedBookingId ? (
                    <span className="text-xs text-[#6c757d] font-mono">{e.convertedBookingId}</span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => promote(e.id)}
                        className="btn-primary text-xs py-1 px-2"
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => remove(e.id)}
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(() => {
          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
              <span className="text-[#6c757d]">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40">←</button>
                <span className="px-3 text-[#6c757d]">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40">→</button>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="mt-4 text-xs text-[#6c757d] bg-blue-50 border border-blue-200 rounded-lg p-3">
        <strong>Promote</strong> moves the customer off the waitlist and creates a confirmed booking when a cancellation opens a slot.
        Customers are notified automatically upon promotion. Converted entries are retained for audit purposes.
      </div>
    </div>
  );
}
