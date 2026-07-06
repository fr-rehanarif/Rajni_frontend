import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [activity, setActivity] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const addActivity = (text) => {
    const item = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const oldActivity = JSON.parse(
      localStorage.getItem("inventoryActivity") || "[]"
    );

    const updated = [item, ...oldActivity].slice(0, 5);

    localStorage.setItem("inventoryActivity", JSON.stringify(updated));
    setActivity(updated);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch {
      alert("Products load failed");
    }
  };

  useEffect(() => {
    fetchProducts();

    const savedActivity = JSON.parse(
      localStorage.getItem("inventoryActivity") || "[]"
    );
    setActivity(savedActivity);
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteProduct.id}`);

      addActivity(`Deleted product: ${deleteProduct.name}`);

      setDeleteProduct(null);
      setSelectedProduct(null);
      fetchProducts();
    } catch {
      alert("Product delete failed");
    }
  };

  const categories = useMemo(() => {
    const unique = products.map((p) => p.category).filter(Boolean);
    return ["all", ...new Set(unique)];
  }, [products]);

  const sortOptions = [
    { value: "latest", label: "Latest Added" },
    { value: "lowest-stock", label: "Lowest Stock" },
    { value: "highest-stock", label: "Highest Stock" },
    { value: "highest-profit", label: "Highest Profit" },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (sortBy === "lowest-stock") {
      list.sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
    }

    if (sortBy === "highest-stock") {
      list.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
    }

    if (sortBy === "highest-profit") {
      list.sort((a, b) => {
        const profitA =
          Number(a.selling_price || 0) - Number(a.purchase_price || 0);
        const profitB =
          Number(b.selling_price || 0) - Number(b.purchase_price || 0);

        return profitB - profitA;
      });
    }

    return list;
  }, [products, search, category, sortBy]);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  );

  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.purchase_price || 0) * Number(p.stock || 0),
    0
  );

  const lowStock = products.filter((p) => {
    const stock = Number(p.stock || 0);
    return stock > 0 && stock <= 5;
  }).length;

  const outOfStock = products.filter(
    (p) => Number(p.stock || 0) === 0
  ).length;

  const healthyProducts = products.filter(
    (p) => Number(p.stock || 0) > 15
  ).length;

  const mediumStock = products.filter((p) => {
    const stock = Number(p.stock || 0);
    return stock > 5 && stock <= 15;
  }).length;

  const mostProfitable = [...products].sort((a, b) => {
    const profitA =
      Number(a.selling_price || 0) - Number(a.purchase_price || 0);
    const profitB =
      Number(b.selling_price || 0) - Number(b.purchase_price || 0);

    return profitB - profitA;
  })[0];

  const highestStockProduct = [...products].sort(
    (a, b) => Number(b.stock || 0) - Number(a.stock || 0)
  )[0];

  const averageMargin =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => {
            const selling = Number(p.selling_price || 0);
            const purchase = Number(p.purchase_price || 0);
            const margin =
              selling > 0 ? ((selling - purchase) / selling) * 100 : 0;

            return sum + margin;
          }, 0) / products.length
        )
      : 0;

  const selectedCategoryLabel =
    category === "all" ? "All Categories" : category;

  const selectedSortLabel =
    sortOptions.find((item) => item.value === sortBy)?.label || "Latest Added";

  const selectedProfit = selectedProduct
    ? Number(selectedProduct.selling_price || 0) -
      Number(selectedProduct.purchase_price || 0)
    : 0;

  const selectedMargin =
    selectedProduct && Number(selectedProduct.selling_price || 0) > 0
      ? Math.round(
          (selectedProfit / Number(selectedProduct.selling_price || 0)) * 100
        )
      : 0;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Inventory</h1>
          <p>Manage saree stock, pricing and categories.</p>
        </div>

        <div className="inventory-actions">
          <div className="product-count">{products.length} Products</div>

          <button
            className="add-product-main"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="inventory-stat-card">
          <span>Total Products</span>
          <h2>{totalProducts}</h2>
        </div>

        <div className="inventory-stat-card">
          <span>Total Stock</span>
          <h2>{totalStock}</h2>
        </div>

        <div className="inventory-stat-card">
          <span>Inventory Value</span>
          <h2>₹{inventoryValue.toLocaleString("en-IN")}</h2>
        </div>

        <div className="inventory-stat-card danger">
          <span>Low Stock</span>
          <h2>{lowStock}</h2>
        </div>
      </div>

      <div className="inventory-health-grid">
        <div className="health-card green">
          <span>Healthy Products</span>
          <h3>{healthyProducts}</h3>
        </div>

        <div className="health-card yellow">
          <span>Medium Stock</span>
          <h3>{mediumStock}</h3>
        </div>

        <div className="health-card orange">
          <span>Low Stock</span>
          <h3>{lowStock}</h3>
        </div>

        <div className="health-card red">
          <span>Out Of Stock</span>
          <h3>{outOfStock}</h3>
        </div>
      </div>

      <div className="inventory-insights-grid">
        <div className="insight-mini-card">
          <span>Most Profitable</span>
          <h3>{mostProfitable?.name || "-"}</h3>
        </div>

        <div className="insight-mini-card">
          <span>Highest Stock</span>
          <h3>{highestStockProduct?.name || "-"}</h3>
        </div>

        <div className="insight-mini-card">
          <span>Average Margin</span>
          <h3>{averageMargin}%</h3>
        </div>
      </div>

      <div className="inventory-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or category..."
        />

        <div className="premium-dropdown">
          <button
            className="premium-dropdown-btn"
            onClick={() => {
              setShowCategoryMenu(!showCategoryMenu);
              setShowSortMenu(false);
            }}
            type="button"
          >
            {selectedCategoryLabel}
            <span>⌄</span>
          </button>

          {showCategoryMenu && (
            <div className="premium-dropdown-menu">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`premium-dropdown-item ${
                    category === cat ? "active" : ""
                  }`}
                  onClick={() => {
                    setCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                >
                  {cat === "all" ? "All Categories" : cat}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="premium-dropdown">
          <button
            className="premium-dropdown-btn"
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowCategoryMenu(false);
            }}
            type="button"
          >
            {selectedSortLabel}
            <span>⌄</span>
          </button>

          {showSortMenu && (
            <div className="premium-dropdown-menu">
              {sortOptions.map((item) => (
                <div
                  key={item.value}
                  className={`premium-dropdown-item ${
                    sortBy === item.value ? "active" : ""
                  }`}
                  onClick={() => {
                    setSortBy(item.value);
                    setShowSortMenu(false);
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="inventory-content-grid">
        <div>
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={(product) => setDeleteProduct(product)}
            onView={(product) => setSelectedProduct(product)}
          />
        </div>

        <div className="activity-card">
          <div className="activity-head">
            <h3>Inventory Activity</h3>
            <span>Recent</span>
          </div>

          {activity.length === 0 ? (
            <div className="activity-empty">
              No recent inventory activity.
            </div>
          ) : (
            activity.map((item) => (
              <div className="activity-item" key={item.id}>
                <div className="activity-dot"></div>
                <div>
                  <p>{item.text}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedProduct && (
        <div
          className="drawer-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <aside
            className="product-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <span className="drawer-kicker">Product Details</span>
                <h2>{selectedProduct.name}</h2>
                <p>{selectedProduct.category || "No category"}</p>
              </div>

              <button
                className="drawer-close"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>

            <div className="drawer-stock-box">
              <span>Current Stock</span>
              <strong>{selectedProduct.stock}</strong>
            </div>

            <div className="drawer-grid">
              <div>
                <span>Purchase Price</span>
                <strong>
                  ₹
                  {Number(selectedProduct.purchase_price || 0).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>Selling Price</span>
                <strong>
                  ₹
                  {Number(selectedProduct.selling_price || 0).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>Profit / Item</span>
                <strong className="drawer-profit">
                  ₹{selectedProfit.toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Margin</span>
                <strong>{selectedMargin}%</strong>
              </div>
            </div>

            <div className="drawer-total-card">
              <span>Total Stock Value</span>
              <strong>
                ₹
                {(
                  Number(selectedProduct.purchase_price || 0) *
                  Number(selectedProduct.stock || 0)
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="drawer-actions">
              <button
                className="drawer-edit"
                onClick={() => handleEdit(selectedProduct)}
              >
                Edit Product
              </button>

              <button
                className="drawer-delete"
                onClick={() => {
                  setDeleteProduct(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Delete
              </button>
            </div>
          </aside>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop">
          <div className="product-modal">
            <div className="modal-head">
              <div>
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <p>
                  {editingProduct
                    ? "Update saree stock details."
                    : "Add saree stock details to inventory."}
                </p>
              </div>

              <button
                className="close-modal"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              >
                ×
              </button>
            </div>

            <ProductForm
              editProduct={editingProduct}
              onProductAdded={() => {
                addActivity(
                  editingProduct
                    ? `Updated product: ${editingProduct.name}`
                    : "Added new product"
                );

                fetchProducts();
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {deleteProduct && (
        <div className="modal-backdrop">
          <div className="delete-modal">
            <h2>Delete Product?</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteProduct.name}</strong>?
            </p>

            <div className="delete-actions">
              <button
                className="cancel-delete"
                onClick={() => setDeleteProduct(null)}
              >
                Cancel
              </button>

              <button className="confirm-delete" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;