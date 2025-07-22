import React, { useState, useEffect } from 'react';
import API from '../utils/axiosAuth';
import './ManageHotels.css';

export default function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', location: ''
  });
  const [editId, setEditId] = useState(null);
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

  const handleInput = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const apiCall = editId
      ? API.put(`/admin/hotel/${editId}`, formData)
      : API.post('/admin/create_hotel', formData);

    apiCall
      .then(() => {
        fetchHotels();
        setFormData({ name: '', phone: '', address: '', location: '' });
        setEditId(null);
        showMessage('success', editId ? 'Hotel updated successfully!' : 'Hotel created successfully!');
        setIsLoading(false);
      })
      .catch(err => {
        showMessage('error', err.response?.data?.error || 'Action failed');
        setIsLoading(false);
      });
  };

  const handleEdit = (hotel) => {
    setFormData({
      name: hotel.name,
      phone: hotel.phone,
      address: hotel.address,
      location: hotel.location
    });
    setEditId(hotel.id);
    document.querySelector('.hotel-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      setIsLoading(true);
      API.delete(`/admin/hotel/${id}`)
        .then(() => {
          fetchHotels();
          showMessage('success', 'Hotel deleted successfully!');
          setIsLoading(false);
        })
        .catch(err => {
          showMessage('error', err.response?.data?.error || 'Delete failed');
          setIsLoading(false);
        });
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const cancelEdit = () => {
    setFormData({ name: '', phone: '', address: '', location: '' });
    setEditId(null);
  };

  return (
    <div className="hotel-management">
      <h2 className="admin-title">Hotel Management</h2>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="hotel-form">
        <h3>{editId ? "Edit Hotel" : "Create New Hotel"}</h3>
        <input name="name" placeholder="Hotel Name" value={formData.name} onChange={handleInput} required disabled={isLoading} />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInput} required maxLength={10} pattern="[0-9]{10}" disabled={isLoading} />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleInput} required disabled={isLoading} />
        <input name="location" placeholder="Location/City" value={formData.location} onChange={handleInput} required disabled={isLoading} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={isLoading} className="admin-button">
            {isLoading ? 'Processing...' : editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="admin-button cancel">Cancel</button>
          )}
        </div>
      </form>

      <form onSubmit={handleFilterSubmit} className="hotel-filter">
        <input name="name" placeholder="Search name..." value={filters.name} onChange={handleFilterChange} disabled={isLoading} />
        <input name="location" placeholder="Search location..." value={filters.location} onChange={handleFilterChange} disabled={isLoading} />
        <button type="submit" disabled={isLoading} className="admin-button">Search</button>
        {(filters.name || filters.location) && (
          <button type="button" onClick={() => { setFilters({ name: '', location: '' }); setTimeout(fetchHotels, 100); }} className="admin-button cancel">Clear</button>
        )}
      </form>

      {isLoading && <div className="loading"><div className="loading-spinner">Loading...</div></div>}

      {!isLoading && hotels.length === 0 && (
        <div className="empty-state">
          <h3>No hotels found</h3>
          <p>Try different filters or create one</p>
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
              <th>Actions</th>
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
                <td>
                  <button onClick={() => handleEdit(h)} className="admin-button edit">Edit</button>
                  <button onClick={() => handleDelete(h.id)} className="admin-button delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
