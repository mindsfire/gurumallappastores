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
  const [phoneFilter, setPhoneFilter] = useState("");

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

  const updateProductAvailability = async (productId: string, isAvailable: boolean) => {
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, isAvailable })
      });
      if (!res.ok) throw new Error("Failed to update stock");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Get unique phone numbers for the filter
  const uniquePhones = [...new Set(orders.map(o => o.customer?.phone).filter(Boolean))];

  // Filter orders by phone
  const filteredOrders = phoneFilter 
    ? orders.filter(o => o.customer?.phone === phoneFilter)
    : orders;

  // Get order count by phone
  const orderCountByPhone = (phone: string) => orders.filter(o => o.customer?.phone === phone).length;

  const statusColors: Record<string, string> = {
    PENDING_VERIFICATION: "#fff3cd",
    PROCESSING: "#cce5ff",
    SHIPPED: "#d4edda",
    COMPLETED: "#d4edda",
    CANCELLED: "#f8d7da"
  };

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard...</div>;
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
          Inventory
        </button>
      </div>

      {activeTab === "orders" && (
        <div>
          {/* Phone number filter */}
          <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#666" }}>Filter by Customer:</span>
            <button
              onClick={() => setPhoneFilter("")}
              style={{
                padding: "0.4rem 0.8rem",
                border: phoneFilter === "" ? "2px solid #4a2c00" : "1px solid #ccc",
                background: phoneFilter === "" ? "#f5f0e8" : "white",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: phoneFilter === "" ? "bold" : "normal"
              }}
            >
              All ({orders.length})
            </button>
            {uniquePhones.map(phone => (
              <button
                key={phone}
                onClick={() => setPhoneFilter(phone)}
                style={{
                  padding: "0.4rem 0.8rem",
                  border: phoneFilter === phone ? "2px solid #4a2c00" : "1px solid #ccc",
                  background: phoneFilter === phone ? "#f5f0e8" : "white",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: phoneFilter === phone ? "bold" : "normal"
                }}
              >
                📱 {phone} ({orderCountByPhone(phone)})
              </button>
            ))}
          </div>

          {/* Orders list */}
          {filteredOrders.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#666", background: "white", borderRadius: "8px" }}>
              No orders found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredOrders.map(order => (
                <div key={order.id} style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                  {/* Order header - always visible */}
                  <div
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    style={{ padding: "1rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#4a2c00" }}>{order.shortId}</span>
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span style={{ fontWeight: "bold" }}>₹{order.totalAmount}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        background: statusColors[order.status] || "#eee"
                      }}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: "1.2rem" }}>{expandedOrder === order.id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded order details */}
                  {expandedOrder === order.id && (
                    <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid #eee" }}>
                      {/* Customer info */}
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

                      {/* Order items */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ fontWeight: "bold", color: "#333", marginBottom: "0.5rem", fontSize: "0.9rem" }}>🛒 Items Ordered</div>
                        {order.items?.map((item: any) => (
                          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.9rem", borderBottom: "1px dashed #eee" }}>
                            <span>{item.product?.name} - {item.product?.unitSize} × {item.quantity}</span>
                            <span style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.85rem", color: "#666" }}>
                          <span>Delivery Fee</span>
                          <span>₹30</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontWeight: "bold", borderTop: "1px solid #333" }}>
                          <span>Total</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* UTR */}
                      <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                        <span style={{ fontWeight: "bold", color: "#333" }}>💳 UTR: </span>
                        <span style={{ fontFamily: "monospace", letterSpacing: "1px", background: "#f5f5f5", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                          {order.utrNumber || "Not provided"}
                        </span>
                      </div>

                      {/* Status update */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Update Status:</span>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{ 
                            padding: "0.5rem", 
                            borderRadius: "4px", 
                            border: "1px solid #ccc",
                            backgroundColor: statusColors[order.status] || "white",
                            fontWeight: "bold"
                          }}
                        >
                          <option value="PENDING_VERIFICATION">Pending UTR</option>
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
            </div>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", textAlign: "left" }}>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Product Name</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Variant Size</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Price</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "1rem", fontWeight: "bold" }}>{product.name}</td>
                  <td style={{ padding: "1rem" }}>{product.unitSize}</td>
                  <td style={{ padding: "1rem" }}>₹{product.price}</td>
                  <td style={{ padding: "1rem" }}>
                    <select 
                      defaultValue={product.isAvailable ? "true" : "false"}
                      onChange={(e) => updateProductAvailability(product.id, e.target.value === "true")}
                      style={{ 
                        padding: "0.5rem", 
                        borderRadius: "4px", 
                        border: "1px solid #ccc",
                        background: product.isAvailable ? "#d4edda" : "#f8d7da"
                      }}
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
