function Navbar() {
  const admin = JSON.parse(localStorage.getItem("admin"));

  return (
    <header className="top-header">
      <div>
        <h1>Rajni Saree Center</h1>
        <p>Luxury Saree POS Command Center</p>
      </div>

      <input
        className="global-search"
        placeholder="Search product, customer, bill..."
      />

      <div className="admin-pill">
        {admin?.username || "Admin"}
      </div>
    </header>
  );
}

export default Navbar;