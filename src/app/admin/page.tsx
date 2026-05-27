"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Inventory management state
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", unitSize: "", price: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", unitSize: "", price: "", description: "" });
  const [actionMsg, setActionMsg] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/products")
      ]);
      
      if (!ordersRes.ok || !productsRes.ok) throw new Error("Failed to load dashboard data");
      
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      
      setOrders(ordersData.orders);
      setProducts(productsData.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateProduct = async (productId: string, updates: Record<string, any>) => {
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, ...updates })
      });
      if (!res.ok) throw new Error("Failed to update product");
      setEditingProduct(null);
      setActionMsg("Product updated ✓");
      setTimeout(() => setActionMsg(""), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.unitSize || !newProduct.price) {
      alert("Name, Unit Size, and Price are required");
      return;
    }
    try {
      const body = JSON.stringify({
        name: newProduct.name,
        unitSize: newProduct.unitSize,
        price: parseFloat(newProduct.price),
        description: newProduct.description
      });

      // Retry once on failure (handles Neon cold start)
      let res = await fetch(`/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      if (!res.ok) {
        setActionMsg("Database waking up... retrying...");
        res = await fetch(`/api/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        });
      }
      if (!res.ok) throw new Error("Failed to add product");
      setShowAddForm(false);
      setNewProduct({ name: "", unitSize: "", price: "", description: "" });
      setActionMsg("Product added ✓");
      setTimeout(() => setActionMsg(""), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");
      if (data.softDeleted) {
        setActionMsg(data.message);
      } else {
        setActionMsg("Product deleted ✓");
      }
      setTimeout(() => setActionMsg(""), 5000);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEditing = (product: any) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      unitSize: product.unitSize,
      price: String(product.price),
      description: product.description || ""
    });
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Get unique phone numbers for the filter
  // Reset to page 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  let filteredOrders = orders;
  
  if (statusFilter !== "ALL") {
    filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
  }
  
  if (searchQuery) {
    filteredOrders = filteredOrders.filter(o => 
      o.customer?.phone?.includes(searchQuery) || 
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shortId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColors: Record<string, string> = {
    PENDING_UTR: "#fde8d8",
    PENDING_VERIFICATION: "#fff3cd",
    PROCESSING: "#cce5ff",
    SHIPPED: "#d4edda",
    COMPLETED: "#d4edda",
    CANCELLED: "#f8d7da"
  };

  const inputStyle = {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
    width: "100%"
  };

  if (isLoading) return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", animation: "pulse 1.5s infinite ease-in-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ width: "200px", height: "36px", background: "#eee", borderRadius: "6px" }}></div>
        <div style={{ width: "80px", height: "36px", background: "#eee", borderRadius: "4px" }}></div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid #eee", paddingBottom: "0.5rem" }}>
        <div style={{ width: "100px", height: "36px", background: "#eee", borderRadius: "4px" }}></div>
        <div style={{ width: "120px", height: "36px", background: "#eee", borderRadius: "4px" }}></div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <div style={{ width: "150px", height: "32px", background: "#eee", borderRadius: "20px" }}></div>
        <div style={{ width: "120px", height: "32px", background: "#eee", borderRadius: "20px" }}></div>
        <div style={{ width: "130px", height: "32px", background: "#eee", borderRadius: "20px" }}></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: "100%", height: "70px", background: "#f5f5f5", borderRadius: "8px" }}></div>
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
  if (error) return <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "transparent", borderRadius: "4px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid #eee", paddingBottom: "0.5rem" }}>
        <button 
          onClick={() => setActiveTab("orders")}
          style={{ padding: "0.5rem 1rem", background: activeTab === "orders" ? "#4a2c00" : "transparent", color: activeTab === "orders" ? "white" : "#333", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
        >
          Orders ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab("inventory")}
          style={{ padding: "0.5rem 1rem", background: activeTab === "inventory" ? "#4a2c00" : "transparent", color: activeTab === "inventory" ? "white" : "#333", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
        >
          Inventory ({products.length})
        </button>
      </div>

      {/* Action message toast */}
      {actionMsg && (
        <div style={{
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          borderRadius: "6px",
          background: actionMsg.includes("✓") ? "#d4edda" : "#fff3cd",
          color: actionMsg.includes("✓") ? "#155724" : "#856404",
          fontWeight: "bold",
          fontSize: "0.9rem"
        }}>
          {actionMsg}
        </div>
      )}

      {/* ====== ORDERS TAB ====== */}
      {activeTab === "orders" && (
        <div>
          <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", background: "#f9f9f9", padding: "1rem", borderRadius: "8px", border: "1px solid #eee" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1 1 250px" }}>
              <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", whiteSpace: "nowrap" }}>🔍 Search:</span>
              <input 
                type="search" 
                placeholder="Name, Phone, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", whiteSpace: "nowrap" }}>📋 Status:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: "auto", cursor: "pointer", background: "white" }}
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING_UTR">Awaiting Payment</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== "ALL") && (
              <span style={{ fontSize: "0.85rem", color: "#666", width: "100%" }}>
                Found {filteredOrders.length} matching {filteredOrders.length === 1 ? "order" : "orders"}
              </span>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#666", background: "white", borderRadius: "8px" }}>No orders found</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {paginatedOrders.map(order => (
                <div key={order.id} style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                  <div onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} style={{ padding: "1rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", flex: 1 }}>
                      <span style={{ fontWeight: "bold", fontSize: "1rem", color: "#4a2c00", minWidth: "85px" }}>{order.shortId}</span>
                      <span style={{ fontSize: "0.85rem", color: "#666", whiteSpace: "nowrap" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "#444", fontWeight: "600", whiteSpace: "nowrap", background: "#f5f5f5", padding: "0.15rem 0.4rem", borderRadius: "4px", border: "1px solid #eaeaea" }}>
                        📱 {order.customer?.phone}
                      </span>
                      <span style={{ fontWeight: "bold", fontSize: "0.95rem" }}>₹{order.totalAmount}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ padding: "0.25rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold", background: statusColors[order.status] || "#eee", whiteSpace: "nowrap" }}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: "1rem", color: "#999", marginLeft: "0.25rem" }}>{expandedOrder === order.id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid #eee" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem 0", fontSize: "0.9rem" }}>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#333", marginBottom: "0.25rem" }}>👤 Customer</div>
                          <div>{order.customer.name}</div>
                          <div style={{ color: "#666" }}>📱 {order.customer.phone}</div>
                          {order.customer.email && <div style={{ color: "#666" }}>✉️ {order.customer.email}</div>}
                        </div>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#333", marginBottom: "0.25rem" }}>📍 Delivery Address</div>
                          <div>{order.customer.address}</div>
                          <div>{order.customer.city} - {order.customer.pincode}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ fontWeight: "bold", color: "#333", marginBottom: "0.5rem", fontSize: "0.9rem" }}>🛒 Items Ordered</div>
                        {order.items?.map((item: any) => (
                          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.9rem", borderBottom: "1px dashed #eee" }}>
                            <span>{item.product?.name} - {item.product?.unitSize} × {item.quantity}</span>
                            <span style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.85rem", color: "#666" }}>
                          <span>Delivery Fee</span><span>₹30</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontWeight: "bold", borderTop: "1px solid #333" }}>
                          <span>Total</span><span>₹{order.totalAmount}</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                        <span style={{ fontWeight: "bold", color: "#333" }}>💳 UTR: </span>
                        <span style={{ fontFamily: "monospace", letterSpacing: "1px", background: "#f5f5f5", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {order.utrNumber || "Not provided"}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Update Status:</span>
                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: statusColors[order.status] || "white", fontWeight: "bold" }}>
                          <option value="PENDING_UTR">Awaiting Payment</option>
                          <option value="PENDING_VERIFICATION">Pending Verification</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="COMPLETED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid #eee" }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #ccc", background: currentPage === 1 ? "#f9f9f9" : "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? "#999" : "#333", fontWeight: "bold" }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    Page <strong style={{ color: "#333" }}>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #ccc", background: currentPage === totalPages ? "#f9f9f9" : "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? "#999" : "#333", fontWeight: "bold" }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====== INVENTORY TAB ====== */}
      {activeTab === "inventory" && (
        <div>
          {/* Add Product Button */}
          <div style={{ marginBottom: "1.5rem" }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                padding: "0.6rem 1.2rem",
                background: showAddForm ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              {showAddForm ? "✕ Cancel" : "+ Add New Product"}
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div style={{ background: "#f8f9fa", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", border: "2px dashed #28a745" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Add New Product</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#666" }}>Product Name</label>
                  <input
                    placeholder="e.g. Fresh Cow Butter"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#666" }}>Pack Size</label>
                  <input
                    placeholder="e.g. 500g Pack"
                    value={newProduct.unitSize}
                    onChange={(e) => setNewProduct({ ...newProduct, unitSize: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#666" }}>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 640"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    style={inputStyle}
                    min="1"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#666" }}>Description (optional)</label>
                  <input
                    placeholder="Short description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                onClick={addProduct}
                style={{ padding: "0.6rem 1.5rem", background: "#28a745", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Save Product
              </button>
            </div>
          )}

          {/* Product List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {products.map(product => (
              <div key={product.id} style={{
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "1rem",
                opacity: product.isAvailable ? 1 : 0.6
              }}>
                {editingProduct === product.id ? (
                  /* ---- EDIT MODE ---- */
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", color: "#666", marginBottom: "0.2rem" }}>Name</label>
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", color: "#666", marginBottom: "0.2rem" }}>Pack Size</label>
                        <input value={editForm.unitSize} onChange={(e) => setEditForm({ ...editForm, unitSize: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", color: "#666", marginBottom: "0.2rem" }}>Price (₹)</label>
                        <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={inputStyle} min="1" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", color: "#666", marginBottom: "0.2rem" }}>Description</label>
                        <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => updateProduct(product.id, {
                          name: editForm.name,
                          unitSize: editForm.unitSize,
                          price: parseFloat(editForm.price),
                          description: editForm.description
                        })}
                        style={{ padding: "0.5rem 1rem", background: "#28a745", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        style={{ padding: "0.5rem 1rem", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- VIEW MODE ---- */
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{product.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>{product.unitSize}</div>
                      {product.description && <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.2rem" }}>{product.description}</div>}
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#4a2c00", minWidth: "80px" }}>
                      ₹{product.price}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <select
                        value={product.isAvailable ? "true" : "false"}
                        onChange={(e) => updateProduct(product.id, { isAvailable: e.target.value === "true" })}
                        style={{
                          padding: "0.4rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          background: product.isAvailable ? "#d4edda" : "#f8d7da",
                          fontSize: "0.85rem",
                          fontWeight: "bold"
                        }}
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                      <button
                        onClick={() => startEditing(product)}
                        style={{ padding: "0.4rem 0.8rem", background: "transparent", color: "#4a2c00", border: "1px solid #4a2c00", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id, `${product.name} - ${product.unitSize}`)}
                        style={{ padding: "0.4rem 0.8rem", background: "transparent", color: "#dc3545", border: "1px solid #dc3545", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
