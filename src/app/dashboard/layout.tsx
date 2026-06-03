"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
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
      setUserName(user.name);
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-10 w-10 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm text-slate-400">Loading your workspace...</p>
      </div>
    );
  }

  const menuItems = [
    {
      name: "Dashboard Overview",
      path: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "New Quotation / Order",
      path: "/dashboard/order",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "My Quotations",
      path: "/dashboard/orders",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shrink-0 relative z-20">
        <div>
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/5 flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center font-bold text-slate-950 text-base">
              A
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AasaMedChem
              </span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Seller Panel
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
                  id={`user-nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
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
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2 px-3 py-1">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs uppercase">
              {userName ? userName[0] : "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold truncate text-slate-200">{userName || "User"}</span>
              <span className="text-[10px] text-slate-500 truncate">Registered Seller</span>
            </div>
          </div>
          <button
            id="user-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Exit Workspace</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            {menuItems.find((item) => item.path === pathname)?.name || "Seller Panel"}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Server connection: Stable</span>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
