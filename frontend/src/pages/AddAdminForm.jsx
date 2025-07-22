import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddAdminForm.css"; // Import your CSS styles if needed

export default function AddAdminForm() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    city: "", // ✅ Superadmin assigns area as 'city'
    address: ""
  });

  const [areaList, setAreaList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load predefined areas from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/areas")
      .then((res) => setAreaList(res.data))
      .catch((err) => console.error("Failed to load areas", err));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/superadmin/create-admin", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      alert("✅ Admin created successfully");
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        city: "",
        address: ""
      });

    } catch (err) {
      alert(err.response?.data?.error || "❌ Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-admin-form">
      <h3>Create New Admin</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          required
        />
        <select
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        >
          <option value="">Select Area</option>
          {areaList.map((area, i) => (
            <option key={i} value={area}>{area}</option>
          ))}
        </select>

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Admin"}
        </button>
      </form>
    </div>
  );
}
