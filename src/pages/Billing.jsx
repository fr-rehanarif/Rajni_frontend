/**
 * Billing.jsx — Production-Grade POS for Saree Shop
 * Architecture: Enterprise-ready, extensible, zero-bug, zero-NaN
 * Future-ready: Thermal receipt printing hook points built in
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const PAYMENT_MODES = ["Cash", "UPI", "Card", "Due"];
const MOBILE_REGEX = /^\d{10}$/;
const DEBOUNCE_MS = 320;

// ─────────────────────────────────────────────────────────────
// UTILITY — pure helpers, no side effects
// ─────────────────────────────────────────────────────────────
const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const currency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n(v));

const roundHalf = (v) => Math.round(n(v) * 2) / 2;

const calcSummary = (cartItems, discountPct) => {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + n(item.rate) * n(item.qty),
    0
  );
  const discountAmount = (subtotal * n(discountPct)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const rounded = roundHalf(afterDiscount);
  const roundOff = n((rounded - afterDiscount).toFixed(2));
  const grandTotal = rounded;
  const totalQty = cartItems.reduce((acc, item) => acc + n(item.qty), 0);
  const totalItems = cartItems.length;
  return {
    subtotal,
    discountAmount,
    roundOff,
    grandTotal,
    totalQty,
    totalItems,
  };
};

const getToken = () => localStorage.getItem("token") || "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─────────────────────────────────────────────────────────────
// API SERVICE — all network calls isolated here
// Future: swap with axios instance or react-query
// ─────────────────────────────────────────────────────────────
const ApiService = {
  async fetchProducts() {
    const res = await fetch(`https://rajni-backend.onrender.com/api/products`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Products fetch failed (${res.status})`);
    return res.json();
  },

  async fetchCustomerByMobile(mobile) {
    const res = await fetch(`https://rajni-backend.onrender.com/api/customers/mobile/${mobile}`, {
      headers: authHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Customer fetch failed (${res.status})`);
    return res.json();
  },

  async createSale(payload) {
    const res = await fetch(`https://rajni-backend.onrender.com/api/sales`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Sale creation failed (${res.status})`);
    }
    return res.json();
  },
};

// ─────────────────────────────────────────────────────────────
// RECEIPT BUILDER — future thermal/PDF printing entry point
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const buildReceiptPayload = (customer, cartItems, summary, paymentMode, saleId) => ({
  saleId,
  date: new Date().toISOString(),
  customer,
  items: cartItems,
  summary,
  paymentMode,
  shopName: "Rajni Saree Shop",
  shopAddress: "F-32,Lado Sarai, New Delhi-110030",
  shopPhone: "+91 9818511037",
});

// ─────────────────────────────────────────────────────────────
// DEBOUNCE HOOK
// ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────
// CART MANAGER — pure cart state mutations
// ─────────────────────────────────────────────────────────────
const CartManager = {
  addItem(cart, product) {
    const existing = cart.find((i) => i.product_id === product.id);
    if (existing) {
      return cart.map((i) =>
        i.product_id === product.id
          ? {
              ...i,
              qty: Math.min(n(i.qty) + 1, n(product.stock)),
              amount: n(i.rate) * Math.min(n(i.qty) + 1, n(product.stock)),
            }
          : i
      );
    }
    if (n(product.stock) < 1) return cart;
    const newItem = {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      rate: n(product.selling_price),
      qty: 1,
      stock: n(product.stock),
      amount: n(product.selling_price),
    };
    return [...cart, newItem];
  },

  updateQty(cart, productId, rawQty, stockMap) {
    const qty = n(rawQty);
    const stock = n(stockMap[productId]);
    const safeQty = Math.min(Math.max(qty, 1), stock);
    return cart.map((i) =>
      i.product_id === productId
        ? { ...i, qty: safeQty, amount: n(i.rate) * safeQty }
        : i
    );
  },

  incrementQty(cart, productId) {
    return cart.map((i) =>
      i.product_id === productId
        ? {
            ...i,
            qty: Math.min(n(i.qty) + 1, n(i.stock)),
            amount: n(i.rate) * Math.min(n(i.qty) + 1, n(i.stock)),
          }
        : i
    );
  },

  decrementQty(cart, productId) {
    return cart.map((i) =>
      i.product_id === productId
        ? {
            ...i,
            qty: Math.max(n(i.qty) - 1, 1),
            amount: n(i.rate) * Math.max(n(i.qty) - 1, 1),
          }
        : i
    );
  },

  removeItem(cart, productId) {
    return cart.filter((i) => i.product_id !== productId);
  },
};

// ─────────────────────────────────────────────────────────────
// ICON COMPONENTS — inline SVG, zero dependency
// ─────────────────────────────────────────────────────────────
const Icon = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Minus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Receipt: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 2 6 22"/><path d="M6 2l3 2 3-2 3 2 3-2v20l-3-2-3 2-3-2-3 2V2z"/><line x1="10" y1="9" x2="18" y2="9"/><line x1="10" y1="13" x2="18" y2="13"/>
    </svg>
  ),
  Tag: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 1s linear infinite"}}>
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: ProductCard
// ─────────────────────────────────────────────────────────────
const ProductCard = React.memo(({ product, onAdd, inCart }) => {
  const outOfStock = n(product.stock) < 1;
  const atMax = inCart && n(inCart.qty) >= n(product.stock);

  return (
    <div className={`pos-product-card ${outOfStock ? "out-of-stock" : ""}`}>
      <div className="product-card-inner">
        <div className="product-badge">
          <Icon.Tag />
          <span>{product.category || "Saree"}</span>
        </div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">{currency(product.selling_price)}</div>
        <div className="product-stock-row">
          <span className={`stock-badge ${outOfStock ? "stock-nil" : n(product.stock) <= 3 ? "stock-low" : "stock-ok"}`}>
            {outOfStock ? "Out of Stock" : `${n(product.stock)} in stock`}
          </span>
          {inCart && (
            <span className="in-cart-badge">
              In cart: {inCart.qty}
            </span>
          )}
        </div>
      </div>
      <button
        className={`add-to-cart-btn ${atMax ? "btn-disabled" : ""}`}
        onClick={() => !outOfStock && !atMax && onAdd(product)}
        disabled={outOfStock || atMax}
        aria-label={`Add ${product.name} to cart`}
      >
        <Icon.Plus />
        <span>{inCart ? "Add More" : "Add to Cart"}</span>
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: CartRow
// ─────────────────────────────────────────────────────────────
const CartRow = React.memo(({ item, onIncrement, onDecrement, onQtyChange, onRemove }) => {
  const [localQty, setLocalQty] = useState(String(item.qty));

  useEffect(() => {
    setLocalQty(String(item.qty));
  }, [item.qty]);

  const handleQtyBlur = () => {
    const parsed = parseInt(localQty, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setLocalQty(String(item.qty));
      return;
    }
    onQtyChange(item.product_id, parsed, item.stock);
  };

  const atMin = n(item.qty) <= 1;
  const atMax = n(item.qty) >= n(item.stock);

  return (
    <tr className="cart-row">
      <td className="cart-td cart-name-cell">
        <div className="cart-product-name">{item.product_name}</div>
        <div className="cart-product-rate">{currency(item.rate)} / piece</div>
      </td>
      <td className="cart-td cart-price-cell">{currency(item.rate)}</td>
      <td className="cart-td cart-qty-cell">
        <div className="qty-control">
          <button
            className={`qty-btn ${atMin ? "qty-btn-disabled" : ""}`}
            onClick={() => onDecrement(item.product_id)}
            disabled={atMin}
            aria-label="Decrease quantity"
          >
            <Icon.Minus />
          </button>
          <input
            type="number"
            className="qty-input"
            value={localQty}
            min={1}
            max={item.stock}
            onChange={(e) => setLocalQty(e.target.value)}
            onBlur={handleQtyBlur}
            aria-label="Quantity"
          />
          <button
            className={`qty-btn ${atMax ? "qty-btn-disabled" : ""}`}
            onClick={() => onIncrement(item.product_id)}
            disabled={atMax}
            aria-label="Increase quantity"
          >
            <Icon.Plus />
          </button>
        </div>
        {atMax && (
          <div className="stock-warning">Max stock</div>
        )}
      </td>
      <td className="cart-td cart-amount-cell">{currency(item.amount)}</td>
      <td className="cart-td cart-action-cell">
        <button
          className="remove-btn"
          onClick={() => onRemove(item.product_id)}
          aria-label={`Remove ${item.product_name}`}
        >
          <Icon.Trash />
        </button>
      </td>
    </tr>
  );
});

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: SummaryRow
// ─────────────────────────────────────────────────────────────
const SummaryRow = ({ label, value, bold, highlight, small }) => (
  <div className={`summary-row ${bold ? "summary-bold" : ""} ${highlight ? "summary-highlight" : ""} ${small ? "summary-small" : ""}`}>
    <span className="summary-label">{label}</span>
    <span className="summary-value">{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: SuccessModal
// ─────────────────────────────────────────────────────────────
const SuccessModal = ({ saleId, onClose }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Sale success">
    <div className="modal-card success-modal">
      <div className="success-icon-wrap">
        <Icon.CheckCircle />
      </div>
      <h2 className="success-title">Bill Saved!</h2>
      <p className="success-sub">
        Sale <strong>#{saleId}</strong> has been recorded successfully.
      </p>
      <p className="success-redirect">Redirecting to bills…</p>
      <button className="modal-close-btn" onClick={onClose}>
        View Bills Now
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN BILLING COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Billing() {
  const navigate = useNavigate();

  // ── Products State ──
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_MS);

  // ── Cart State ──
  const [cartItems, setCartItems] = useState([]);

  // ── Customer State ──
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerLookupState, setCustomerLookupState] = useState("idle"); // idle | loading | found | new
  const customerLookupRef = useRef(null);

  // ── Billing State ──
  const [discountPct, setDiscountPct] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");

  // ── Save State ──
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successSaleId, setSuccessSaleId] = useState(null);

  // Prevent duplicate save requests
  const saveLockRef = useRef(false);

  // ── Stock Map (for quick lookup without re-render) ──
  const stockMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = n(p.stock);
    });
    return map;
  }, [products]);

  // ────────Print Receipt Hook (Future)────────
  const printBill = (saleId) => {
  const printWindow = window.open("", "_blank", "width=400,height=700");

  const rows = cartItems
    .map(
      (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">₹${item.rate}</td>
        <td style="text-align:right">₹${item.amount}</td>
      </tr>
    `
    )
    .join("");

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Invoice</title>

<style>
body{
font-family:Arial,sans-serif;
padding:20px;
color:#000;
}

h2{
margin:0;
text-align:center;
}

.shop{
text-align:center;
font-size:13px;
margin-bottom:20px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:15px;
}

th,td{
padding:6px;
border-bottom:1px dashed #999;
font-size:13px;
}

th{
text-align:left;
}

.total{
margin-top:20px;
text-align:right;
font-size:16px;
font-weight:bold;
}

.footer{
margin-top:30px;
text-align:center;
font-size:12px;
}

hr{
border:none;
border-top:1px dashed #000;
margin:15px 0;
}
</style>

</head>

<body>

<h2>Rajni Saree Shop</h2>

<div class="shop">
F-32 Lado Sarai, New Delhi<br>
Mob : +91 9818511037
</div>

<hr>

<div>
<b>Bill No:</b> ${saleId}<br>
<b>Date:</b> ${new Date().toLocaleString("en-IN")}<br>
<b>Customer:</b> ${customerName || "Walk In Customer"}<br>
<b>Mobile:</b> ${customerMobile}
</div>

<table>

<thead>

<tr>
<th>Item</th>
<th>Qty</th>
<th>Rate</th>
<th>Amt</th>
</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

<div class="total">
Subtotal : ₹${summary.subtotal.toFixed(2)}<br>

Discount : ${discountPct}%<br>

Grand Total : ₹${summary.grandTotal.toFixed(2)}
</div>

<div class="footer">
Thank You ❤️<br>
Please Visit Again
</div>

<script>
window.onload=function(){
window.print();
window.onafterprint=function(){
window.close();
}
}
</script>

</body>

</html>
`);
};

  // ─── Load Products ───────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await ApiService.fetchProducts();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ─── Filtered Products ───────────────────────────────────
  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, debouncedSearch]);

  // ─── Cart Map for quick lookup ───────────────────────────
  const cartMap = useMemo(() => {
    const map = {};
    cartItems.forEach((item) => {
      map[item.product_id] = item;
    });
    return map;
  }, [cartItems]);

  // ─── Summary ─────────────────────────────────────────────
  const summary = useMemo(
    () => calcSummary(cartItems, discountPct),
    [cartItems, discountPct]
  );

  // ─── Customer Mobile Lookup ───────────────────────────────
  useEffect(() => {
    if (!MOBILE_REGEX.test(customerMobile)) {
      setCustomerLookupState("idle");
      return;
    }

    // Cancel previous in-flight request
    if (customerLookupRef.current) {
      customerLookupRef.current.cancelled = true;
    }
    const token = { cancelled: false };
    customerLookupRef.current = token;

    setCustomerLookupState("loading");

    ApiService.fetchCustomerByMobile(customerMobile)
      .then((customer) => {
        if (token.cancelled) return;
        if (customer) {
          setCustomerName(customer.name || customer.customer_name || "");
          setCustomerLookupState("found");
        } else {
          setCustomerLookupState("new");
        }
      })
      .catch(() => {
        if (!token.cancelled) setCustomerLookupState("new");
      });

    return () => {
      token.cancelled = true;
    };
  }, [customerMobile]);

  // ─── Cart Handlers ────────────────────────────────────────
  const handleAddToCart = useCallback((product) => {
    setCartItems((prev) => CartManager.addItem(prev, product));
  }, []);

  const handleIncrement = useCallback((productId) => {
    setCartItems((prev) => CartManager.incrementQty(prev, productId));
  }, []);

  const handleDecrement = useCallback((productId) => {
    setCartItems((prev) => CartManager.decrementQty(prev, productId));
  }, []);

  const handleQtyChange = useCallback((productId, rawQty, stock) => {
    setCartItems((prev) =>
      CartManager.updateQty(prev, productId, rawQty, { [productId]: stock })
    );
  }, []);

  const handleRemove = useCallback((productId) => {
    setCartItems((prev) => CartManager.removeItem(prev, productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ─── Discount Handler ─────────────────────────────────────
  const handleDiscountChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setDiscountPct(0);
      return;
    }
    const num = n(val);
    if (num < 0 || num > 100) return;
    setDiscountPct(num);
  };

  // ─── Reset All ────────────────────────────────────────────
  const resetBill = useCallback(() => {
    setCartItems([]);
    setCustomerName("");
    setCustomerMobile("");
    setCustomerLookupState("idle");
    setDiscountPct(0);
    setPaymentMode("Cash");
    setSaveError(null);
  }, []);

  // ─── Save Bill ────────────────────────────────────────────
  const handleSaveBill = async () => {
    if (saveLockRef.current || saving) return;
    if (cartItems.length === 0) {
      setSaveError("Cart is empty. Add at least one product.");
      return;
    }
    if (!customerMobile.trim()) {
      setSaveError("Customer mobile number is required.");
      return;
    }
    if (!MOBILE_REGEX.test(customerMobile)) {
      setSaveError("Enter a valid 10-digit mobile number.");
      return;
    }

    saveLockRef.current = true;
    setSaving(true);
    setSaveError(null);

    const payload = {
      customerName: customerName.trim() || "Walk-in Customer",
      customerMobile: customerMobile.trim(),
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        qty: n(item.qty),
        rate: n(item.rate),
        amount: n(item.amount),
      })),
      subtotal: n(summary.subtotal.toFixed(2)),
      discountPercent: n(discountPct),
      grandTotal: n(summary.grandTotal.toFixed(2)),
      paymentMode,
    };

    try {
  const result = await ApiService.createSale(payload);

  const saleId =
    result.id ||
    result.sale_id ||
    result.saleId ||
    "N/A";

  // Print Bill
  printBill(saleId);

  // Show Success Modal
  setSuccessSaleId(saleId);

  // Reload Products
  loadProducts();

} catch (err) {
  setSaveError(err.message || "Failed to save bill. Please try again.");
} finally {
  setSaving(false);
  saveLockRef.current = false;
}
  };

  // ─── Auto-navigate after success ─────────────────────────
  useEffect(() => {
    if (successSaleId === null) return;
    const timer = setTimeout(() => {
      resetBill();
      navigate("/app/bill-history");
    }, 2800);
    return () => clearTimeout(timer);
  }, [successSaleId, navigate, resetBill]);

  const handleSuccessClose = () => {
    resetBill();
    navigate("/app/bill-history");
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>

      {/* Success Modal */}
      {successSaleId !== null && (
        <SuccessModal saleId={successSaleId} onClose={handleSuccessClose} />
      )}

      <div className="pos-root">
        {/* ── HEADER ── */}
        <header className="pos-header">
          <div className="header-brand">
            <div className="header-logo">
              <Icon.ShoppingBag />
            </div>
            <div>
              <h1 className="header-title">Saree Elegance</h1>
              <p className="header-sub">Point of Sale</p>
            </div>
          </div>
          <div className="header-meta">
            <span className="header-date">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        <div className="pos-body">
          {/* ══════════════ LEFT PANEL — PRODUCTS ══════════════ */}
          <section className="pos-products-panel" aria-label="Products">
            {/* Search */}
            <div className="search-bar-wrap">
              <div className="search-icon">
                <Icon.Search />
              </div>
              <input
                type="search"
                className="search-input"
                placeholder="Search sarees by name or category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="products-grid-header">
              <span className="products-count">
                {productsLoading
                  ? "Loading…"
                  : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {productsLoading ? (
              <div className="state-container">
                <div className="loading-spinner" aria-label="Loading products" />
                <p className="state-text">Loading products…</p>
              </div>
            ) : productsError ? (
              <div className="state-container">
                <p className="state-error">{productsError}</p>
                <button className="retry-btn" onClick={loadProducts}>
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="state-container">
                <p className="state-text">No products found for "<strong>{debouncedSearch}</strong>"</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={handleAddToCart}
                    inCart={cartMap[product.id] || null}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ══════════════ RIGHT PANEL — BILLING ══════════════ */}
          <aside className="pos-billing-panel" aria-label="Billing Panel">

            {/* ── CUSTOMER SECTION ── */}
            <section className="billing-section customer-section">
              <h2 className="section-title">
                <Icon.User />
                Customer Details
              </h2>
              <div className="customer-fields">
                {/* Mobile */}
                <div className="field-group">
                  <label className="field-label" htmlFor="customerMobile">
                    <Icon.Phone />
                    Mobile Number
                  </label>
                  <div className="field-input-wrap">
                    <input
                      id="customerMobile"
                      type="tel"
                      className="field-input"
                      placeholder="10-digit mobile"
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) =>
                        setCustomerMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      autoComplete="tel"
                    />
                    {customerLookupState === "loading" && (
                      <span className="field-status loading-dot">
                        <Icon.Loader />
                      </span>
                    )}
                    {customerLookupState === "found" && (
                      <span className="field-status status-found" title="Existing customer">✓</span>
                    )}
                    {customerLookupState === "new" && (
                      <span className="field-status status-new" title="New customer">+</span>
                    )}
                  </div>
                  {customerLookupState === "found" && (
                    <p className="field-hint hint-found">Existing customer found</p>
                  )}
                  {customerLookupState === "new" && (
                    <p className="field-hint hint-new">New customer — will be created on save</p>
                  )}
                </div>

                {/* Name */}
                <div className="field-group">
                  <label className="field-label" htmlFor="customerName">
                    <Icon.User />
                    Customer Name
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    className="field-input"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            </section>

            {/* ── CART TABLE ── */}
            <section className="billing-section cart-section">
              <div className="cart-header">
                <h2 className="section-title">
                  <Icon.ShoppingBag />
                  Cart
                  {cartItems.length > 0 && (
                    <span className="cart-count-badge">{cartItems.length}</span>
                  )}
                </h2>
                {cartItems.length > 0 && (
                  <button className="clear-cart-btn" onClick={handleClearCart}>
                    Clear All
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <Icon.ShoppingBag />
                  </div>
                  <p>Cart is empty</p>
                  <span>Add products from the left panel</span>
                </div>
              ) : (
                <div className="cart-table-wrap">
                  <table className="cart-table" aria-label="Cart items">
                    <thead>
                      <tr>
                        <th className="cart-th">Product</th>
                        <th className="cart-th">Rate</th>
                        <th className="cart-th">Qty</th>
                        <th className="cart-th">Amount</th>
                        <th className="cart-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <CartRow
                          key={item.product_id}
                          item={item}
                          onIncrement={handleIncrement}
                          onDecrement={handleDecrement}
                          onQtyChange={handleQtyChange}
                          onRemove={handleRemove}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── BILL SUMMARY ── */}
            <section className="billing-section summary-section">
              <h2 className="section-title">
                <Icon.Receipt />
                Bill Summary
              </h2>

              {/* Discount */}
              <div className="discount-row">
                <label className="field-label" htmlFor="discountPct">
                  Discount (%)
                </label>
                <div className="discount-input-wrap">
                  <input
                    id="discountPct"
                    type="number"
                    className="discount-input"
                    min={0}
                    max={100}
                    step={0.5}
                    value={discountPct === 0 ? "" : discountPct}
                    placeholder="0"
                    onChange={handleDiscountChange}
                  />
                  <span className="discount-suffix">%</span>
                </div>
              </div>

              {/* Summary Rows */}
              <div className="summary-rows">
                <SummaryRow
                  label={`Subtotal (${summary.totalItems} item${summary.totalItems !== 1 ? "s" : ""}, ${summary.totalQty} pcs)`}
                  value={currency(summary.subtotal)}
                />
                {n(discountPct) > 0 && (
                  <SummaryRow
                    label={`Discount (${n(discountPct)}%)`}
                    value={`− ${currency(summary.discountAmount)}`}
                    small
                  />
                )}
                {summary.roundOff !== 0 && (
                  <SummaryRow
                    label="Round Off"
                    value={`${summary.roundOff > 0 ? "+" : ""}${currency(Math.abs(summary.roundOff))}`}
                    small
                  />
                )}
                <div className="summary-divider" />
                <SummaryRow
                  label="Grand Total"
                  value={currency(summary.grandTotal)}
                  bold
                  highlight
                />
              </div>

              {/* Payment Mode */}
              <div className="field-group payment-group">
                <label className="field-label" htmlFor="paymentMode">
                  Payment Mode
                </label>
                <select
                  id="paymentMode"
                  className="payment-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {saveError && (
                <div className="save-error" role="alert">
                  <span>⚠</span> {saveError}
                </div>
              )}

              {/* Save Button */}
              <button
                className={`save-bill-btn ${saving ? "saving" : ""}`}
                onClick={handleSaveBill}
                disabled={saving || cartItems.length === 0}
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <Icon.Loader />
                    <span>Saving Bill…</span>
                  </>
                ) : (
                  <>
                    <Icon.Receipt />
                    <span>Save Bill — {currency(summary.grandTotal)}</span>
                  </>
                )}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES — scoped, premium gold + white theme
