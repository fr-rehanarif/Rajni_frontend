import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Billing.css";

function Billing() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState({ name: "", mobile: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const token = localStorage.getItem("token");

  // Fetch products
  const fetchItems = async () => {
    try {
      const res = await fetch("https://rajni-backend.onrender.com/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.products || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = items.filter((i) => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      setCart(cart.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1, amount: (c.qty + 1) * item.selling_price } : c));
    } else {
      setCart([...cart, { ...item, qty: 1, amount: item.selling_price }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((c) => c._id !== id));

  const subtotal = cart.reduce((acc, curr) => acc + curr.amount, 0);
  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal - discountAmount;

  const updateQty = (id, qty) => {
  qty = Number(qty);

  if (qty < 1) return;

  setCart(
    cart.map((item) =>
      item._id === id
        ? {
            ...item,
            qty,
            amount: qty * item.selling_price,
          }
        : item
    )
  );
};

  const saveBill = async () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  try {
    const billData = {
      customer,
      cart,
      subtotal,
      discount,
      grandTotal,
      paymentMode,
    };

    const res = await fetch(
      "https://rajni-backend.onrender.com/api/bills",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billData),
      }
    );

    const data = await res.json();

    if (data.success) {
      navigate(`/bill-print/${data.bill_id}`);
    } else {
      setMessage(data.message || "Failed to save bill");
    }
  } catch (err) {
    console.error(err);
    setMessage("Something went wrong");
  }
};

  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1>Billing</h1>
        <p>Create bill, calculate total and save invoice</p>
      </div>

      <div className="billing-layout">
        {/* Left Side */}
        <div className="billing-left">
          <input className="search-input" placeholder="Search product..." onChange={(e) => setSearch(e.target.value)} />
          <div className="item-list">
            {filteredItems.map((item) => (
              <div className="card" key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
                <div><strong>{item.name}</strong><p>Stock: {item.stock}</p></div>
                <button className="gold-btn" onClick={() => addToCart(item)}>Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="billing-right">
          <h2>Bill Cart</h2>
          <div className="customer-row">
            <input
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  name: e.target.value,
                })
              }
            />
            <input
  placeholder="Mobile Number"
  value={customer.mobile}
  onChange={(e) =>
    setCustomer({
      ...customer,
      mobile: e.target.value,
    })
  }
/>
          </div>
          <div className="cart-list">
  {cart.length === 0 ? (
    <p>No item added</p>
  ) : (
    cart.map((item) => (
      <div className="cart-item" key={item._id}>
        <div>
          <strong>{item.name}</strong>
          <p>₹{item.selling_price}</p>
        </div>

        <input
          type="number"
          min="1"
          value={item.qty}
          onChange={(e) =>
            updateQty(item._id, e.target.value)
          }
        />

        <strong>₹{item.amount}</strong>

        <button onClick={() => removeFromCart(item._id)}>
          X
        </button>
      </div>
    ))
  )}
</div>
          <div className="total-box">
            <div>
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div>
              <span>Discount (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div>
              <span>Discount Amount</span>
              <strong>₹{discountAmount}</strong>
            </div>
            <div>
              <span>Grand Total</span>
              <strong>₹{grandTotal}</strong>
            </div>
          </div>
          <select
            className="payment-select"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="Cash">Cash</option>

            <option value="UPI">UPI</option>

            <option value="Card">Card</option>

            <option value="Due">Due</option>

          </select>
          <button className="save-bill-btn" onClick={saveBill}>
            Save Bill
          </button>
          {message && (
            <div className="page-message">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Billing;

