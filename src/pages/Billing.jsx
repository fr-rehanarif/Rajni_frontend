import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from "../services/api";

const LOW_STOCK_THRESHOLD = 5;
const DEFAULT_GST = 5;

const ICONS = {
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  phone: 'M3 5a2 2 0 012-2h2.28a1 1 0 01.98.804l.7 3.5a1 1 0 01-.5 1.06l-1.6.8a12 12 0 006.36 6.36l.8-1.6a1 1 0 011.06-.5l3.5.7a1 1 0 01.804.98V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V6z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z',
  plus: 'M12 4v16m8-8H4',
  minus: 'M4 12h16',
  trash: 'M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-9.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 8.5-8.5z',
  printer: 'M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z',
  check: 'M5 13l4 4L19 7',
  close: 'M6 18L18 6M6 6l12 12',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  crown: 'M2 20h20M4 17l1-9 5 4 2-6 2 6 5-4 1 9H4z',
  gift: 'M20 12v9H4v-9M2 7h20v5H2V7zm10 0V3a2 2 0 10-2 2h2zm0 0V3a2 2 0 112 2h-2z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0',
  refresh: 'M4 4v5h.582a8 8 0 1015.356 2M20 20v-5h-.581',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01',
  cash: 'M3 6h18M3 6v12h18V6M3 6l9 6 9-6m-9 9a2 2 0 100-4 2 2 0 000 4z',
  card: 'M2 7h20v3H2V7zm0 0a2 2 0 012-2h16a2 2 0 012 2m0 0v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm3 8h4',
  upi: 'M4 4l16 16M4 20L20 4M4 4h6v6H4V4zm10 10h6v6h-6v-6z',
  wallet: 'M3 7a2 2 0 012-2h12a2 2 0 012 2v2h-4a3 3 0 100 6h4v2a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm14 4h2v2h-2a1 1 0 110-2z',
  split: 'M8 3H5a2 2 0 00-2 2v3m18-5h-3a2 2 0 00-2 2v3M3 16v3a2 2 0 002 2h3m11-5v3a2 2 0 01-2 2h-3',
  chevronDown: 'M19 9l-7 7-7-7',
  bag: 'M6 2l1.5 4h9L18 2M4 6h16l-1.5 14a2 2 0 01-2 2H7.5a2 2 0 01-2-2L4 6zm4 4v4m8-4v4',
  bolt: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  info: 'M12 8h.01M11 12h1v4h1m-1 5a9 9 0 100-18 9 9 0 000 18z',
  share: 'M8.68 13.34a3 3 0 100-2.68m0 2.68a3 3 0 010-2.68m0 2.68l6.64 3.66m-6.64-6.34l6.64-3.66M18 6a3 3 0 11-6 0 3 3 0 016 0zm0 12a3 3 0 11-6 0 3 3 0 016 0z',
};

function Icon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={ICONS[name] || ''} />
    </svg>
  );
}

