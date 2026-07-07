import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="pos-shell">
      <Sidebar />

      <div className="pos-main">
        <Navbar />

        <div className="pos-body">
          <main className="pos-workspace">
            <Outlet />
          </main>

          <aside className="live-panel">
            <h3>Live Insights</h3>

            <div className="insight-card">
              <span>Today's Sale</span>
              <strong>₹0</strong>
            </div>

            <div className="insight-card">
              <span>Today's Bills</span>
              <strong>0</strong>
            </div>

            <div className="insight-card warning">
              <span>Low Stock</span>
              <strong>0 Items</strong>
            </div>

            <button className="quick-bill-btn">+ New Bill</button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;