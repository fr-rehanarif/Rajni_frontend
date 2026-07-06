function ProductTable({ products, onEdit, onDelete, onView }) {
  const getStockStatus = (stock) => {
    const qty = Number(stock || 0);

    if (qty === 0) {
      return {
        label: "Out of Stock",
        className: "stock-out",
      };
    }

    if (qty <= 5) {
      return {
        label: `Low (${qty})`,
        className: "stock-low",
      };
    }

    if (qty <= 15) {
      return {
        label: `Medium (${qty})`,
        className: "stock-medium",
      };
    }

    return {
      label: `Healthy (${qty})`,
      className: "stock-ok",
    };
  };

  return (
    <div className="product-table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Stock Health</th>
            <th>Purchase</th>
            <th>Selling</th>
            <th>Profit</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const profit =
              Number(product.selling_price || 0) -
              Number(product.purchase_price || 0);

            const stockStatus = getStockStatus(product.stock);

            return (
              <tr
                key={product.id}
                onClick={() => onView(product)}
                className="clickable-row"
              >
                <td>
                  <strong>{product.name}</strong>
                </td>

                <td>{product.category || "-"}</td>

                <td>
                  <span className={stockStatus.className}>
                    {stockStatus.label}
                  </span>
                </td>

                <td>₹{product.purchase_price}</td>
                <td>₹{product.selling_price}</td>

                <td>
                  <span className="profit-badge">
                    ₹{profit.toLocaleString("en-IN")}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="empty-state">
          <h3>No products added yet</h3>
          <p>Click “Add Product” to start building your inventory.</p>
        </div>
      )}
    </div>
  );
}

export default ProductTable;