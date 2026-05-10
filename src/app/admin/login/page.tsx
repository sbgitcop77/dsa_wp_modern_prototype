"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      if (res.ok) {
        setToast({ message: "Welcome back, Alexis!", type: "success" });
        setTimeout(() => router.push("/admin"), 800);
      } else {
        setToast({ message: "Invalid username or password.", type: "error" });
        setLoading(false);
      }
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F7F7F7" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4" style={{ backgroundColor: "#00141B" }}>
              DSA
            </div>
            <h1 className="text-xl font-bold text-[#212529]">Admin Login</h1>
            <p className="text-sm text-[#6c757d] mt-1">Diamond Sports Academy</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-[#6c757d] mt-4">Diamond Sports Academy · Admin Portal</p>
      </div>
    </div>
  );
}
