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
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative z-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/5 border border-primary/10 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Seller Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your pharmaceutical raw material quotations</p>
        </div>
        <Link
          id="dashboard-new-quote-link"
          href="/dashboard/order"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:-translate-y-0.5 shrink-0 cursor-pointer"
        >
          Create New Quotation
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Value Approved</p>
          <p className="text-3xl font-extrabold text-foreground mt-3 bg-gradient-to-r from-foreground to-slate-400 bg-clip-text text-transparent">
            {formatINR(totalSpent)}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-primary">
            <span className="h-4 w-4 bg-primary/10 border border-primary/20 rounded flex items-center justify-center font-bold">✓</span>
            <span>From {approvedOrders.length} approved orders</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Quotations</p>
          <p className="text-3xl font-extrabold text-foreground mt-3">
            {pendingQuotations}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-amber-500">
            <span className="h-4 w-4 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center font-bold font-mono">i</span>
            <span>Awaiting administrator approval</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Submitted</p>
          <p className="text-3xl font-extrabold text-foreground mt-3">
            {totalQuotations}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-primary">
            <span className="h-4 w-4 bg-primary/10 border border-primary/20 rounded flex items-center justify-center font-bold font-mono">#</span>
            <span>Lifetime queries submitted</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Recent Quotations</h2>
          <Link
            id="dashboard-all-quotes-link"
            href="/dashboard/orders"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-background/50">
            <p className="text-sm text-muted-foreground">You haven't placed any quotations yet.</p>
            <Link
              href="/dashboard/order"
              className="text-xs text-primary hover:text-primary/80 font-semibold mt-2 inline-block transition-colors"
            >
              Start draft quotation now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-slate-300">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}...</td>
                    <td className="py-4 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-xs">{order.items.length} Product(s)</td>
                    <td className="py-4 font-semibold text-foreground">{formatINR(order.totalAmount)}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === "PENDING"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                            : order.status === "APPROVED"
                            ? "bg-primary/10 border border-primary/20 text-primary"
                            : "bg-destructive/10 border border-destructive/20 text-destructive-foreground"
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
