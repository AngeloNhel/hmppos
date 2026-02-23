import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const role = decoded.role;

    if (allowedRoles && !allowedRoles.includes(role)) {
      // redirect based on role
      if (role === "admin") return <Navigate to="/admin" />;
      if (role === "cashier") return <Navigate to="/pos" />;
      return <Navigate to="/" />;
    }
  } catch (err) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;