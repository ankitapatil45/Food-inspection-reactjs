import React, { useEffect, useState } from "react";
import API from "../utils/axiosAuth";
import "./AdminList.css";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({ name: "", city: "" });
  const [activeView, setActiveView] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetchAdmins();
    fetchCities();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await API.get("/superadmin/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await API.get("/areas");
      setCities(res.data);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilter = () => {
    setFilters({ name: "", city: "" });
  };

  const filteredAdmins = admins.filter((admin) => {
    const nameMatch = admin.username.toLowerCase().includes(filters.name.toLowerCase());
    const cityMatch = admin.city?.toLowerCase().includes(filters.city.toLowerCase());
    const statusMatch = admin.is_active === activeView;
    return nameMatch && cityMatch && statusMatch;
  });

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setEditedFields({
      name: admin.name || "",
      phone: admin.phone || "",
      address: admin.address || "",
      city: admin.city || "",
      password: "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      const payload = {
        name: editedFields.name,
        phone: editedFields.phone,
        address: editedFields.address,
        password: editedFields.password,
      };

      if (!payload.password) delete payload.password;

      const selectedCity = cities.find((c) => c.name === editedFields.city);
      if (selectedCity) {
        payload.city_id = selectedCity.id;
      }

      await API.put(`/superadmin/admin/${id}`, payload);
      setEditingId(null);
      fetchAdmins();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedFields({});
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.put(`/admin/admin/${id}/toggle-status`);
      fetchAdmins();
    } catch (err) {
      console.error("Status toggle failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/superadmin/admin/${id}`);
      fetchAdmins();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="admin-list-container">
      <h2>Admin List</h2>

      <div className="filter-bar">
        <input
          type="text"
          name="name"
          placeholder="Filter by Username"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="city"
          placeholder="Filter by city"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <button onClick={handleClearFilter}>Clear Filter</button>
        <button onClick={() => setActiveView(!activeView)}>
          {activeView ? "View Inactive" : "View Active"}
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>City</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.username}</td>
              <td>{admin.email}</td>

              {editingId === admin.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editedFields.name}
                      onChange={(e) => setEditedFields({ ...editedFields, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editedFields.phone}
                      onChange={(e) => setEditedFields({ ...editedFields, phone: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editedFields.address}
                      onChange={(e) => setEditedFields({ ...editedFields, address: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      value={editedFields.city}
                      onChange={(e) => setEditedFields({ ...editedFields, city: e.target.value })}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={editedFields.password}
                      onChange={(e) => setEditedFields({ ...editedFields, password: e.target.value })}
                    />
                  </td>
                  <td>
                    <button className="save-btn" onClick={() => handleUpdate(admin.id)}>Save</button>
                    <button className="delete-btn" onClick={handleCancel}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{admin.name}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.address}</td>
                  <td>{admin.city}</td>
                  <td className={admin.is_active ? "status-active" : "status-inactive"}>
                    {admin.is_active ? "Active" : "Inactive"}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(admin)}>Edit</button>
                    <button className="status-btn" onClick={() => handleToggleStatus(admin.id)}>
                      {admin.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(admin.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
