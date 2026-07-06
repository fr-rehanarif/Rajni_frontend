import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

/* ─────────────────────────── helpers ─────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

/* ─────────────────────────── inline styles ───────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#FAF8F3",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1A1A1A",
  },
  pageHead: {
    padding: "24px 32px 16px",
    borderBottom: "1px solid #E8DFC8",
    background: "#FFFDF7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#B8860B",
    letterSpacing: 0.4,
    margin: 0,
  },
  pageSub: { fontSize: 13, color: "#888", margin: "2px 0 0" },
  addBtn: {
    background: "linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)",
    color: "#D4AF37",
    border: "none",
    borderRadius: 9,
    padding: "10px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    letterSpacing: 0.4,
    transition: "opacity 0.15s",
  },

  /* toolbar */
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 32px",
    background: "#FFFDF7",
    borderBottom: "1px solid #F0E8D0",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 220,
    padding: "10px 16px",
    border: "1.5px solid #D4AF37",
    borderRadius: 8,
    fontSize: 14,
    background: "#FAF8F3",
    color: "#1A1A1A",
    outline: "none",
    transition: "border-color 0.2s",
  },
  sortSelect: {
    padding: "9px 14px",
    border: "1.5px solid #E8DFC8",
    borderRadius: 8,
    fontSize: 13,
    background: "#FAF8F3",
    color: "#1A1A1A",
    outline: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  countBadge: {
    fontSize: 12,
    color: "#B8860B",
    background: "#FFF8E1",
    border: "1px solid #FFD700",
    borderRadius: 20,
    padding: "4px 12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  /* table area */
  tableWrap: {
    padding: "24px 32px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#FFFDF7",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(180,150,0,0.08)",
    border: "1px solid #E8DFC8",
  },
  th: {
    background: "#1A1A1A",
    color: "#D4AF37",
    padding: "13px 16px",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
  },
  thRight: {
    background: "#1A1A1A",
    color: "#D4AF37",
    padding: "13px 16px",
    textAlign: "right",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 16px",
    borderBottom: "1px solid #F0E8D0",
    fontSize: 13,
    color: "#1A1A1A",
    verticalAlign: "middle",
  },
  tdRight: {
    padding: "13px 16px",
    borderBottom: "1px solid #F0E8D0",
    fontSize: 13,
    color: "#1A1A1A",
    textAlign: "right",
    verticalAlign: "middle",
  },
  tdMuted: {
    padding: "13px 16px",
    borderBottom: "1px solid #F0E8D0",
    fontSize: 13,
    color: "#888",
    verticalAlign: "middle",
  },
  trHover: { cursor: "default", transition: "background 0.12s" },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
  },
  nameCell: { display: "flex", alignItems: "center", gap: 10 },
  nameBold: { fontWeight: 700, fontSize: 13 },
  actionBtn: {
    background: "none",
    border: "1px solid #E8DFC8",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.15s",
    marginLeft: 4,
  },
  editBtn: { color: "#B8860B", borderColor: "#D4AF37" },
  deleteBtn: { color: "#C0392B", borderColor: "#F5B7B1" },
  emptyRow: {
    textAlign: "center",
    padding: "48px 0",
    color: "#BBB",
    fontSize: 14,
  },

  /* stats row */
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    padding: "24px 32px 0",
  },
  statCard: {
    background: "#FFFDF7",
    border: "1px solid #E8DFC8",
    borderRadius: 12,
    padding: "16px 20px",
    boxShadow: "0 1px 4px rgba(180,150,0,0.06)",
  },
  statLabel: { fontSize: 12, color: "#888", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  statVal: { fontSize: 24, fontWeight: 800, color: "#B8860B", margin: "4px 0 0" },

  /* modal / drawer */
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.50)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    background: "#FFFDF7",
    borderRadius: 14,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
    overflow: "hidden",
  },
  modalHead: {
    background: "#1A1A1A",
    padding: "18px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { color: "#D4AF37", fontWeight: 800, fontSize: 17, margin: 0 },
  modalClose: {
    background: "none",
    border: "none",
    color: "#AAA",
    fontSize: 24,
    cursor: "pointer",
    lineHeight: 1,
  },
  modalBody: { padding: "24px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    padding: "10px 14px",
    border: "1.5px solid #E8DFC8",
    borderRadius: 8,
    fontSize: 14,
    background: "#FAF8F3",
    color: "#1A1A1A",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  inputErr: {
    padding: "10px 14px",
    border: "1.5px solid #E74C3C",
    borderRadius: 8,
    fontSize: 14,
    background: "#FAF8F3",
    color: "#1A1A1A",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errMsg: { fontSize: 11, color: "#C0392B", margin: 0 },
  modalFooter: {
    display: "flex",
    gap: 10,
    padding: "0 24px 24px",
  },
  cancelBtn: {
    flex: 1,
    padding: "11px 0",
    background: "#FAF8F3",
    border: "1.5px solid #E8DFC8",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    color: "#555",
  },
  saveBtn: {
    flex: 1,
    padding: "11px 0",
    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    color: "#fff",
    transition: "opacity 0.15s",
  },

  /* detail panel */
  detailBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.50)",
    zIndex: 1000,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
  detailPanel: {
    background: "#FFFDF7",
    width: "100%",
    maxWidth: 440,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-6px 0 32px rgba(0,0,0,0.18)",
    overflowY: "auto",
  },
  detailHead: {
    background: "#1A1A1A",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailAvatar: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 22,
  },
  detailName: { color: "#D4AF37", fontWeight: 800, fontSize: 18, margin: "8px 0 2px" },
  detailMobile: { color: "#AAA", fontSize: 13 },
  detailBody: { padding: 24, display: "flex", flexDirection: "column", gap: 16 },
  detailStatGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  detailStat: {
    background: "#FAF8F3",
    border: "1px solid #E8DFC8",
    borderRadius: 10,
    padding: "12px 16px",
  },
  detailStatLabel: { fontSize: 11, color: "#888", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 },
  detailStatVal: { fontSize: 20, fontWeight: 800, color: "#B8860B", margin: "4px 0 0" },
  billsTitle: { fontSize: 13, fontWeight: 700, color: "#1A1A1A", margin: "8px 0 4px" },
  billRow: {
    background: "#FAF8F3",
    border: "1px solid #E8DFC8",
    borderRadius: 8,
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  billRowLeft: { fontSize: 12, color: "#555" },
  billRowRight: { fontSize: 13, fontWeight: 700, color: "#B8860B" },
  noBills: { fontSize: 13, color: "#BBB", textAlign: "center", padding: "20px 0" },
};

/* ═══════════════════════════ Component ═══════════════════════════ */
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  /* modal state */
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit

  /* form fields */
  const [form, setForm] = useState({ name: "", mobile: "", email: "", address: "" });
  const [formErrs, setFormErrs] = useState({});
  const [saving, setSaving] = useState(false);

  /* detail panel */
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [customerBills, setCustomerBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);

  /* ── load ── */
  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data.customers || []);
    } catch {
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  /* ── filtered + sorted ── */
  const displayed = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = q
      ? customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.mobile?.includes(q) ||
            c.email?.toLowerCase().includes(q)
        )
      : [...customers];

    if (sortBy === "name") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortBy === "mobile") list.sort((a, b) => (a.mobile || "").localeCompare(b.mobile || ""));
    else if (sortBy === "total_spent") list.sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0));
    else if (sortBy === "total_bills") list.sort((a, b) => Number(b.total_bills || 0) - Number(a.total_bills || 0));

    return list;
  }, [customers, search, sortBy]);

  /* ── stats ── */
  const totalSpent = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const totalBills = customers.reduce((s, c) => s + Number(c.total_bills || 0), 0);

  /* ── open add / edit modal ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", mobile: "", email: "", address: "" });
    setFormErrs({});
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditTarget(c);
    setForm({ name: c.name || "", mobile: c.mobile || "", email: c.email || "", address: c.address || "" });
    setFormErrs({});
    setShowForm(true);
  };

  /* ── validation ── */
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) errs.mobile = "Enter a valid 10-digit mobile";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    setFormErrs(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── save ── */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/customers/${editTarget.id}`, form);
      } else {
        await api.post("/customers", form);
      }
      setShowForm(false);
      loadCustomers();
    } catch {
      alert("Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${c.id}`);
      loadCustomers();
    } catch {
      alert("Failed to delete customer");
    }
  };

  /* ── detail panel ── */
  const openDetail = async (c) => {
    setDetailCustomer(c);
    setCustomerBills([]);
    setBillsLoading(true);
    try {
      const res = await api.get(`/customers/${c.id}/bills`);
      setCustomerBills(res.data.bills || []);
    } catch {
      setCustomerBills([]);
    } finally {
      setBillsLoading(false);
    }
  };

  /* ── avatar letter ── */
  const initial = (name) => (name || "?").trim().charAt(0).toUpperCase();

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div style={S.page}>
      {/* ── Page header ── */}
      <div style={S.pageHead}>
        <div>
          <h1 style={S.pageTitle}>Customers</h1>
          <p style={S.pageSub}>Manage your customer database and view purchase history.</p>
        </div>
        <button
          style={S.addBtn}
          onClick={openAdd}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + Add Customer
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <p style={S.statLabel}>Total Customers</p>
          <p style={S.statVal}>{customers.length}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>Total Bills</p>
          <p style={S.statVal}>{totalBills}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>Total Revenue</p>
          <p style={S.statVal}>₹{fmt(totalSpent)}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>Avg. Spend / Customer</p>
          <p style={S.statVal}>
            ₹{customers.length ? fmt(Math.round(totalSpent / customers.length)) : "0"}
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={S.toolbar}>
        <input
          style={S.searchInput}
          placeholder="🔍  Search by name, mobile or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#B8860B")}
          onBlur={(e) => (e.target.style.borderColor = "#D4AF37")}
        />
        <select
          style={S.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="mobile">Sort: Mobile</option>
          <option value="total_spent">Sort: Highest Spend</option>
          <option value="total_bills">Sort: Most Bills</option>
        </select>
        <span style={S.countBadge}>{displayed.length} customer{displayed.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Table ── */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Mobile</th>
              <th style={S.th}>Email</th>
              <th style={S.thRight}>Bills</th>
              <th style={S.thRight}>Total Spent</th>
              <th style={{ ...S.th, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={S.emptyRow}>Loading customers…</td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6} style={S.emptyRow}>
                  {search ? "No customers match your search." : "No customers added yet."}
                </td>
              </tr>
            ) : (
              displayed.map((c) => (
                <tr
                  key={c.id}
                  style={S.trHover}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF8E8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={S.td}>
                    <div style={S.nameCell}>
                      <div style={S.avatarCircle}>{initial(c.name)}</div>
                      <span style={S.nameBold}>{c.name}</span>
                    </div>
                  </td>
                  <td style={S.td}>{c.mobile || <span style={{ color: "#CCC" }}>—</span>}</td>
                  <td style={S.tdMuted}>{c.email || <span style={{ color: "#CCC" }}>—</span>}</td>
                  <td style={S.tdRight}>{Number(c.total_bills || 0)}</td>
                  <td style={{ ...S.tdRight, fontWeight: 700, color: "#B8860B" }}>
                    ₹{fmt(c.total_spent)}
                  </td>
                  <td style={{ ...S.td, textAlign: "center", whiteSpace: "nowrap" }}>
                    <button
                      style={{ ...S.actionBtn, ...S.editBtn }}
                      onClick={() => openDetail(c)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FFF8E1";
                        e.currentTarget.style.borderColor = "#B8860B";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.borderColor = "#D4AF37";
                      }}
                    >
                      View
                    </button>
                    <button
                      style={{ ...S.actionBtn, ...S.editBtn }}
                      onClick={() => openEdit(c)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FFF8E1";
                        e.currentTarget.style.borderColor = "#B8860B";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.borderColor = "#D4AF37";
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...S.actionBtn, ...S.deleteBtn }}
                      onClick={() => handleDelete(c)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FFF0EE";
                        e.currentTarget.style.borderColor = "#C0392B";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.borderColor = "#F5B7B1";
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ══════════════ ADD / EDIT MODAL ══════════════ */}
      {showForm && (
        <div style={S.backdrop} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <h2 style={S.modalTitle}>{editTarget ? "Edit Customer" : "Add New Customer"}</h2>
              <button style={S.modalClose} onClick={() => setShowForm(false)}>×</button>
            </div>

            <div style={S.modalBody}>
              {/* Name */}
              <div style={S.fieldGroup}>
                <label style={S.label}>Full Name *</label>
                <input
                  style={formErrs.name ? S.inputErr : S.input}
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = formErrs.name ? "#E74C3C" : "#E8DFC8")}
                />
                {formErrs.name && <p style={S.errMsg}>{formErrs.name}</p>}
              </div>

              {/* Mobile */}
              <div style={S.fieldGroup}>
                <label style={S.label}>Mobile Number</label>
                <input
                  style={formErrs.mobile ? S.inputErr : S.input}
                  placeholder="10-digit mobile"
                  value={form.mobile}
                  maxLength={10}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = formErrs.mobile ? "#E74C3C" : "#E8DFC8")}
                />
                {formErrs.mobile && <p style={S.errMsg}>{formErrs.mobile}</p>}
              </div>

              {/* Email */}
              <div style={S.fieldGroup}>
                <label style={S.label}>Email Address</label>
                <input
                  style={formErrs.email ? S.inputErr : S.input}
                  placeholder="e.g. priya@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = formErrs.email ? "#E74C3C" : "#E8DFC8")}
                />
                {formErrs.email && <p style={S.errMsg}>{formErrs.email}</p>}
              </div>

              {/* Address */}
              <div style={S.fieldGroup}>
                <label style={S.label}>Address</label>
                <input
                  style={S.input}
                  placeholder="Street, City"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8DFC8")}
                />
              </div>
            </div>

            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button
                style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = "0.86"; }}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = saving ? "0.7" : "1")}
              >
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ DETAIL SIDE PANEL ══════════════ */}
      {detailCustomer && (
        <div style={S.detailBackdrop} onClick={(e) => e.target === e.currentTarget && setDetailCustomer(null)}>
          <div style={S.detailPanel}>
            {/* header */}
            <div style={S.detailHead}>
              <div>
                <div style={S.detailAvatar}>{initial(detailCustomer.name)}</div>
                <p style={S.detailName}>{detailCustomer.name}</p>
                <p style={S.detailMobile}>{detailCustomer.mobile || "No mobile"}</p>
              </div>
              <button style={{ ...S.modalClose, alignSelf: "flex-start" }} onClick={() => setDetailCustomer(null)}>×</button>
            </div>

            <div style={S.detailBody}>
              {/* stat grid */}
              <div style={S.detailStatGrid}>
                <div style={S.detailStat}>
                  <p style={S.detailStatLabel}>Total Bills</p>
                  <p style={S.detailStatVal}>{Number(detailCustomer.total_bills || 0)}</p>
                </div>
                <div style={S.detailStat}>
                  <p style={S.detailStatLabel}>Total Spent</p>
                  <p style={S.detailStatVal}>₹{fmt(detailCustomer.total_spent)}</p>
                </div>
              </div>

              {/* info */}
              {detailCustomer.email && (
                <div style={{ fontSize: 13, color: "#555" }}>
                  <span style={{ fontWeight: 700 }}>Email: </span>{detailCustomer.email}
                </div>
              )}
              {detailCustomer.address && (
                <div style={{ fontSize: 13, color: "#555" }}>
                  <span style={{ fontWeight: 700 }}>Address: </span>{detailCustomer.address}
                </div>
              )}

              {/* purchase history */}
              <div>
                <p style={S.billsTitle}>Purchase History</p>
                {billsLoading ? (
                  <p style={S.noBills}>Loading…</p>
                ) : customerBills.length === 0 ? (
                  <p style={S.noBills}>No purchases found.</p>
                ) : (
                  customerBills.map((bill) => (
                    <div key={bill.id || bill.bill_no} style={S.billRow}>
                      <div style={S.billRowLeft}>
                        <div style={{ fontWeight: 600, color: "#1A1A1A" }}>{bill.bill_no || bill.id}</div>
                        <div>
                          {bill.date
                            ? new Date(bill.date).toLocaleDateString("en-IN")
                            : "—"}{" "}
                          • {bill.payment_mode || "—"}
                        </div>
                      </div>
                      <div style={S.billRowRight}>₹{fmt(bill.grand_total)}</div>
                    </div>
                  ))
                )}
              </div>

              {/* actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  style={{ ...S.cancelBtn, flex: 1 }}
                  onClick={() => { setDetailCustomer(null); openEdit(detailCustomer); }}
                >
                  Edit Customer
                </button>
                <button
                  style={{ ...S.saveBtn, flex: 1 }}
                  onClick={() => setDetailCustomer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}