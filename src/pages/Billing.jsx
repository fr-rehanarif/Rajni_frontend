import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

/* ─────────────────────────── helpers ─────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const today = () => new Date();

function genInvoiceNo() {
  return `INV-${Date.now()}`;
}

/* ─────────────────────────── inline styles ───────────────────── */
const S = {
  /* layout */
  page: {
    minHeight: "100vh",
    background: "#FAF8F3",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1A1A1A",
  },
  pageHead: {
    padding: "24px 32px 0",
    borderBottom: "1px solid #E8DFC8",
    background: "#FFFDF7",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#B8860B",
    letterSpacing: 0.4,
    margin: 0,
  },
  pageSub: {
    fontSize: 13,
    color: "#888",
    margin: "2px 0 0",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 0,
    height: "calc(100vh - 80px)",
    overflow: "hidden",
  },

  /* product panel */
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #E8DFC8",
    overflow: "hidden",
    background: "#FAF8F3",
  },
  searchWrap: {
    padding: "16px 20px 12px",
    borderBottom: "1px solid #F0E8D0",
    background: "#FFFDF7",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px",
    border: "1.5px solid #D4AF37",
    borderRadius: 8,
    fontSize: 14,
    background: "#FFFDF7",
    color: "#1A1A1A",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  productGrid: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 12,
    alignContent: "start",
  },
  card: {
    background: "#FFFDF7",
    border: "1px solid #E8DFC8",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 1px 4px rgba(180,150,0,0.06)",
    transition: "box-shadow 0.18s, border-color 0.18s",
    cursor: "default",
  },
  cardName: { fontSize: 14, fontWeight: 700, color: "#1A1A1A", margin: 0 },
  cardMeta: {
    fontSize: 12,
    color: "#888",
    margin: 0,
    display: "flex",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  badgeLow: {
    fontSize: 10,
    fontWeight: 700,
    background: "#FFF3CD",
    color: "#856404",
    borderRadius: 4,
    padding: "1px 6px",
    border: "1px solid #FFD700",
  },
  badgeOut: {
    fontSize: 10,
    fontWeight: 700,
    background: "#FDECEA",
    color: "#C0392B",
    borderRadius: 4,
    padding: "1px 6px",
    border: "1px solid #F5B7B1",
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  cardPrice: { fontSize: 16, fontWeight: 800, color: "#B8860B" },
  addBtn: {
    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "7px 18px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  addBtnDisabled: {
    background: "#DDD",
    color: "#999",
    border: "none",
    borderRadius: 7,
    padding: "7px 18px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "not-allowed",
  },
  empty: {
    gridColumn: "1/-1",
    textAlign: "center",
    color: "#AAA",
    fontSize: 14,
    padding: 40,
  },

  /* cart panel */
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    background: "#FFFDF7",
    overflow: "hidden",
  },
  cartHeader: {
    padding: "16px 20px 10px",
    borderBottom: "1px solid #F0E8D0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartTitle: { fontSize: 17, fontWeight: 700, color: "#1A1A1A", margin: 0 },
  clearBtn: {
    fontSize: 12,
    color: "#C0392B",
    background: "none",
    border: "1px solid #F5B7B1",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontWeight: 600,
  },
  customerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: "12px 16px",
    borderBottom: "1px solid #F0E8D0",
  },
  input: {
    padding: "9px 12px",
    border: "1.5px solid #E8DFC8",
    borderRadius: 8,
    fontSize: 13,
    background: "#FFFDF7",
    color: "#1A1A1A",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  inputErr: {
    padding: "9px 12px",
    border: "1.5px solid #E74C3C",
    borderRadius: 8,
    fontSize: 13,
    background: "#FFFDF7",
    color: "#1A1A1A",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errMsg: { fontSize: 11, color: "#C0392B", margin: "-6px 0 0", padding: "0 16px" },
  cartItems: { flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 8 },
  cartItem: {
    background: "#FAF8F3",
    border: "1px solid #EDE4CC",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cartItemInfo: { flex: 1, minWidth: 0 },
  cartItemName: { fontSize: 13, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cartItemPrice: { fontSize: 12, color: "#888", margin: 0 },
  qtyControl: { display: "flex", alignItems: "center", gap: 4 },
  qtyBtn: {
    width: 26,
    height: 26,
    border: "1.5px solid #D4AF37",
    borderRadius: 6,
    background: "#FFFDF7",
    color: "#B8860B",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  qtyVal: { minWidth: 28, textAlign: "center", fontWeight: 700, fontSize: 14 },
  itemTotal: { fontWeight: 800, fontSize: 14, color: "#B8860B", minWidth: 60, textAlign: "right" },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#CCC",
    fontSize: 18,
    cursor: "pointer",
    padding: "0 2px",
    lineHeight: 1,
    transition: "color 0.15s",
  },

  /* summary */
  summary: {
    padding: "12px 16px",
    borderTop: "1px solid #F0E8D0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 },
  discountRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  discountGroup: { display: "flex", gap: 6, flex: 1, justifyContent: "flex-end" },
  discountInput: {
    width: 70,
    padding: "6px 8px",
    border: "1.5px solid #E8DFC8",
    borderRadius: 6,
    fontSize: 13,
    textAlign: "right",
    background: "#FFFDF7",
    outline: "none",
  },
  grandRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
    borderRadius: 10,
    padding: "10px 14px",
    marginTop: 4,
  },
  grandLabel: { color: "#FFF", fontWeight: 700, fontSize: 15 },
  grandAmt: { color: "#FFF", fontWeight: 800, fontSize: 18 },
  paySelect: {
    margin: "0 16px 10px",
    padding: "9px 12px",
    border: "1.5px solid #D4AF37",
    borderRadius: 8,
    fontSize: 13,
    background: "#FFFDF7",
    color: "#1A1A1A",
    outline: "none",
    width: "calc(100% - 32px)",
    fontWeight: 600,
  },
  saveBtn: {
    margin: "0 16px 16px",
    width: "calc(100% - 32px)",
    padding: "13px 0",
    background: "linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)",
    color: "#D4AF37",
    border: "none",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    letterSpacing: 0.6,
    transition: "opacity 0.15s",
  },

  /* modal */
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    padding: "24px 0",
  },
  modalWrap: {
    background: "#fff",
    width: 680,
    maxWidth: "95vw",
    borderRadius: 4,
    position: "relative",
    boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
  closeModal: {
    position: "absolute",
    top: 12,
    right: 16,
    background: "none",
    border: "none",
    fontSize: 26,
    cursor: "pointer",
    color: "#555",
    lineHeight: 1,
    zIndex: 10,
  },

  /* invoice */
  invoice: {
    padding: "32px 40px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: "#111",
    fontSize: 13,
    lineHeight: 1.5,
  },
  bizName: { fontSize: 22, fontWeight: 800, textAlign: "center", letterSpacing: 1, margin: 0, color: "#B8860B" },
  bizAddr: { textAlign: "center", fontSize: 12, color: "#555", margin: "2px 0 0" },
  divider: { border: "none", borderTop: "2px solid #D4AF37", margin: "14px 0" },
  thinDivider: { border: "none", borderTop: "1px solid #EEE", margin: "10px 0" },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 13 },
  metaLabel: { fontWeight: 700, color: "#555" },
  table: { width: "100%", borderCollapse: "collapse", margin: "14px 0", fontSize: 12 },
  th: {
    background: "#1A1A1A",
    color: "#D4AF37",
    padding: "7px 10px",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 12,
  },
  thRight: {
    background: "#1A1A1A",
    color: "#D4AF37",
    padding: "7px 10px",
    textAlign: "right",
    fontWeight: 700,
    fontSize: 12,
  },
  td: { padding: "7px 10px", borderBottom: "1px solid #F0E8D0", fontSize: 12 },
  tdRight: { padding: "7px 10px", borderBottom: "1px solid #F0E8D0", textAlign: "right", fontSize: 12 },
  totalsSection: { display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", marginTop: 4 },
  totalsRow: { display: "flex", gap: 24, justifyContent: "flex-end", fontSize: 13 },
  grandTotalRow: {
    display: "flex",
    gap: 24,
    justifyContent: "flex-end",
    fontSize: 16,
    fontWeight: 800,
    color: "#B8860B",
    borderTop: "2px solid #D4AF37",
    paddingTop: 6,
    marginTop: 2,
    width: "100%",
  },
  policySignRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 20, gap: 16 },
  policyBox: { fontSize: 11, color: "#555", lineHeight: 1.6 },
  policyTitle: { fontWeight: 700, color: "#1A1A1A", marginBottom: 4 },
  signBox: { textAlign: "center", fontSize: 11, color: "#888", minWidth: 140 },
  signLine: { border: "1px solid #CCC", height: 50, marginTop: 28, borderRadius: 4 },
  thankYou: { textAlign: "center", marginTop: 18, borderTop: "1px solid #EEE", paddingTop: 12 },
  invoiceActions: { display: "flex", gap: 10, padding: "16px 40px", borderTop: "1px solid #F0E8D0" },
  printBtn: {
    flex: 1,
    padding: "11px 0",
    background: "#FAF8F3",
    border: "1.5px solid #D4AF37",
    borderRadius: 8,
    color: "#B8860B",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  saveBillBtn: {
    flex: 1,
    padding: "11px 0",
    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};

/* ═══════════════════════════ Component ═══════════════════════════ */
export default function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: "", mobile: "" });
  const [mobileErr, setMobileErr] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountRs, setDiscountRs] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceNo] = useState(genInvoiceNo);
  const invoiceRef = useRef(null);

  useEffect(() => { loadProducts(); }, []);

  /* ── API ── */
  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch {
      alert("Products load failed");
    }
  };

  /* ── Filtered products ── */
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        String(p.item_code || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  /* ── Cart ops ── */
  const addToCart = (product) => {
    if (Number(product.stock || 0) <= 0) return;
    const exists = cart.find((i) => i.id === product.id);
    if (exists) { updateQty(product.id, exists.qty + 1); return; }
    setCart((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.selling_price || 0),
        stock: Number(product.stock || 0),
        qty: 1,
      },
    ]);
  };

  const updateQty = (id, raw) => {
    const qty = Math.max(1, Number(raw || 1));
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (qty > item.stock) {
          alert(`Only ${item.stock} pieces available`);
          return { ...item, qty: item.stock };
        }
        return { ...item, qty };
      })
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  /* ── Totals ── */
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const discountAmount = useMemo(() => {
    if (discountRs !== "") return Math.min(Number(discountRs) || 0, subtotal);
    return Math.round(subtotal * (Number(discountPercent || 0) / 100));
  }, [discountPercent, discountRs, subtotal]);

  const grandTotal = subtotal - discountAmount;

  /* ── Discount sync ── */
  const handleDiscountPercent = (v) => {
    setDiscountPercent(v);
    setDiscountRs("");
  };
  const handleDiscountRs = (v) => {
    setDiscountRs(v);
    setDiscountPercent("");
  };

  /* ── Validation ── */
  const validateMobile = (mob) => {
    if (mob && !/^\d{10}$/.test(mob)) {
      setMobileErr("Enter a valid 10-digit mobile number");
      return false;
    }
    setMobileErr("");
    return true;
  };

  const openPreview = () => {
    if (cart.length === 0) { alert("Add at least one item to the cart."); return; }
    if (!customer.name.trim()) { alert("Please enter customer name."); return; }
    if (!validateMobile(customer.mobile)) return;
    setShowPreview(true);
  };

  /* ── Save Bill ── */
  const saveBill = async () => {
    try {
      const payload = {
        customerName: customer.name,
        customerMobile: customer.mobile,
        subtotal,
        discountPercent: discountRs !== "" ? ((discountAmount / subtotal) * 100).toFixed(2) : Number(discountPercent || 0),
        discountAmount,
        grandTotal,
        paymentMode,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          sale_price: item.price,
          qty: item.qty,
        })),
      };

      const res = await api.post("/sales", payload);
      if (res.data.success) {
        alert(`Bill Saved\n${res.data.billNo}`);
        setCart([]);
        setCustomer({ name: "", mobile: "" });
        setDiscountPercent("");
        setDiscountRs("");
        setShowPreview(false);
        loadProducts();
      }
    } catch (error) {
      console.error(error);
      alert("Bill save failed");
    }
  };

  /* ── Print ── */
  const handlePrint = () => window.print();

  /* ── Date/time ── */
  const now = today();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div style={S.page}>
      {/* ── Page header ── */}
      <div style={S.pageHead}>
        <div style={{ padding: "0 0 16px" }}>
          <h1 style={S.pageTitle}>Billing</h1>
          <p style={S.pageSub}>Create bills, apply discounts and print A4 invoices.</p>
        </div>
      </div>

      <div style={S.body}>
        {/* ══════════════ LEFT — Products ══════════════ */}
        <div style={S.leftPanel}>
          {/* search */}
          <div style={S.searchWrap}>
            <input
              style={S.searchInput}
              placeholder="🔍  Search by name, category or item code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#B8860B")}
              onBlur={(e) => (e.target.style.borderColor = "#D4AF37")}
            />
          </div>

          {/* product cards */}
          <div style={S.productGrid}>
            {filteredProducts.length === 0 && (
              <div style={S.empty}>No products found.</div>
            )}
            {filteredProducts.map((product) => {
              const stock = Number(product.stock || 0);
              const outOfStock = stock <= 0;
              const lowStock = stock > 0 && stock <= 5;
              return (
                <div
                  key={product.id}
                  style={S.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(180,150,0,0.15)";
                    e.currentTarget.style.borderColor = "#D4AF37";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(180,150,0,0.06)";
                    e.currentTarget.style.borderColor = "#E8DFC8";
                  }}
                >
                  <p style={S.cardName}>{product.name}</p>
                  <p style={S.cardMeta}>
                    <span>{product.category || "—"}</span>
                    {product.item_code && <span style={{ color: "#BBB" }}>#{product.item_code}</span>}
                    <span style={{ color: "#AAA" }}>•</span>
                    <span>Qty: {stock}</span>
                    {lowStock && <span style={S.badgeLow}>Low Stock</span>}
                    {outOfStock && <span style={S.badgeOut}>Out of Stock</span>}
                  </p>
                  <div style={S.cardBottom}>
                    <span style={S.cardPrice}>₹{fmt(product.selling_price)}</span>
                    <button
                      style={outOfStock ? S.addBtnDisabled : S.addBtn}
                      disabled={outOfStock}
                      onClick={() => addToCart(product)}
                      onMouseEnter={(e) => { if (!outOfStock) e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ RIGHT — Cart ══════════════ */}
        <div style={S.rightPanel}>
          {/* cart header */}
          <div style={S.cartHeader}>
            <h2 style={S.cartTitle}>
              Bill Cart{" "}
              {cart.length > 0 && (
                <span style={{ fontSize: 12, color: "#B8860B", fontWeight: 600 }}>
                  ({cart.length} item{cart.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>
            {cart.length > 0 && (
              <button style={S.clearBtn} onClick={clearCart}>
                Remove All
              </button>
            )}
          </div>

          {/* customer fields */}
          <div style={S.customerGrid}>
            <div>
              <input
                style={S.input}
                placeholder="Customer Name *"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                onBlur={(e) => (e.target.style.borderColor = "#E8DFC8")}
              />
            </div>
            <div>
              <input
                style={mobileErr ? S.inputErr : S.input}
                placeholder="Mobile Number"
                value={customer.mobile}
                maxLength={10}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setCustomer({ ...customer, mobile: v });
                  if (v.length === 10 || v.length === 0) validateMobile(v);
                  else setMobileErr("");
                }}
                onBlur={() => validateMobile(customer.mobile)}
              />
            </div>
            {mobileErr && (
              <div style={{ ...S.errMsg, gridColumn: "1/-1" }}>{mobileErr}</div>
            )}
          </div>

          {/* cart items */}
          <div style={S.cartItems}>
            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#BBB",
                  fontSize: 13,
                  padding: "32px 0",
                }}
              >
                No items added yet.
                <br />
                <span style={{ fontSize: 11, color: "#D4AF37" }}>← Search and add products</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} style={S.cartItem}>
                  <div style={S.cartItemInfo}>
                    <p style={S.cartItemName}>{item.name}</p>
                    <p style={S.cartItemPrice}>₹{fmt(item.price)} / piece</p>
                  </div>
                  <div style={S.qtyControl}>
                    <button
                      style={S.qtyBtn}
                      onClick={() => updateQty(item.id, item.qty - 1)}
                    >
                      −
                    </button>
                    <span style={S.qtyVal}>{item.qty}</span>
                    <button
                      style={S.qtyBtn}
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span style={S.itemTotal}>₹{fmt(item.price * item.qty)}</span>
                  <button
                    style={S.removeBtn}
                    onClick={() => removeItem(item.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#CCC")}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* summary */}
          <div style={S.summary}>
            <div style={S.summaryRow}>
              <span style={{ color: "#555" }}>Subtotal</span>
              <strong>₹{fmt(subtotal)}</strong>
            </div>

            {/* discount */}
            <div style={{ ...S.summaryRow, gap: 8 }}>
              <span style={{ color: "#555", whiteSpace: "nowrap" }}>Discount</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  style={{ ...S.discountInput, width: 62 }}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={discountPercent}
                  onChange={(e) => handleDiscountPercent(e.target.value)}
                  title="Discount in percent"
                />
                <span style={{ color: "#CCC", fontSize: 12 }}>or</span>
                <input
                  style={{ ...S.discountInput, width: 72 }}
                  type="number"
                  min="0"
                  placeholder="₹ amt"
                  value={discountRs}
                  onChange={(e) => handleDiscountRs(e.target.value)}
                  title="Discount in rupees"
                />
                <span style={{ color: "#B8860B", fontWeight: 700, minWidth: 64, textAlign: "right" }}>
                  − ₹{fmt(discountAmount)}
                </span>
              </div>
            </div>

            {/* grand total */}
            <div style={S.grandRow}>
              <span style={S.grandLabel}>Grand Total</span>
              <span style={S.grandAmt}>₹{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* payment mode */}
          <select
            style={S.paySelect}
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Mixed</option>
          </select>

          {/* CTA */}
          <button
            style={S.saveBtn}
            onClick={openPreview}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Generate Invoice & Preview
          </button>
        </div>
      </div>

      {/* ══════════════ INVOICE MODAL ══════════════ */}
      {showPreview && (
        <div style={S.backdrop} onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}>
          <div style={S.modalWrap}>
            <button style={S.closeModal} onClick={() => setShowPreview(false)}>
              ×
            </button>

            {/* ── Invoice body ── */}
            <div ref={invoiceRef} style={S.invoice}>
              <h1 style={S.bizName}>RAJNI SARI CENTER</h1>
              <p style={S.bizAddr}>F-232, Lado Sarai, New Delhi – 110030</p>
              <p style={{ ...S.bizAddr, marginTop: 0 }}>Mobile: 9818602584</p>

              <hr style={S.divider} />

              <div style={S.metaGrid}>
                <div>
                  <p style={{ margin: "2px 0" }}>
                    <span style={S.metaLabel}>Invoice No: </span>{invoiceNo}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={S.metaLabel}>Date: </span>{dateStr}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={S.metaLabel}>Time: </span>{timeStr}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "2px 0" }}>
                    <span style={S.metaLabel}>Customer: </span>
                    {customer.name || "Walk-in Customer"}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={S.metaLabel}>Mobile: </span>
                    {customer.mobile || "—"}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={S.metaLabel}>Payment: </span>{paymentMode}
                  </p>
                </div>
              </div>

              <hr style={S.divider} />

              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Sr.</th>
                    <th style={S.th}>Item Name</th>
                    <th style={{ ...S.th, textAlign: "center" }}>Qty</th>
                    <th style={S.thRight}>Rate</th>
                    <th style={S.thRight}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={S.td}>{idx + 1}</td>
                      <td style={S.td}>{item.name}</td>
                      <td style={{ ...S.td, textAlign: "center" }}>{item.qty}</td>
                      <td style={S.tdRight}>₹{fmt(item.price)}</td>
                      <td style={S.tdRight}>₹{fmt(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={S.totalsSection}>
                <div style={S.totalsRow}>
                  <span style={{ color: "#555" }}>Subtotal:</span>
                  <strong>₹{fmt(subtotal)}</strong>
                </div>
                {discountAmount > 0 && (
                  <div style={S.totalsRow}>
                    <span style={{ color: "#555" }}>
                      Discount
                      {discountPercent !== "" && ` (${discountPercent}%)`}:
                    </span>
                    <strong style={{ color: "#C0392B" }}>− ₹{fmt(discountAmount)}</strong>
                  </div>
                )}
                <div style={S.grandTotalRow}>
                  <span>Grand Total:</span>
                  <span>₹{fmt(grandTotal)}</span>
                </div>
              </div>

              <hr style={{ ...S.thinDivider, marginTop: 14 }} />

              <div style={S.policySignRow}>
                <div style={S.policyBox}>
                  <p style={S.policyTitle}>Exchange / Return Policy</p>
                  <p style={{ margin: "1px 0" }}>Goods once sold will not be taken back.</p>
                  <p style={{ margin: "1px 0" }}>Exchange allowed within 3 days with original bill.</p>
                  <p style={{ margin: "1px 0" }}>Product must be unused and in original condition.</p>
                </div>
                <div style={S.signBox}>
                  <p style={{ margin: 0 }}>Shop Stamp / Authorised Signature</p>
                  <div style={S.signLine}></div>
                </div>
              </div>

              <div style={S.thankYou}>
                <strong style={{ fontSize: 14, color: "#B8860B" }}>Thank You For Shopping</strong>
                <br />
                <span style={{ fontSize: 12, color: "#888" }}>Please Visit Again</span>
              </div>
            </div>

            {/* actions outside print area */}
            <div style={S.invoiceActions}>
              <button
                style={S.printBtn}
                onClick={handlePrint}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4EDD8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#FAF8F3")}
              >
                🖨 Print Invoice
              </button>
              <button
                style={S.saveBillBtn}
                onClick={saveBill}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                💾 Save Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print-only styles ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .billing-print-area { display: block !important; }
        }
        @media print {
          #root { display: none; }
        }
      `}</style>
    </div>
  );
}