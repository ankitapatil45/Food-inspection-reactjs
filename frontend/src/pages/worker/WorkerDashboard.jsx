import React, { useState } from 'react';
import './WorkerDashboard.css';
import WorkerHotelList from './WorkerHotelList';
import SubmitVideo from './SubmitVideo';
import WorkerMedia from './WorkerMedia';
import WorkerLocation from './WorkerLocation';

import { FaHotel, FaVideo, FaPhotoVideo, FaMapMarkerAlt } from 'react-icons/fa';

export default function WorkerDashboard() {
  const [activeSection, setActiveSection] = useState('welcome');
  const worker = JSON.parse(sessionStorage.getItem('user'));

  const options = [
    { title: 'View Hotels', section: 'hotels', icon: <FaHotel /> },
    { title: 'Submit Video', section: 'video', icon: <FaVideo /> },
    { title: 'My Media', section: 'media', icon: <FaPhotoVideo /> },
    { title: 'Live Location', section: 'location', icon: <FaMapMarkerAlt /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'hotels':
        return <WorkerHotelList />;
      case 'video':
        return <SubmitVideo />;
      case 'media':
        return <WorkerMedia />;
      case 'location':
        return <WorkerLocation />;
      default:
        return (
          <div className="admin-welcome">
            <h2 className="admin-title">Welcome, {worker?.username || 'Worker'}!</h2>
            <p className="admin-subtext">
              Use the sidebar menu to view hotels, submit videos, and share your location.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="admin-info-section">
          <div className="admin-info-title">Worker Info</div>
          <div className="admin-info-item"><strong>ID:</strong> {worker?.id}</div>
          <div className="admin-info-item"><strong>Username:</strong> {worker?.username}</div>
          <div className="admin-info-item"><strong>Area:</strong> {worker?.city || 'Unassigned'}</div>
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
