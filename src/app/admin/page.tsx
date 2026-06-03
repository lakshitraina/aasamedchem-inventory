"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/units";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const token = localStorage.getItem("token");
      
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (productsRes.ok) setProducts(productsData);
      if (ordersRes.ok) setOrders(ordersData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Calculations
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  // Inventory value: Sum of (stockQuantity * basePrice)
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.basePrice,
    0
  );

  // Sales total: Sum of approved order amounts
  const totalSales = orders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative z-10">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/5 border border-emerald-500/10 p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-slate-100">Welcome Operator</h1>
        <p className="text-sm text-slate-400 mt-1">Control panel dashboard containing system inventory and incoming order streams.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Inventory Asset Value</p>
          <p className="text-2xl font-extrabold text-white mt-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {formatINR(totalInventoryValue)}
          </p>
          <span className="text-[10px] text-slate-500 mt-2 block">Value of all stocked materials</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Sales Approved</p>
          <p className="text-2xl font-extrabold text-white mt-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {formatINR(totalSales)}
          </p>
          <span className="text-[10px] text-slate-500 mt-2 block">Value of cleared orders</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Quotations</p>
          <p className="text-2xl font-extrabold text-white mt-3">
            {pendingOrders}
          </p>
          <span className="text-[10px] text-slate-500 mt-2 block">Requiring review & approval</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-teal-500/10 transition-colors" />
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Products Registered</p>
          <p className="text-2xl font-extrabold text-white mt-3">
            {totalProducts}
          </p>
          <span className="text-[10px] text-slate-500 mt-2 block">Unique items in system</span>
        </div>
      </div>

      {/* Navigation Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-200 text-base">Quick Inventory Overview</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage your chemical stock, adjust base pricing formulas, configure base dimensions, and review current inventory alerts.
          </p>
          <Link
            id="admin-shortcut-inventory"
            href="/admin/products/list"
            className="inline-block bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            Launch Stock Console
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-200 text-base">Order Approvals Streams</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review incoming quotations, verify target-unit conversions with precision validations, and approve/reject transactions with atomic database stock deduction.
          </p>
          <Link
            id="admin-shortcut-orders"
            href="/admin/orders"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            Launch Order Stream
          </Link>
        </div>
      </div>

    </div>
  );
}