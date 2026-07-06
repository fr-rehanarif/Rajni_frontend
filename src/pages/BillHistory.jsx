import { useEffect, useState } from "react";
import api from "../services/api";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/sales");

      const data = Array.isArray(res.data?.sales)
        ? res.data.sales
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setBills(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load bill history.");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const q = search.toLowerCase().trim();

    if (!q) return true;

    const searchableText = [
      bill.bill_no,
      bill.customer_name,
      bill.customer_mobile,
      bill.payment_mode,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(q);
  });

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading Bills...</div>;
  }

  if (error) {
    return <div style={{ padding: "30px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Bill History</h1>

      <input
        type="text"
        placeholder="Search Bill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          borderRadius: "10px",
          border: "1px solid #ddd",
        }}
      />

      {filteredBills.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          No Bills Found
        </div>
      ) : (
        filteredBills.map((bill) => (
          <div
            key={bill.id}
            style={{
              background: "#fff",
              padding: "20px",
              marginBottom: "15px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h3>{bill.bill_no || "N/A"}</h3>

            <p>
              Customer: {bill.customer_name || "-"}
            </p>

            <p>
              Mobile: {bill.customer_mobile || "-"}
            </p>

            <p>
              Total: ₹
              {Number(bill.grand_total || 0).toLocaleString("en-IN")}
            </p>

            <p>
              Payment: {bill.payment_mode || "-"}
            </p>

            <p>
              Date: {" "}
              {bill.created_at
                ? new Date(bill.created_at).toLocaleDateString("en-IN")
                : "-"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default BillHistory;
