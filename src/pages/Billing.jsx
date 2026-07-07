import React from 'react';
import './BillingPage.css';

const BillingPage = () => {
  return (
    <div className="pos-billing-page">
      {/* Header - Consistent with Dashboard */}
      <header className="pos-header">
        <div className="header-left">
          <h1>Rajni Saree Center</h1>
          <p>Luxury Saree POS Command Center</p>
        </div>
        <div className="header-right">
          <button className="user-btn">Manager1</button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="billing-content">
        
        {/* Left: Inventory */}
        <section className="inventory-panel">
          <div className="pos-card">
            <h2>Inventory</h2>
            <div className="product-grid">
              {/* Add your product mapping logic here */}
              <div className="product-item">Titan Black</div>
              <div className="product-item">Test Product</div>
            </div>
          </div>
        </section>

        {/* Right: Customer & Cart */}
        <aside className="sidebar-panel">
          <div className="pos-card">
            <h3>Customer</h3>
            <input type="text" placeholder="10 Digit Mobile" className="pos-input" />
          </div>
          
          <div className="pos-card mt-20">
            <h3>Cart</h3>
            <div className="cart-items">
              {/* Cart logic here */}
              <p className="empty-msg">Cart is empty</p>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
};

export default BillingPage;