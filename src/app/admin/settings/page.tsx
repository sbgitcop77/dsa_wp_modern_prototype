"use client";
import { useState } from "react";
import Toast from "@/components/Toast";

type Tab = "general" | "lanes" | "notifications" | "cancellation" | "security";

const INITIAL_GENERAL = {
  facilityName: "Diamond Sports Academy",
  location: "Odenton, Maryland",
  email: "admin@diamondsports.com",
  phone: "443-555-0100",
  website: "https://thediamondsportsacademy.com",
  timezone: "America/New_York",
  activeLanes: "4",
};

const INITIAL_NOTIFICATIONS = {
  sendConfirmationEmail: true,
  send24hrReminder: true,
  send2hrSmsReminder: true,
  sendCalendarInvite: true,
  notifyAdminOnNewBooking: true,
  notifyAdminOnCancellation: true,
  adminNotificationEmail: "admin@diamondsports.com",
};

const INITIAL_CANCELLATION = {
  lateCancelWindowHours: "24",
  noShowPolicy: "Customers who miss a session without cancelling will be marked as No-Show after 15 minutes.",
  allowCustomerSelfCancel: true,
  requireCancellationReason: false,
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [general, setGeneral] = useState(INITIAL_GENERAL);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [cancellation, setCancellation] = useState(INITIAL_CANCELLATION);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setToast({ message: "General settings saved.", type: "success" });
  }

  function saveNotifications(e: React.FormEvent) {
    e.preventDefault();
    setToast({ message: "Notification settings saved.", type: "success" });
  }

  function saveCancellation(e: React.FormEvent) {
    e.preventDefault();
    setToast({ message: "Cancellation policy saved.", type: "success" });
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (currentPassword !== "diamond123") {
      setToast({ message: "Current password is incorrect.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match.", type: "error" });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ message: "Password must be at least 8 characters.", type: "error" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setToast({ message: "Password updated successfully.", type: "success" });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "lanes", label: "Lane Configuration" },
    { key: "notifications", label: "Notifications" },
    { key: "cancellation", label: "Cancellation Policy" },
    { key: "security", label: "Security" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-[#212529] mb-6">Settings</h1>

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

      <div className="max-w-2xl">

        {/* General */}
        {tab === "general" && (
          <form onSubmit={saveGeneral} className="card p-6 space-y-4">
            <h2 className="font-semibold text-[#212529] mb-2">Facility Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Facility Name</label>
                <input className="input" value={general.facilityName} onChange={e => setGeneral(g => ({ ...g, facilityName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={general.location} onChange={e => setGeneral(g => ({ ...g, location: e.target.value }))} />
              </div>
              <div>
                <label className="label">Contact Email</label>
                <input className="input" type="email" value={general.email} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Website</label>
                <input className="input" value={general.website} onChange={e => setGeneral(g => ({ ...g, website: e.target.value }))} />
              </div>
              <div>
                <label className="label">Timezone</label>
                <select className="input" value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="btn-primary text-sm">Save Changes</button>
            </div>
          </form>
        )}

        {/* Lane Configuration */}
        {tab === "lanes" && (
          <form onSubmit={saveGeneral} className="space-y-4">
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-[#212529]">Active Lanes</h2>
                <p className="text-xs text-[#6c757d] mt-0.5">
                  Number of batting lanes currently available for booking. Changing this affects capacity shown on the dashboard and schedule.
                </p>
              </div>
              <div className="flex items-end gap-4">
                <div className="w-36">
                  <label className="label">Number of Lanes</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={10}
                    value={general.activeLanes}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === "" || (Number(v) >= 1 && Number(v) <= 10)) {
                        setGeneral(g => ({ ...g, activeLanes: v }));
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-[#6c757d] pb-2">Maximum 10 lanes</p>
              </div>
              <div className="pt-1">
                <button type="submit" className="btn-primary text-sm">Save Changes</button>
              </div>
            </div>
          </form>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <form onSubmit={saveNotifications} className="card p-6 space-y-5">
            <h2 className="font-semibold text-[#212529]">Customer Notifications</h2>
            <div className="space-y-3">
              {([
                ["sendConfirmationEmail", "Send confirmation email on booking"],
                ["send24hrReminder", "Send 24-hour email reminder"],
                ["send2hrSmsReminder", "Send 2-hour SMS reminder"],
                ["sendCalendarInvite", "Send Calendar invite"],
              ] as [keyof typeof notifications, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[key] as boolean}
                    onChange={e => setNotifications(n => ({ ...n, [key]: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-[#212529]">{label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-semibold text-[#212529] mb-3">Admin Notifications</h2>
              <div className="space-y-3">
                {([
                  ["notifyAdminOnNewBooking", "Notify admin on new booking"],
                  ["notifyAdminOnCancellation", "Notify admin on cancellation"],
                ] as [keyof typeof notifications, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[key] as boolean}
                      onChange={e => setNotifications(n => ({ ...n, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-[#212529]">{label}</span>
                  </label>
                ))}
                <div>
                  <label className="label">Admin Notification Email</label>
                  <input
                    className="input"
                    type="email"
                    value={notifications.adminNotificationEmail}
                    onChange={e => setNotifications(n => ({ ...n, adminNotificationEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="btn-primary text-sm">Save Changes</button>
            </div>
          </form>
        )}

        {/* Cancellation Policy */}
        {tab === "cancellation" && (
          <form onSubmit={saveCancellation} className="card p-6 space-y-4">
            <h2 className="font-semibold text-[#212529] mb-2">Cancellation Policy</h2>
            <div>
              <label className="label">Late Cancellation Window (hours before session)</label>
              <select
                className="input w-40"
                value={cancellation.lateCancelWindowHours}
                onChange={e => setCancellation(c => ({ ...c, lateCancelWindowHours: e.target.value }))}
              >
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>
            <div>
              <label className="label">No-Show Policy</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={cancellation.noShowPolicy}
                onChange={e => setCancellation(c => ({ ...c, noShowPolicy: e.target.value }))}
              />
            </div>
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancellation.allowCustomerSelfCancel}
                  onChange={e => setCancellation(c => ({ ...c, allowCustomerSelfCancel: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-[#212529]">Allow customers to self-cancel via cancellation link</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancellation.requireCancellationReason}
                  onChange={e => setCancellation(c => ({ ...c, requireCancellationReason: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-[#212529]">Require cancellation reason from customers</span>
              </label>
            </div>
            <div className="pt-2">
              <button type="submit" className="btn-primary text-sm">Save Changes</button>
            </div>
          </form>
        )}

        {/* Security */}
        {tab === "security" && (
          <div className="space-y-4">
            <form onSubmit={changePassword} className="card p-6 space-y-4">
              <h2 className="font-semibold text-[#212529] mb-2">Change Password</h2>
              <div>
                <label className="label">Current Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="btn-primary text-sm">Update Password</button>
              </div>
            </form>

            <div className="card p-6">
              <h2 className="font-semibold text-[#212529] mb-1">Admin Account</h2>
              <p className="text-sm text-[#6c757d] mb-3">Logged in as <strong>Alexis Rivera</strong> (Administrator)</p>
              <a href="/admin/login" className="text-sm text-[#f33b41] hover:underline">Sign Out</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
