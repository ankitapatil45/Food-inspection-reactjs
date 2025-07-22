import React, { useState } from "react";
import AddAdminForm from "./AddAdminForm";
import AdminList from "./AdminList";
import HotelList from "./HotelList";
import WorkerList from "./WorkerList";
import SearchAdminWithWorkers from "./AdminSearchWithWorkers";
import SuperAdminMedia from "./SuperAdminMedia";
import './AdminDashboard.css'; // ✅ Reuse existing CSS

export default function SuperAdminDashboard() {
  const [activeSection, setActiveSection] = useState("welcome");

  const options = [
    { title: 'Add Admin', section: 'add-admin' },
    { title: 'Admin List', section: 'admin-list' },
    { title: 'Hotel List', section: 'hotel-list' },
    { title: 'Worker List', section: 'worker-list' },
    { title: 'Search Admin + Workers', section: 'search-admin' },
    { title: 'Submitted Media', section: 'view-media' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "add-admin":
        return <AddAdminForm />;
      case "admin-list":
        return <AdminList />;
      case "hotel-list":
        return <HotelList />;
      case "worker-list":
        return <WorkerList />;
      case "search-admin":
        return <SearchAdminWithWorkers />;
      case "view-media":
        return <SuperAdminMedia />;
      default:
        return (
          <div className="admin-welcome">
            <h2 className="admin-title">Welcome, Super Admin</h2>
            <p className="admin-subtext">Use the sidebar menu to manage admins, workers, hotels, and media submissions.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="admin-sidebar">
        <div className="admin-info-section">
          <div className="admin-info-title">Super Admin Info</div>
          <div className="admin-info-item"><strong>Role:</strong> Super Admin</div>
        </div>
        <div className="sidebar-content">
          {options.map((opt, i) => (
            <div
              key={i}
              className={`menu-item ${activeSection === opt.section ? 'active' : ''}`}
              onClick={() => setActiveSection(opt.section)}
            >
              <span className="menu-text">{opt.title}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="admin-main-content">
        {renderSection()}
      </main>
    </>
  );
}
