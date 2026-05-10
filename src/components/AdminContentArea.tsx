"use client";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default function AdminContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return (
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto" style={{ backgroundColor: "#F7F7F7" }}>
        {children}
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-hidden"
      style={{ backgroundColor: "#F7F7F7" }}
    >
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
