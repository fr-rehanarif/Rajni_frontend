import { useEffect, useState } from "react";
import api from "../services/api";

function Settings() {
  const [activePanel, setActivePanel] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");

  const [business, setBusiness] = useState(() => {
    return JSON.parse(localStorage.getItem("businessProfile")) || {
      shopName: "Rajni Saree Center",
      mobile: "9818602584",
      address: "F-232, Lado Sarai, New Delhi - 110030",
    };
  });

  const [invoice, setInvoice] = useState(() => {
    return JSON.parse(localStorage.getItem("invoiceSettings")) || {
      title: "RAJNI SAREE CENTER",
      policy:
        "Goods once sold will not be returned. Exchange within 7 days only.",
    };
  });

  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

  const cards = [
    {
      key: "business",
      title: "Business Profile",
      desc: "Shop name, address, mobile number and business details.",
      icon: "🏪",
    },
    {
      key: "admins",
      title: "Admin Users",
      desc: "Create employee login accounts and manage access.",
      icon: "👤",
    },
    {
      key: "password",
      title: "Change Password",
      desc: "Update your admin login password securely.",
      icon: "🔐",
    },
    {
      key: "invoice",
      title: "Invoice Settings",
      desc: "Invoice header, policy text and print preferences.",
      icon: "🧾",
    },
    {
      key: "theme",
      title: "Theme Settings",
      desc: "Switch between luxury light and dark POS themes.",
      icon: "🎨",
    },
    {
      key: "backup",
      title: "Backup & Restore",
      desc: "Export, restore and protect business data.",
      icon: "💾",
    },
    {
      key: "danger",
      title: "Danger Zone",
      desc: "Reset data or perform high-risk system actions.",
      icon: "⚠️",
      danger: true,
    },
  ];

  const loadAdmins = async () => {
    try {
      const res = await api.get("/auth/admins");
      setAdmins(res.data.admins || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const createAdmin = async () => {
    if (!newUsername || !newPassword) {
      alert("Username and password required");
      return;
    }

    try {
      await api.post("/auth/register", {
        username: newUsername,
        password: newPassword,
        role: "admin",
      });

      alert("Admin user created");

      setNewUsername("");
      setNewPassword("");

      loadAdmins();
    } catch (error) {
      alert(error?.response?.data?.message || "Admin create failed");
    }
  };

  const deleteAdminUser = async (id) => {
    if (Number(id) === Number(currentAdmin.id)) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Delete this admin user?")) return;

    try {
      await api.delete(`/auth/admins/${id}`);

      alert("Admin deleted");

      loadAdmins();
    } catch (error) {
      alert(error?.response?.data?.message || "Admin delete failed");
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newAdminPassword || !confirmAdminPassword) {
      alert("All password fields are required");
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword: newAdminPassword,
      });

      alert("Password updated successfully");

      setCurrentPassword("");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
    } catch (error) {
      alert(error?.response?.data?.message || "Password update failed");
    }
  };

  const saveBusinessProfile = () => {
    localStorage.setItem("businessProfile", JSON.stringify(business));
    alert("Business profile saved");
  };

  const saveInvoiceSettings = () => {
    localStorage.setItem("invoiceSettings", JSON.stringify(invoice));
    alert("Invoice settings saved");
  };

  const setTheme = (theme) => {
    localStorage.setItem("posTheme", theme);
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    alert(`${theme === "dark" ? "Premium Dark" : "Luxury Light"} theme selected`);
  };

  const exportBackup = () => {
    const backupData = {
      businessProfile: JSON.parse(localStorage.getItem("businessProfile") || "{}"),
      invoiceSettings: JSON.parse(localStorage.getItem("invoiceSettings") || "{}"),
      inventoryActivity: JSON.parse(localStorage.getItem("inventoryActivity") || "[]"),
      posTheme: localStorage.getItem("posTheme") || "light",
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "rajni-pos-backup.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const restoreBackup = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (data.businessProfile) {
          localStorage.setItem(
            "businessProfile",
            JSON.stringify(data.businessProfile)
          );
          setBusiness(data.businessProfile);
        }

        if (data.invoiceSettings) {
          localStorage.setItem(
            "invoiceSettings",
            JSON.stringify(data.invoiceSettings)
          );
          setInvoice(data.invoiceSettings);
        }

        if (data.inventoryActivity) {
          localStorage.setItem(
            "inventoryActivity",
            JSON.stringify(data.inventoryActivity)
          );
        }

        if (data.posTheme) {
          localStorage.setItem("posTheme", data.posTheme);
        }

        alert("Backup restored successfully");
      } catch {
        alert("Invalid backup file");
      }
    };

    reader.readAsText(file);
  };

  const startReset = () => {
    const one = confirm("Are you sure you want to start reset?");
    if (!one) return;

    const two = confirm("This can remove local app settings. Continue?");
    if (!two) return;

    const typed = prompt('Type "RESET" to confirm');

    if (typed !== "RESET") {
      alert("Reset cancelled");
      return;
    }

    localStorage.removeItem("businessProfile");
    localStorage.removeItem("invoiceSettings");
    localStorage.removeItem("inventoryActivity");
    localStorage.removeItem("posTheme");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedUsername");
    localStorage.removeItem("shopLogo");
    localStorage.removeItem("darkLogin");

    alert("Local settings reset completed");
    window.location.reload();
  };

  const renderPanelContent = () => {
    if (activePanel === "business") {
      return (
        <>
          <h2>Business Profile</h2>
          <p>Shop information used on invoices and reports.</p>

          <div className="settings-form">
            <input
              placeholder="Shop Name"
              value={business.shopName}
              onChange={(e) =>
                setBusiness({ ...business, shopName: e.target.value })
              }
            />

            <input
              placeholder="Mobile Number"
              value={business.mobile}
              onChange={(e) =>
                setBusiness({ ...business, mobile: e.target.value })
              }
            />

            <input
              placeholder="Address"
              value={business.address}
              onChange={(e) =>
                setBusiness({ ...business, address: e.target.value })
              }
            />

            <button onClick={saveBusinessProfile}>Save Business Profile</button>
          </div>
        </>
      );
    }

    if (activePanel === "admins") {
      return (
        <>
          <div className="settings-modal-head">
            <div>
              <h2>Admin Users</h2>
              <p>Create employee/admin login accounts.</p>
            </div>
          </div>

          <div className="settings-form">
            <input
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button onClick={createAdmin}>Create Admin User</button>
          </div>

          <div className="admin-list">
            {admins.map((admin) => {
              const isCurrentUser = Number(admin.id) === Number(currentAdmin.id);

              return (
                <div key={admin.id} className="admin-row">
                  <div className="admin-avatar">
                    {admin.username?.charAt(0)?.toUpperCase() || "A"}
                  </div>

                  <div className="admin-info">
                    <strong>
                      {admin.username}
                      {isCurrentUser ? " (You)" : ""}
                    </strong>
                    <span>{admin.role}</span>
                  </div>

                  {isCurrentUser ? (
                    <span className="current-admin-badge">Current User</span>
                  ) : (
                    <button
                      className="delete-admin-btn"
                      onClick={() => deleteAdminUser(admin.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      );
    }

    if (activePanel === "password") {
      return (
        <>
          <h2>Change Password</h2>
          <p>Update your current admin password.</p>

          <div className="settings-form">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmAdminPassword}
              onChange={(e) => setConfirmAdminPassword(e.target.value)}
            />

            <button onClick={updatePassword}>Update Password</button>
          </div>
        </>
      );
    }

    if (activePanel === "invoice") {
      return (
        <>
          <h2>Invoice Settings</h2>
          <p>Manage invoice header and return policy text.</p>

          <div className="settings-form">
            <input
              placeholder="Invoice Title"
              value={invoice.title}
              onChange={(e) =>
                setInvoice({ ...invoice, title: e.target.value })
              }
            />

            <textarea
              placeholder="Return / Exchange Policy"
              value={invoice.policy}
              onChange={(e) =>
                setInvoice({ ...invoice, policy: e.target.value })
              }
            />

            <button onClick={saveInvoiceSettings}>Save Invoice Settings</button>
          </div>
        </>
      );
    }

    if (activePanel === "theme") {
      return (
        <>
          <h2>Theme Settings</h2>
          <p>Choose POS appearance.</p>

          <div className="theme-options">
            <button onClick={() => setTheme("light")}>Luxury Light</button>
            <button onClick={() => setTheme("dark")}>Premium Dark</button>
          </div>
        </>
      );
    }

    if (activePanel === "backup") {
      return (
        <>
          <h2>Backup & Restore</h2>
          <p>Protect your business data.</p>

          <div className="theme-options">
            <button onClick={exportBackup}>Export Backup</button>

            <label className="restore-btn">
              Restore Backup
              <input type="file" accept=".json" onChange={restoreBackup} />
            </label>
          </div>
        </>
      );
    }

    if (activePanel === "danger") {
      return (
        <>
          <h2>Danger Zone</h2>
          <p>High-risk actions. Use carefully.</p>

          <div className="danger-box">
            <strong>Full Reset</strong>
            <span>
              This resets local settings only. Database reset will be added later
              with backend protection.
            </span>
            <button onClick={startReset}>Start Reset</button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Control business profile, users, security and system preferences.</p>
        </div>
      </div>

      <div className="settings-hero">
        <div>
          <span>Rajni Saree Center</span>
          <h2>System Control Panel</h2>
          <p>
            Manage your POS setup from one secure place. Business details, admin
            access, invoice preferences and backup controls stay here.
          </p>
        </div>

        <div className="settings-secure-badge">● Secure Admin Area</div>
      </div>

      <div className="settings-grid">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`settings-card ${card.danger ? "danger" : ""}`}
            onClick={() => setActivePanel(card.key)}
          >
            <div className="settings-icon">{card.icon}</div>

            <div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePanel(card.key);
              }}
            >
              Open
            </button>
          </div>
        ))}
      </div>

      {activePanel && (
        <div className="modal-backdrop">
          <div className="settings-modal">
            <button
              className="close-modal"
              onClick={() => setActivePanel(null)}
            >
              ×
            </button>

            {renderPanelContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;