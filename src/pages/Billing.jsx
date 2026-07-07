import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState({ name: '', isNew: true });
  const [inventory, setInventory] = useState([]); // State for all items
  const [cart, setCart] = useState([]);

  // 1. Fetch ALL inventory on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/products'); // Ensure this route exists in backend
        setInventory(res.data.products || res.data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      }
    };
    fetchInventory();
  }, []);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setMobile(val);
    if (val.length === 10) {
      api.get(`/customers/mobile/${val}`)
        .then(res => setCustomer({ name: res.data.customer?.name || 'Unknown', isNew: false }))
        .catch(() => setCustomer({ name: 'New Customer', isNew: true }));
    }
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, qty: 1 }]);
  };

  return (
    <div className="billing-container">
      <header className="billing-header">
        <h1>Rajni Saree Center POS</h1>
      </header>

      <div className="billing-layout">
        {/* Left: Inventory List */}
        <section className="panel inventory-panel">
          <h3>Inventory</h3>
          <div className="inventory-grid">
            {inventory.map((item) => (
              <div key={item.id} className="product-card" onClick={() => addToCart(item)}>
                <h4>{item.name}</h4>
                <p>₹{item.sale_price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Customer & Cart */}
        <section className="right-column">
          <div className="panel customer-panel">
            <h3>Customer</h3>
            <input value={mobile} onChange={handleMobileChange} placeholder="10 Digit Mobile" />
            <p className="customer-name">{customer.name}</p>
          </div>

          <div className="panel cart-panel">
            <h3>Cart</h3>
            {cart.map((item, i) => (
              <div key={i}>{item.name} - ₹{item.sale_price}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Billing;