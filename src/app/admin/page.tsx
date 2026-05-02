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
      fetchData(); // refresh
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
      fetchData(); // refresh
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
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
          Orders
        </button>
        <button 
          onClick={() => setActiveTab("inventory")}
          style={{ padding: "0.5rem 1rem", background: activeTab === "inventory" ? "#4a2c00" : "transparent", color: activeTab === "inventory" ? "white" : "#333", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
        >
          Inventory Management
        </button>
      </div>

      {activeTab === "orders" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", textAlign: "left" }}>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Order ID</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Date</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Customer</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Amount</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>UTR (UPI)</th>
                <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>No orders found</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "1rem", fontWeight: "bold" }}>{order.shortId}</td>
                    <td style={{ padding: "1rem" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "1rem" }}>
                      <div>{order.customer.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>{order.customer.phone}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>₹{order.totalAmount}</td>
                    <td style={{ padding: "1rem", fontFamily: "monospace", letterSpacing: "1px" }}>
                      {order.utrNumber || "-"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ 
                          padding: "0.5rem", 
                          borderRadius: "4px", 
                          border: "1px solid #ccc",
                          backgroundColor: order.status === 'PENDING_VERIFICATION' ? '#fff3cd' : 
                                          order.status === 'PROCESSING' ? '#cce5ff' :
                                          order.status === 'SHIPPED' ? '#d4edda' : 'white'
                        }}
                      >
                        <option value="PENDING_VERIFICATION">Pending UTR</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="COMPLETED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
