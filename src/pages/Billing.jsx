import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState({ name: '', isNew: true });
  const [loading, setLoading] = useState(false);

  // Logic to fetch customer
  const fetchCustomer = async (mobileNum) => {
    if (mobileNum.length !== 10) return;
    setLoading(true);
    try {
      const res = await api.get(`/customers/mobile/${mobileNum}`);
      // Handle response structure (if it's {customer: {name: ...}} or direct)
      const data = res.data.customer || res.data;
      setCustomer({ name: data.name || 'Unknown', isNew: false });
    } catch (err) {
      // If 404, it means customer doesn't exist, show as New Customer
      setCustomer({ name: 'New Customer', isNew: true });
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setMobile(val);
    if (val.length === 10) fetchCustomer(val);
  };

  return (
    <div className="billing-container">
      <header className="billing-header">
        <h1>Rajni Saree Center POS</h1>
      </header>

      <div className="billing-layout">
        {/* Left: Inventory Section */}
        <section className="panel inventory-panel">
          <h3>Inventory</h3>
          <input className="product-search-input" placeholder="Search Inventory..." />
        </section>

        {/* Right: Customer & Cart */}
        <section className="right-column">
          <div className="panel customer-panel">
            <h3>Customer</h3>
            <input 
              value={mobile} 
              onChange={handleMobileChange} 
              placeholder="10 Digit Mobile"
              maxLength={10}
            />
            {mobile.length === 10 && (
              <p className={`customer-status ${customer.isNew ? 'new' : 'existing'}`}>
                {customer.name}
              </p>
            )}
          </div>

          <div className="panel cart-panel">
            <h3>Cart</h3>
            <table className="cart-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>{/* Add cart rows here */}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Billing;