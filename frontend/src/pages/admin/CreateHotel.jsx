import React, { useState } from 'react';
import API from '../../utils/axiosAuth'; // token-authenticated axios

export default function CreateHotel() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    location: ''
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/create_hotel', formData);
      alert("Hotel created successfully");
      setFormData({ name: '', phone: '', address: '', location: '' });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create hotel");
    }
  };

  return (
    <div>
      <h2>Create Hotel</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Hotel Name" value={formData.name} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
