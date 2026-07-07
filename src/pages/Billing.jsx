import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const fetchCustomer = useCallback(async (mobileNumber) => {
    if (mobileNumber.length !== 10) return;
    setCustomerLoading(true);
    try {
      const response = await api.get(`/customers/mobile/${mobileNumber}`);
      console.log("API Customer Response:", response.data); // CHECK THIS IN F12 CONSOLE
      
      // Update this path based on your console log
      const data = response.data.customer || response.data;
      setCustomer(data);
    } catch (error) {
      setCustomer({ mobile: mobileNumber, name: '', isNew: true });
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setMobile(val);
    if (val.length === 10) fetchCustomer(val);
  };

  const addToCart = (product) => {
    setCart((prev) => [...prev, { ...product, qty: 1, amount: product.sale_price }]);
  };

  return (
    <div className="billing-container">
      <header className="billing-header">
        <h1>Rajni Saree Center POS</h1>
      </header>

      <main className="billing-layout">
        {/* LEFT: INVENTORY */}
        <section className="inventory-panel glassmorphism">
          <h3>Inventory</h3>
          <input
            className="product-search-input"
            placeholder="Search Inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="results-area">
            {searchResults.map(p => <div key={p.id} onClick={() => addToCart(p)}>{p.name}</div>)}
          </div>
        </section>

        {/* RIGHT: CART & CUSTOMER */}
        <section className="cart-panel">
          <div className="customer-card glassmorphism">
            <h3>Customer</h3>
            <input value={mobile} onChange={handleMobileChange} placeholder="10 Digit Mobile" />
            {customer && <p className="customer-name">Name: {customer.name || "New Customer"}</p>}
          </div>

          <div className="cart-section glassmorphism">
            <h3>Cart</h3>
            <table className="cart-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>
                {cart.map((item, i) => (
                  <tr key={i}><td>{item.name}</td><td>{item.qty}</td><td>₹{item.amount}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default React.memo(Billing);