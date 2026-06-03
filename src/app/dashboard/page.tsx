"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/units";

export default function UserDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const totalQuotations = orders.length;
  const pendingQuotations = orders.filter((o) => o.status === "PENDING").length;
  const approvedOrders = orders.filter((o) => o.status === "APPROVED");
  const totalSpent = approvedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/10 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome to Seller Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your pharmaceutical raw material quotations</p>
        </div>
        <Link
          id="dashboard-new-quote-link"
          href="/dashboard/order"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 shrink-0"
        >
          Create New Quotation
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value Approved</p>
          <p className="text-3xl font-extrabold text-white mt-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {formatINR(totalSpent)}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-emerald-400">
            <span className="h-4 w-4 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-center font-bold">✓</span>
            <span>From {approvedOrders.length} approved orders</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Quotations</p>
          <p className="text-3xl font-extrabold text-white mt-3">
            {pendingQuotations}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-amber-400">
            <span className="h-4 w-4 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center font-bold font-mono">i</span>
            <span>Awaiting administrator approval</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submitted</p>
          <p className="text-3xl font-extrabold text-white mt-3">
            {totalQuotations}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-indigo-400">
            <span className="h-4 w-4 bg-indigo-500/10 border border-indigo-500/20 rounded flex items-center justify-center font-bold font-mono">#</span>
            <span>Lifetime queries submitted</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-200">Recent Quotations</h2>
          <Link
            id="dashboard-all-quotes-link"
            href="/dashboard/orders"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
            <p className="text-sm text-slate-500">You haven't placed any quotations yet.</p>
            <Link
              href="/dashboard/order"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2 inline-block transition-colors"
            >
              Start draft quotation now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-mono text-xs text-slate-400">{order.id.slice(0, 8)}...</td>
                    <td className="py-4 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-xs">{order.items.length} Product(s)</td>
                    <td className="py-4 font-semibold text-slate-200">{formatINR(order.totalAmount)}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === "PENDING"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : order.status === "APPROVED"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
