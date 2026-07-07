import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Billing.css";

function Billing() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [customerFound, setCustomerFound] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
  });

  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const token = localStorage.getItem("token");

  const fetchItems = async () => {
    try {
      const res = await fetch("https://rajni-backend.onrender.com/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // FIXED: Look for 'products' instead of 'items' to match Inventory.jsx
      if (data.success) {
        setItems(data.products || []); 
      } else {
        setMessage(data.message || "Items load nahi hue");
      }
    } catch (error) {
      console.error("Items fetch error:", error);
      setMessage("Items load failed");
    }
  };

  const searchCustomerByMobile = async (mobile) => {
    if (mobile.length < 10) {
      setCustomerFound("");
      return;
    }

    try {
      const res = await fetch(
        `https://rajni-backend.onrender.com/api/customers/mobile/${mobile}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success && data.customer) {
        setCustomer({
          name: data.customer.name,
          mobile: data.customer.mobile,
        });

        setCustomerFound(
          `Existing customer found. Due: ₹${data.customer.due_amount || 0}`
        );
      } else {
        setCustomerFound("New customer will be created after bill save");
      }
    } catch (error) {
      console.error("Customer search error:", error);
      setCustomerFound("Customer search failed");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Safety net: ensure we only filter if items exists
  const filteredItems = (items || []).filter((item) => {
    const itemName = String(item.item_name || "").toLowerCase();
    const itemCode = String(item.item_code || "").toLowerCase();
    const searchValue = search.toLowerCase();

    return (
      itemName.includes(searchValue) || itemCode.includes(searchValue)
    );
  });

  const addToCart = (item) => {
    if (Number(item.stock_qty) <= 0) {
      setMessage("This item is out of stock");
      return;
    }

    const existing = cart.find((cartItem) => cartItem.id === item.id);

    if (existing) {
      if (existing.qty >= Number(item.stock_qty)) {
        setMessage("Not enough pieces in stock");
        return;
      }

      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                qty: cartItem.qty + 1,
                amount: (cartItem.qty + 1) * Number(cartItem.sale_price),
              }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          qty: 1,
          amount: Number(item.sale_price) || 0,
        },
      ]);
    }

    setMessage("");
  };

  const updateQty = (id, qty) => {
    let value = Number(qty);

    if (!Number.isFinite(value) || value < 1) {
      value = 1;
    }

    const selectedItem = items.find((item) => item.id === id);

    if (selectedItem && value > Number(selectedItem.stock_qty)) {
      setMessage("Not enough pieces in stock");
      value = Number(selectedItem.stock_qty);
    } else {
      setMessage("");
    }

    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: value,
              amount: value * Number(item.sale_price),
            }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const discountPercent = Number(discount) || 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountAmount;

  const saveBill = async () => {
    if (cart.length === 0) {
      setMessage("Add at least one item");
      return;
    }

    const billData = {
      customer_name: customer.name,
      customer_mobile: customer.mobile,
      items: cart,
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      grand_total: grandTotal,
      paid_amount: paymentMode === "Due" ? 0 : grandTotal,
      due_amount: paymentMode === "Due" ? grandTotal : 0,
      payment_mode: paymentMode,
    };

    try {
      setMessage("Bill save ho raha hai...");

      const res = await fetch("https://rajni-backend.onrender.com/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billData),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Bill save failed");
        return;
      }

      const savedBillId = data.bill_id;

      setCart([]);
      setCustomer({ name: "", mobile: "" });
      setCustomerFound("");
      setDiscount(0);
      setPaymentMode("Cash");

      await fetchItems();

      navigate(`/bill-print/${savedBillId}`);
    } catch (error) {
      console.error("Bill save error:", error);
      setMessage("Bill save failed");
    }
  };

 // ... keep your imports and logic the same
  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1>Billing</h1>
        <p>Create bill, calculate total and save invoice</p>
      </div>

      <div className="billing-layout">
        {/* Left Side: Items */}
        <div className="billing-left">
          <input
            className="search-input"
            placeholder="Search item by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="item-list">
            {filteredItems.map((item) => (
              <div className="card" key={item.id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{item.item_name}</strong>
                  <p>Pieces: {item.stock_qty}</p>
                </div>
                <button className="gold-btn" onClick={() => addToCart(item)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cart */}
        <div className="billing-right card">
          <h2>Bill Cart</h2>
          {/* ... inputs for Customer Name/Mobile ... */}
          
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <span>{item.item_name}</span>
                <span>₹{item.amount}</span>
              </div>
            ))}
          </div>

          <div className="total-box">
             {/* Total calculations */}
          </div>

          <button className="gold-btn" style={{ width: '100%', marginTop: '1rem' }} onClick={saveBill}>
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
// ... 
}

export default Billing;