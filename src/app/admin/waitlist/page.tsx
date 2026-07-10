"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/data/store/useAppStore";
import { MockDataService } from "@/data/service/MockDataService";
import { notifyBoth } from "@/data/service/notifyUtils";
import type { Booking } from "@/data/types";
import Toast from "@/components/Toast";

const db = new MockDataService();

const _d = new Date();
const TODAY = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

type Group = {
  key: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  entries: Booking[];
};

export default function WaitlistPage() {
  const bookings = useAppStore(s => s.bookings);
  const [timeframe, setTimeframe] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<Booking | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; email: string; ref: string } | null>(null);

  // Build grouped waitlist from waitlisted bookings
  const groups: Group[] = useMemo(() => {
    const waitlisted = bookings.filter(b => {
      if (b.status !== "waitlisted") return false;
      const matchesTimeframe = timeframe === "upcoming" ? b.date >= TODAY : b.date < TODAY;
      const q = search.trim().toLowerCase();
      const matchesSearch = q === "" || b.customerName.toLowerCase().includes(q);
      return matchesTimeframe && matchesSearch;
    });

    const map = new Map<string, Group>();
    for (const b of waitlisted) {
      const key = `${b.instructorId}__${b.date}__${b.startTime}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          instructorId: b.instructorId,
          instructorName: b.instructorName,
          date: b.date,
          startTime: b.startTime,
          durationMinutes: b.durationMinutes,
          entries: [],
        });
      }
      map.get(key)!.entries.push(b);
    }

    // Sort entries within each group by createdAt (first-come-first-served)
    for (const g of map.values()) {
      g.entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    // Sort groups by date then time
    return [...map.values()].sort((a, b) =>
      a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)
    );
  }, [bookings, timeframe, search]);

  const totalWaiting = groups.reduce((sum, g) => sum + g.entries.length, 0);

  // Check if instructor is already confirmed at a given slot (slot taken — no more promotions)
  function isSlotTaken(instructorId: string, date: string, startTime: string): boolean {
    return bookings.some(b =>
      b.instructorId === instructorId &&
      b.date === date &&
      b.startTime === startTime &&
      b.status === "confirmed"
    );
  }

  function executeConfirm(booking: Booking) {
    db.confirmWaitlisted(booking.id);
    const customer = db.getCustomers().find(c => c.id === booking.customerId);
    notifyBoth(db, {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      recipientName: booking.customerName,
      recipientEmail: customer?.email ?? "",
      notificationType: "confirmation",
      customerId: booking.customerId,
    });
    setConfirmEntry(null);
    setSuccessInfo({ name: booking.customerName, email: customer?.email ?? "", ref: booking.bookingReference });
  }

  function removeEntry(booking: Booking) {
    db.cancelBooking(booking.id, "admin", "Removed from waitlist by admin");
    setToast({ message: "Waitlist entry removed.", type: "info" });
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#212529]">Waitlist</h1>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {(["upcoming", "past"] as const).map(t => (
                <button key={t} onClick={() => setTimeframe(t)}
                  className={`px-4 py-1.5 font-medium transition-colors capitalize ${
                    timeframe === t ? "bg-[#337C99] text-white" : "bg-white text-[#6c757d] hover:text-[#212529]"
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <p className="text-sm text-[#6c757d] mt-0.5">
            {totalWaiting} {totalWaiting === 1 ? "person" : "people"} waiting across {groups.length} {groups.length === 1 ? "slot" : "slots"}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm text-[#212529] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#337C99]/30"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card p-12 text-center text-[#6c757d]">
          {search ? "No waitlisted entries match your search." : timeframe === "upcoming" ? "No upcoming waitlist entries." : "No past waitlist entries."}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(group => {
            const slotTaken = isSlotTaken(group.instructorId, group.date, group.startTime);
            return (
              <div key={group.key} className="card overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#337C99" }}>
                      {group.instructorName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#212529] text-sm">{group.instructorName}</p>
                      <p className="text-xs text-[#6c757d]">
                        {formatDate(group.date)} · {formatTime(group.startTime)} · {group.durationMinutes} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      {group.entries.length} waiting
                    </span>
                    {slotTaken && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        Slot filled
                      </span>
                    )}
                  </div>
                </div>

                {/* Entries table */}
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100">
                    <tr>
                      {["#", "Customer", "Booking Ref", "Added", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group.entries.map((entry, i) => {
                      const customer = db.getCustomers().find(c => c.id === entry.customerId);
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-[#6c757d] font-medium text-xs">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#212529]">{entry.customerName}</p>
                            {customer?.email && (
                              <p className="text-xs text-[#6c757d]">{customer.email}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#337C99]">{entry.bookingReference}</td>
                          <td className="px-4 py-3 text-xs text-[#6c757d]">
                            {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setConfirmEntry(entry)}
                                disabled={slotTaken}
                                className="btn-primary text-xs py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => removeEntry(entry)}
                                className="btn-secondary text-xs py-1 px-2.5"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm modal */}
      {confirmEntry && (() => {
        const customer = db.getCustomers().find(c => c.id === confirmEntry.customerId);
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <h2 className="text-lg font-bold text-[#212529] mb-2">Confirm Booking</h2>
              <p className="text-sm text-[#6c757d] mb-5">
                This will confirm the waitlisted booking for <strong>{confirmEntry.customerName}</strong> and notify them at <strong>{customer?.email ?? "—"}</strong>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmEntry(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => executeConfirm(confirmEntry)} className="btn-primary flex-1 text-sm">Confirm Booking</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Success modal */}
      {successInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#212529] mb-1">Booking Confirmed</h2>
            <p className="text-sm text-[#6c757d] mb-1">
              <strong>{successInfo.name}</strong> has been notified at <strong>{successInfo.email}</strong>.
            </p>
            <p className="text-xs font-mono text-[#6c757d] mb-5">{successInfo.ref}</p>
            <button onClick={() => setSuccessInfo(null)} className="btn-primary w-full text-sm">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
