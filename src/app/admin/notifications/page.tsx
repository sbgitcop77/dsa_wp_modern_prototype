"use client";
import { useState } from "react";
import { MOCK_NOTIFICATIONS } from "@/data/mock/notifications";
import Toast from "@/components/Toast";
import type { NotificationRecord } from "@/data/mock/notifications";

const TYPE_LABELS: Record<NotificationRecord["notificationType"], string> = {
  confirmation: "Confirmation",
  reminder_24hr: "24hr Reminder",
  reminder_2hr_sms: "2hr SMS Reminder",
  change: "Change",
  cancellation: "Cancellation",
  calendar_invite: "Calendar Invite",
};

const CHANNEL_BADGE: Record<NotificationRecord["channel"], string> = {
  email: "badge-blue",
  sms: "badge-orange",
  calendar: "badge-purple",
};

const STATUS_BADGE: Record<NotificationRecord["deliveryStatus"], string> = {
  sent: "badge-green",
  pending: "badge-yellow",
  failed: "badge-red",
};

const PAGE_SIZE = 30;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = notifications.filter(n => {
    const q = search.toLowerCase();
    if (q && !n.recipientName.toLowerCase().includes(q) && !n.bookingReference.toLowerCase().includes(q)) return false;
    if (channelFilter !== "all" && n.channel !== channelFilter) return false;
    if (statusFilter !== "all" && n.deliveryStatus !== statusFilter) return false;
    if (typeFilter !== "all" && n.notificationType !== typeFilter) return false;
    return true;
  });

  function retryNotification(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, deliveryStatus: "pending" as const } : n));
    setToast({ message: "Notification queued for retry.", type: "info" });
  }

  const counts = {
    sent: notifications.filter(n => n.deliveryStatus === "sent").length,
    pending: notifications.filter(n => n.deliveryStatus === "pending").length,
    failed: notifications.filter(n => n.deliveryStatus === "failed").length,
  };

  function formatSentAt(sentAt: string) {
    if (!sentAt) return "—";
    return new Date(sentAt).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-[#212529] mb-6">Notifications</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-2xl font-bold text-[#212529]">{counts.sent}</p>
          <p className="text-xs text-[#6c757d] mt-0.5">Sent</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-[#212529]">{counts.pending}</p>
          <p className="text-xs text-[#6c757d] mt-0.5">Pending</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-red-500">{counts.failed}</p>
          <p className="text-xs text-[#6c757d] mt-0.5">Failed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <input
          className="input w-56 text-sm py-1.5"
          placeholder="Search by name or reference…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input w-36 text-sm py-1.5" value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }}>
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="calendar">Calendar</option>
        </select>
        <select className="input w-36 text-sm py-1.5" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select className="input w-44 text-sm py-1.5" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="all">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              {["Reference", "Recipient", "Type", "Channel", "Sent At", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6c757d]">No notifications found</td></tr>
            ) : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(n => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-[#337C99]">{n.bookingReference}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#212529]">{n.recipientName}</p>
                  <p className="text-xs text-[#6c757d] capitalize">{n.recipientType}</p>
                </td>
                <td className="px-4 py-3 text-[#6c757d]">{TYPE_LABELS[n.notificationType]}</td>
                <td className="px-4 py-3">
                  <span className={CHANNEL_BADGE[n.channel]}>{n.channel}</span>
                </td>
                <td className="px-4 py-3 text-[#6c757d] text-xs">{formatSentAt(n.sentAt)}</td>
                <td className="px-4 py-3">
                  <span className={STATUS_BADGE[n.deliveryStatus]}>{n.deliveryStatus}</span>
                </td>
                <td className="px-4 py-3">
                  {n.deliveryStatus === "failed" && (
                    <button onClick={() => retryNotification(n.id)} className="text-[#337C99] hover:underline text-xs">Retry</button>
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
    </div>
  );
}
