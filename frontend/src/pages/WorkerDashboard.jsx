// src/pages/WorkerDashboard.jsx

import React, { useState } from 'react';

function WorkerDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const options = [
    { icon: '🏨', title: 'View Hotels' },
    { icon: '🧪', title: 'Submit Sample' },
    { icon: '🎥', title: 'Submit Video' },
    { icon: '📜', title: 'My Submissions' },
    { icon: '📍', title: 'Submit Location' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, left: isMenuOpen ? '0' : '-250px' }}>
        <h3 style={styles.menuHeader}>📋 Worker Menu</h3>
        <ul style={styles.menuList}>
          {options.map((opt, i) => (
            <li key={i} style={styles.menuItem}>
              <span style={styles.icon}>{opt.icon}</span>
              <span>{opt.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Menu Button */}
      <button onClick={toggleMenu} style={styles.menuButton}>
        ☰ Menu
      </button>

      {/* Main Content */}
      <div style={styles.page}>
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Welcome, Worker! 👷</h2>
            <p style={styles.subtext}>Manage your tasks and submissions from the side menu.</p>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
  top: '72px',           // ✅ Navbar height
  bottom: 0,
  width: '250px',
  backgroundColor: '#1e3a8a',
  color: 'white',
  padding: '30px 20px',
  transition: 'left 0.3s ease-in-out',
  zIndex: 100,
  },
  menuHeader: {
    fontSize: '1.6rem',
    marginBottom: '25px',
    borderBottom: '1px solid rgba(255,255,255,0.3)',
    paddingBottom: '10px',
  },
  menuList: {
    listStyleType: 'none',
    padding: 0,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    fontSize: '1.1rem',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  icon: {
    marginRight: '12px',
    fontSize: '1.5rem',
  },
  menuButton: {
    position: 'fixed',
    top: '72px', // ✅ Navbar height below
    left: '20px',
    padding: '10px 18px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    zIndex: 999, // ✅ Stay on top of everything
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  page: {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    fontFamily: 'Segoe UI, sans-serif',
  },
  content: {
    marginLeft: '270px',
    padding: '100px 40px 40px 40px',
    width: '100%',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '12px',
    color: '#1f2937',
  },
  subtext: {
    fontSize: '1rem',
    color: '#555',
  },
};

export default WorkerDashboard;
