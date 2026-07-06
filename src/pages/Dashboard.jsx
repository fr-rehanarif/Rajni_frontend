import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.purchase_price || 0) * Number(p.stock || 0),
    0
  );

  const expectedProfit = products.reduce(
    (sum, p) =>
      sum +
      (Number(p.selling_price || 0) - Number(p.purchase_price || 0)) *
        Number(p.stock || 0),
    0
  );

  const lowStockItems = products.filter((p) => Number(p.stock || 0) <= 5);

  const topProfitProduct = [...products].sort((a, b) => {
    const profitA = Number(a.selling_price || 0) - Number(a.purchase_price || 0);
    const profitB = Number(b.selling_price || 0) - Number(b.purchase_price || 0);
    return profitB - profitA;
  })[0];

  const highestStockProduct = [...products].sort(
    (a, b) => Number(b.stock || 0) - Number(a.stock || 0)
  )[0];

  const activity = JSON.parse(localStorage.getItem("inventoryActivity") || "[]");

  return (
    <div className="premium-dashboard">
      <div className="dash-hero compact">
        <div>
          <span>Rajni Saree Center</span>
          <h1>Business Command Center</h1>
          <p>Live inventory, profit and stock health overview.</p>
        </div>

        <button onClick={() => navigate("/app/billing")}>+ New Bill</button>
      </div>

      <div className="dash-stats">
        <div className="dash-card">
          <div className="dash-icon">📦</div>
          <span>Total Products</span>
          <h2>{totalProducts}</h2>
        </div>

        <div className="dash-card">
          <div className="dash-icon">🏬</div>
          <span>Total Stock</span>
          <h2>{totalStock}</h2>
        </div>

        <div className="dash-card">
          <div className="dash-icon">💰</div>
          <span>Inventory Value</span>
          <h2>₹{inventoryValue.toLocaleString("en-IN")}</h2>
        </div>

        <div className="dash-card success">
          <div className="dash-icon">📈</div>
          <span>Expected Profit</span>
          <h2>₹{expectedProfit.toLocaleString("en-IN")}</h2>
        </div>
      </div>

      <div className="dash-main-grid">
        <div className="dash-panel">
          <h3>Quick Actions</h3>

          <div className="dash-actions">
            <button onClick={() => navigate("/app/billing")}>+ New Bill</button>
            <button onClick={() => navigate("/app/inventory")}>
              + Add Product
            </button>
            <button onClick={() => navigate("/app/customers")}>
              + Customer
            </button>
            <button onClick={() => navigate("/app/reports")}>Reports</button>
          </div>
        </div>

        <div className="dash-panel dark">
          <h3>Top Insights</h3>

          <div className="dash-insight">
            <span>Most Profitable</span>
            <strong>{topProfitProduct?.name || "-"}</strong>
          </div>

          <div className="dash-insight">
            <span>Highest Stock</span>
            <strong>{highestStockProduct?.name || "-"}</strong>
          </div>

          <div className="dash-insight">
            <span>Low Stock Alerts</span>
            <strong>{lowStockItems.length}</strong>
          </div>
        </div>
      </div>

      <div className="dash-main-grid">
        <div className="dash-panel">
          <h3>Low Stock Alert</h3>

          {lowStockItems.length === 0 ? (
            <div className="dash-empty">No low stock products 🎉</div>
          ) : (
            lowStockItems.slice(0, 5).map((item) => (
              <div className="dash-row" key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.stock} left</span>
              </div>
            ))
          )}
        </div>

        <div className="dash-panel">
          <div className="panel-title-row">
            <h3>Demo Sales Trend</h3>
            <span>This Week</span>
          </div>

          <div className="fake-chart premium">
            <div style={{ height: "45%" }}></div>
            <div style={{ height: "70%" }}></div>
            <div style={{ height: "35%" }}></div>
            <div style={{ height: "85%" }}></div>
            <div style={{ height: "60%" }}></div>
          </div>
        </div>
      </div>

      <div className="dash-panel">
        <div className="panel-title-row">
          <h3>Recent Activity</h3>
          <span>Inventory Logs</span>
        </div>

        {activity.length === 0 ? (
          <div className="dash-empty">No recent activity yet.</div>
        ) : (
          activity.slice(0, 5).map((item) => (
            <div className="dash-row" key={item.id}>
              <strong>{item.text}</strong>
              <span>{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;