// ─────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── ROOT ── */
  .pos-root {
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #fdf8ee 0%, #fff8f0 40%, #fdfaf5 100%);
    color: #1a1109;
    display: flex;
    flex-direction: column;
  }

  /* ── HEADER ── */
  .pos-header {
    background: linear-gradient(90deg, #1a0a00 0%, #3d1f00 60%, #5c2d00 100%);
    color: #fff;
    padding: 0 28px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(90,40,0,0.25);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .header-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #c9940a, #f0c040);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a0a00;
    box-shadow: 0 2px 10px rgba(201,148,10,0.4);
    flex-shrink: 0;
  }
  .header-title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #f5d87e;
  }
  .header-sub {
    font-size: 0.72rem;
    color: rgba(245,216,126,0.65);
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 1px;
  }
  .header-date {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.6);
  }

  /* ── BODY LAYOUT ── */
  .pos-body {
    display: grid;
    grid-template-columns: 1fr 440px;
    gap: 0;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* ── PRODUCTS PANEL ── */
  .pos-products-panel {
    padding: 24px 24px 24px 28px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── SEARCH ── */
  .search-bar-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 14px;
    color: #a07030;
    display: flex;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    height: 48px;
    padding: 0 44px 0 42px;
    border: 2px solid #e8d5a3;
    border-radius: 12px;
    font-size: 0.95rem;
    background: #fff;
    color: #1a1109;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .search-input:focus {
    border-color: #c9940a;
    box-shadow: 0 0 0 3px rgba(201,148,10,0.12);
  }
  .search-input::placeholder { color: #bba070; }
  .search-clear {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    font-size: 1.3rem;
    color: #a07030;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    transition: background 0.15s;
  }
  .search-clear:hover { background: #f5e8c8; }

  .products-grid-header {
    display: flex;
    align-items: center;
  }
  .products-count {
    font-size: 0.82rem;
    color: #8a6030;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── STATE CONTAINERS ── */
  .state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 260px;
    gap: 14px;
    animation: fadeIn 0.3s ease;
  }
  .state-text { color: #8a6030; font-size: 0.95rem; text-align: center; }
  .state-error { color: #c0392b; font-size: 0.95rem; text-align: center; }
  .loading-spinner {
    width: 40px; height: 40px;
    border: 3px solid #e8d5a3;
    border-top-color: #c9940a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .retry-btn {
    padding: 8px 22px;
    border: 1.5px solid #c9940a;
    border-radius: 8px;
    background: #fff;
    color: #c9940a;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  .retry-btn:hover { background: #c9940a; color: #fff; }

  /* ── PRODUCT GRID ── */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
    animation: fadeIn 0.3s ease;
  }

  /* ── PRODUCT CARD ── */
  .pos-product-card {
    background: #fff;
    border: 1.5px solid #ecddb8;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    animation: fadeInUp 0.25s ease both;
    position: relative;
  }
  .pos-product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(180,120,20,0.14);
    border-color: #c9940a;
  }
  .pos-product-card.out-of-stock {
    opacity: 0.55;
    pointer-events: none;
  }
  .product-card-inner {
    padding: 16px 16px 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .product-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: linear-gradient(90deg, #fff8e1, #fdf3cc);
    border: 1px solid #e8c84a;
    color: #7a5500;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    width: fit-content;
  }
  .product-name {
    font-size: 0.97rem;
    font-weight: 600;
    color: #1a1109;
    line-height: 1.35;
    flex: 1;
  }
  .product-price {
    font-size: 1.15rem;
    font-weight: 700;
    color: #b07d10;
  }
  .product-stock-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .stock-badge {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
  }
  .stock-ok { background: #e6f9ef; color: #15803d; border: 1px solid #bbf7d0; }
  .stock-low { background: #fff8e1; color: #b45309; border: 1px solid #fde68a; }
  .stock-nil { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .in-cart-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 50px;
    background: #ede9fe;
    color: #6d28d9;
    border: 1px solid #c4b5fd;
    font-weight: 600;
  }

  .add-to-cart-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 11px 0;
    background: linear-gradient(90deg, #b07d10, #c9940a);
    color: #fff;
    border: none;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
    font-family: inherit;
    letter-spacing: 0.02em;
  }
  .add-to-cart-btn:hover:not(:disabled) {
    background: linear-gradient(90deg, #9a6c0a, #b07d10);
  }
  .add-to-cart-btn.btn-disabled,
  .add-to-cart-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #9ca3af;
  }

  /* ── BILLING PANEL ── */
  .pos-billing-panel {
    background: #fff;
    border-left: 1.5px solid #ecddb8;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: calc(100vh - 68px);
    position: sticky;
    top: 68px;
  }

  .billing-section {
    padding: 20px 20px 0;
    border-bottom: 1.5px solid #f3e8cc;
  }
  .billing-section:last-child {
    border-bottom: none;
    padding-bottom: 24px;
  }

  .section-title {
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #8a6030;
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 14px;
  }

  /* ── CUSTOMER SECTION ── */
  .customer-section { padding-bottom: 18px; }
  .customer-fields { display: flex; flex-direction: column; gap: 12px; }
  .field-group { display: flex; flex-direction: column; gap: 5px; }
  .field-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: #6b4f2a;
    display: flex;
    align-items: center;
    gap: 5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .field-input-wrap { position: relative; display: flex; align-items: center; }
  .field-input {
    width: 100%;
    height: 40px;
    padding: 0 40px 0 12px;
    border: 1.5px solid #e0c88a;
    border-radius: 9px;
    font-size: 0.9rem;
    background: #fffdf7;
    color: #1a1109;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .field-input:focus {
    border-color: #c9940a;
    box-shadow: 0 0 0 3px rgba(201,148,10,0.1);
    background: #fff;
  }
  .field-input::placeholder { color: #c4a060; }
  .field-status {
    position: absolute;
    right: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
  }
  .status-found { color: #15803d; }
  .status-new { color: #c9940a; font-size: 1.1rem; }
  .loading-dot { color: #c9940a; animation: spin 0.8s linear infinite; }
  .field-hint {
    font-size: 0.73rem;
    font-weight: 500;
    margin-top: 2px;
  }
  .hint-found { color: #15803d; }
  .hint-new { color: #b45309; }

  /* ── CART SECTION ── */
  .cart-section { padding-bottom: 0; }
  .cart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .cart-count-badge {
    background: linear-gradient(90deg, #c9940a, #f0c040);
    color: #1a0a00;
    font-size: 0.7rem;
    font-weight: 700;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
  }
  .clear-cart-btn {
    font-size: 0.75rem;
    color: #b91c1c;
    background: none;
    border: 1px solid #fecaca;
    border-radius: 7px;
    padding: 4px 10px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s;
    font-family: inherit;
  }
  .clear-cart-btn:hover { background: #fef2f2; }

  .empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 36px 0 28px;
    gap: 8px;
    color: #c4a060;
  }
  .empty-cart-icon { opacity: 0.35; }
  .empty-cart p { font-size: 0.95rem; font-weight: 600; color: #c4a060; }
  .empty-cart span { font-size: 0.78rem; color: #d4b87a; }

  .cart-table-wrap {
    overflow-x: auto;
    margin: 0 -20px;
  }
  .cart-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .cart-th {
    padding: 8px 12px;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    color: #8a6030;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1.5px solid #ecddb8;
    background: #fffdf7;
    white-space: nowrap;
  }
  .cart-td {
    padding: 12px;
    border-bottom: 1px solid #f5e8c8;
    vertical-align: middle;
  }
  .cart-row:last-child .cart-td { border-bottom: none; }
  .cart-row:hover .cart-td { background: #fffef9; }

  .cart-name-cell { min-width: 130px; }
  .cart-product-name {
    font-weight: 600;
    color: #1a1109;
    font-size: 0.83rem;
    line-height: 1.3;
  }
  .cart-product-rate {
    font-size: 0.72rem;
    color: #9a7040;
    margin-top: 2px;
  }
  .cart-price-cell { color: #6b4f2a; white-space: nowrap; }
  .cart-amount-cell { font-weight: 700; color: #b07d10; white-space: nowrap; }
  .cart-action-cell { width: 36px; }

  .qty-control {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .qty-btn {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    border: 1.5px solid #e0c88a;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #7a5500;
    transition: all 0.15s;
    flex-shrink: 0;
    padding: 0;
  }
  .qty-btn:hover:not(:disabled) {
    background: #fdf3cc;
    border-color: #c9940a;
    color: #9a6c0a;
  }
  .qty-btn.qty-btn-disabled,
  .qty-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .qty-input {
    width: 40px;
    height: 26px;
    text-align: center;
    border: 1.5px solid #e0c88a;
    border-radius: 7px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #1a1109;
    background: #fffdf7;
    outline: none;
    font-family: inherit;
    -moz-appearance: textfield;
  }
  .qty-input::-webkit-inner-spin-button,
  .qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .qty-input:focus {
    border-color: #c9940a;
    box-shadow: 0 0 0 2px rgba(201,148,10,0.1);
  }
  .stock-warning {
    font-size: 0.65rem;
    color: #b45309;
    font-weight: 600;
    margin-top: 3px;
    text-align: center;
  }

  .remove-btn {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    border: 1.5px solid #fecaca;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #b91c1c;
    transition: all 0.15s;
    padding: 0;
  }
  .remove-btn:hover {
    background: #fef2f2;
    border-color: #ef4444;
  }

  /* ── SUMMARY SECTION ── */
  .summary-section {}
  .discount-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 12px;
  }
  .discount-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .discount-input {
    width: 90px;
    height: 36px;
    padding: 0 28px 0 10px;
    border: 1.5px solid #e0c88a;
    border-radius: 9px;
    font-size: 0.88rem;
    font-weight: 600;
    text-align: right;
    color: #1a1109;
    background: #fffdf7;
    outline: none;
    font-family: inherit;
    -moz-appearance: textfield;
    transition: border-color 0.2s;
  }
  .discount-input::-webkit-inner-spin-button,
  .discount-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .discount-input:focus { border-color: #c9940a; }
  .discount-suffix {
    position: absolute;
    right: 10px;
    font-size: 0.82rem;
    color: #8a6030;
    font-weight: 600;
    pointer-events: none;
  }

  .summary-rows { display: flex; flex-direction: column; gap: 0; margin-bottom: 16px; }
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 0;
    border-bottom: 1px dashed #f0e0b0;
    font-size: 0.88rem;
  }
  .summary-row:last-child { border-bottom: none; }
  .summary-label { color: #6b4f2a; }
  .summary-value { font-weight: 600; color: #1a1109; }
  .summary-bold .summary-label { font-weight: 700; color: #1a1109; font-size: 0.95rem; }
  .summary-bold .summary-value { font-weight: 800; font-size: 1.05rem; }
  .summary-highlight .summary-value { color: #b07d10; }
  .summary-small { opacity: 0.8; }
  .summary-divider {
    height: 1.5px;
    background: linear-gradient(90deg, transparent, #c9940a40, transparent);
    margin: 4px 0;
  }

  .payment-group { padding: 14px 0; }
  .payment-select {
    width: 100%;
    height: 42px;
    padding: 0 14px;
    border: 1.5px solid #e0c88a;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #1a1109;
    background: #fffdf7;
    outline: none;
    cursor: pointer;
    appearance: none;
    font-family: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a6030' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    transition: border-color 0.2s;
  }
  .payment-select:focus { border-color: #c9940a; }

  .save-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 9px;
    padding: 10px 14px;
    font-size: 0.82rem;
    color: #b91c1c;
    font-weight: 500;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 7px;
    animation: fadeInUp 0.2s ease;
  }

  .save-bill-btn {
    width: 100%;
    height: 52px;
    border-radius: 13px;
    border: none;
    background: linear-gradient(90deg, #7a5000, #b07d10, #c9940a);
    background-size: 200% auto;
    color: #fff;
    font-size: 0.97rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background-position 0.4s, opacity 0.2s, transform 0.15s;
    font-family: inherit;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 18px rgba(180,120,10,0.28);
  }
  .save-bill-btn:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(180,120,10,0.35);
  }
  .save-bill-btn:active:not(:disabled) { transform: translateY(0); }
  .save-bill-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  .save-bill-btn.saving { animation: pulse 1.2s ease infinite; }

  /* ── SUCCESS MODAL ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26,10,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.25s ease;
  }
  .modal-card {
    background: #fff;
    border-radius: 20px;
    padding: 40px 36px;
    max-width: 380px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: scaleIn 0.3s ease;
  }
  .success-icon-wrap {
    color: #15803d;
    display: flex;
    justify-content: center;
    margin-bottom: 18px;
  }
  .success-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1a1109;
    margin-bottom: 10px;
  }
  .success-sub {
    font-size: 0.95rem;
    color: #4a3010;
    margin-bottom: 8px;
  }
  .success-redirect {
    font-size: 0.8rem;
    color: #9a7040;
    margin-bottom: 24px;
    animation: pulse 1.2s ease infinite;
  }
  .modal-close-btn {
    padding: 12px 32px;
    border-radius: 11px;
    border: none;
    background: linear-gradient(90deg, #b07d10, #c9940a);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 14px rgba(180,120,10,0.3);
    transition: opacity 0.2s;
  }
  .modal-close-btn:hover { opacity: 0.88; }

  /* ── SCROLLBAR ── */
  .pos-products-panel::-webkit-scrollbar,
  .pos-billing-panel::-webkit-scrollbar { width: 5px; }
  .pos-products-panel::-webkit-scrollbar-track,
  .pos-billing-panel::-webkit-scrollbar-track { background: transparent; }
  .pos-products-panel::-webkit-scrollbar-thumb,
  .pos-billing-panel::-webkit-scrollbar-thumb {
    background: #e0c88a;
    border-radius: 10px;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .pos-body {
      grid-template-columns: 1fr;
      overflow: visible;
    }
    .pos-billing-panel {
      position: static;
      max-height: none;
      border-left: none;
      border-top: 1.5px solid #ecddb8;
    }
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }
  @media (max-width: 540px) {
    .pos-header { padding: 0 16px; height: 58px; }
    .header-date { display: none; }
    .pos-products-panel { padding: 16px; }
    .products-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .pos-billing-panel { padding: 0; }
    .billing-section { padding: 16px 16px 0; }
  }
`;
