import React, { useState, useEffect } from 'react';
import API from '../../utils/axiosAuth';
import './ManageHotels.css';

export default function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', location: ''
  });
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({ name: '', city: '', status: 'active' });
  const [adminCity, setAdminCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdminProfile();
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  const fetchAdminProfile = () => {
    API.get('/admin/profile')
      .then(res => {
        setAdminCity(res.data.assigned_city || '');
      })
      .catch(() => {
        showMessage('error', 'Failed to fetch admin city');
      });
  };

  const fetchHotels = () => {
    setIsLoading(true);
    API.get('/hotel')
      .then(res => {
        let filtered = res.data;

        if (filters.name) {
          filtered = filtered.filter(h => h.name.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.city) {
          filtered = filtered.filter(h => (h.city || '').toLowerCase().includes(filters.city.toLowerCase()));
        }
        filtered = filtered.filter(h => h.is_active === (filters.status === 'active'));

        setHotels(filtered);
        setIsLoading(false);
      })
      .catch(err => {
        showMessage('error', err.response?.data?.error || 'Failed to load hotels');
        setIsLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const apiCall = editId
      ? API.put(`/hotel/${editId}`, formData)
      : API.post('/admin/create_hotel', formData);

    apiCall
      .then(() => {
        fetchHotels();
        setFormData({ name: '', phone: '', address: '', location: '' });
        setEditId(null);
        setIsLoading(false);
      })
      .catch(err => {
        showMessage('error', err.response?.data?.error || 'Action failed');
        setIsLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      setIsLoading(true);
      API.delete(`/hotel/${id}`)
        .then(() => {
          fetchHotels();
          setIsLoading(false);
        })
        .catch(err => {
          showMessage('error', err.response?.data?.error || 'Delete failed');
          setIsLoading(false);
        });
    }
  };

  const toggleStatus = (id) => {
    API.put(`/hotel/${id}/toggle-status`)
      .then(response => {
        const newStatus = response.data.status;
        setHotels(prevHotels =>
          prevHotels.map(h =>
            h.id === id ? { ...h, is_active: newStatus } : h
          )
        );
      })
      .catch(err => {
        showMessage('error', err.response?.data?.error || 'Status update failed');
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
  };

  const showMessage = (type, text) => {
    if (type === 'success') return;
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters(prev => ({ ...prev, name: '', city: '' }));
  };

  const toggleStatusFilter = () => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active'
    }));
  };

  return (
    <div className="hotels-page">
      <h2>Manage Hotels</h2>
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <p className="fixed-city">
        Fixed City / Assigned Area: <strong>{adminCity}</strong>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="hotel-form">
        <input
          type="text"
          placeholder="Hotel Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          required
        />
        <button type="submit" className="admin-button">
          {editId ? 'Update Hotel' : 'Create Hotel'}
        </button>
      </form>

      {/* Filter section */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by Hotel Name"
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          placeholder="Search by City"
          name="city"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <button className="admin-button" onClick={clearFilters}>
          Clear Filters
        </button>
        <button
          className={`admin-button ${filters.status === 'active' ? 'active' : 'inactive'}`}
          onClick={toggleStatusFilter}
        >
          {filters.status === 'active' ? 'Active Hotels' : 'Inactive Hotels'}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p>Loading hotels...</p>
      ) : (
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Location</th>
              <th>City</th>
              <th>Status</th>
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
                <td>{h.city || 'N/A'}</td>
                <td>
                  <span
                    style={{
                      color: h.is_active ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    {h.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-button edit"
                    onClick={() => handleEdit(h)}
                  >
                    Edit
                  </button>
                  <button
                    className={`admin-button toggle ${h.is_active ? 'inactive' : 'active'}`}
                    onClick={() => toggleStatus(h.id)}
                  >
                    {h.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="admin-button delete"
                    onClick={() => handleDelete(h.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
