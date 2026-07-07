import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  // --- STATE MANAGEMENT ---
  
  // Customer State
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState(null);

  // Product Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState([]);
  
  // Billing & Payment State
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for Keyboard Support
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // --- CUSTOMER LOGIC ---

  const fetchCustomer = useCallback(async (mobileNumber) => {
    if (mobileNumber.length !== 10) return;
    
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const response = await api.get(`/customers/mobile/${mobileNumber}`);
      
      // Unwrap the nested 'customer' object from your backend response
      const customerData = response.data.customer || response.data;

      if (customerData && customerData.name) {
        setCustomer({
          ...customerData,
          isNew: false
        });
      } else {
        setCustomer({ mobile: mobileNumber, name: '', isNew: true });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setCustomer({ mobile: mobileNumber, name: '', isNew: true });
      } else {
        setCustomerError('Network error while fetching customer.');
      }
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setMobile(val);
      if (val.length === 10) {
        fetchCustomer(val);
      } else {
        setCustomer(null);
      }
    }
  };

  const handleCustomerNameChange = (e) => {
    if (customer && customer.isNew) {
      setCustomer({ ...customer, name: e.target.value });
    }
  };

  // --- PRODUCT SEARCH LOGIC (DEBOUNCED) ---

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const response = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(response.data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Product search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, qty: item.qty + 1, amount: (item.qty + 1) * item.rate }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product_id: product.id,
          product_name: product.name,
          item_code: product.code,
          mrp: product.mrp,
          rate: product.sale_price,
          qty: 1,
          gst: product.gst || 0,
          amount: product.sale_price
        }
      ];
    });
    setSearchQuery('');
    setShowSuggestions(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  // --- CART MANAGEMENT ---

  const updateCartQty = useCallback((index, newQty) => {
    if (newQty < 1) return;
    setCart((prev) => {
      const updated = [...prev];
      updated[index].qty = newQty;
      updated[index].amount = newQty * updated[index].rate;
      return updated;
    });
  }, []);

  const removeCartItem = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const duplicateCartItem = useCallback((index) => {
    setCart((prev) => {
      const updated = [...prev];
      const itemToDuplicate = { ...updated[index] };
      updated.splice(index + 1, 0, itemToDuplicate);
      return updated;
    });
  }, []);

  // --- CALCULATIONS (MEMOIZED) ---

  const { subtotal, totalGst, grandTotal, roundOff } = useMemo(() => {
    let sub = 0;
    let gstAmt = 0;

    cart.forEach(item => {
      sub += item.amount;
      gstAmt += (item.amount * (item.gst / 100));
    });

    const discountAmount = sub * (discountPercent / 100);
    const totalBeforeRound = sub - discountAmount + gstAmt;
    const roundedTotal = Math.round(totalBeforeRound);
    
    return {
      subtotal: sub,
      totalGst: gstAmt,
      grandTotal: roundedTotal,
      roundOff: Number((roundedTotal - totalBeforeRound).toFixed(2))
    };
  }, [cart, discountPercent]);

  const remainingAmount = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    return grandTotal - paid;
  }, [grandTotal, amountPaid]);

  // --- SAVE & PRINT LOGIC ---

  const handleSaveBill = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!customer || !customer.name) return alert("Valid customer details required");

    setIsSaving(true);
    try {
      // Step 1: Auto-create customer if new
      let finalCustomerId = customer.id;
      if (customer.isNew) {
        const custRes = await api.post('/customers', {
          mobile: customer.mobile,
          name: customer.name
        });
        finalCustomerId = custRes.data.id;
      }

      // Step 2: Save the bill mapping to your sales and sale_items schema
      const billPayload = {
        customer_id: finalCustomerId,
        subtotal,
        discount_percent: discountPercent,
        total_gst: totalGst,
        round_off: roundOff,
        grand_total: grandTotal,
        payment_mode: paymentMode,
        amount_paid: amountPaid || grandTotal,
        items: cart
      };

      const saleRes = await api.post('/sales', billPayload);
      
      // Reset for next bill
      setCart([]);
      setMobile('');
      setCustomer(null);
      setDiscountPercent(0);
      setAmountPaid('');
      
      // Auto-trigger print preview
      window.open(`/print/bill/${saleRes.data.id}`, '_blank');
      
    } catch (error) {
      console.error("Failed to save bill:", error);
      alert(error.response?.data?.message || "Error saving bill. Please check network connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- KEYBOARD SHORTCUTS ---

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveBill();
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        // Trigger Print Action
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        if (mobileInputRef.current) mobileInputRef.current.focus();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        if (searchInputRef.current) searchInputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveBill]);

  // --- RENDER ---

  return (
    <div className="billing-container">
      <header className="billing-header">
        <h1>Rajni Saree Center POS</h1>
        <div className="header-actions">
          <span className="shortcut-hint">F2: Customer | F3: Product | Ctrl+S: Save</span>
        </div>
      </header>

      <main className="billing-layout">
        <section className="left-panel">
          {/* PRODUCT SEARCH */}
          <div className="search-section">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by Item Name, Code, or Category (F3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="product-search-input"
            />
            {isSearching && <div className="search-loading">Searching...</div>}
            
            {showSuggestions && searchResults.length > 0 && (
              <ul className="search-dropdown">
                {searchResults.map((product) => (
                  <li key={product.id} onClick={() => addToCart(product)}>
                    <span className="product-code">[{product.code}]</span>
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">₹{product.sale_price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CART TABLE */}
          <div className="cart-section">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Name</th>
                  <th>MRP</th>
                  <th>Sale Price</th>
                  <th>Qty</th>
                  <th>GST %</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item_code}</td>
                    <td>{item.product_name}</td>
                    <td>₹{item.mrp}</td>
                    <td>₹{item.rate}</td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.qty} 
                        onChange={(e) => updateCartQty(index, parseInt(e.target.value) || 1)}
                        className="qty-input"
                      />
                    </td>
                    <td>{item.gst}%</td>
                    <td>₹{item.amount.toFixed(2)}</td>
                    <td className="action-cells">
                      <button onClick={() => duplicateCartItem(index)} title="Duplicate">DUP</button>
                      <button onClick={() => removeCartItem(index)} title="Delete">DEL</button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty-cart">Cart is empty. Scan or search products to begin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="right-panel">
          {/* CUSTOMER SECTION */}
          <div className="customer-card glassmorphism">
            <h3>Customer Details</h3>
            <div className="form-group">
              <label>Mobile Number (F2)</label>
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="10 Digit Mobile"
                value={mobile}
                onChange={handleMobileChange}
                maxLength={10}
              />
              {customerLoading && <span className="status-text">Fetching...</span>}
              {customerError && <span className="error-text">{customerError}</span>}
            </div>
            
            {customer && (
              <div className="form-group slide-down">
                <label>Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={customer.name}
                  onChange={handleCustomerNameChange}
                  disabled={!customer.isNew}
                />
                {!customer.isNew && (
                  <div className="customer-badges">
                    <span className="badge vip-badge">Existing Customer</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BILLING SUMMARY */}
          <div className="summary-card glassmorphism">
            <h3>Billing Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Discount (%):</span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={discountPercent} 
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} 
                className="discount-input"
              />
            </div>
            <div className="summary-row">
              <span>GST:</span>
              <span>₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Round Off:</span>
              <span>{roundOff > 0 ? '+' : ''}{roundOff}</span>
            </div>
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          {/* PAYMENT & CHECKOUT */}
          <div className="payment-card glassmorphism">
            <h3>Payment</h3>
            <div className="payment-modes">
              {['Cash', 'UPI', 'Card', 'Wallet', 'Split'].map(mode => (
                <button 
                  key={mode} 
                  className={`mode-btn ${paymentMode === mode ? 'active' : ''}`}
                  onClick={() => setPaymentMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="form-group amount-paid-group">
              <label>Amount Paid</label>
              <input 
                type="number" 
                placeholder={`₹${grandTotal}`} 
                value={amountPaid} 
                onChange={(e) => setAmountPaid(e.target.value)} 
              />
            </div>
            <div className="summary-row">
              <span>Change/Remaining:</span>
              <span className={remainingAmount < 0 ? 'change-due' : 'balance-due'}>
                ₹{Math.abs(remainingAmount).toFixed(2)} {remainingAmount < 0 ? '(Return)' : '(Due)'}
              </span>
            </div>
            
            <button 
              className="btn-checkout" 
              onClick={handleSaveBill} 
              disabled={isSaving || cart.length === 0}
            >
              {isSaving ? 'Processing...' : 'Complete Bill (Ctrl+S)'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default React.memo(Billing);