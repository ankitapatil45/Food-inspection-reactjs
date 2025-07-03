// src/pages/ManageWorkers.jsx

import React, { useEffect, useState } from 'react';
import API from '../utils/axiosAuth';
import './ManageHotels.css';

function ManageWorkers() {
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState({
    name: '', username: '', phone: '', email: '',
    address: '', assigned_area: '', password: '', confirm_password: ''
  });
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({ name: '', assigned_area: '' });

  const admin = JSON.parse(localStorage.getItem('user'));
  const loggedInAdminId = admin?.id;

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = () => {
    API.get('/admin/workers', { params: filters })
      .then((res) => setWorkers(res.data))
      .catch((err) => alert(err.response?.data?.error));
  };

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const apiCall = editId
      ? API.put(`/admin/worker/${editId}`, formData)
      : API.post('/admin/create-worker', formData); // ✅ fixed URL

    apiCall
      .then(() => {
        fetchWorkers();
        setFormData({
          name: '', username: '', phone: '', email: '',
          address: '', assigned_area: '', password: '', confirm_password: ''
        });
        setEditId(null);
      })
      .catch((err) => alert(err.response?.data?.error));
  };

  const handleEdit = (worker) => {
    setEditId(worker.id);
    setFormData({
      ...worker,
      password: '',
      confirm_password: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      API.delete(`/admin/worker/${id}`)
        .then(() => fetchWorkers())
        .catch((err) => alert(err.response?.data?.error));
    }
  };

  const handleToggle = (id) => {
    API.put(`/admin/worker/${id}/toggle-status`) // ✅ fixed URL
      .then(() => fetchWorkers())
      .catch((err) => alert(err.response?.data?.error));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  return (
    <div>
      <h2>Worker Management</h2>

      <form onSubmit={handleSubmit}>
        <h3>{editId ? "Edit Worker" : "Create Worker"}</h3>
        {['name', 'username', 'phone', 'email', 'address', 'assigned_area', 'password', 'confirm_password'].map((field) => (
          <input
            key={field}
            type={field.includes('password') ? 'password' : 'text'}
            name={field}
            value={formData[field] || ''}
            placeholder={field.replace('_', ' ')}
            onChange={handleInput}
            className="admin-input"
          />
        ))}
        <button type="submit" className="admin-button">
          {editId ? 'Update Worker' : 'Create Worker'}
        </button>
      </form>

      <form onSubmit={handleFilterSubmit}>
        <input
          name="name"
          placeholder="Search by name"
          value={filters.name}
          onChange={handleFilterChange}
          className="admin-input"
        />
        <input
          name="assigned_area"
          placeholder="Search by area"
          value={filters.assigned_area}
          onChange={handleFilterChange}
          className="admin-input"
        />
        <button type="submit" className="admin-button">Search</button>
      </form>

      <h3>All Workers</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th><th>Username</th><th>Phone</th><th>Area</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => (
            <tr key={w.id}>
              <td>{w.name}</td>
              <td>{w.username}</td>
              <td>{w.phone}</td>
              <td>{w.assigned_area}</td>
              <td>{w.is_active ? '✅' : '❌'}</td> {/* ✅ fixed property */}
              <td>
                {w.created_by === loggedInAdminId ? (
                  <>
                    <button onClick={() => handleEdit(w)}>Edit</button>{' '}
                    <button onClick={() => handleDelete(w.id)}>Delete</button>{' '}
                    <button onClick={() => handleToggle(w.id)}>
                      {w.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </>
                ) : (
                  <em>Not your worker</em>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageWorkers;
