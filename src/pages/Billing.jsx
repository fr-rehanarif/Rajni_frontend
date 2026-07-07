import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Billing.css"; // Ensure this file has the CSS from our previous discussion

function Billing() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState({ name: "", mobile: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const token = localStorage.getItem("token");

  const fetchItems = async () => {
    try {
      const res = await fetch("https://rajni-backend.onrender.com/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.products || []);
      }
    } catch (error) {
      console.error("Items fetch error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = (items || []).filter((item) => {
    const name = String(item.name || "").toLowerCase();
    const searchValue = search.toLowerCase();
    return name.includes(searchValue);
  });

  const addToCart = (item) => {
    if (Number(item.stock) <= 0) {
      alert("This item is out of stock");
      return;
    }

    const existing = cart.find((cartItem) => cartItem._id === item._id);

    if (existing) {
      if (existing.qty >= Number(item.stock)) return;
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, qty: cartItem.qty + 1, amount: (cartItem.qty + 1) * Number(item.selling_price) }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1, amount: Number(item.selling_price) || 0 }]);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const discountAmount = (subtotal * Number(discount)) / 100;
  const grandTotal = subtotal - discountAmount;

  const saveBill = async () => {
    if (cart.length === 0) return alert("Add items first");

    const billData = {
      customer_name: customer.name,
      customer_mobile: customer.mobile,
      items: cart,
      subtotal,
      discount_percent: discount,
      discount_amount: discountAmount,
      grand_total: grandTotal,
      payment_mode: paymentMode,
    };

    try {
      const res = await fetch("https://rajni-backend.onrender.com/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(billData),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        navigate(`/bill-print/${data.bill_id}`);
      }
    } catch (error) {
      console.error("Bill save error:", error);
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1>Billing</h1>
        <p>Create bill, calculate total and save invoice</p>
      </div>

      <div className="billing-layout">
        <div className="billing-left">
          <input
            className="search-input"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="item-list">
            {filteredItems.map((item) => (
              <div className="card" key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <strong>{item.name}</strong>
                  <p>Stock: {item.stock}</p>
                </div>
                <button className="gold-btn" onClick={() => addToCart(item)}>Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="billing-right card">
          <h2>Bill Cart</h2>
          <input placeholder="Name" className="search-input" onChange={(e) => setCustomer({...customer, name: e.target.value})} />
          <input placeholder="Mobile" className="search-input" onChange={(e) => setCustomer({...customer, mobile: e.target.value})} />
          
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item._id}>
                <span>{item.name} x {item.qty}</span>
                <span>₹{item.amount}</span>
              </div>
            ))}
          </div>

          <div className="total-box">
             <p>Subtotal: ₹{subtotal}</p>
             <p>Grand Total: ₹{grandTotal}</p>
          </div>

          <button className="gold-btn" style={{ width: '100%' }} onClick={saveBill}>Save Bill</button>
        </div>
      </div>
    </div>
  );
}

export default Billing;