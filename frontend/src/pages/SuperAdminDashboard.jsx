// src/pages/SuperAdminDashboard.jsx
import React from "react";
import AddAdminForm from "../pages/AddAdminForm";
import './SuperAdminDashboard.css';

export default function SuperAdminDashboard() {
  return (
    <div className="superadmin-container">
      <h1>Welcome, Super Admin</h1>
      <AddAdminForm />
    </div>
  );
}
