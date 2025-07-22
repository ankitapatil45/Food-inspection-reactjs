// src/pages/HotelList.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/axiosAuth';
import './ManageHotels.css'; // using the same CSS

export default function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState({ name: '', location: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchHotels();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchHotels = () => {
    setIsLoading(true);
    API.get('/hotels', { params: filters })
      .then(res => {
        setHotels(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        showMessage('error', err.response?.data?.error || 'Failed to load hotels');
        setIsLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  return (
    <div className="hotel-management">
      <h2 className="admin-title"> Hotel List</h2>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleFilterSubmit} className="hotel-filter">
        <input
          name="name"
          placeholder="Search name..."
          value={filters.name}
          onChange={handleFilterChange}
          disabled={isLoading}
        />
        <input
          name="location"
          placeholder="Search location..."
          value={filters.location}
          onChange={handleFilterChange}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="admin-button">Search</button>
        {(filters.name || filters.location) && (
          <button
            type="button"
            onClick={() => {
              setFilters({ name: '', location: '' });
              setTimeout(fetchHotels, 100);
            }}
            className="admin-button cancel"
          >
            Clear
          </button>
        )}
      </form>

      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {!isLoading && hotels.length === 0 && (
        <div className="empty-state">
          <h3>No hotels found</h3>
          <p>Try different filters</p>
        </div>
      )}

      {!isLoading && hotels.length > 0 && (
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Location</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.phone}</td>
                <td>{h.address}</td>
                <td>{h.location}</td>
                <td>{h.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
