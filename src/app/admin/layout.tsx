"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      setAdminName(user.name);
      setLoading(false);
    } catch (e) {
      localStorage.clear();
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm text-muted-foreground">Loading control panel...</p>
      </div>
    );
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Inventory Management",
      path: "/admin/products/list",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Quotations & Orders",
      path: "/admin/orders",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Background decoration */}
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/65 backdrop-blur-md flex flex-col justify-between shrink-0 relative z-20">
        <div>
          {/* Logo */}
          <div className="px-6 py-6 border-b border-border flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
              A
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-slate-400 bg-clip-text text-transparent">
                AasaMedChem
              </span>
              <span className="text-[10px] text-primary font-semibold tracking-wider uppercase">
                Admin Control
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  id={`admin-nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(139,92,246,0.05)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 px-3 py-1">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase">
              {adminName ? adminName[0] : "A"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold truncate text-foreground">{adminName || "Admin"}</span>
              <span className="text-[10px] text-muted-foreground truncate">System Operator</span>
            </div>
          </div>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive-foreground transition-all duration-300 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Exit Console</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/25 backdrop-blur-md px-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {menuItems.find((item) => item.path === pathname)?.name || "Control Panel"}
          </h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Terminal: Online</span>
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
