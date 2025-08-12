import React, { useState } from "react";
import AddAdminForm from "./AddAdminForm";
import AdminList from "./AdminList";
import HotelList from "./HotelList";
import WorkerList from "./WorkerList";
import SearchAdminWithWorkers from "./AdminSearchWithWorkers";
import SuperAdminMedia from "./SuperAdminMedia";
import './SuperAdminDashboard.css';

import { FaUserPlus, FaUsers, FaHotel, FaUserTie, FaSearch, FaPhotoVideo } from "react-icons/fa";

export default function SuperAdminDashboard() {
  const [activeSection, setActiveSection] = useState("welcome");

  const options = [
    { title: 'Add Admin', section: 'add-admin', icon: <FaUserPlus /> },
    { title: 'Admin List', section: 'admin-list', icon: <FaUsers /> },
    { title: 'Hotel List', section: 'hotel-list', icon: <FaHotel /> },
    { title: 'Worker List', section: 'worker-list', icon: <FaUserTie /> },
    { title: 'Admin + Worker', section: 'search-admin', icon: <FaSearch /> },
    { title: 'View Media', section: 'view-media', icon: <FaPhotoVideo /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "add-admin": return <AddAdminForm />;
      case "admin-list": return <AdminList />;
      case "hotel-list": return <HotelList />;
      case "worker-list": return <WorkerList />;
      case "search-admin": return <SearchAdminWithWorkers />;
      case "view-media": return <SuperAdminMedia />;
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
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar scroll-on-hover">
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
              <span className="icon">{opt.icon}</span>
              <span className="menu-text">{opt.title}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="admin-main-content">
        {renderSection()}
      </main>
    </div>
  );
}
