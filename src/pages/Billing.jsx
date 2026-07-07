import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState(null);

  // Force fetch when mobile hits 10 digits
  useEffect(() => {
    if (mobile.length === 10) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/customers/mobile/${mobile}`);
          // This handles both { "name": "..." } and { "customer": { "name": "..." } }
          const data = res.data.customer || res.data;
          setCustomer(data);
        } catch (err) {
          setCustomer({ name: 'New Customer' });
        }
      };
      fetchCustomer();
    } else {
      setCustomer(null);
    }
  }, [mobile]);

  return (
    <div className="billing-container">
      <header><h1>Rajni Saree Center POS</h1></header>
      <div className="billing-layout">
        <section className="inventory-panel">
          <h3>Inventory</h3>
          <input className="product-search-input" placeholder="Search Inventory..." />
        </section>
        <section className="cart-panel">
          <div className="customer-card">
            <h3>Customer</h3>
            <input 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} 
              placeholder="10 Digit Mobile" 
            />
            {customer && <p className="customer-name-display">{customer.name}</p>}
          </div>
          <div className="cart-section"><h3>Cart</h3></div>
        </section>
      </div>
    </div>
  );
};

export default Billing;