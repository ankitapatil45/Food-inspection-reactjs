import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddAdminForm.css";

export default function AddAdminForm() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    address: "",
  });

  const [areaList, setAreaList] = useState([]);
  const [newCity, setNewCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/areas")
      .then((res) => setAreaList(res.data))
      .catch((err) => console.error("Failed to load areas", err));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCity = async () => {
    const trimmedCity = newCity.trim();
    if (!trimmedCity) return alert("City name cannot be empty.");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/superadmin/add-city",
        { name: trimmedCity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert(`✅ ${response.data.message}`);
      setAreaList((prev) => [...prev, { id: response.data.city_id, name: trimmedCity }]);
      setFormData((prev) => ({ ...prev, city: trimmedCity }));
      setNewCity("");
    } catch (err) {
      alert(err.response?.data?.error || "❌ Failed to add city");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalData = {
      ...formData,
      phone: "+91" + formData.phone.trim(),
    };

    try {
      await axios.post(
        "http://localhost:5000/api/superadmin/create-admin",
        finalData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("✅ Admin created successfully");
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        city: "",
        address: "",
      });
    } catch (err) {
      alert(err.response?.data?.error || "❌ Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="add-admin-form-container">
        <h2>Create New Admin</h2>
        <form className="admin-form-stacked" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Full Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter Username"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              required
            />
          </div>

          {/* Assign City + Add New City side by side */}
          <div className="form-group">
            <div className="city-fields-wrapper">
              <div className="city-field">
                <label>Assign City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Area</option>
                  {areaList.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="city-field">
                <label>Add New City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Enter New City"
                />
                <button type="button" onClick={handleAddCity}>
                  ➕ Add City
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Add Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
