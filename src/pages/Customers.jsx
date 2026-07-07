import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(135deg, #0b0b0d 0%, #16130d 45%, #0b0b0d 100%)",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: "#f5efe0",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "28px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    background: "linear-gradient(90deg, #f4d992, #d4af37, #f4d992)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  subtitle: {
    color: "#a89f8c",
    fontSize: "13px",
    marginTop: "4px",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 22px",
    borderRadius: "12px",
    border: "1px solid rgba(212,175,55,0.5)",
    background: "linear-gradient(135deg, #d4af37, #b8860b)",
    color: "#1a1508",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(212,175,55,0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },
  statCard: {
    position: "relative",
    padding: "22px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(212,175,55,0.18)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },
  statLabel: {
    fontSize: "12px",
    color: "#b8ab86",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  statValue: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#f4d992",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "20px",
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 320px",
    maxWidth: "420px",
  },
  searchInput: {
    width: "100%",
    padding: "13px 16px 13px 42px",
    borderRadius: "12px",
    border: "1px solid rgba(212,175,55,0.25)",
    background: "rgba(255,255,255,0.05)",
    color: "#f5efe0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s ease, box-shadow 0.2s ease",
  },
  tableWrap: {
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.16)",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "680px",
  },
  th: {
    textAlign: "left",
    padding: "16px 20px",
    fontSize: "12px",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    color: "#d4af37",
    borderBottom: "1px solid rgba(212,175,55,0.2)",
    background: "rgba(212,175,55,0.06)",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#e9e2cf",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  actionBtn: {
    border: "none",
    background: "rgba(212,175,55,0.12)",
    color: "#f4d992",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    marginRight: "8px",
    transition: "background 0.2s ease, transform 0.2s ease",
  },
  deleteBtn: {
    border: "none",
    background: "rgba(200,60,60,0.15)",
    color: "#ff9a9a",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    transition: "background 0.2s ease, transform 0.2s ease",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: "440px",
    background: "linear-gradient(160deg, #17140d, #1f1a10)",
    border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f4d992",
    marginBottom: "20px",
  },
  label: {
    fontSize: "12px",
    color: "#b8ab86",
    marginBottom: "6px",
    display: "block",
    letterSpacing: "0.4px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(212,175,55,0.25)",
    background: "rgba(255,255,255,0.05)",
    color: "#f5efe0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "16px",
    transition: "border 0.2s ease",
  },
  errorText: {
    color: "#ff9a9a",
    fontSize: "12px",
    marginTop: "-12px",
    marginBottom: "14px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "11px 20px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#e9e2cf",
    cursor: "pointer",
    fontSize: "14px",
  },
  saveBtn: {
    padding: "11px 22px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #d4af37, #b8860b)",
    color: "#1a1508",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 8px 20px rgba(212,175,55,0.3)",
  },
  toastContainer: {
    position: "fixed",
    top: "24px",
    right: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 2000,
  },
  toast: {
    padding: "14px 20px",
    borderRadius: "12px",
    color: "#1a1508",
    fontWeight: 600,
    fontSize: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
    minWidth: "220px",
    animation: "none",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "70px 20px",
    color: "#a89f8c",
  },
  emptyTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#e9e2cf",
    marginTop: "16px",
    marginBottom: "18px",
  },
  skeletonCell: {
    height: "14px",
    borderRadius: "6px",
    background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(212,175,55,0.12) 50%, rgba(255,255,255,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
};

const keyframes = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
`;

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
    <circle cx="11" cy="11" r="7" stroke="#d4af37" strokeWidth="2" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CustomerIcon = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="#d4af37" strokeWidth="1.5" />
    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const searchDebounceRef = useRef(null);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data.customers || []);
    } catch (err) {
      pushToast(err.response?.data?.message || "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      const q = searchTerm.trim();
      if (!q) {
        fetchCustomers();
        return;
      }
      setLoading(true);
      try {
        const res = await api.get("/customers/search", { params: { q } });
        setCustomers(res.data.customers || []);
      } catch (err) {
        pushToast(err.response?.data?.message || "Search failed", "error");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchTerm, fetchCustomers, pushToast]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormName("");
    setFormMobile("");
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name || "");
    setFormMobile(customer.mobile || "");
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formName.trim()) errors.name = "Name is required";
    if (!/^\d{10}$/.test(formMobile.trim())) errors.mobile = "Mobile must be exactly 10 digits";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, {
          name: formName.trim(),
          mobile: formMobile.trim(),
        });
        pushToast("Customer Updated", "success");
      } else {
        await api.post("/customers", {
          name: formName.trim(),
          mobile: formMobile.trim(),
        });
        pushToast("Customer Added", "success");
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      pushToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (customer) => setDeleteTarget(customer);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/customers/${deleteTarget.id}`);
      pushToast("Customer Deleted", "success");
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      pushToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const today = new Date();
  const totalCustomers = customers.length;
  const todaysCustomers = customers.filter((c) => c.created_at && isSameDay(new Date(c.created_at), today)).length;
  const monthCustomers = customers.filter((c) => c.created_at && isSameMonth(new Date(c.created_at), today)).length;
  const newestCustomer = customers.reduce((latest, c) => {
    if (!c.created_at) return latest;
    if (!latest) return c;
    return new Date(c.created_at) > new Date(latest.created_at) ? c : latest;
  }, null);

  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      <div style={styles.toastContainer}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...styles.toast,
              background: t.type === "error" ? "linear-gradient(135deg, #ff8a8a, #d95c5c)" : "linear-gradient(135deg, #f4d992, #d4af37)",
              animation: "slideIn 0.3s ease",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Customers</h1>
          <div style={styles.subtitle}>Rajni Saree Center — Customer Management</div>
        </div>
        <button
          style={styles.addBtn}
          onClick={openAddModal}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          + Add Customer
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Customers</div>
          <div style={styles.statValue}>{totalCustomers}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Today's Customers</div>
          <div style={styles.statValue}>{todaysCustomers}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>This Month</div>
          <div style={styles.statValue}>{monthCustomers}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Newest Customer</div>
          <div style={{ ...styles.statValue, fontSize: "18px" }}>{newestCustomer ? newestCustomer.name : "-"}</div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <SearchIcon />
          <input
            style={styles.searchInput}
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Customer Name</th>
                <th style={styles.th}>Mobile Number</th>
                <th style={styles.th}>Created Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} style={styles.td}>
                        <div style={{ ...styles.skeletonCell, width: j === 1 ? "70%" : "50%" }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                customers.map((c) => (
                  <tr
                    key={c.id}
                    style={styles.tr}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={styles.td}>{c.id}</td>
                    <td style={styles.td}>{c.name}</td>
                    <td style={styles.td}>{c.mobile}</td>
                    <td style={styles.td}>{formatDate(c.created_at)}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => openEditModal(c)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.22)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.12)")}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => confirmDelete(c)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,60,60,0.28)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(200,60,60,0.15)")}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && customers.length === 0 && (
          <div style={styles.emptyState}>
            <CustomerIcon size={54} />
            <div style={styles.emptyTitle}>No Customers Found</div>
            <button style={styles.addBtn} onClick={openAddModal}>
              + Add Customer
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={{ ...styles.modal, animation: "fadeScale 0.25s ease" }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>{editingCustomer ? "Edit Customer" : "Add Customer"}</div>

            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Customer name"
            />
            {formErrors.name && <div style={styles.errorText}>{formErrors.name}</div>}

            <label style={styles.label}>Mobile Number</label>
            <input
              style={styles.input}
              value={formMobile}
              onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10 digit mobile number"
            />
            {formErrors.mobile && <div style={styles.errorText}>{formErrors.mobile}</div>}

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={styles.overlay} onClick={() => !deleting && setDeleteTarget(null)}>
          <div style={{ ...styles.modal, maxWidth: "400px", animation: "fadeScale 0.25s ease" }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Delete Customer</div>
            <div style={{ color: "#e9e2cf", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#f4d992" }}>{deleteTarget.name}</strong>? This action cannot be undone.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button
                style={{ ...styles.saveBtn, background: "linear-gradient(135deg, #ff8a8a, #d95c5c)", color: "#1a0808" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}