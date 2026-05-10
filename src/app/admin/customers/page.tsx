"use client";
import { useState } from "react";
import { MOCK_CUSTOMERS } from "@/data/mock/customers";
import { MOCK_BOOKINGS } from "@/data/mock/bookings";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import type { Customer } from "@/data/mock/customers";
import { Pencil, X, Check } from "lucide-react";

type View = "list" | "profile";

export default function CustomersPage() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [flagFilter, setFlagFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    if (q && !fullName.includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (flagFilter === "flagged" && !c.isFlagged) return false;
    if (flagFilter === "not_flagged" && c.isFlagged) return false;
    if (activeFilter === "active" && !c.isActive) return false;
    if (activeFilter === "inactive" && c.isActive) return false;
    return true;
  });

  function openProfile(c: Customer) {
    setSelected(c);
    setView("profile");
    setEditing(false);
  }

  function toggleFlag(id: string) {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isFlagged: !c.isFlagged } : c));
    setSelected(prev => prev ? { ...prev, isFlagged: !prev.isFlagged } : prev);
    setToast({ message: selected?.isFlagged ? "Customer unflagged." : "Customer flagged.", type: "info" });
  }

  function toggleActive(id: string) {
    const now = new Date().toISOString();
    setCustomers(prev => prev.map(c => {
      if (c.id !== id) return c;
      return c.isActive
        ? { ...c, isActive: false, deactivatedAt: now }
        : { ...c, isActive: true, deactivatedAt: undefined };
    }));
    setSelected(prev => {
      if (!prev) return prev;
      return prev.isActive
        ? { ...prev, isActive: false, deactivatedAt: now }
        : { ...prev, isActive: true, deactivatedAt: undefined };
    });
    setToast({ message: selected?.isActive ? "Customer deactivated." : "Customer reactivated.", type: "info" });
    setDeactivateConfirm(false);
  }

  function startEdit() {
    if (!selected) return;
    setEditForm({ firstName: selected.firstName, lastName: selected.lastName, email: selected.email, phone: selected.phone });
    setEditing(true);
  }

  function saveEdit() {
    if (!selected) return;
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, ...editForm } : c));
    setSelected(prev => prev ? { ...prev, ...editForm } : prev);
    setEditing(false);
    setToast({ message: "Customer updated.", type: "success" });
  }

  function toggleSmsOptOut(id: string) {
    const isCurrentlyOptedOut = selected?.smsOptOut ?? false;
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, smsOptOut: !c.smsOptOut } : c));
    setSelected(prev => prev ? { ...prev, smsOptOut: !prev.smsOptOut } : prev);
    setToast({ message: isCurrentlyOptedOut ? "SMS notifications enabled." : "SMS notifications disabled.", type: "info" });
  }

  const customerBookings = selected ? MOCK_BOOKINGS.filter(b => b.customerId === selected.id) : [];

  if (view === "profile" && selected) {
    return (
      <div className="p-6 lg:p-8">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <button onClick={() => setView("list")} className="text-sm text-[#337C99] hover:underline mb-5 flex items-center gap-1">
          ← Back to Customers
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
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
                  <input className="input text-sm py-1.5" value={editForm.phone ?? ""} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
                  <button onClick={() => setEditing(false)} className="btn-secondary text-xs w-full justify-center mt-1"><X className="w-3 h-3 mr-1" />Cancel</button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[#212529]">{selected.firstName} {selected.lastName}</h2>
                  <p className="text-sm text-[#6c757d]">{selected.email}</p>
                  <p className="text-sm text-[#6c757d]">{selected.phone}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {selected.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}
                    {selected.isFlagged && <span className="badge-red">Flagged</span>}
                  </div>
                </>
              )}
            </div>
            {/* Activity */}
            <div className="card p-5">
              <p className="font-semibold text-[#212529] mb-3">Activity Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#6c757d]">No-Shows</span><span className="font-medium">{selected.noShowCount}</span></div>
                <div className="flex justify-between"><span className="text-[#6c757d]">Late Cancellations</span><span className="font-medium">{selected.lateCancellationCount}</span></div>
                <div className="flex justify-between"><span className="text-[#6c757d]">Flagged</span><span className={selected.isFlagged ? "font-medium text-red-600" : "font-medium"}>{ selected.isFlagged ? "Yes" : "No"}</span></div>
              </div>
            </div>
            {/* SMS preference */}
            <div className="card p-5">
              <p className="font-semibold text-[#212529] mb-3">Notifications</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6c757d]">SMS Notifications</span>
                <button
                  role="switch"
                  aria-checked={!selected.smsOptOut}
                  onClick={() => toggleSmsOptOut(selected.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${!selected.smsOptOut ? "bg-[#337C99]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${!selected.smsOptOut ? "left-6" : "left-1"}`} />
                </button>
              </div>
              <p className="text-xs text-[#6c757d] mt-1.5">
                {selected.smsOptOut ? "Customer will not receive SMS notifications." : "Customer will receive SMS notifications."}
              </p>
            </div>
            {/* Actions */}
            <div className="card p-5 space-y-2">
              <button onClick={() => toggleFlag(selected.id)} className="btn-secondary w-full justify-center text-sm">
                {selected.isFlagged ? "Unflag Customer" : "Flag Customer"}
              </button>
              <button onClick={() => setDeactivateConfirm(true)} className={`w-full justify-center text-sm ${selected.isActive ? "btn-danger" : "btn-primary"}`} style={selected.isActive ? {} : { backgroundColor: "#337C99" }}>
                {selected.isActive ? "Deactivate Customer" : "Reactivate Customer"}
              </button>
            </div>
          </div>
          {/* Right: booking history */}
          <div className="lg:col-span-2">
            <div className="card overflow-x-auto">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-[#212529]">Booking History</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100">
                  <tr>
                    {["Ref","Date","Time","Instructor","Duration","Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customerBookings.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-[#6c757d] text-sm">No bookings</td></tr>
                  ) : customerBookings.map(b => (
                    <tr key={b.id}>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#337C99]">{b.bookingReference}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{b.date}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{b.startTime}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{b.instructorName}</td>
                      <td className="px-4 py-2.5 text-[#6c757d]">{b.durationMinutes}m</td>
                      <td className="px-4 py-2.5">
                        <span className={{ confirmed:"badge-green", cancelled:"badge-red", no_show:"badge-yellow", completed:"badge-gray" }[b.status]}>{b.status.replace("_"," ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {deactivateConfirm && (
          <Modal title={selected.isActive ? "Deactivate Customer" : "Reactivate Customer"} onClose={() => setDeactivateConfirm(false)}
            footer={
              <>
                <button onClick={() => setDeactivateConfirm(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => toggleActive(selected.id)} className={selected.isActive ? "btn-danger" : "btn-primary"}>Confirm</button>
              </>
            }
          >
            <p className="text-sm text-[#6c757d]">
              {selected.isActive
                ? `Are you sure you want to deactivate ${selected.firstName} ${selected.lastName}?`
                : `Reactivate ${selected.firstName} ${selected.lastName}?`}
            </p>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-[#212529] mb-6">Customers</h1>

      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <input className="input w-60 text-sm py-1.5" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-40 text-sm py-1.5" value={flagFilter} onChange={e => setFlagFilter(e.target.value)}>
          <option value="all">All Flags</option>
          <option value="flagged">Flagged</option>
          <option value="not_flagged">Not Flagged</option>
        </select>
        <select className="input w-36 text-sm py-1.5" value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              {["Name","Email","Phone","No-shows","Late Cancels","Flag","Status",""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6c757d]">No customers found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#212529]">{c.firstName} {c.lastName}</td>
                <td className="px-4 py-3 text-[#6c757d]">{c.email}</td>
                <td className="px-4 py-3 text-[#6c757d]">{c.phone}</td>
                <td className="px-4 py-3 text-center">{c.noShowCount}</td>
                <td className="px-4 py-3 text-center">{c.lateCancellationCount}</td>
                <td className="px-4 py-3">{c.isFlagged ? <span className="badge-red">Flagged</span> : <span className="text-[#6c757d]">—</span>}</td>
                <td className="px-4 py-3">{c.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openProfile(c)} className="text-[#337C99] hover:underline text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
