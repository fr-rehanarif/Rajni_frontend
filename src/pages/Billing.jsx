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

  return (
    <div>
      <h1>Billing</h1>
      <p>Create bill, calculate total and save invoice</p>

      <div className="billing-layout">
        <div className="billing-left">
          <input
            className="search-input"
            placeholder="Search item by name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="item-list">
            {filteredItems.map((item) => (
              <div className="item-card" key={item.id}>
                <div>
                  <h3>{item.item_name}</h3>
                  <p>
                    {item.item_code} • {item.category} • Pieces: {item.stock_qty}
                  </p>
                </div>
                <div>
                  <strong>₹{item.sale_price}</strong>
                  <button onClick={() => addToCart(item)}>Add</button>
                </div>
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
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              placeholder="Mobile Number"
              value={customer.mobile}
              onChange={(e) => {
                const mobile = e.target.value;
                setCustomer({ ...customer, mobile });
                searchCustomerByMobile(mobile);
              }}
            />
          </div>

          {customerFound && (
            <div className="customer-found">{customerFound}</div>
          )}

          <div className="cart-list">
            {cart.length === 0 ? (
              <p>No item added</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.item_name}</strong>
                    <p>₹{item.sale_price}</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, e.target.value)}
                  />
                  <strong>₹{item.amount}</strong>
                  <button onClick={() => removeFromCart(item.id)}>X</button>
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

          {message && <div className="page-message">{message}</div>}
        </div>
      </div>
    </div>
  );
}

export default Billing;