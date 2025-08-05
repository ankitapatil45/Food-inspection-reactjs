import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/axiosAuth';
import './ManageWorkers.css';

export default function ManageWorkers() {
  const location = useLocation();
  const navigate = useNavigate();
  const editingWorker = location.state?.worker || null;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    address: '',
    assigned_area: '',  // city name (display only)
    city_id: '',        // city ID (needed in backend)
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (editingWorker) {
      setFormData({
        name: editingWorker.name || '',
        username: editingWorker.username || '',
        phone: editingWorker.phone || '',
        email: editingWorker.email || '',
        address: editingWorker.address || '',
        assigned_area: editingWorker.assigned_area || '',
        city_id: editingWorker.city_id || '',
        password: '',
        confirm_password: ''
      });
      setLoading(false);
    } else {
      API.get('/admin/profile')
        .then(res => {
          const { assigned_city, city_id } = res.data;
          setFormData(prev => ({
            ...prev,
            assigned_area: assigned_city,
            city_id: city_id
          }));
        })
        .catch(err => {
          alert("❌ Could not fetch admin profile");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [editingWorker]);

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingWorker && formData.password !== formData.confirm_password) {
      alert("❌ Passwords do not match");
      return;
    }

    const payload = { ...formData };

    if (editingWorker) {
      API.put(`/admin/worker/${editingWorker.id}`, payload)
        .then(() => {
          alert("✅ Worker updated successfully");
          navigate('/admin/all-workers');
        })
        .catch((err) =>
          alert(err.response?.data?.error || "❌ Update failed")
        );
    } else {
      API.post('/admin/create-worker', payload)
        .then(() => {
          alert("✅ Worker created successfully");
          setFormData({
            name: '',
            username: '',
            phone: '',
            email: '',
            address: '',
            assigned_area: formData.assigned_area,
            city_id: formData.city_id,
            password: '',
            confirm_password: ''
          });
        })
        .catch((err) =>
          alert(err.response?.data?.error || "❌ Creation failed")
        );
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div className="workers-page">
      <h2 className="admin-title">
        {editingWorker ? 'Edit Worker' : 'Create Worker'}
      </h2>
      <form onSubmit={handleSubmit} className="create-worker-form">

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInput}
            required
          />
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInput}
            required
            disabled={editingWorker}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInput}
            maxLength={10}
            pattern="[0-9]{10}"
            inputMode="numeric"
            title="Phone number must be exactly 10 digits"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInput}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInput}
            required
          />
        </div>

        <div className="form-group">
          <label>Assigned City</label>
          <input
            type="text"
            value={`Fixed City : ${formData.assigned_area}`}
            disabled
          />
          <input
            type="hidden"
            name="assigned_area"
            value={formData.assigned_area}
          />
        </div>

        <input
          type="hidden"
          name="city_id"
          value={formData.city_id}
        />

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInput}
            required={!editingWorker}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInput}
            required={!editingWorker}
          />
        </div>

        <button type="submit" className="admin-button">
          {editingWorker ? 'Update Worker' : 'Create Worker'}
        </button>
      </form>
    </div>
  );
}
