"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/units";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("All");

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setProcessing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Quotation successfully ${newStatus.toLowerCase()}!`);
        // Update local state
        setOrders(orders.map((o) => (o.id === id ? data : o)));
        setSelectedOrder(data); // update detail view
      } else {
        setErrorMsg(data.message || `Failed to ${newStatus.toLowerCase()} order.`);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    return statusFilter === "All" || o.status === statusFilter;
  });

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
    <div className="space-y-6 animate-fadeIn relative z-10">
      
      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <span>✓ {successMsg}</span>
        </div>
      )}

      {/* Filter Header Controls */}
      <div className="flex items-center justify-between bg-slate-900/30 border border-white/5 p-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wider">Status Filter:</span>
          {["All", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              id={`admin-filter-status-${status.toLowerCase()}`}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                statusFilter === status
                  ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
                  : "bg-transparent border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-500 font-semibold">{filteredOrders.length} Quotation(s)</span>
      </div>

      {/* Orders Catalog Layout */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
          <p className="text-sm text-slate-500">No quotations found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Orders List (Left) */}
          <div className={`${selectedOrder ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setSelectedOrder(order);
                }}
                className={`bg-slate-900/20 border p-5 rounded-2xl cursor-pointer hover:border-white/10 transition-all duration-300 ${
                  selectedOrder?.id === order.id
                    ? "border-emerald-500/30 bg-emerald-500/[0.01]"
                    : "border-white/5"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block">ID: {order.id.slice(0, 18)}...</span>
                    <h3 className="font-bold text-slate-200 text-sm truncate max-w-xs">{order.user.name}</h3>
                    <p className="text-[10px] text-slate-400">{order.user.email}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between h-full min-h-[80px]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider ${
                        order.status === "PENDING"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : order.status === "APPROVED"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-base font-extrabold text-white mt-4 block">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quotation Detail Workspace (Right) */}
          {selectedOrder && (
            <div className="lg:col-span-6 bg-slate-900/30 border border-white/5 rounded-3xl p-6 h-fit animate-slideIn">
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Verify Conversion Rates</h3>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">Order Ref: {selectedOrder.id}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* User overview */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-1 text-xs text-slate-400 mb-6">
                <p><span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Purchasing Agent:</span> <span className="font-bold text-slate-200">{selectedOrder.user.name}</span></p>
                <p><span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Email:</span> <span className="text-slate-300">{selectedOrder.user.email}</span></p>
                <p><span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Submitted:</span> <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{item.product.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500">SKU: {item.product.sku}</span>
                      </div>
                      <span className="font-extrabold text-slate-200 text-sm">{formatINR(item.lineTotal)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-semibold">Ordered Quantity</span>
                        <span className="font-semibold text-slate-300">{item.orderedQuantity} {item.orderedUnit}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-semibold font-mono">Formula Unit Rate</span>
                        <span className="font-semibold text-slate-300">{formatINR(item.unitPrice)} / {item.orderedUnit}</span>
                      </div>
                      <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                        <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-semibold font-mono">Internal Base equivalent</span>
                        <span className="font-medium text-slate-300">
                          {item.convertedQuantity.toLocaleString()} {item.product.baseUnit} @ {formatINR(item.product.basePrice)} / {item.product.baseUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom calculations summary */}
              <div className="border-t border-white/5 pt-4 mt-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">Total Calculation</span>
                  <span className="text-lg font-extrabold text-emerald-400">{formatINR(selectedOrder.totalAmount)}</span>
                </div>

                {/* Status-specific action buttons */}
                {selectedOrder.status === "PENDING" ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      id="admin-reject-order-btn"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "REJECTED")}
                      disabled={processing}
                      className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      Reject Quotation
                    </button>
                    <button
                      id="admin-approve-order-btn"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "APPROVED")}
                      disabled={processing}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin h-3 w-3 text-slate-950" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Approve & Deduct</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl text-center text-xs font-semibold border ${
                    selectedOrder.status === "APPROVED"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    This quotation has been {selectedOrder.status.toLowerCase()}.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
