import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      <h2>HMP POS System</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;