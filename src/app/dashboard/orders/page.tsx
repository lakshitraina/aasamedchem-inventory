"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/units";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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
    <div className="space-y-6 animate-fadeIn relative z-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-sans">My Quotation History</h1>
        <p className="text-xs text-slate-400 mt-1">Review the status and details of your chemical asset orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
          <p className="text-sm text-slate-500">No quotations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List Section (Left) */}
          <div className={`${selectedOrder ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-slate-900/20 border p-5 rounded-2xl cursor-pointer hover:border-white/10 transition-all duration-300 ${
                  selectedOrder?.id === order.id
                    ? "border-blue-500/30 bg-blue-500/[0.02]"
                    : "border-white/5"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">ID: {order.id}</span>
                    <span className="text-xs text-slate-400 block">{new Date(order.createdAt).toLocaleString()}</span>
                    <span className="text-xs text-slate-300 font-semibold mt-2 block">{order.items.length} Product(s)</span>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between h-full">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider mb-2 ${
                        order.status === "PENDING"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : order.status === "APPROVED"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-base font-extrabold text-white">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Section (Right) */}
          {selectedOrder && (
            <div className="lg:col-span-6 bg-slate-900/30 border border-white/5 rounded-3xl p-6 h-fit animate-slideIn">
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Quotation Details</h3>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">ID: {selectedOrder.id}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{item.product.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500">SKU: {item.product.sku}</span>
                      </div>
                      <span className="font-extrabold text-slate-300 text-sm">{formatINR(item.lineTotal)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-semibold">Ordered Quantity</span>
                        <span className="font-semibold text-slate-200">{item.orderedQuantity} {item.orderedUnit}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-semibold">Unit Price</span>
                        <span className="font-semibold text-slate-200">{formatINR(item.unitPrice)} / {item.orderedUnit}</span>
                      </div>
                      <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                        <span className="block text-slate-500 text-[8px] uppercase tracking-wider font-semibold">Database conversion</span>
                        <span className="font-medium text-slate-300">
                          {item.convertedQuantity.toLocaleString()} {item.product.baseUnit} @ {formatINR(item.product.basePrice)} / {item.product.baseUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Total Amount</span>
                <span className="text-lg font-extrabold text-blue-400">{formatINR(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
