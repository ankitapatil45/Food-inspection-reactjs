import React, { useEffect, useState } from "react";
import API from "../utils/axiosAuth";
import "./AdminList.css"; // Reuse same styles

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({ name: "", city: "" });
  const [activeView, setActiveView] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetchWorkers();
    fetchCities();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await API.get("/superadmin/workers");
      setWorkers(res.data);
    } catch (err) {
      console.error("Failed to fetch workers", err);
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

  const filteredWorkers = workers.filter((w) => {
    const nameMatch = w.name.toLowerCase().includes(filters.name.toLowerCase());
    const cityMatch = (w.city || "").toLowerCase().includes(filters.city.toLowerCase());
    const statusMatch = w.is_active === activeView;
    return nameMatch && cityMatch && statusMatch;
  });

  const handleEdit = (worker) => {
    setEditingId(worker.id);
    setEditedFields({
      name: worker.name || "",
      phone: worker.phone || "",
      address: worker.address || "",
      city: worker.city || "",
      password: "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      const payload = {
        name: editedFields.name,
        phone: editedFields.phone,
        address: editedFields.address,
      };

      if (editedFields.password) {
        payload.password = editedFields.password;
      }

      const selectedCity = cities.find((c) => c.name === editedFields.city);
      if (selectedCity) {
        payload.city_id = selectedCity.id;
      }

      await API.put(`/superadmin/worker/${id}`, payload);
      setEditingId(null);
      fetchWorkers();
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
      await API.put(`/admin/worker/${id}/toggle-status`);
      fetchWorkers();
    } catch (err) {
      console.error("Status toggle failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/superadmin/worker/${id}`);
      fetchWorkers();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleLiveLocation = async (id) => {
    try {
      const res = await API.get(`/superadmin/worker-location?worker_id=${id}`);
      const loc = res.data;
      alert(`Live Location of ${loc.name}\nLat: ${loc.latitude}\nLon: ${loc.longitude}\nTime: ${loc.timestamp}`);
    } catch (err) {
      alert("No location found or error fetching location.");
    }
  };

  return (
    <div className="admin-list-container">
      <h2>Worker List</h2>

      <div className="filter-bar">
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
        <button onClick={handleClearFilter}>Clear Filter</button>
        <button onClick={() => setActiveView(!activeView)}>
          {activeView ? "View Inactive" : "View Active"}
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>City</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredWorkers.map((worker) => (
            <tr key={worker.id}>
              <td>{editingId === worker.id ? (
                <input
                  type="text"
                  value={editedFields.name}
                  onChange={(e) =>
                    setEditedFields({ ...editedFields, name: e.target.value })
                  }
                />
              ) : worker.name}</td>
              <td>{worker.email}</td>
              <td>{editingId === worker.id ? (
                <input
                  type="text"
                  value={editedFields.phone}
                  onChange={(e) =>
                    setEditedFields({ ...editedFields, phone: e.target.value })
                  }
                />
              ) : worker.phone}</td>
              <td>{editingId === worker.id ? (
                <input
                  type="text"
                  value={editedFields.address}
                  onChange={(e) =>
                    setEditedFields({ ...editedFields, address: e.target.value })
                  }
                />
              ) : worker.address}</td>
              <td>{editingId === worker.id ? (
                <select
                  value={editedFields.city}
                  onChange={(e) =>
                    setEditedFields({ ...editedFields, city: e.target.value })
                  }
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : worker.city}</td>
              <td className={worker.is_active ? "status-active" : "status-inactive"}>
                {worker.is_active ? "Active" : "Inactive"}
              </td>
              <td>
                {editingId === worker.id ? (
                  <>
                    <input
                      type="password"
                      placeholder="New Password (optional)"
                      value={editedFields.password}
                      onChange={(e) =>
                        setEditedFields({ ...editedFields, password: e.target.value })
                      }
                    />
                    <button className="save-btn" onClick={() => handleUpdate(worker.id)}>Save</button>
                    <button className="delete-btn" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => handleEdit(worker)}>Edit</button>
                    <button className="status-btn" onClick={() => handleToggleStatus(worker.id)}>
                      {worker.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(worker.id)}>Delete</button>
                    <button className="edit-btn" onClick={() => handleLiveLocation(worker.id)}>Live Location</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