function formatCurrency(n) {
  const v = Number(n) || 0;
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(d) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function formatShortDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getCashierName() {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
    if (raw) {
      const u = JSON.parse(raw);
      return u.name || u.fullName || u.username || 'Cashier';
    }
  } catch (e) {}
  return 'Cashier';
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function Badge({ icon, children, tone }) {
  const tones = {
    gold: 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-[0_2px_10px_rgba(180,140,20,0.4)]',
    green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${tones[tone] || tones.slate}`}>
      {icon && <Icon name={icon} className="w-3 h-3" />}
      {children}
    </span>
  );
}

function GlassPanel({ children, className }) {
  return (
    <div className={`backdrop-blur-xl bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(150,120,40,0.12)] rounded-2xl ${className || ''}`}>
      {children}
    </div>
  );
}

function SkeletonLine({ w }) {
  return <div className={`h-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent animate-pulse ${w || 'w-full'}`} />;
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_.15s_ease]" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[86vh] overflow-hidden flex flex-col rounded-3xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-[#141210]/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] animate-[popIn_.18s_cubic-bezier(0.16,1,0.3,1)]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20">
          <h3 className="text-[15px] font-semibold tracking-wide text-[#3a2f18] dark:text-[#F4EFE6]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8a7a55] hover:bg-[#D4AF37]/10 transition-colors">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[13px]">
      <Icon name="alert" className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 transition-colors">
          <Icon name="refresh" className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

export default function Billing() {
  const [now, setNow] = useState(new Date());
  const [billNumber, setBillNumber] = useState('');
  const [cashier, setCashier] = useState('');

  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerStatus, setCustomerStatus] = useState('idle');
  const [customerError, setCustomerError] = useState('');

  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [qty, setQty] = useState(1);
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(0);

  const [cart, setCart] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);

  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showProductSearchModal, setShowProductSearchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountModalItemId, setDiscountModalItemId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState('');

  const [printMode, setPrintMode] = useState('thermal');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const mobileRef = useRef(null);
  const nameRef = useRef(null);
  const productInputRef = useRef(null);
  const qtyRef = useRef(null);
  const paidRef = useRef(null);
  const dropdownRefs = useRef([]);
  const printRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setCashier(getCashierName());
    generateBillNumber();
    mobileRef.current && mobileRef.current.focus();
  }, []);

  const generateBillNumber = useCallback(async () => {
    try {
      const res = await api.get('/sales');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const next = (list.length || 0) + 1;
      const d = new Date();
      const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      setBillNumber(`RSC-${stamp}-${String(next).padStart(4, '0')}`);
    } catch (e) {
      const d = new Date();
      setBillNumber(`RSC-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getTime()).slice(-4)}`);
    }
  }, []);

  useEffect(() => {
    if (mobile.length !== 10) {
      setCustomer(null);
      setCustomerStatus('idle');
      setCustomerName('');
      return;
    }
    const t = setTimeout(() => lookupCustomer(mobile), 400);
    return () => clearTimeout(t);
  }, [mobile]);

  const lookupCustomer = useCallback(async (num) => {
    setCustomerStatus('loading');
    setCustomerError('');
    try {
      const res = await api.get(`/customers/mobile/${num}`);
      const c = res.data?.customer || res.data;
      if (c && (c.id || c.name)) {
        setCustomer(c);
        setCustomerName(c.name || '');
        setCustomerStatus('existing');
      } else {
        setCustomer(null);
        setCustomerName('');
        setCustomerStatus('new');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCustomer(null);
        setCustomerName('');
        setCustomerStatus('new');
      } else if (err.response && err.response.status === 401) {
        handleTokenExpired();
      } else {
        setCustomerStatus('error');
        setCustomerError('Could not fetch customer details.');
      }
    }
  }, []);

  useEffect(() => {
    if (!productQuery || productQuery.trim().length < 1 || (selectedProduct && selectedProduct.name === productQuery)) {
      setProductResults([]);
      return;
    }
    const t = setTimeout(() => searchProducts(productQuery), 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const searchProducts = useCallback(async (q) => {
    setProductLoading(true);
    setProductError('');
    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProductResults(list);
      setShowProductDropdown(true);
      setActiveProductIndex(list.length ? 0 : -1);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleTokenExpired();
      } else {
        setProductError('Product search failed. Check connection.');
        setProductResults([]);
      }
    } finally {
      setProductLoading(false);
    }
  }, []);

  function handleTokenExpired() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  function selectProduct(p) {
    setSelectedProduct(p);
    setProductQuery(p.name);
    setShowProductDropdown(false);
    setActiveProductIndex(-1);
    setQty(1);
    setDiscountType('percent');
    setDiscountValue(0);
    setTimeout(() => qtyRef.current && qtyRef.current.focus(), 50);
  }

  function clearProductSelection() {
    setSelectedProduct(null);
    setProductQuery('');
    setProductResults([]);
    setQty(1);
    setDiscountValue(0);
  }

  function onProductKeyDown(e) {
    if (!showProductDropdown || productResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveProductIndex((i) => Math.min(i + 1, productResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveProductIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeProductIndex >= 0 && productResults[activeProductIndex]) {
        selectProduct(productResults[activeProductIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowProductDropdown(false);
    }
  }

  function computeLine(product, qtyVal, dType, dVal) {
    const price = Number(product.sale_price ?? product.price ?? product.salePrice ?? 0);
    const mrp = Number(product.mrp ?? price);
    const stock = Number(product.stock ?? product.available_pieces ?? 0);
    const gstPercent = Number(product.gst_percent ?? product.gst ?? DEFAULT_GST);
    const base = price * qtyVal;
    const perItemDiscount = dType === 'percent' ? (price * (Number(dVal) || 0)) / 100 : Number(dVal) || 0;
    const discountAmount = Math.min(perItemDiscount * qtyVal, base);
    const taxable = base - discountAmount;
    const gstAmount = (taxable * gstPercent) / 100;
    const total = taxable + gstAmount;
    return { price, mrp, stock, base, discountAmount, gstPercent, gstAmount, taxable, total };
  }

  const linePreview = useMemo(() => {
    if (!selectedProduct) return null;
    return computeLine(selectedProduct, qty, discountType, discountValue);
  }, [selectedProduct, qty, discountType, discountValue]);

  function addToCart() {
    if (!selectedProduct) return;
    const stock = Number(selectedProduct.stock ?? selectedProduct.available_pieces ?? 0);
    if (qty < 1) return;
    if (qty > stock) {
      setProductError('Quantity exceeds available stock.');
      return;
    }
    const line = computeLine(selectedProduct, qty, discountType, discountValue);
    const item = {
      id: uid(),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      itemCode: selectedProduct.item_code ?? selectedProduct.code ?? '—',
      category: selectedProduct.category ?? '—',
      image: selectedProduct.image_url ?? selectedProduct.image ?? null,
      qty,
      discountType,
      discountValue: Number(discountValue) || 0,
      stock,
      ...line,
    };
    setCart((c) => [...c, item]);
    clearProductSelection();
    productInputRef.current && productInputRef.current.focus();
  }

  function updateCartItem(id, patch) {
    setCart((c) =>
      c.map((it) => {
        if (it.id !== id) return it;
        const merged = { ...it, ...patch };
        const line = computeLine(
          { sale_price: merged.price, mrp: merged.mrp, stock: merged.stock, gst_percent: merged.gstPercent },
          merged.qty,
          merged.discountType,
          merged.discountValue
        );
        return { ...merged, ...line };
      })
    );
  }

  function removeCartItem(id) {
    setCart((c) => c.filter((it) => it.id !== id));
    setDeleteConfirmId(null);
    if (selectedRow === id) setSelectedRow(null);
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.base, 0);
    const discount = cart.reduce((s, i) => s + i.discountAmount, 0);
    const gst = cart.reduce((s, i) => s + i.gstAmount, 0);
    const rawTotal = subtotal - discount + gst;
    const grandTotal = Math.round(rawTotal);
    const roundOff = grandTotal - rawTotal;
    const paid = paymentMethods.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const remaining = Math.max(grandTotal - paid, 0);
    const change = paid > grandTotal ? paid - grandTotal : 0;
    return { subtotal, discount, gst, roundOff, grandTotal, paid, remaining, change };
  }, [cart, paymentMethods]);

  function quickPay(method) {
    setPaymentMethods([{ id: uid(), method, amount: totals.grandTotal }]);
  }

  function addSplitLine() {
    setPaymentMethods((p) => [...p, { id: uid(), method: 'cash', amount: 0 }]);
  }

  function updateSplitLine(id, patch) {
    setPaymentMethods((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeSplitLine(id) {
    setPaymentMethods((p) => p.filter((x) => x.id !== id));
  }

  async function runCustomerSearch(q) {
    setCustomerSearchLoading(true);
    setCustomerSearchError('');
    try {
      const res = await api.get('/customers');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const filtered = q
        ? list.filter((c) => (c.name || '').toLowerCase().includes(q.toLowerCase()) || (c.mobile || '').includes(q))
        : list;
      setCustomerSearchResults(filtered.slice(0, 50));
    } catch (err) {
      setCustomerSearchError('Unable to load customers.');
    } finally {
      setCustomerSearchLoading(false);
    }
  }

  useEffect(() => {
    if (showCustomerSearchModal) runCustomerSearch(customerSearchQuery);
  }, [showCustomerSearchModal]);

  useEffect(() => {
    if (!showCustomerSearchModal) return;
    const t = setTimeout(() => runCustomerSearch(customerSearchQuery), 300);
    return () => clearTimeout(t);
  }, [customerSearchQuery]);

  function pickCustomerFromModal(c) {
    setMobile(c.mobile || '');
    setCustomer(c);
    setCustomerName(c.name || '');
    setCustomerStatus('existing');
    setShowCustomerSearchModal(false);
  }

  function validateBeforeSave() {
    if (cart.length === 0) return 'Add at least one product to the cart.';
    if (mobile.length !== 10) return 'Enter a valid 10-digit mobile number.';
    if (!customerName.trim()) return 'Customer name is required.';
    if (paymentMethods.length === 0) return 'Select a payment method.';
    if (totals.paid <= 0) return 'Enter the amount received.';
    return '';
  }

  async function saveBill() {
    const v = validateBeforeSave();
    if (v) {
      setSaveError(v);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      let customerId = customer?.id;
      if (customerStatus === 'new') {
        const res = await api.post('/customers', { name: customerName.trim(), mobile });
        customerId = res.data?.id || res.data?.customer?.id;
      }
      const payload = {
        customer_id: customerId,
        customer_name: customerName.trim(),
        customer_mobile: mobile,
        bill_number: billNumber,
        cashier_name: cashier,
        items: cart.map((i) => ({
          product_id: i.productId,
          name: i.name,
          item_code: i.itemCode,
          price: i.price,
          mrp: i.mrp,
          qty: i.qty,
          discount_type: i.discountType,
          discount_value: i.discountValue,
          discount_amount: i.discountAmount,
          gst_percent: i.gstPercent,
          gst_amount: i.gstAmount,
          total: i.total,
        })),
        subtotal: totals.subtotal,
        total_discount: totals.discount,
        total_gst: totals.gst,
        round_off: totals.roundOff,
        grand_total: totals.grandTotal,
        payments: paymentMethods.map((p) => ({ method: p.method, amount: Number(p.amount) || 0 })),
        paid_amount: totals.paid,
        remaining_amount: totals.remaining,
        change_return: totals.change,
      };
      const res = await api.post('/sales', payload);
      setSavedInvoice({ ...payload, invoice_number: res.data?.invoice_number || res.data?.bill_number || billNumber, id: res.data?.id });
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleTokenExpired();
      } else if (!err.response) {
        setSaveError('Network error. Please check your connection and retry.');
      } else {
        setSaveError(err.response?.data?.message || 'Failed to save bill. Please retry.');
      }
    } finally {
      setSaving(false);
    }
  }

  function resetBilling() {
    setMobile('');
    setCustomer(null);
    setCustomerName('');
    setCustomerStatus('idle');
    setCustomerError('');
    clearProductSelection();
    setCart([]);
    setSelectedRow(null);
    setPaymentMethods([]);
    setSaveError('');
    setSavedInvoice(null);
    setShowSuccessModal(false);
    generateBillNumber();
    setTimeout(() => mobileRef.current && mobileRef.current.focus(), 50);
  }

  function printReceipt(mode) {
    setPrintMode(mode);
    setTimeout(() => window.print(), 80);
  }

  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === 'F2') {
        e.preventDefault();
        resetBilling();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowCustomerSearchModal(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowProductSearchModal(true);
        setTimeout(() => productInputRef.current && productInputRef.current.focus(), 50);
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (cart.length) setShowPaymentModal(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (paymentMethods.length) saveBill();
        else setShowPaymentModal(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (paymentMethods.length) saveBill();
        else setShowPaymentModal(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        printReceipt('thermal');
      } else if (e.key === 'Delete' && !typing && selectedRow) {
        e.preventDefault();
        setDeleteConfirmId(selectedRow);
      } else if (e.key === 'Escape') {
        setShowCustomerSearchModal(false);
        setShowProductSearchModal(false);
        setShowPaymentModal(false);
        setShowDiscountModal(false);
        setDeleteConfirmId(null);
        setShowSuccessModal(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cart, paymentMethods, selectedRow]);

  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    setIsDark(document.documentElement.classList.contains('dark'));
  }

  const isVIP = customer?.is_vip || (customer?.lifetime_purchase || 0) >= 100000;
  const isGold = customer?.is_gold || (customer?.total_bills || 0) >= 20;
  const isPreferred = customer?.is_preferred || (customer?.outstanding_balance || 0) === 0 && (customer?.total_bills || 0) >= 5;
  const isRepeat = (customer?.total_bills || 0) > 1;

  const discountItem = cart.find((c) => c.id === discountModalItemId);

  return (
    <div className="min-h-screen bg-[#FBF8F2] dark:bg-[#0f0d0a] text-[#2b2413] dark:text-[#F4EFE6] transition-colors duration-300">
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .billing-scroll::-webkit-scrollbar{width:6px;height:6px}
        .billing-scroll::-webkit-scrollbar-thumb{background:rgba(212,175,55,.4);border-radius:99px}
        #print-area{display:none}
        @media print{
          body *{visibility:hidden}
          #print-area,#print-area *{visibility:visible}
          #print-area{display:block;position:absolute;top:0;left:0;width:100%}
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-[#D4AF37]/25 backdrop-blur-xl bg-white/80 dark:bg-[#0f0d0a]/85">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8a6d1f] flex items-center justify-center shadow-lg">
              <Icon name="bag" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-wide leading-none bg-gradient-to-r from-[#8a6d1f] via-[#D4AF37] to-[#8a6d1f] bg-clip-text text-transparent">Rajni Saree Center</h1>
              <p className="text-[11px] text-[#8a7a55] mt-1">New Bill · {billNumber || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-[12px] text-[#6b5c39] dark:text-[#c9bd9a]">
              <Icon name="clock" className="w-3.5 h-3.5" />
              <span>{formatDate(now)}</span>
              <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
              <span className="tabular-nums">{formatTime(now)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[12px] font-medium">
              <Icon name="user" className="w-3.5 h-3.5" />
              {cashier}
            </div>
            <button onClick={toggleDark} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#D4AF37]/10 border border-[#D4AF37]/25 hover:bg-[#D4AF37]/20 transition-colors">
              <Icon name="moon" className="w-4 h-4" />
            </button>
            <button onClick={resetBilling} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-[12px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Icon name="bolt" className="w-3.5 h-3.5" /> New Bill (F2)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-6 min-w-0">
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#8a7a55]">Customer</h2>
              <button onClick={() => setShowCustomerSearchModal(true)} className="flex items-center gap-1 text-[12px] font-medium text-[#B8860B] hover:text-[#8a6d1f] transition-colors">
                <Icon name="search" className="w-3.5 h-3.5" /> Search (F3)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-[#8a7a55] mb-1 block">Mobile Number</label>
                <div className="relative">
                  <Icon name="phone" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8860B]" />
                  <input
                    ref={mobileRef}
                    value={mobile}
                    maxLength={10}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#D4AF37]/25 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-[14px] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#8a7a55] mb-1 block">Customer Name</label>
                <input
                  ref={nameRef}
                  value={customerName}
                  disabled={customerStatus === 'existing'}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#D4AF37]/25 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-[14px] disabled:opacity-70 transition-all"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap min-h-[24px]">
              {customerStatus === 'loading' && <SkeletonLine w="w-40" />}
              {customerStatus === 'existing' && (
                <>
                  <Badge icon="check" tone="green">Existing Customer</Badge>
                  {isRepeat && <Badge icon="refresh" tone="violet">Repeat Customer</Badge>}
                  {isVIP && <Badge icon="crown" tone="gold">VIP</Badge>}
                  {isGold && <Badge icon="star" tone="amber">Gold Customer</Badge>}
                  {isPreferred && <Badge icon="gift" tone="rose">Preferred</Badge>}
                </>
              )}
              {customerStatus === 'new' && <Badge icon="alert" tone="amber">New Customer</Badge>}
              {customerStatus === 'error' && <ErrorBanner message={customerError} onRetry={() => lookupCustomer(mobile)} />}
            </div>

            {customerStatus === 'existing' && customer && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-[slideUp_.2s_ease]">
                {[
                  ['Customer Since', formatShortDate(customer.customer_since || customer.created_at)],
                  ['Total Bills', customer.total_bills ?? 0],
                  ['Lifetime Purchase', formatCurrency(customer.lifetime_purchase)],
                  ['Outstanding', formatCurrency(customer.outstanding_balance)],
                  ['Last Purchase', formatShortDate(customer.last_purchase_date || customer.last_purchase)],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/20 px-3 py-2">
                    <p className="text-[10px] text-[#8a7a55] uppercase tracking-wide">{label}</p>
                    <p className="text-[13px] font-semibold mt-0.5 truncate">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          <GlassPanel className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#8a7a55]">Add Product</h2>
              <span className="text-[11px] text-[#8a7a55]">F4 to focus</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
              <div className="relative">
                <label className="text-[11px] font-medium text-[#8a7a55] mb-1 block">Search by name, code or category</label>
                <div className="relative">
                  <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8860B]" />
                  <input
                    ref={productInputRef}
                    value={productQuery}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      setSelectedProduct(null);
                    }}
                    onKeyDown={onProductKeyDown}
                    onFocus={() => productResults.length && setShowProductDropdown(true)}
                    placeholder="Type to search products..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#D4AF37]/25 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-[14px] transition-all"
                  />
                </div>
                {showProductDropdown && (
                  <div className="absolute z-30 mt-1.5 w-full max-h-72 overflow-y-auto billing-scroll rounded-xl border border-[#D4AF37]/25 bg-white/95 dark:bg-[#161310]/95 backdrop-blur-xl shadow-2xl animate-[slideUp_.15s_ease]">
                    {productLoading && (
                      <div className="p-3 space-y-2">
                        <SkeletonLine /> <SkeletonLine w="w-2/3" /> <SkeletonLine w="w-1/2" />
                      </div>
                    )}
                    {!productLoading && productError && <div className="p-3"><ErrorBanner message={productError} onRetry={() => searchProducts(productQuery)} /></div>}
                    {!productLoading && !productError && productResults.length === 0 && productQuery && (
                      <div className="p-4 text-center text-[13px] text-[#8a7a55]">No products found for "{productQuery}"</div>
                    )}
                    {!productLoading &&
                      productResults.map((p, idx) => {
                        const stock = Number(p.stock ?? p.available_pieces ?? 0);
                        return (
                          <button
                            key={p.id}
                            onMouseEnter={() => setActiveProductIndex(idx)}
                            onClick={() => selectProduct(p)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${idx === activeProductIndex ? 'bg-[#D4AF37]/15' : 'hover:bg-[#D4AF37]/8'}`}
                          >
                            {p.image_url || p.image ? (
                              <img src={p.image_url || p.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37]/20" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center"><Icon name="bag" className="w-4 h-4 text-[#B8860B]" /></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium truncate">{p.name}</p>
                              <p className="text-[11px] text-[#8a7a55]">{p.item_code || p.code || '—'} · {p.category || '—'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[13px] font-semibold">{formatCurrency(p.sale_price ?? p.price)}</p>
                              <p className={`text-[10px] ${stock <= LOW_STOCK_THRESHOLD ? 'text-rose-500' : 'text-emerald-500'}`}>{stock} in stock</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#8a7a55] mb-1 block">Qty</label>
                <div className="flex items-center rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-10 flex items-center justify-center hover:bg-[#D4AF37]/15 transition-colors"><Icon name="minus" className="w-3.5 h-3.5" /></button>
                  <input
                    ref={qtyRef}
                    value={qty}
                    onChange={(e) => {
                      const v = Number(e.target.value.replace(/\D/g, '')) || 1;
                      const stock = selectedProduct ? Number(selectedProduct.stock ?? selectedProduct.available_pieces ?? 0) : 999999;
                      setQty(Math.min(Math.max(v, 1), stock));
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addToCart()}
                    className="w-12 text-center bg-transparent outline-none text-[14px] font-semibold"
                  />
                  <button
                    onClick={() => {
                      const stock = selectedProduct ? Number(selectedProduct.stock ?? selectedProduct.available_pieces ?? 0) : 999999;
                      setQty((q) => Math.min(stock, q + 1));
                    }}
                    className="w-9 h-10 flex items-center justify-center hover:bg-[#D4AF37]/15 transition-colors"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#8a7a55] mb-1 block">Discount</label>
                <div className="flex items-center gap-1">
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 px-2 py-2.5 text-[13px] outline-none">
                    <option value="percent">%</option>
                    <option value="flat">₹</option>
                  </select>
                  <input
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-16 rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 px-2 py-2.5 text-[13px] outline-none text-center"
                  />
                </div>
              </div>
              <button
                disabled={!selectedProduct}
                onClick={addToCart}
                className="h-[42px] px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-semibold text-[13px] shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <Icon name="plus" className="w-4 h-4" /> Add
              </button>
            </div>

            {selectedProduct && linePreview && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-[slideUp_.2s_ease]">
                {selectedProduct.image_url || selectedProduct.image ? (
                  <img src={selectedProduct.image_url || selectedProduct.image} alt="" className="w-full h-24 object-cover rounded-xl border border-[#D4AF37]/20 sm:col-span-1" />
                ) : (
                  <div className="w-full h-24 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20"><Icon name="bag" className="w-6 h-6 text-[#B8860B]" /></div>
                )}
                <div className="col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ['MRP', formatCurrency(linePreview.mrp)],
                    ['Sale Price', formatCurrency(linePreview.price)],
                    ['Category', selectedProduct.category || '—'],
                    ['Available', `${linePreview.stock} pcs`],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/20 px-3 py-2">
                      <p className="text-[10px] text-[#8a7a55] uppercase">{l}</p>
                      <p className="text-[13px] font-semibold mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                {linePreview.stock <= LOW_STOCK_THRESHOLD && (
                  <div className="col-span-full flex items-center gap-2 text-[12px] text-rose-500 font-medium">
                    <Icon name="alert" className="w-3.5 h-3.5" /> Low stock warning — only {linePreview.stock} pieces left
                  </div>
                )}
              </div>
            )}
          </GlassPanel>

          <GlassPanel className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#8a7a55]">Cart ({cart.length})</h2>
            </div>
            <div className="overflow-x-auto billing-scroll">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[#8a7a55] border-y border-[#D4AF37]/15">
                    <th className="px-5 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium">Price</th>
                    <th className="px-3 py-2.5 font-medium">Qty</th>
                    <th className="px-3 py-2.5 font-medium">Discount</th>
                    <th className="px-3 py-2.5 font-medium">GST</th>
                    <th className="px-3 py-2.5 font-medium">Amount</th>
                    <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-[#8a7a55]">
                        Cart is empty. Search and add a product above.
                      </td>
                    </tr>
                  )}
                  {cart.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRow(item.id)}
                      className={`border-b border-[#D4AF37]/10 cursor-pointer transition-colors animate-[slideUp_.15s_ease] ${selectedRow === item.id ? 'bg-[#D4AF37]/12' : 'hover:bg-[#D4AF37]/6'}`}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[11px] text-[#8a7a55]">{item.itemCode}</p>
                      </td>
                      <td className="px-3 py-3">{formatCurrency(item.price)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); updateCartItem(item.id, { qty: Math.max(1, item.qty - 1) }); }} className="w-6 h-6 rounded-md bg-[#D4AF37]/12 hover:bg-[#D4AF37]/25 flex items-center justify-center"><Icon name="minus" className="w-3 h-3" /></button>
                          <span className="w-6 text-center font-semibold">{item.qty}</span>
                          <button onClick={(e) => { e.stopPropagation(); updateCartItem(item.id, { qty: Math.min(item.stock, item.qty + 1) }); }} className="w-6 h-6 rounded-md bg-[#D4AF37]/12 hover:bg-[#D4AF37]/25 flex items-center justify-center"><Icon name="plus" className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="px-3 py-3">{formatCurrency(item.discountAmount)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.gstAmount)}</td>
                      <td className="px-3 py-3 font-semibold">{formatCurrency(item.total)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); setDiscountModalItemId(item.id); setShowDiscountModal(true); }} className="w-7 h-7 rounded-lg bg-[#D4AF37]/12 hover:bg-[#D4AF37]/25 flex items-center justify-center"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id); }} className="w-7 h-7 rounded-lg bg-rose-500/12 hover:bg-rose-500/25 text-rose-500 flex items-center justify-center"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>

        <aside className="flex flex-col gap-6">
          <GlassPanel className="p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#8a7a55] mb-4">Bill Summary</h2>
            <div className="space-y-2 text-[13px]">
              {[
                ['Subtotal', totals.subtotal],
                ['Discount', -totals.discount],
                ['GST', totals.gst],
                ['Round Off', totals.roundOff],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between text-[#6b5c39] dark:text-[#c9bd9a]">
                  <span>{l}</span>
                  <span className="font-medium">{formatCurrency(v)}</span>
                </div>
              ))}
              <div className="h-px bg-[#D4AF37]/25 my-2" />
              <div className="flex items-center justify-between text-[17px] font-bold">
                <span>Grand Total</span>
                <span className="bg-gradient-to-r from-[#B8860B] to-[#D4AF37] bg-clip-text text-transparent">{formatCurrency(totals.grandTotal)}</span>
              </div>
              <div className="h-px bg-[#D4AF37]/25 my-2" />
              <div className="flex items-center justify-between text-[#6b5c39] dark:text-[#c9bd9a]">
                <span>Paid</span>
                <span className="font-medium">{formatCurrency(totals.paid)}</span>
              </div>
              <div className="flex items-center justify-between text-[#6b5c39] dark:text-[#c9bd9a]">
                <span>Remaining</span>
                <span className={`font-medium ${totals.remaining > 0 ? 'text-rose-500' : ''}`}>{formatCurrency(totals.remaining)}</span>
              </div>
              <div className="flex items-center justify-between text-[#6b5c39] dark:text-[#c9bd9a]">
                <span>Change Return</span>
                <span className="font-medium text-emerald-500">{formatCurrency(totals.change)}</span>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setShowPaymentModal(true)}
              className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8a6d1f] text-white font-semibold text-[14px] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="cash" className="w-4 h-4" /> Payment (F5)
            </button>
            {saveError && <div className="mt-3"><ErrorBanner message={saveError} onRetry={saveBill} /></div>}
          </GlassPanel>

          <GlassPanel className="p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#8a7a55] mb-3">Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 text-[11.5px] text-[#6b5c39] dark:text-[#c9bd9a]">
              {[
                ['F2', 'New Bill'],
                ['F3', 'Customer Search'],
                ['F4', 'Product Search'],
                ['F5', 'Payment'],
                ['F6', 'Save Bill'],
                ['Ctrl+S', 'Save Bill'],
                ['Ctrl+P', 'Print'],
                ['Delete', 'Remove Item'],
                ['Esc', 'Close Modal'],
              ].map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[10px] font-semibold">{k}</kbd>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </aside>
      </main>

      <Modal open={showCustomerSearchModal} onClose={() => setShowCustomerSearchModal(false)} title="Search Customer" wide>
        <input
          autoFocus
          value={customerSearchQuery}
          onChange={(e) => setCustomerSearchQuery(e.target.value)}
          placeholder="Search by name or mobile"
          className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#D4AF37]/25 focus:border-[#D4AF37] outline-none text-[14px] mb-4"
        />
        {customerSearchLoading && (
          <div className="space-y-2">
            <SkeletonLine /> <SkeletonLine w="w-2/3" /> <SkeletonLine w="w-1/2" />
          </div>
        )}
        {!customerSearchLoading && customerSearchError && <ErrorBanner message={customerSearchError} onRetry={() => runCustomerSearch(customerSearchQuery)} />}
        {!customerSearchLoading && !customerSearchError && (
          <div className="space-y-2 max-h-96 overflow-y-auto billing-scroll">
            {customerSearchResults.length === 0 && <p className="text-center text-[13px] text-[#8a7a55] py-6">No customers found.</p>}
            {customerSearchResults.map((c) => (
              <button key={c.id} onClick={() => pickCustomerFromModal(c)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#D4AF37]/6 hover:bg-[#D4AF37]/15 transition-colors text-left">
                <div>
                  <p className="text-[13px] font-medium">{c.name}</p>
                  <p className="text-[11px] text-[#8a7a55]">{c.mobile}</p>
                </div>
                <p className="text-[12px] font-semibold text-[#B8860B]">{formatCurrency(c.lifetime_purchase)}</p>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={showProductSearchModal} onClose={() => setShowProductSearchModal(false)} title="Search Product" wide>
        <p className="text-[13px] text-[#8a7a55]">Use the product search field on the billing screen — this shortcut just brings focus there.</p>
      </Modal>

      <Modal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} title="Edit Discount">
        {discountItem && (
          <div className="space-y-4">
            <p className="text-[13px] font-medium">{discountItem.name}</p>
            <div className="flex items-center gap-2">
              <select
                value={discountItem.discountType}
                onChange={(e) => updateCartItem(discountItem.id, { discountType: e.target.value })}
                className="rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 px-3 py-2.5 text-[13px] outline-none"
              >
                <option value="percent">Percent %</option>
                <option value="flat">Flat ₹</option>
              </select>
              <input
                value={discountItem.discountValue}
                onChange={(e) => updateCartItem(discountItem.id, { discountValue: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                className="flex-1 rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 px-3 py-2.5 text-[13px] outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#8a7a55]">
              <span>Discount Amount</span>
              <span className="font-semibold text-[#2b2413] dark:text-[#F4EFE6]">{formatCurrency(discountItem.discountAmount)}</span>
            </div>
            <button onClick={() => setShowDiscountModal(false)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-semibold text-[13px]">
              Done
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Remove Item">
        <p className="text-[13px] text-[#6b5c39] dark:text-[#c9bd9a] mb-5">Are you sure you want to remove this item from the cart? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/30 font-semibold text-[13px] hover:bg-[#D4AF37]/10 transition-colors">Cancel</button>
          <button onClick={() => removeCartItem(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-[13px] hover:bg-rose-600 transition-colors">Remove</button>
        </div>
      </Modal>

      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Payment">
        <div className="space-y-5">
          <div className="flex items-center justify-between text-[15px] font-bold">
            <span>Grand Total</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['cash', 'cash', 'Cash'],
              ['upi', 'upi', 'UPI'],
              ['card', 'card', 'Card'],
              ['wallet', 'wallet', 'Wallet'],
            ].map(([key, icon, label]) => (
              <button key={key} onClick={() => quickPay(key)} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/18 transition-colors">
                <Icon name={icon} className="w-5 h-5 text-[#B8860B]" />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
          <button onClick={addSplitLine} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#D4AF37]/40 text-[12px] font-semibold text-[#B8860B] hover:bg-[#D4AF37]/8 transition-colors">
            <Icon name="split" className="w-4 h-4" /> Split Payment
          </button>

          <div className="space-y-2 max-h-48 overflow-y-auto billing-scroll">
            {paymentMethods.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <select value={p.method} onChange={(e) => updateSplitLine(p.id, { method: e.target.value })} className="rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 px-2 py-2 text-[12px] outline-none">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="wallet">Wallet</option>
                </select>
                <input
                  ref={paidRef}
                  value={p.amount}
                  onChange={(e) => updateSplitLine(p.id, { amount: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                  className="flex-1 rounded-xl border border-[#D4AF37]/25 bg-white/70 dark:bg-white/5 px-3 py-2 text-[13px] outline-none"
                />
                <button onClick={() => removeSplitLine(p.id)} className="w-8 h-8 rounded-lg bg-rose-500/12 text-rose-500 flex items-center justify-center hover:bg-rose-500/25"><Icon name="close" className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-[13px] border-t border-[#D4AF37]/20 pt-3">
            <div className="flex items-center justify-between"><span className="text-[#8a7a55]">Paid</span><span className="font-semibold">{formatCurrency(totals.paid)}</span></div>
            <div className="flex items-center justify-between"><span className="text-[#8a7a55]">Remaining</span><span className={`font-semibold ${totals.remaining > 0 ? 'text-rose-500' : ''}`}>{formatCurrency(totals.remaining)}</span></div>
            <div className="flex items-center justify-between"><span className="text-[#8a7a55]">Change Return</span><span className="font-semibold text-emerald-500">{formatCurrency(totals.change)}</span></div>
          </div>

          {saveError && <ErrorBanner message={saveError} onRetry={saveBill} />}

          <button
            disabled={saving}
            onClick={saveBill}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8a6d1f] text-white font-semibold text-[14px] shadow-lg disabled:opacity-50 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Icon name="refresh" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Bill (F6)'}
          </button>
        </div>
      </Modal>

      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Bill Saved Successfully">
        {savedInvoice && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Icon name="check" className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-[13px] text-[#8a7a55]">Invoice Number</p>
              <p className="text-[20px] font-bold bg-gradient-to-r from-[#B8860B] to-[#D4AF37] bg-clip-text text-transparent">{savedInvoice.invoice_number}</p>
            </div>
            <p className="text-[15px] font-semibold">{formatCurrency(savedInvoice.grand_total)}</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => printReceipt('thermal')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/25 font-semibold text-[12.5px] hover:bg-[#D4AF37]/20 transition-colors"><Icon name="printer" className="w-4 h-4" /> 80mm Print</button>
              <button onClick={() => printReceipt('a4')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/25 font-semibold text-[12.5px] hover:bg-[#D4AF37]/20 transition-colors"><Icon name="printer" className="w-4 h-4" /> A4 Invoice</button>
              <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/25 font-semibold text-[12.5px] hover:bg-[#D4AF37]/20 transition-colors"><Icon name="share" className="w-4 h-4" /> Share PDF</button>
              <button onClick={resetBilling} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8a6d1f] text-white font-semibold text-[12.5px] hover:shadow-lg transition-all"><Icon name="bolt" className="w-4 h-4" /> New Bill</button>
            </div>
          </div>
        )}
      </Modal>

      <div id="print-area" ref={printRef}>
        {savedInvoice && printMode === 'thermal' && (
          <div style={{ width: '80mm', padding: '8px', fontFamily: 'monospace', fontSize: '11px' }}>
            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>Rajni Saree Center</p>
            <p style={{ textAlign: 'center' }}>Invoice: {savedInvoice.invoice_number}</p>
            <p style={{ textAlign: 'center' }}>{formatDate(now)} {formatTime(now)}</p>
            <hr />
            <p>Customer: {savedInvoice.customer_name}</p>
            <p>Mobile: {savedInvoice.customer_mobile}</p>
            <hr />
            {savedInvoice.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{it.name} x{it.qty}</span>
                <span>{formatCurrency(it.total)}</span>
              </div>
            ))}
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatCurrency(savedInvoice.subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span>{formatCurrency(savedInvoice.total_discount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST</span><span>{formatCurrency(savedInvoice.total_gst)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>Grand Total</span><span>{formatCurrency(savedInvoice.grand_total)}</span></div>
            <hr />
            <p style={{ textAlign: 'center' }}>Thank you for shopping with us!</p>
          </div>
        )}
        {savedInvoice && printMode === 'a4' && (
          <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center' }}>Rajni Saree Center</h1>
            <p style={{ textAlign: 'center' }}>Tax Invoice</p>
            <hr />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr>
                  <td>Product</td><td>Price</td><td>Qty</td><td>Discount</td><td>GST</td><td>Amount</td>
                </tr>
              </thead>
              <tbody>
                {savedInvoice.items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.name}</td><td>{formatCurrency(it.price)}</td><td>{it.qty}</td><td>{formatCurrency(it.discount_amount)}</td><td>{formatCurrency(it.gst_amount)}</td><td>{formatCurrency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 style={{ textAlign: 'right', marginTop: '16px' }}>Grand Total: {formatCurrency(savedInvoice.grand_total)}</h2>
          </div>
        )}
      </div>
    </div>
  );
}