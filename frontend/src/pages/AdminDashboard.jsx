// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import './AdminDashboard.css';
import ManageWorkers from './ManageWorkers';
import ManageHotels from './ManageHotels';
import AllWorkersList from './AllWorkersList';
import AdminMedia from './AdminMedia';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('welcome');
  const admin = JSON.parse(localStorage.getItem('user'));

  const options = [
    { title: 'Manage Workers', section: 'workers' },
    { title: 'All Workers', section: 'all_workers' },
    { title: 'Manage Hotels', section: 'hotels' },
    { title: 'Submitted Media', section: 'videos' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'workers':
        return <ManageWorkers />;
      case 'all_workers':
        return <AllWorkersList />;
      case 'hotels':
        return <ManageHotels />;
      case 'videos':
        return <AdminMedia />;
      default:
        return (
          <div className="admin-welcome">
            <h2 className="admin-title">Welcome, {admin?.username} </h2>
            <p><strong>Admin ID:</strong> {admin?.id}</p>
            <p><strong>Assigned Area:</strong> {admin?.city || 'Not assigned'}</p>
            <p className="admin-subtext">Use the sidebar menu to manage workers, hotels, and media submissions.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="admin-sidebar">
        {admin && (
          <div className="admin-info-section">
            <div className="admin-info-title">Admin Info</div>
            <div className="admin-info-item"><strong>ID:</strong> {admin.id}</div>
            <div className="admin-info-item"><strong>Username:</strong> {admin.username}</div>
            <div className="admin-info-item"><strong>Area:</strong> {admin.city || 'Unassigned'}</div>
          </div>
        )}
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

export default AdminDashboard;
