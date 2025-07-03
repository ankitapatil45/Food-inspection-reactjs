import React, { useState, useEffect } from 'react';
import API from '../utils/axiosAuth'; // Axios wrapper with auth token
import './ManageHotels.css'; // Optional for styling

export default function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', location: ''
  });
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({ name: '', location: '' });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = () => {
    API.get('/hotels', { params: filters })
      .then(res => setHotels(res.data))
      .catch(err => alert(err.response?.data?.error || 'Failed to load hotels'));
  };

  const handleInput = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const apiCall = editId
      ? API.put(`/admin/hotel/${editId}`, formData)
      : API.post('/admin/create_hotel', formData);

    apiCall
      .then(() => {
        fetchHotels();
        setFormData({ name: '', phone: '', address: '', location: '' });
        setEditId(null);
      })
      .catch(err => alert(err.response?.data?.error || 'Action failed'));
  };

  const handleEdit = (hotel) => {
    setFormData({
      name: hotel.name,
      phone: hotel.phone,
      address: hotel.address,
      location: hotel.location
    });
    setEditId(hotel.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      API.delete(`/admin/hotel/${id}`)
        .then(() => fetchHotels())
        .catch(err => alert(err.response?.data?.error || 'Delete failed'));
    }
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
      <h2>🏨 Hotel Management</h2>

      {/* Create / Edit Form */}
      <form onSubmit={handleSubmit} className="hotel-form">
        <h3>{editId ? "Edit Hotel" : "Create Hotel"}</h3>
        <input name="name" placeholder="Hotel Name" value={formData.name} onChange={handleInput} required />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleInput} required />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleInput} required />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleInput} required />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
      </form>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className="hotel-filter">
        <input name="name" placeholder="Search by name" value={filters.name} onChange={handleFilterChange} />
        <input name="location" placeholder="Search by location" value={filters.location} onChange={handleFilterChange} />
        <button type="submit">Search</button>
      </form>

      {/* Hotel List */}
      <table className="hotel-table">
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>Address</th><th>Location</th><th>City</th><th>Actions</th>
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
                <button onClick={() => handleEdit(h)}>Edit</button>{' '}
                <button onClick={() => handleDelete(h.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
