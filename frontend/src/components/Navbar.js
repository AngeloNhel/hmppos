import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="nav-left">
        <h2 onClick={() => navigate("/admin")}>HMP POS</h2>
      </div>

      <div className="nav-center">
        <button onClick={() => navigate("/admin/account")}>Account</button>
        <button onClick={() => navigate("/admin/items")}>Items</button>
        <button onClick={() => navigate("/admin/stocks")}>Stocks</button>
        <button onClick={() => navigate("/admin/sales-report")}>Sales</button>
        <button onClick={() => navigate("/admin/critical-stocks")}>Critical</button>
        <button onClick={() => navigate("/admin/void-transactions")}>Void</button>
        <button onClick={() => navigate("/admin/sales-return")}>Return</button>
      </div>

      <div className="nav-right">
        <button onClick={logout}>Logout</button>
      </div>

    </nav>
  );
}

export default Navbar;