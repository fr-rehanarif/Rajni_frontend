import { useEffect, useState } from "react";
import api from "../services/api";

function ProductForm({ onProductAdded, editProduct }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    purchase_price: "",
    selling_price: "",
  });

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || "",
        category: editProduct.category || "",
        stock: editProduct.stock || "",
        purchase_price: editProduct.purchase_price || "",
        selling_price: editProduct.selling_price || "",
      });
    }
  }, [editProduct]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.selling_price) {
      alert("Product name and selling price required");
      return;
    }

    try {
      const payload = {
        name: form.name,
        category: form.category,
        stock: Number(form.stock || 0),
        purchase_price: Number(form.purchase_price || 0),
        selling_price: Number(form.selling_price || 0),
      };

      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      onProductAdded();
    } catch {
      alert(editProduct ? "Product update failed" : "Product add failed");
    }
  };

  return (
    <form className="modal-product-form" onSubmit={handleSubmit}>
      <div className="form-group full">
        <label>Product Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Red Silk Saree"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Silk"
        />
      </div>

      <div className="form-group">
        <label>Stock</label>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          placeholder="10"
        />
      </div>

      <div className="form-group">
        <label>Purchase Price</label>
        <input
          name="purchase_price"
          type="number"
          value={form.purchase_price}
          onChange={handleChange}
          placeholder="1200"
        />
      </div>

      <div className="form-group">
        <label>Selling Price</label>
        <input
          name="selling_price"
          type="number"
          value={form.selling_price}
          onChange={handleChange}
          placeholder="2500"
        />
      </div>

      <button className="modal-submit" type="submit">
        {editProduct ? "Update Product" : "Save Product"}
      </button>
    </form>
  );
}

export default ProductForm;