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
    <div className="billing-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <header><h1>Rajni Saree Center POS</h1></header>

      {/* Force layout with direct styles to debug CSS issues */}
      <div className="billing-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flexGrow: 1, marginTop: '20px' }}>
        
        <section className="inventory-panel" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #ddd' }}>
          <h3>Inventory</h3>
          <input className="product-search-input" placeholder="Search Inventory..." style={{ width: '100%', padding: '10px' }} />
        </section>

        <section className="cart-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="customer-card" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #ddd' }}>
            <h3>Customer</h3>
            <input placeholder="10 Digit Mobile" style={{ width: '100%', padding: '10px' }} />
          </div>
          
          <div className="cart-section" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #ddd', flexGrow: 1 }}>
            <h3>Cart</h3>
          </div>
        </section>
      </div>
    </div>
  );
};

export default React.memo(Billing);