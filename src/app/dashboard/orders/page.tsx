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
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
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
        <h1 className="text-2xl font-bold text-foreground font-sans">My Quotation History</h1>
        <p className="text-xs text-muted-foreground mt-1">Review the status and details of your chemical asset orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
          <p className="text-sm text-muted-foreground">No quotations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List Section (Left) */}
          <div className={`${selectedOrder ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-card border p-5 rounded-2xl cursor-pointer hover:border-accent-foreground/10 transition-all duration-300 ${
                  selectedOrder?.id === order.id
                    ? "border-primary/30 bg-primary/[0.02]"
                    : "border-border"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block mb-1">ID: {order.id}</span>
                    <span className="text-xs text-muted-foreground block">{new Date(order.createdAt).toLocaleString()}</span>
                    <span className="text-xs text-slate-300 font-semibold mt-2 block">{order.items.length} Product(s)</span>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between h-full">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider mb-2 ${
                        order.status === "PENDING"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                          : order.status === "APPROVED"
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "bg-destructive/10 border border-destructive/20 text-destructive-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-base font-extrabold text-foreground">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Section (Right) */}
          {selectedOrder && (
            <div className="lg:col-span-6 bg-card border border-border rounded-3xl p-6 h-fit animate-slideIn">
              <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quotation Details</h3>
                  <span className="text-[10px] font-mono text-muted-foreground mt-1 block">ID: {selectedOrder.id}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-background border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{item.product.name}</h4>
                        <span className="text-[10px] font-mono text-muted-foreground">SKU: {item.product.sku}</span>
                      </div>
                      <span className="font-extrabold text-foreground text-sm">{formatINR(item.lineTotal)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground bg-secondary/50 p-2.5 rounded-xl border border-border">
                      <div>
                        <span className="block text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">Ordered Quantity</span>
                        <span className="font-semibold text-foreground">{item.orderedQuantity} {item.orderedUnit}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">Unit Price</span>
                        <span className="font-semibold text-foreground">{formatINR(item.unitPrice)} / {item.orderedUnit}</span>
                      </div>
                      <div className="col-span-2 border-t border-border pt-2 mt-1">
                        <span className="block text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">Database conversion</span>
                        <span className="font-medium text-slate-300">
                          {item.convertedQuantity.toLocaleString()} {item.product.baseUnit} @ {formatINR(item.product.basePrice)} / {item.product.baseUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="border-t border-border pt-4 mt-6 flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Total Amount</span>
                <span className="text-lg font-extrabold text-primary">{formatINR(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
