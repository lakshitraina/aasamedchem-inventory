"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMsg(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center font-sans">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-[440px] max-w-[90%] bg-card/65 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl relative z-10">
        
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
              A
            </span>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-slate-400 bg-clip-text text-transparent">
              AasaMedChem
            </span>
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground mt-1">Access the Inventory Control Center</p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 px-4 py-3 rounded-xl animate-shake">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              id="login-email-input"
              type="email"
              className="w-full bg-background border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(139,92,246,0.05)]"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Password</label>
            <input
              id="login-password-input"
              type="password"
              className="w-full bg-background border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(139,92,246,0.05)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Demo Credentials</p>
          <div className="text-left bg-background/50 rounded-xl p-3 border border-border space-y-1">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-primary">Admin:</span> admin@aasamedchem.com / admin123
            </p>
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-blue-500">User:</span> user@aasamedchem.com / user123
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}