import React from "react";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h1>Admin Dashboard</h1>
        <p>Manage users, reports, and system settings efficiently.</p>
      </div>
    </>
  );
}

export default AdminDashboard;