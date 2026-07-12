/**
 * BillHistory.jsx
 * Rajni Saree Center POS — Enterprise Billing History
 * Premium Apple-inspired UI · Luxury Boutique Theme
 *
 * Architecture:
 *   - Fetches real sales data from GET /sales
 *   - Supports GET /sales/:id if available, falls back to list data
 *   - DELETE /sales/:id for bill deletion
 *   - No dummy data — production-ready
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import api from "./services/api.js";
import "./BillHistory.css";

/* ──────────────────────────────────────────────────────────────
   CONSTANTS & HELPERS
────────────────────────────────────────────────────────────── */

const STORE = {
  name: "Rajni Saree Center",
  tagline: "LUXURY BOUTIQUE",
  address: "Shop No. 12, Silk Market Complex,\nMahalaxmi Road, Surat — 395 003",
  phone: "+91 98765 43210",
  gstin: "24AABCS1429B1Z9",
  email: "info@rajnisaree.com",
};

const PAYMENT_MODES = ["All", "Cash", "UPI", "Card", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Amount" },
  { value: "lowest", label: "Lowest Amount" },
];

/**
 * Normalize a sale object from the API into a consistent shape.
 * Handles varying field name conventions from the backend.
 */
function normalizeSale(sale) {
  return {
    id:             sale.id          ?? sale.sale_id    ?? sale._id ?? null,
    billNumber:     sale.bill_number ?? sale.billNumber ?? sale.invoice_number ?? `BILL-${sale.id}`,
    customerName:   sale.customer_name ?? sale.customerName ?? sale.name ?? "Walk-in Customer",
    customerMobile: sale.customer_mobile ?? sale.mobile ?? sale.phone ?? "",
    customerAddress:sale.customer_address ?? sale.address ?? "",
    paymentMode:    sale.payment_mode ?? sale.paymentMode ?? sale.payment_type ?? "Cash",
    items:          sale.items         ?? sale.sale_items ?? [],
    subTotal:       parseFloat(sale.sub_total   ?? sale.subTotal  ?? sale.subtotal  ?? 0),
    discount:       parseFloat(sale.discount    ?? sale.discount_amount ?? 0),
    grandTotal:     parseFloat(sale.grand_total ?? sale.grandTotal ?? sale.total    ?? 0),
    date:           sale.date          ?? sale.created_at ?? sale.createdAt ?? null,
    notes:          sale.notes         ?? sale.remark     ?? "",
    raw:            sale,
  };
}

/**
 * Normalize a single item inside a sale.
 */
function normalizeItem(item, idx) {
  return {
    id:       item.id          ?? item.item_id   ?? idx,
    name:     item.name        ?? item.item_name ?? item.product_name ?? `Item ${idx + 1}`,
    hsn:      item.hsn         ?? item.hsn_code  ?? "",
    qty:      parseFloat(item.qty       ?? item.quantity ?? 1),
    rate:     parseFloat(item.rate      ?? item.price    ?? item.unit_price ?? 0),
    discount: parseFloat(item.discount  ?? item.item_discount ?? 0),
    amount:   parseFloat(item.amount    ?? item.total_amount   ?? 0),
  };
}

/** Format currency as Indian Rupees */
function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Format compact currency (₹1,23,456) */
function formatCurrencyCompact(value) {
  const num = parseFloat(value) || 0;
  return "₹" + num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format date string to readable form */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Format time string */
function formatTime(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

/** Check if a date is today */
function isToday(dateStr) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  } catch {
    return false;
  }
}

/** Generate initials from a name */
function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

/** Normalize payment mode string */
function normalizePaymentMode(mode = "") {
  const m = mode.trim().toLowerCase();
  if (m === "cash")             return "Cash";
  if (m === "upi" || m === "gpay" || m === "phonepe" || m === "paytm") return "UPI";
  if (m === "card" || m === "credit" || m === "debit" || m === "swipe") return "Card";
  return "Other";
}

/* ──────────────────────────────────────────────────────────────
   SVG ICON COMPONENTS
   (Inline SVG keeps zero dependency on icon libraries)
────────────────────────────────────────────────────────────── */

