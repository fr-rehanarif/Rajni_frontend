import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import MainLayout from "../layouts/MainLayout";
import Settings from "../pages/Settings";
import Billing from "../pages/Billing";
import BillHistory from "../pages/BillHistory";
import Customers from "../pages/Customers";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/app" element={<MainLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="customers" element={<Customers />} />
          <Route path="/bill-history" element={<BillHistory />}
/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;