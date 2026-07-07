import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  // ... (Keep all your existing states)
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // FIXED: Customer fetcher - Ensure you check your F12 console to match this path
  const fetchCustomer = useCallback(async (mobileNumber) => {
    if (mobileNumber.length !== 10) return;
    setCustomerLoading(true);
    try {
      const response = await api.get(`/customers/mobile/${mobileNumber}`);
      // Based on your previous context, we use response.data if the object is flat,
      // or response.data.customer if it is nested.
      const data = response.data.customer || response.data;
      if (data && data.name) {
        setCustomer({ ...data, isNew: false });
      } else {
        setCustomer({ mobile: mobileNumber, name: '', isNew: true });
      }
    } catch (error) {
      setCustomer({ mobile: mobileNumber, name: '', isNew: true });
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  // ... (Keep your existing addToCart, removeCartItem, etc.)

  return (
    <div className="billing-container">
      <header className="billing-header">
        <h1>Rajni Saree Center POS</h1>
      </header>

      <main className="billing-layout">
        {/* NEW LEFT PANEL: INVENTORY/SEARCH */}
        <section className="inventory-panel">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search Inventory (F3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="product-search-input"
            />
            {showSuggestions && (
              <ul className="search-dropdown">
                {searchResults.map((p) => (
                  <li key={p.id} onClick={() => addToCart(p)}>
                    {p.name} - ₹{p.sale_price}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Add a full inventory grid or list here if needed */}
        </section>

        {/* NEW RIGHT PANEL: CUSTOMER & CART */}
        <section className="cart-panel">
          <div className="customer-card glassmorphism">
            {/* ... Customer inputs ... */}
          </div>
          
          <div className="cart-section glassmorphism">
            <table className="cart-table">
               {/* ... Your existing table ... */}
            </table>
          </div>

          <div className="summary-card glassmorphism">
            {/* ... Summary & Payment ... */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default React.memo(Billing);