const Icon = ({ d, size = 20, strokeWidth = 1.8, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const Icons = {
  receipt:    ["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2","M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 1-2-2h-2a2 2 0 0 1-2 2Z"],
  search:     "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z",
  refresh:    "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  printer:    ["M6 9V2h12v7","M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2","M6 14h12v8H6z"],
  download:   ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  trash:      ["M3 6h18","M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6","M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"],
  moon:       "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  sun:        ["M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42","M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z"],
  chevronDown:"M6 9l6 6 6-6",
  chevronUp:  "M18 15l-6-6-6 6",
  chevronRight:"M9 18l6-6-6-6",
  x:          "M18 6 6 18M6 6l12 12",
  check:      "M20 6 9 17l-5-5",
  alert:      ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z","M12 9v4","M12 17h.01"],
  inboxEmpty: ["M22 12h-4l-3 9L9 3l-3 9H2","M12 12v9"],
  file:       ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  bills:      ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  calendar:   ["M3 9h18","M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z","M16 2v4","M8 2v4"],
  cash:       ["M12 1v22","M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  chart:      ["M18 20V10","M12 20V4","M6 20v-6"],
  phone:      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17Z",
  user:       ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  tag:        "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
  upi:        ["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  creditcard: ["M1 4h22a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z","M1 10h22"],
  arrowUp:    ["M12 19V5","M5 12l7-7 7 7"],
  filter:     "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  eye:        ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  clock:      ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z","M12 6v6l4 2"],
  mappin:     ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z","M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  sort:       ["M3 6h18","M7 12h10","M11 18h4"],
  star:       "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  info:       ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z","M12 16v-4","M12 8h.01"],
  percent:    ["M19 5L5 19","M6.5 6.5h.01","M17.5 17.5h.01"],
};

/* ──────────────────────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
────────────────────────────────────────────────────────────── */

/** Payment badge */
function PaymentBadge({ mode }) {
  const normalized = normalizePaymentMode(mode);
  const config = {
    Cash:  { cls: "bh-badge--cash",  icon: Icons.cash,       label: "Cash" },
    UPI:   { cls: "bh-badge--upi",   icon: Icons.upi,        label: "UPI"  },
    Card:  { cls: "bh-badge--card",  icon: Icons.creditcard, label: "Card" },
    Other: { cls: "bh-badge--other", icon: Icons.tag,        label: mode || "Other" },
  };
  const { cls, icon, label } = config[normalized] ?? config.Other;
  return (
    <span className={`bh-badge ${cls}`}>
      <Icon d={icon} size={10} strokeWidth={2} />
      {label}
    </span>
  );
}

/** Stat card */
function StatCard({ label, value, prefix, suffix, iconVariant, icon, trend, barPct }) {
  return (
    <div className="bh-stat-card">
      <div className="bh-stat-card-top">
        <div className={`bh-stat-icon bh-stat-icon--${iconVariant}`}>
          <Icon d={icon} size={20} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <span className={`bh-stat-trend ${trend >= 0 ? "bh-stat-trend--up" : "bh-stat-trend--neutral"}`}>
            {trend >= 0 ? <Icon d={Icons.arrowUp} size={10} strokeWidth={2.5} /> : null}
            {trend >= 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>
      <div>
        <div className="bh-stat-card-value">
          {prefix && <small>{prefix}</small>}
          {value}
          {suffix && <small style={{ marginLeft: "2px" }}>{suffix}</small>}
        </div>
        <div className="bh-stat-card-label">{label}</div>
      </div>
      {barPct !== undefined && (
        <div className="bh-stat-card-bar">
          <div
            className="bh-stat-card-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }}
          />
        </div>
      )}
    </div>
  );
}

/** Skeleton card shimmer */
function SkeletonCard() {
  return (
    <div className="bh-skeleton-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--sm" style={{ width: "70px" }} />
        <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--lg" style={{ width: "80px" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div className="bh-skeleton-shimmer" style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0 }} />
        <div className="bh-skeleton-shimmer bh-skeleton-line" style={{ width: "120px" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--sm" style={{ width: "90px" }} />
        <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--sm" style={{ width: "60px" }} />
      </div>
    </div>
  );
}

/** Skeleton stats */
function SkeletonStatCard() {
  return (
    <div className="bh-stat-card" style={{ gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="bh-skeleton-shimmer" style={{ width: "40px", height: "40px", borderRadius: "10px" }} />
        <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--sm" style={{ width: "44px" }} />
      </div>
      <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--xl" style={{ width: "90px" }} />
      <div className="bh-skeleton-shimmer bh-skeleton-line bh-skeleton-line--sm" style={{ width: "70px" }} />
    </div>
  );
}

/** Toast */
function Toast({ id, type = "info", message, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4200);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const iconMap = {
    success: Icons.check,
    error:   Icons.alert,
    info:    Icons.info,
  };

  return (
    <div className={`bh-toast bh-toast--${type}`} role="alert">
      <div className="bh-toast-icon">
        <Icon d={iconMap[type] ?? Icons.info} size={16} strokeWidth={2} />
      </div>
      <span className="bh-toast-text">{message}</span>
      <button className="bh-toast-close" onClick={() => onClose(id)} aria-label="Close">
        <Icon d={Icons.x} size={11} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** Delete confirm modal */
function DeleteModal({ bill, onConfirm, onCancel, loading }) {
  return (
    <div className="bh-modal-overlay" role="dialog" aria-modal="true">
      <div className="bh-modal">
        <div className="bh-modal-icon">
          <Icon d={Icons.trash} size={26} strokeWidth={1.8} />
        </div>
        <div className="bh-modal-title">Delete Bill?</div>
        <div className="bh-modal-body">
          Are you sure you want to permanently delete{" "}
          <strong>{bill.billNumber}</strong> for{" "}
          <strong>{bill.customerName}</strong>?{" "}
          This action cannot be undone.
        </div>
        <div className="bh-modal-actions">
          <button
            className="bh-btn bh-btn--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bh-btn bh-btn--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : (
              <>
                <Icon d={Icons.trash} size={15} strokeWidth={2} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   INVOICE PREVIEW COMPONENT
────────────────────────────────────────────────────────────── */

function InvoicePreview({ bill }) {
  const items = useMemo(
    () => (bill.items || []).map((item, i) => normalizeItem(item, i)),
    [bill.items]
  );

  const computedSubTotal = useMemo(
    () =>
      bill.subTotal > 0
        ? bill.subTotal
        : items.reduce((s, it) => s + (it.amount > 0 ? it.amount : it.qty * it.rate), 0),
    [bill.subTotal, items]
  );

  const computedAmount = useCallback(
    (item) =>
      item.amount > 0
        ? item.amount
        : parseFloat((item.qty * item.rate).toFixed(2)),
    []
  );

  return (
    <div className="bh-invoice-wrap">
      <div className="bh-invoice-doc">
        {/* Gold stripe top */}
        <div className="bh-invoice-gold-stripe" />

        {/* Header */}
        <div className="bh-invoice-header">
          <div>
            <div className="bh-invoice-store-name">
              {STORE.name.split(" ").slice(0, 2).join(" ")}{" "}
              <span>{STORE.name.split(" ").slice(2).join(" ")}</span>
            </div>
            <div className="bh-invoice-store-tag">{STORE.tagline}</div>
            <div className="bh-invoice-store-address">
              {STORE.address.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              <div style={{ marginTop: "4px" }}>
                <strong>GSTIN:</strong> {STORE.gstin}
              </div>
              <div>
                <strong>Phone:</strong> {STORE.phone}
              </div>
            </div>
          </div>
          <div className="bh-invoice-right">
            <div className="bh-invoice-title">Invoice</div>
            <div className="bh-invoice-meta-table">
              <div className="bh-invoice-meta-row">
                <span className="bh-invoice-meta-key">Bill No</span>
                <span className="bh-invoice-meta-val">{bill.billNumber}</span>
              </div>
              <div className="bh-invoice-meta-row">
                <span className="bh-invoice-meta-key">Date</span>
                <span className="bh-invoice-meta-val">{formatDate(bill.date)}</span>
              </div>
              <div className="bh-invoice-meta-row">
                <span className="bh-invoice-meta-key">Time</span>
                <span className="bh-invoice-meta-val">{formatTime(bill.date) || "—"}</span>
              </div>
              <div className="bh-invoice-meta-row">
                <span className="bh-invoice-meta-key">Payment</span>
                <span className="bh-invoice-meta-val">
                  <PaymentBadge mode={bill.paymentMode} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="bh-invoice-customer-section">
          <div>
            <div className="bh-invoice-section-label">Bill To</div>
            <div className="bh-invoice-customer-name">{bill.customerName}</div>
            {bill.customerMobile && (
              <div className="bh-invoice-customer-detail">
                <Icon d={Icons.phone} size={12} strokeWidth={1.8} />
                {bill.customerMobile}
              </div>
            )}
            {bill.customerAddress && (
              <div className="bh-invoice-customer-detail">
                <Icon d={Icons.mappin} size={12} strokeWidth={1.8} />
                {bill.customerAddress}
              </div>
            )}
          </div>
          <div>
            <div className="bh-invoice-section-label">Payment Details</div>
            <div className="bh-invoice-customer-detail">
              <Icon d={Icons.tag} size={12} strokeWidth={1.8} />
              Mode: <strong style={{ color: "var(--text-primary)", marginLeft: "4px" }}>
                {bill.paymentMode || "Cash"}
              </strong>
            </div>
            {bill.notes && (
              <div className="bh-invoice-customer-detail" style={{ marginTop: "4px" }}>
                <Icon d={Icons.info} size={12} strokeWidth={1.8} />
                {bill.notes}
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        <div className="bh-invoice-table-section">
          <div className="bh-invoice-table-wrap">
            <table className="bh-invoice-table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}>#</th>
                  <th>Item Description</th>
                  {items.some((it) => it.hsn) && <th className="center">HSN</th>}
                  <th className="center">Qty</th>
                  <th className="right">Rate</th>
                  {items.some((it) => it.discount > 0) && (
                    <th className="right">Disc %</th>
                  )}
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "32px 16px",
                        color: "var(--text-tertiary)",
                        fontSize: "13px",
                      }}
                    >
                      No items found for this bill.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id ?? idx}>
                      <td>
                        <span className="bh-item-number">{idx + 1}</span>
                      </td>
                      <td className="item-name">{item.name}</td>
                      {items.some((it) => it.hsn) && (
                        <td className="center" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-tertiary)" }}>
                          {item.hsn || "—"}
                        </td>
                      )}
                      <td className="center" style={{ fontWeight: 600 }}>
                        {item.qty}
                      </td>
                      <td className="right" style={{ fontFamily: "var(--font-mono)", fontSize: "12.5px" }}>
                        {formatCurrency(item.rate)}
                      </td>
                      {items.some((it) => it.discount > 0) && (
                        <td className="right" style={{ color: "#16a34a", fontSize: "12px", fontWeight: 600 }}>
                          {item.discount > 0 ? `${item.discount}%` : "—"}
                        </td>
                      )}
                      <td className="right" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>
                        {formatCurrency(computedAmount(item))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bh-invoice-totals">
          <div className="bh-invoice-totals-grid">
            <div className="bh-totals-row">
              <span className="bh-totals-label">Sub Total</span>
              <span className="bh-totals-value">{formatCurrency(computedSubTotal)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="bh-totals-row bh-totals-discount">
                <span className="bh-totals-label">Discount</span>
                <span className="bh-totals-value">− {formatCurrency(bill.discount)}</span>
              </div>
            )}
            <div className="bh-totals-divider" />
            <div className="bh-totals-row bh-totals-grand">
              <span className="bh-totals-label">Grand Total</span>
              <span className="bh-totals-value">{formatCurrency(bill.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bh-invoice-footer">
          <div className="bh-invoice-payment">
            <div className="bh-invoice-section-label">Payment Mode</div>
            <div className="bh-invoice-payment-method">
              <PaymentBadge mode={bill.paymentMode} />
            </div>
          </div>
          <div className="bh-invoice-thank-you">
            <div className="bh-invoice-thank-you-text">Thank You!</div>
            <div className="bh-invoice-thank-you-sub">
              Visit again · {STORE.name}
            </div>
            <div className="bh-invoice-thank-you-sub" style={{ marginTop: "2px" }}>
              {STORE.email}
            </div>
          </div>
        </div>

        {/* Gold stripe bottom */}
        <div className="bh-invoice-gold-stripe-bottom" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────────── */

export default function BillHistory() {
  /* ── Data State ── */
  const [sales, setSales]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [refreshing, setRefreshing]     = useState(false);

  /* ── UI State ── */
  const [selectedBill, setSelectedBill] = useState(null);
  const [billLoading, setBillLoading]   = useState(false);

  /* ── Search & Filter State ── */
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOrder, setSortOrder]       = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  /* ── Dark Mode ── */
  const [darkMode, setDarkMode]         = useState(() => {
    try {
      return (
        localStorage.getItem("bh-dark-mode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  /* ── Delete State ── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Toast State ── */
  const [toasts, setToasts]             = useState([]);
  const toastIdRef                      = useRef(0);

  /* ── Refs ── */
  const sortMenuRef                     = useRef(null);
  const searchRef                       = useRef(null);

  /* ── Apply dark mode to DOM ── */
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    try {
      localStorage.setItem("bh-dark-mode", String(darkMode));
    } catch { /* localStorage unavailable */ }
  }, [darkMode]);

  /* ── Close sort menu on outside click ── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Keyboard shortcut: Escape closes sort menu ── */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        setShowSortMenu(false);
        setDeleteTarget(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  /* ── Toast helpers ── */
  const addToast = useCallback((message, type = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Fetch sales ── */
  const fetchSales = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get("/sales");

      // Normalize the response data
      let rawData = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        rawData = response.data.data;
      } else if (Array.isArray(response.data?.sales)) {
        rawData = response.data.sales;
      } else if (response.data && typeof response.data === "object") {
        rawData = Object.values(response.data).find(Array.isArray) ?? [];
      }

      setSales(rawData.map(normalizeSale));

      if (isRefresh) {
        addToast("Bills refreshed successfully.", "success");
      }
    } catch (err) {
      setError(err?.message ?? "Failed to load billing history.");
      if (isRefresh) {
        addToast("Failed to refresh. Please try again.", "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  /* ── Initial fetch ── */
  useEffect(() => {
    fetchSales(false);
  }, [fetchSales]);

  /* ── Fetch individual bill detail (or use list data) ── */
  const selectBill = useCallback(async (bill) => {
    if (selectedBill?.id === bill.id) return;

    setSelectedBill(bill);
    setBillLoading(true);

    try {
      const response = await api.get(`/sales/${bill.id}`);
      let raw = response.data;
      if (raw?.data) raw = raw.data;
      if (raw?.sale) raw = raw.sale;
      setSelectedBill(normalizeSale(raw));
    } catch {
      // Graceful fallback: use already-loaded list data
      setSelectedBill(bill);
    } finally {
      setBillLoading(false);
    }
  }, [selectedBill]);

  /* ── Delete bill ── */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sales/${deleteTarget.id}`);
      setSales((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (selectedBill?.id === deleteTarget.id) setSelectedBill(null);
      addToast(`Bill ${deleteTarget.billNumber} deleted.`, "success");
    } catch (err) {
      addToast(
        err?.message ?? "Failed to delete bill. Please try again.",
        "error"
      );
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, selectedBill, addToast]);

  /* ── Print handler ── */
  const handlePrint = useCallback(() => {
    if (!selectedBill) {
      addToast("Please select a bill to print.", "info");
      return;
    }
    window.print();
  }, [selectedBill, addToast]);

  /* ── Download PDF (uses print dialog / browser save as PDF) ── */
  const handleDownloadPDF = useCallback(() => {
    if (!selectedBill) {
      addToast("Please select a bill to download.", "info");
      return;
    }
    addToast("Opening print dialog — choose 'Save as PDF'.", "info");
    setTimeout(() => window.print(), 400);
  }, [selectedBill, addToast]);

  /* ── Filtered & sorted sales ── */
  const filteredSales = useMemo(() => {
    let list = [...sales];

    // Apply filter
    if (activeFilter === "Today") {
      list = list.filter((s) => isToday(s.date));
    } else if (activeFilter !== "All") {
      list = list.filter(
        (s) => normalizePaymentMode(s.paymentMode) === activeFilter
      );
    }

    // Apply search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((s) =>
        s.billNumber?.toLowerCase().includes(q) ||
        s.customerName?.toLowerCase().includes(q) ||
        s.customerMobile?.toLowerCase().includes(q) ||
        normalizePaymentMode(s.paymentMode).toLowerCase().includes(q) ||
        formatDate(s.date).toLowerCase().includes(q)
      );
    }

    // Apply sort
    list.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date ?? 0) - new Date(a.date ?? 0);
      }
      if (sortOrder === "oldest") {
        return new Date(a.date ?? 0) - new Date(b.date ?? 0);
      }
      if (sortOrder === "highest") {
        return (b.grandTotal ?? 0) - (a.grandTotal ?? 0);
      }
      if (sortOrder === "lowest") {
        return (a.grandTotal ?? 0) - (b.grandTotal ?? 0);
      }
      return 0;
    });

    return list;
  }, [sales, activeFilter, searchQuery, sortOrder]);

  /* ── Statistics ── */
  const stats = useMemo(() => {
    const todayBills  = sales.filter((s) => isToday(s.date));
    const cashBills   = sales.filter((s) => normalizePaymentMode(s.paymentMode) === "Cash");
    const onlineBills = sales.filter((s) => normalizePaymentMode(s.paymentMode) !== "Cash");
    const totalRev    = sales.reduce((s, b) => s + (b.grandTotal ?? 0), 0);
    const todayRev    = todayBills.reduce((s, b) => s + (b.grandTotal ?? 0), 0);
    const avgBill     = sales.length > 0 ? totalRev / sales.length : 0;

    return {
      totalBills:  sales.length,
      todayBills:  todayBills.length,
      todayRev,
      totalRev,
      cashBills:   cashBills.length,
      onlineBills: onlineBills.length,
      avgBill,
      cashPct:     sales.length > 0 ? (cashBills.length / sales.length) * 100 : 0,
      onlinePct:   sales.length > 0 ? (onlineBills.length / sales.length) * 100 : 0,
    };
  }, [sales]);

  /* ── Sort label ── */
  const activeSortLabel = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? "Sort",
    [sortOrder]
  );

  /* ── Render ── */
  return (
    <div className="bh-root" data-theme={darkMode ? "dark" : "light"}>

      {/* ── Top Navigation Bar ── */}
      <header className="bh-topbar">
        {/* Brand */}
        <div className="bh-topbar-brand">
          <div className="bh-topbar-logo">
            <Icon d={Icons.star} size={22} strokeWidth={1.6} />
          </div>
          <div className="bh-topbar-title-group">
            <div className="bh-topbar-title">Rajni Saree Center</div>
            <div className="bh-topbar-subtitle">Billing History</div>
          </div>
        </div>

        {/* Search */}
        <div className="bh-topbar-center">
          <div className="bh-search-wrapper">
            <Icon
              d={Icons.search}
              size={16}
              strokeWidth={2}
              className="bh-search-icon"
            />
            <input
              ref={searchRef}
              type="text"
              className="bh-search-input"
              placeholder="Search by bill no, customer, mobile, payment…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search bills"
            />
            {searchQuery && (
              <button
                className="bh-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <Icon d={Icons.x} size={10} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bh-topbar-actions">
          <button
            className={`bh-icon-btn ${refreshing ? "spinning" : ""}`}
            onClick={() => fetchSales(true)}
            disabled={loading || refreshing}
            title="Refresh bills"
            aria-label="Refresh"
          >
            <Icon d={Icons.refresh} size={16} strokeWidth={2} />
          </button>
          <button
            className={`bh-icon-btn ${darkMode ? "active" : ""}`}
            onClick={() => setDarkMode((d) => !d)}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            <Icon d={darkMode ? Icons.sun : Icons.moon} size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="bh-page">

        {/* Section Header */}
        <div className="bh-section-header">
          <h1 className="bh-section-title">Billing History</h1>
          {!loading && (
            <span className="bh-section-badge">{sales.length} Bills</span>
          )}
        </div>

        {/* ── Statistics Cards ── */}
        {loading ? (
          <div className="bh-stats-grid">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <div className="bh-stats-grid">
            <StatCard
              label="Total Bills"
              value={stats.totalBills.toLocaleString("en-IN")}
              icon={Icons.receipt}
              iconVariant="gold"
              trend={0}
            />
            <StatCard
              label="Today's Bills"
              value={stats.todayBills.toLocaleString("en-IN")}
              icon={Icons.calendar}
              iconVariant="blue"
            />
            <StatCard
              label="Today's Revenue"
              value={
                stats.todayRev >= 100000
                  ? `${(stats.todayRev / 100000).toFixed(1)}L`
                  : stats.todayRev >= 1000
                  ? `${(stats.todayRev / 1000).toFixed(1)}K`
                  : stats.todayRev.toFixed(0)
              }
              prefix="₹"
              icon={Icons.chart}
              iconVariant="green"
            />
            <StatCard
              label="Total Revenue"
              value={
                stats.totalRev >= 100000
                  ? `${(stats.totalRev / 100000).toFixed(1)}L`
                  : stats.totalRev >= 1000
                  ? `${(stats.totalRev / 1000).toFixed(1)}K`
                  : stats.totalRev.toFixed(0)
              }
              prefix="₹"
              icon={Icons.cash}
              iconVariant="purple"
              barPct={(stats.totalRev / Math.max(stats.totalRev, 1)) * 100}
            />
            <StatCard
              label="Cash Bills"
              value={stats.cashBills.toLocaleString("en-IN")}
              icon={Icons.cash}
              iconVariant="green"
              barPct={stats.cashPct}
            />
            <StatCard
              label="Online Bills"
              value={stats.onlineBills.toLocaleString("en-IN")}
              icon={Icons.upi}
              iconVariant="cyan"
              barPct={stats.onlinePct}
            />
            <StatCard
              label="Avg. Bill Value"
              value={
                stats.avgBill >= 1000
                  ? `${(stats.avgBill / 1000).toFixed(1)}K`
                  : stats.avgBill.toFixed(0)
              }
              prefix="₹"
              icon={Icons.percent}
              iconVariant="amber"
            />
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bh-filters">
          <span className="bh-filter-label">Filter:</span>
          <div className="bh-filter-group">
            {["All", "Today", ...PAYMENT_MODES.slice(1)].map((f) => (
              <button
                key={f}
                className={`bh-filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === "Cash"  && <Icon d={Icons.cash}       size={13} strokeWidth={2} />}
                {f === "UPI"   && <Icon d={Icons.upi}        size={13} strokeWidth={2} />}
                {f === "Card"  && <Icon d={Icons.creditcard} size={13} strokeWidth={2} />}
                {f === "Today" && <Icon d={Icons.calendar}   size={13} strokeWidth={2} />}
                {f}
                {f !== "All" && !loading && (
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.25)",
                    padding: "0 5px",
                    borderRadius: "99px",
                  }}>
                    {f === "Today"
                      ? sales.filter((s) => isToday(s.date)).length
                      : f === "Cash"
                      ? sales.filter((s) => normalizePaymentMode(s.paymentMode) === "Cash").length
                      : f === "UPI"
                      ? sales.filter((s) => normalizePaymentMode(s.paymentMode) === "UPI").length
                      : f === "Card"
                      ? sales.filter((s) => normalizePaymentMode(s.paymentMode) === "Card").length
                      : sales.filter((s) => normalizePaymentMode(s.paymentMode) === "Other").length
                    }
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="bh-filter-divider" />

          {/* Sort dropdown */}
          <div style={{ position: "relative" }} ref={sortMenuRef}>
            <button
              className="bh-filter-btn"
              onClick={() => setShowSortMenu((v) => !v)}
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)" }}
            >
              <Icon d={Icons.sort} size={13} strokeWidth={2} />
              {activeSortLabel}
              <Icon d={showSortMenu ? Icons.chevronUp : Icons.chevronDown} size={12} strokeWidth={2.5} />
            </button>
            {showSortMenu && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                zIndex: 200,
                minWidth: "180px",
                animation: "bh-scaleIn 0.15s ease both",
              }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortOrder(opt.value);
                      setShowSortMenu(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: sortOrder === opt.value ? "rgba(232,180,0,0.10)" : "transparent",
                      color: sortOrder === opt.value ? "var(--text-gold)" : "var(--text-secondary)",
                      fontSize: "13px",
                      fontWeight: sortOrder === opt.value ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (sortOrder !== opt.value) e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (sortOrder !== opt.value) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {sortOrder === opt.value && (
                      <Icon d={Icons.check} size={13} strokeWidth={2.5} style={{ color: "var(--text-gold)" }} />
                    )}
                    {sortOrder !== opt.value && <span style={{ width: "13px" }} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="bh-preview-panel">
            <div className="bh-error-card">
              <div className="bh-error-icon">
                <Icon d={Icons.alert} size={32} strokeWidth={1.8} />
              </div>
              <div className="bh-error-title">Failed to Load Bills</div>
              <div className="bh-error-message">{error}</div>
              <button
                className="bh-btn bh-btn--primary"
                onClick={() => fetchSales(false)}
                style={{ marginTop: "8px" }}
              >
                <Icon d={Icons.refresh} size={15} strokeWidth={2} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Main Split Layout ── */}
        {!error && (
          <div className="bh-content-grid">

            {/* ── LEFT PANEL: Bill List ── */}
            <aside className="bh-list-panel">
              <div className="bh-list-header">
                <div className="bh-list-header-title">
                  <Icon d={Icons.bills} size={15} strokeWidth={2} style={{ color: "var(--text-gold)" }} />
                  Bills
                  <span className="bh-list-count-chip">
                    {loading ? "…" : filteredSales.length}
                  </span>
                </div>
                {!loading && filteredSales.length > 0 && (
                  <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                    {searchQuery
                      ? `${filteredSales.length} of ${sales.length} shown`
                      : `Showing all ${filteredSales.length}`
                    }
                  </div>
                )}
              </div>

              <div className="bh-list-scroll">
                {loading ? (
                  <div className="bh-list-items">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="bh-empty-list">
                    <div className="bh-empty-list-icon">
                      <Icon d={Icons.inboxEmpty} size={28} strokeWidth={1.6} />
                    </div>
                    <div className="bh-empty-list-title">
                      {searchQuery ? "No Results Found" : "No Bills Yet"}
                    </div>
                    <div className="bh-empty-list-sub">
                      {searchQuery
                        ? `No bills match "${searchQuery}". Try different keywords.`
                        : "Bills will appear here once created."
                      }
                    </div>
                    {searchQuery && (
                      <button
                        className="bh-btn bh-btn--secondary"
                        onClick={() => setSearchQuery("")}
                        style={{ marginTop: "12px" }}
                      >
                        <Icon d={Icons.x} size={13} strokeWidth={2} />
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bh-list-items">
                    {filteredSales.map((bill, idx) => (
                      <BillListCard
                        key={bill.id ?? idx}
                        bill={bill}
                        selected={selectedBill?.id === bill.id}
                        onClick={() => selectBill(bill)}
                        style={{ animationDelay: `${Math.min(idx * 0.04, 0.3)}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* ── RIGHT PANEL: Invoice Preview ── */}
            <section className="bh-preview-panel">
              {/* Toolbar */}
              <div className="bh-preview-toolbar">
                <div className="bh-preview-toolbar-title">
                  <Icon d={Icons.eye} size={15} strokeWidth={2} style={{ color: "var(--text-gold)" }} />
                  {selectedBill
                    ? `Invoice — ${selectedBill.billNumber}`
                    : "Invoice Preview"
                  }
                </div>
                <div className="bh-preview-toolbar-actions">
                  {selectedBill && (
                    <>
                      <button
                        className="bh-btn bh-btn--secondary"
                        onClick={handleDownloadPDF}
                        title="Download as PDF"
                      >
                        <Icon d={Icons.download} size={15} strokeWidth={2} />
                        <span className="bh-hide-sm">PDF</span>
                      </button>
                      <button
                        className="bh-btn bh-btn--secondary"
                        onClick={() => setDeleteTarget(selectedBill)}
                        title="Delete bill"
                      >
                        <Icon d={Icons.trash} size={15} strokeWidth={2} style={{ color: "#dc2626" }} />
                        <span className="bh-hide-sm" style={{ color: "#dc2626" }}>Delete</span>
                      </button>
                      <button
                        className="bh-btn bh-btn--primary"
                        onClick={handlePrint}
                        title="Print invoice"
                      >
                        <Icon d={Icons.printer} size={15} strokeWidth={2} />
                        Print
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Preview body */}
              {billLoading ? (
                <div className="bh-invoice-scroll">
                  <div
                    className="bh-invoice-wrap"
                    style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                  >
                    <div className="bh-skeleton-shimmer" style={{ height: "140px", borderRadius: "14px" }} />
                    <div className="bh-skeleton-shimmer" style={{ height: "80px",  borderRadius: "14px" }} />
                    <div className="bh-skeleton-shimmer" style={{ height: "240px", borderRadius: "14px" }} />
                    <div className="bh-skeleton-shimmer" style={{ height: "100px", borderRadius: "14px" }} />
                  </div>
                </div>
              ) : selectedBill ? (
                <div className="bh-invoice-scroll">
                  <InvoicePreview bill={selectedBill} />
                </div>
              ) : (
                <div className="bh-empty-preview">
                  <div className="bh-empty-preview-icon">
                    <Icon d={Icons.file} size={40} strokeWidth={1.5} />
                  </div>
                  <div className="bh-empty-preview-title">No Bill Selected</div>
                  <div className="bh-empty-preview-sub">
                    Click on any bill from the left panel to preview the
                    complete invoice here.
                  </div>
                  {!loading && sales.length > 0 && (
                    <button
                      className="bh-btn bh-btn--secondary"
                      onClick={() => selectBill(filteredSales[0] ?? sales[0])}
                      style={{ marginTop: "8px" }}
                    >
                      <Icon d={Icons.eye} size={14} strokeWidth={2} />
                      View Latest Bill
                    </button>
                  )}
                </div>
              )}
            </section>

          </div>
        )}
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <DeleteModal
          bill={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── Toast Notifications ── */}
      <div className="bh-toasts" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            onClose={removeToast}
          />
        ))}
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   BILL LIST CARD COMPONENT
   (Extracted for clean, isolated rendering)
────────────────────────────────────────────────────────────── */

function BillListCard({ bill, selected, onClick, style }) {
  const initials = getInitials(bill.customerName);

  return (
    <div
      className={`bh-bill-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      style={style}
      role="button"
      tabIndex={0}
      aria-selected={selected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Row 1: Bill number + Amount */}
      <div className="bh-bill-card-row1">
        <div className="bh-bill-num">{bill.billNumber}</div>
        <div className="bh-bill-amount">
          <small>₹</small>
          {(bill.grandTotal ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      {/* Row 2: Customer + Payment */}
      <div className="bh-bill-card-row2">
        <div className="bh-bill-customer">
          <div className="bh-bill-avatar">{initials}</div>
          <span className="bh-bill-name">{bill.customerName}</span>
        </div>
        <PaymentBadge mode={bill.paymentMode} />
      </div>

      {/* Row 3: Mobile + Date/Time */}
      <div className="bh-bill-card-row3">
        <div className="bh-bill-meta">
          {bill.customerMobile && (
            <span className="bh-bill-mobile">
              <Icon d={Icons.phone} size={11} strokeWidth={1.8} />
              {bill.customerMobile}
            </span>
          )}
        </div>
        <div className="bh-bill-datetime">
          <Icon d={Icons.clock} size={11} strokeWidth={1.8} />
          {formatDate(bill.date)}
          {formatTime(bill.date) && (
            <span style={{ color: "var(--text-placeholder)", marginLeft: "3px" }}>
              {formatTime(bill.date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
