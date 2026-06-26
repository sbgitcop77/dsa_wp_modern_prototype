"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, UserCheck,
  Clock, Bell, Settings, ListOrdered, BarChart2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Today's Schedule", icon: LayoutDashboard, href: "/admin" },
  { label: "Manage Bookings", icon: CalendarDays,  href: "/admin/bookings" },
  { label: "Waitlist",     icon: ListOrdered,     href: "/admin/waitlist" },
  { label: "Customers",    icon: Users,           href: "/admin/customers" },
  { label: "Instructors",  icon: UserCheck,       href: "/admin/instructors" },
  { label: "Academy Schedule", icon: Clock,        href: "/admin/schedule" },
  { label: "Reports",      icon: BarChart2,       href: "/admin/reports" },
  { label: "Notifications",icon: Bell,            href: "/admin/notifications" },
  { label: "Settings",     icon: Settings,        href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full overflow-y-auto" style={{ backgroundColor: "#00141B" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ backgroundColor: "#337C99" }}>
            DSA
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Diamond Sports</p>
            <p className="text-white/50 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#337C99" }}>
            AR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Alexis Rivera</p>
            <p className="text-white/50 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-3 block w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
