import React, { useState } from 'react';
import './WorkerDashboard.css';
import WorkerHotelList from './WorkerHotelList';
import SubmitVideo from './SubmitVideo';
import WorkerMedia from './WorkerMedia';
import WorkerLocation from './WorkerLocation';

function WorkerDashboard() {
  const [activeSection, setActiveSection] = useState('welcome');
  const worker = JSON.parse(localStorage.getItem('user'));

  const options = [
    { title: 'View Hotels', section: 'hotels' },
    { title: 'Submit Video', section: 'video' },
    { title: 'My Media', section: 'media' },
    { title: 'Live Location', section: 'location' },
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
          <div className="worker-welcome">
            <h2 className="admin-title">Welcome, {worker?.username || 'Worker'}!</h2>
            <p className="admin-subtext">
              Use the sidebar to submit videos, view hotels, and update your location.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className="worker-sidebar">
        {worker && (
          <div className="worker-info-section">
            <div className="worker-info-title">Worker Info</div>
            <div className="worker-info-item"><strong>ID:</strong> {worker.id}</div>
            <div className="worker-info-item"><strong>Name:</strong> {worker.username}</div>
            <div className="worker-info-item"><strong>Area:</strong> {worker.city || 'Unassigned'}</div>
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

      {/* Main Content */}
      <div className="worker-main-content">
        {renderSection()}
      </div>
    </>
  );
}

export default WorkerDashboard;
