import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Users,
  BarChart3,
  IndianRupee,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside className="side-dock">
      <div className="dock-logo">R</div>

      <nav>
        <NavLink to="/app/dashboard"><LayoutDashboard /></NavLink>
        <NavLink to="/app/billing"><ReceiptText /></NavLink>
        <NavLink to="/app/inventory"><Package /></NavLink>
        <NavLink to="/app/customers"><Users /></NavLink>
        <NavLink to="/app/expenses"><IndianRupee /></NavLink>
        <NavLink to="/app/settings"><Settings /></NavLink>
        <NavLink to="/app/bill-history"><ReceiptText /></NavLink>
      </nav>

      <button onClick={logout} className="dock-logout">
        <LogOut />
      </button>
    </aside>
  );
}

export default Sidebar;