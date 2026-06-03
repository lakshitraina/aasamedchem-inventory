"use client";

import { useEffect, useState } from "react";
import { formatINR, DIMENSIONS, BASE_UNITS } from "@/lib/units";

export default function ProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDimension, setSelectedDimension] = useState("All");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    sku: "",
    dimension: "WEIGHT",
    baseUnit: "g",
    stockQuantity: "",
    basePrice: "",
    category: "",
    description: "",
  });

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    dimension: "WEIGHT",
    baseUnit: "g",
    stockQuantity: "",
    basePrice: "",
    category: "",
    description: "",
  });

  // Notifications
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

  // Handle Dimension selection changes to auto-update baseUnit in forms
  const handleCreateDimensionChange = (dim: string) => {
    const defaultUnit = BASE_UNITS[dim as keyof typeof BASE_UNITS];
    setCreateForm({
      ...createForm,
      dimension: dim,
      baseUnit: defaultUnit,
    });
  };

  const handleEditDimensionChange = (dim: string) => {
    const defaultUnit = BASE_UNITS[dim as keyof typeof BASE_UNITS];
    setEditForm({
      ...editForm,
      dimension: dim,
      baseUnit: defaultUnit,
    });
  };

  // Create Product Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Product created successfully!");
        setProducts([...products, data]);
        setIsCreateOpen(false);
        setCreateForm({
          name: "",
          sku: "",
          dimension: "WEIGHT",
          baseUnit: "g",
          stockQuantity: "",
          basePrice: "",
          category: "",
          description: "",
        });
      } else {
        setErrorMsg(data.message || "Failed to create product.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  // Edit Product Select & Open
  const openEditModal = (product: any) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      sku: product.sku,
      dimension: product.dimension,
      baseUnit: product.baseUnit,
      stockQuantity: product.stockQuantity.toString(),
      basePrice: product.basePrice.toString(),
      category: product.category || "",
      description: product.description || "",
    });
    setIsEditOpen(true);
  };

  // Edit Product Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!editProduct) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Product updated successfully!");
        setProducts(
          products.map((p) => (p.id === editProduct.id ? data : p))
        );
        setIsEditOpen(false);
        setEditProduct(null);
      } else {
        setErrorMsg(data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Product deleted successfully.");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        setErrorMsg(data.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDimension =
      selectedDimension === "All" || p.dimension === selectedDimension;

    return matchesSearch && matchesDimension;
  });

  return (
    <div className="space-y-6 animate-fadeIn relative z-10">
      
      {/* Alert Notifications */}
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

      {/* Header controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/30 border border-white/5 p-5 rounded-2xl shrink-0">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
          <input
            id="admin-search-input"
            className="bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs focus:outline-none placeholder:text-slate-600 flex-1 md:max-w-xs"
            placeholder="Search by name, SKU or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            id="admin-filter-dimension"
            className="bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-slate-300 cursor-pointer"
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
          >
            <option value="All">All Dimensions</option>
            <option value="WEIGHT">Weight</option>
            <option value="VOLUME">Volume</option>
            <option value="COUNT">Count</option>
          </select>
        </div>

        <button
          id="admin-create-product-btn"
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5 hover:-translate-y-0.5"
        >
          <span>+</span>
          <span>Register Product</span>
        </button>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
          <p className="text-sm text-slate-500">No products registered in the database.</p>
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/40">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base Unit</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Base Rate (INR)</th>
                  <th className="p-4">Asset Value</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredProducts.map((p) => {
                  const assetValue = p.stockQuantity * p.basePrice;
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-200 text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono truncate max-w-xs">{p.description || "No description."}</div>
                      </td>
                      <td className="p-4 font-mono font-medium tracking-wider text-slate-400">{p.sku}</td>
                      <td className="p-4">
                        {p.category ? (
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-400">
                        {p.baseUnit} <span className="text-[9px] text-slate-600">({p.dimension})</span>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${p.stockQuantity <= 50 ? "text-rose-400" : "text-slate-200"}`}>
                          {p.stockQuantity.toLocaleString()}
                        </span>
                        {p.stockQuantity <= 50 && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded text-[8px] font-bold">LOW</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-200">{formatINR(p.basePrice)}</td>
                      <td className="p-4 font-extrabold text-emerald-400">{formatINR(assetValue)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`edit-product-${p.sku.toLowerCase()}`}
                            onClick={() => openEditModal(p)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 p-2 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            id={`delete-product-${p.sku.toLowerCase()}`}
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/10 text-rose-400 p-2 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/5 rounded-3xl w-[500px] max-w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Register New Material</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Product Name *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    placeholder="e.g. Sodium Chloride"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Unique SKU *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    placeholder="e.g. NACL-001"
                    value={createForm.sku}
                    onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    placeholder="e.g. Salts"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Measurement Dimension *</label>
                  <select
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-300 cursor-pointer"
                    value={createForm.dimension}
                    onChange={(e) => handleCreateDimensionChange(e.target.value)}
                  >
                    <option value="WEIGHT">Weight</option>
                    <option value="VOLUME">Volume</option>
                    <option value="COUNT">Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Base Unit *</label>
                  <select
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-300 cursor-pointer"
                    value={createForm.baseUnit}
                    onChange={(e) => setCreateForm({ ...createForm, baseUnit: e.target.value })}
                  >
                    {DIMENSIONS[createForm.dimension as keyof typeof DIMENSIONS].map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Initial Stock Level *</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    placeholder="e.g. 50000"
                    value={createForm.stockQuantity}
                    onChange={(e) => setCreateForm({ ...createForm, stockQuantity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Base Price per unit (INR) *</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    placeholder="e.g. 0.08"
                    value={createForm.basePrice}
                    onChange={(e) => setCreateForm({ ...createForm, basePrice: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200 resize-none"
                    placeholder="Brief details about compound purity or composition..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="admin-create-submit-btn"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/5 rounded-3xl w-[500px] max-w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Edit Material Details</h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditProduct(null);
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Product Name *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">SKU Code *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    value={editForm.sku}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Dimension (Read-Only)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                    value={editForm.dimension}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Base Unit (Read-Only)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                    value={editForm.baseUnit}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Stock Level *</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Base Price per unit (INR) *</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none text-slate-200 resize-none"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditProduct(null);
                  }}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="admin-edit-submit-btn"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
