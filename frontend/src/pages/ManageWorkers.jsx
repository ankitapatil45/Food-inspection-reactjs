import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/axiosAuth';
import './ManageWorkers.css';
 
export default function ManageWorkers() {
  const location = useLocation();
  const navigate = useNavigate();
  const editingWorker = location.state?.worker || null;
 
  const [formData, setFormData] = useState({
    name: '', username: '', phone: '', email: '',
    address: '', assigned_area: '', password: '', confirm_password: ''
  });
 
  useEffect(() => {
    if (editingWorker) {
      setFormData({
        name: editingWorker.name || '',
        username: editingWorker.username || '',
        phone: editingWorker.phone || '',
        email: editingWorker.email || '',
        address: editingWorker.address || '',
        assigned_area: editingWorker.assigned_area || '',
        password: '',
        confirm_password: ''
      });
    }
  }, [editingWorker]);
 
  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
 
  const handleSubmit = (e) => {
    e.preventDefault();
 
    if (editingWorker) {
      API.put(`/admin/worker/${editingWorker.id}`, formData)
        .then(() => {
          alert("Worker updated successfully");
          navigate('/admin/all-workers');
        })
        .catch((err) =>
          alert(err.response?.data?.error || "Update failed")
        );
    } else {
      API.post('/admin/create-worker', formData)
        .then(() => {
          alert("Worker created successfully");
          setFormData({
            name: '', username: '', phone: '', email: '',
            address: '', assigned_area: '', password: '', confirm_password: ''
          });
        })
        .catch((err) =>
          alert(err.response?.data?.error || "Creation failed")
        );
    }
  };
 
  return (
    <div className="workers-page">
      <h2 className="admin-title">{editingWorker ? 'Edit Worker' : 'Create Worker'}</h2>
      <form onSubmit={handleSubmit} className="create-worker-form">
        {[
          'name', 'username', 'phone', 'email',
          'address', 'assigned_area', 'password', 'confirm_password'
        ].map((field) => (
          <input
            key={field}
            type={
              field.includes('password') ? 'password' :
              field === 'email' ? 'email' :
              field === 'phone' ? 'tel' : 'text'
            }
            name={field}
            value={formData[field]}
            placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            onChange={handleInput}
            className="create-worker-input"
            maxLength={field === 'phone' ? 10 : undefined}
            pattern={field === 'phone' ? '[0-9]{10}' : undefined}
            inputMode={field === 'phone' ? 'numeric' : undefined}
            title={field === 'phone' ? 'Phone number must be exactly 10 digits' : undefined}
            required={field === 'password' ? !editingWorker : true}
            disabled={field === 'username' && editingWorker}
          />
        ))}
        <button type="submit" className="admin-button">
          {editingWorker ? 'Update Worker' : 'Create Worker'}
        </button>
      </form>
    </div>
  );
}