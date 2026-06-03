"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, DIMENSIONS, getConversionFactor, getUnitPriceInTargetUnit, convertToBase } from "@/lib/units";

interface CartItem {
  id: string; // product ID
  name: string;
  sku: string;
  dimension: "WEIGHT" | "VOLUME" | "COUNT";
  baseUnit: string;
  basePrice: number;
  stockQuantity: number;
  orderedQuantity: number;
  orderedUnit: string;
}

export default function PlaceOrderPage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDimension, setSelectedDimension] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Filter products based on search term & dimension
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDimension =
      selectedDimension === "All" || p.dimension === selectedDimension;

    return matchesSearch && matchesDimension;
  });

  // Add a product to the cart
  const addToCart = (product: any) => {
    // Check if already in cart
    const exists = cart.find((item) => item.id === product.id);
    if (exists) return;

    // Pick the first available unit for this dimension as default
    const defaultUnit = DIMENSIONS[product.dimension as keyof typeof DIMENSIONS][0];

    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      dimension: product.dimension,
      baseUnit: product.baseUnit,
      basePrice: product.basePrice,
      stockQuantity: product.stockQuantity,
      orderedQuantity: 1,
      orderedUnit: defaultUnit,
    };

    setCart([...cart, newItem]);
  };

  // Update item quantity in cart
  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return;
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, orderedQuantity: qty } : item
      )
    );
  };

  // Update item unit in cart
  const updateUnit = (id: string, unit: string) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, orderedUnit: unit } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Calculate order subtotal
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const unitPrice = getUnitPriceInTargetUnit(item.basePrice, item.orderedUnit);
      return sum + unitPrice * item.orderedQuantity;
    }, 0);
  };

  // Submit order quotation
  const submitQuotation = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const orderItems = cart.map((item) => ({
      productId: item.id,
      orderedQuantity: item.orderedQuantity,
      orderedUnit: item.orderedUnit,
    }));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: orderItems }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Quotation submitted successfully! Redirecting...");
        setCart([]);
        setTimeout(() => {
          router.push("/dashboard/orders");
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to submit quotation.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] overflow-hidden animate-fadeIn relative z-10">
      
      {/* Catalog Column (Left) */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-4">
        {/* Search & Filter Header */}
        <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl space-y-3 shrink-0">
          <div className="flex gap-2">
            <input
              id="product-search-input"
              className="flex-1 bg-slate-950/80 border border-white/5 focus:border-blue-500/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder:text-slate-600"
              placeholder="Search products by name, SKU or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wider">Dimension:</span>
            {["All", "WEIGHT", "VOLUME", "COUNT"].map((dim) => (
              <button
                key={dim}
                id={`filter-dim-${dim.toLowerCase()}`}
                onClick={() => setSelectedDimension(dim)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                  selectedDimension === dim
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-transparent border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
              <p className="text-sm text-slate-500">No products found matching the criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((p) => {
                const isInCart = cart.some((item) => item.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-slate-900/20 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-slate-200 truncate text-sm" title={p.name}>{p.name}</h3>
                          <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block mt-0.5">SKU: {p.sku}</span>
                        </div>
                        {p.category && (
                          <span className="shrink-0 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[9px] font-semibold uppercase tracking-wider">
                            {p.category}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 min-h-[32px]">
                        {p.description || "No description provided."}
                      </p>

                      {/* Base Info */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/40 rounded-xl p-2.5 border border-white/5 mb-4 text-[10px] text-slate-400">
                        <div>
                          <span className="block text-slate-500 uppercase tracking-wider text-[8px] font-semibold mb-0.5">Base Price</span>
                          <span className="text-slate-200 font-bold text-xs">{formatINR(p.basePrice)}</span>
                          <span className="text-slate-500 font-medium"> / {p.baseUnit}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 uppercase tracking-wider text-[8px] font-semibold mb-0.5">In Stock</span>
                          <span className={`font-bold text-xs ${p.stockQuantity === 0 ? "text-rose-400" : "text-slate-200"}`}>
                            {p.stockQuantity}
                          </span>
                          <span className="text-slate-500 font-medium"> {p.baseUnit}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`add-to-quote-${p.sku.toLowerCase()}`}
                      onClick={() => addToCart(p)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        isInCart
                          ? "bg-slate-800 border border-white/10 text-slate-500 cursor-not-allowed"
                          : "bg-blue-600/15 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-white"
                      }`}
                      disabled={isInCart}
                    >
                      {isInCart ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-sm">+</span>
                          <span>Add to Quote</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Column (Right) */}
      <div className="lg:col-span-5 bg-slate-900/30 border border-white/5 rounded-3xl p-6 flex flex-col h-full overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <span>Quotation Cart</span>
            <span className="h-5 w-5 bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 h-full">
              <div className="h-12 w-12 rounded-full bg-slate-950 flex items-center justify-center border border-white/5">
                <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500">Your quotation draft is empty.<br />Add products from the catalog to get started.</p>
            </div>
          ) : (
            cart.map((item) => {
              const conversionFactor = getConversionFactor(item.orderedUnit);
              const convertedQty = convertToBase(item.orderedQuantity, item.orderedUnit);
              const unitPrice = getUnitPriceInTargetUnit(item.basePrice, item.orderedUnit);
              const lineTotal = unitPrice * item.orderedQuantity;

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm truncate max-w-[200px]" title={item.name}>{item.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500 block">SKU: {item.sku}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                      title="Remove product"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Quantity & Unit Selectors */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7">
                      <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Quantity</label>
                      <input
                        type="number"
                        step="any"
                        className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/40 rounded-xl px-3 py-1.5 text-xs focus:outline-none text-slate-200"
                        value={item.orderedQuantity || ""}
                        onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Unit</label>
                      <select
                        className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/40 rounded-xl px-3 py-1.5 text-xs focus:outline-none text-slate-300 cursor-pointer"
                        value={item.orderedUnit}
                        onChange={(e) => updateUnit(item.id, e.target.value)}
                      >
                        {DIMENSIONS[item.dimension].map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Live Conversion Audit Panel */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-white/5 space-y-1.5 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unit Price:</span>
                      <span className="font-semibold text-slate-300">
                        {formatINR(unitPrice)} <span className="text-[9px] text-slate-500">/ {item.orderedUnit}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Unit equivalent:</span>
                      <span className="font-medium text-slate-300">
                        {convertedQty.toLocaleString()} {item.baseUnit}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1">
                      <span className="font-bold text-slate-400">Line Total:</span>
                      <span className="font-bold text-blue-400 text-xs">
                        {formatINR(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Panel */}
        {cart.length > 0 && (
          <div className="border-t border-white/5 pt-4 mt-4 shrink-0 space-y-4">
            {/* Status alerts */}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-2 rounded-xl text-[10px] flex items-center gap-1.5 animate-shake">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-2 rounded-xl text-[10px] flex items-center gap-1.5">
                <span>✓ {successMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-400">Quotation Total:</span>
              <span className="text-xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                {formatINR(calculateSubtotal())}
              </span>
            </div>

            <button
              id="submit-quotation-btn"
              onClick={submitQuotation}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting Quotation...</span>
                </>
              ) : (
                <span>Submit Quotation</span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
