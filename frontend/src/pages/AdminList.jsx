import React, { useEffect, useState } from "react";
import API from "../utils/axiosAuth";
import "./AdminList.css";

function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editedAdmin, setEditedAdmin] = useState({});
  const [filters, setFilters] = useState({ name: "", city: "" });

  const fetchAdmins = async () => {
    try {
      const res = await API.get("/superadmin/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEdit = (admin) => {
    setEditingAdminId(admin.id);
    setEditedAdmin({
      name: admin.name,
      username: admin.username,
      phone: admin.phone,
    });
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/superadmin/admin/${id}`, editedAdmin);
      setEditingAdminId(null);
      setEditedAdmin({});
      fetchAdmins();
    } catch (err) {
      console.error("Error saving admin:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await API.delete(`/superadmin/admin/${id}`);
      fetchAdmins();
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.put(`/admin/admin/${id}/toggle-status`);
      fetchAdmins();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ name: "", city: "" });
  };

  const filteredAdmins = admins.filter((admin) => {
    const nameMatch = admin.name.toLowerCase().includes(filters.name.toLowerCase());
    const cityMatch = admin.city.toLowerCase().includes(filters.city.toLowerCase());
    return nameMatch && cityMatch;
  });

  return (
    <div className="admin-list-container">
      <h2 className="admin-title">Admin List</h2>

      <div className="filter-container">
        <input
          type="text"
          name="name"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="city"
          placeholder="Filter by City"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <button className="btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Phone</th>
            <th>Area</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.map((admin) => (
            <tr key={admin.id}>
              <td>
                {editingAdminId === admin.id ? (
                  <input
                    value={editedAdmin.name}
                    onChange={(e) =>
                      setEditedAdmin({ ...editedAdmin, name: e.target.value })
                    }
                  />
                ) : (
                  admin.name
                )}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <input
                    value={editedAdmin.username}
                    onChange={(e) =>
                      setEditedAdmin({ ...editedAdmin, username: e.target.value })
                    }
                  />
                ) : (
                  admin.username
                )}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <input
                    value={editedAdmin.phone}
                    onChange={(e) =>
                      setEditedAdmin({ ...editedAdmin, phone: e.target.value })
                    }
                  />
                ) : (
                  admin.phone
                )}
              </td>
              <td>{admin.city}</td>
              <td className={admin.is_active ? "status-active" : "status-inactive"}>
                {admin.is_active ? "Active" : "Inactive"}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <button className="btn" onClick={() => handleSave(admin.id)}>Save</button>
                ) : (
                  <button className="btn" onClick={() => handleEdit(admin)}>Edit</button>
                )}
                <button className="btn" onClick={() => handleDelete(admin.id)}>Delete</button>
                <button className="btn" onClick={() => handleToggleStatus(admin.id)}>
                  {admin.is_active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminList;
