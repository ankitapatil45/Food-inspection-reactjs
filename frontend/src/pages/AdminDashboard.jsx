import React, { useState } from 'react';
import './AdminDashboard.css';
import ManageWorkers from './ManageWorkers';
import ManageHotels from './ManageHotels';
 // ✅ Import added

function AdminDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('welcome');

  // ✅ Get logged in admin data from localStorage
  const admin = JSON.parse(localStorage.getItem('user'));
  console.log("Logged in Admin 👉", admin); // Debug purpose

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const options = [
    { icon: '👷', title: 'Manage Workers', section: 'workers' },
    { icon: '🏨', title: 'Manage Hotels', section: 'hotels' },
    { icon: '🧪', title: 'View Samples', section: 'samples' },
    { icon: '🎥', title: 'Submitted Videos', section: 'videos' },
    { icon: '📍', title: 'Worker Locations', section: 'locations' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'workers':
        return <ManageWorkers />;
      case 'hotels':
        return <ManageHotels />; // ✅ New section added
      default:
        return (
          <div className="admin-card">
            <h2 className="admin-heading">👷 Worker Management</h2>

            {/* ✅ Assigned Area Display */}
            {admin?.city ? (
              <p className="admin-area-label">📍 Area: {admin.city}</p>
            ) : (
              <p className="admin-area-label" style={{ color: 'gray' }}>📍 Area: Not assigned</p>
            )}

            <p className="admin-subtext">Use the sidebar menu to manage the system.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="admin-sidebar" style={{ left: isMenuOpen ? '0' : '-250px' }}>
        <h3 className="admin-menu-header">🛠️ Admin Menu</h3>
        <ul className="admin-menu-list">
          {options.map((opt, i) => (
            <li
              key={i}
              className="admin-menu-item"
              onClick={() => setActiveSection(opt.section)}
            >
              <span className="admin-menu-icon">{opt.icon}</span>
              <span>{opt.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={toggleMenu} className="admin-menu-button">☰ Menu</button>

      <div className="admin-page">
        <div className="admin-content">
          {renderSection()}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
