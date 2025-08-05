import React, { useEffect, useState } from "react";
import API from "../../utils/axiosAuth";
import "./AllWorkersList.css";

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewStatus, setViewStatus] = useState("active"); // Start with "active"

  const fetchWorkers = async () => {
    try {
      const res = await API.get("/admin/workers");
      setWorkers(res.data);
    } catch (err) {
      console.error("Failed to fetch workers:", err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const nameMatch = worker.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      (viewStatus === "active" && worker.is_active) ||
      (viewStatus === "inactive" && !worker.is_active);
    return nameMatch && statusMatch;
  });

  const handleEdit = (id) => {
    setEditingId(id);
    const worker = workers.find((w) => w.id === id);
    setEditedFields({
      name: worker.name,
      username: worker.username,
      email: worker.email,
      phone: worker.phone,
      address: worker.address,
      password: "", // reset password optional
    });
  };

  const handleSave = async (id) => {
    try {
      const payload = {
        ...editedFields,
      };
      if (!payload.password) delete payload.password;

      await API.put(`/admin/worker/${id}`, payload);
      setEditingId(null);
      setEditedFields({});
      fetchWorkers();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      await API.put(`/admin/worker/${id}/toggle-status`);
      fetchWorkers();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/worker/${id}`);
      fetchWorkers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const cycleViewStatus = () => {
    setViewStatus((prev) =>
      prev === "active" ? "inactive" : "active"
    );
  };

  const getViewStatusLabel = () => {
    return viewStatus === "active" ? "Show Inactive" : "Show Active";
  };

  return (
    <div className="admin-list-container">
      <h2>Worker Management</h2>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setSearchTerm("")}>Clear Filter</button>
        <button onClick={cycleViewStatus}>{getViewStatusLabel()}</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredWorkers.map((worker) => (
            <tr key={worker.id}>
              <td>
                {editingId === worker.id ? (
                  <input
                    value={editedFields.name}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, name: e.target.value })
                    }
                  />
                ) : (
                  worker.name
                )}
              </td>
              <td>
                {editingId === worker.id ? (
                  <input
                    value={editedFields.username}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, username: e.target.value })
                    }
                  />
                ) : (
                  worker.username
                )}
              </td>
              <td>
                {editingId === worker.id ? (
                  <input
                    value={editedFields.email}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, email: e.target.value })
                    }
                  />
                ) : (
                  worker.email
                )}
              </td>
              <td>
                {editingId === worker.id ? (
                  <input
                    value={editedFields.phone}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, phone: e.target.value })
                    }
                  />
                ) : (
                  worker.phone
                )}
              </td>
              <td>
                {editingId === worker.id ? (
                  <input
                    value={editedFields.address}
                    onChange={(e) =>
                      setEditedFields({ ...editedFields, address: e.target.value })
                    }
                  />
                ) : (
                  worker.address
                )}
              </td>
              <td>
                <span
                  className={
                    worker.is_active ? "status-active" : "status-inactive"
                  }
                >
                  {worker.is_active ? "Active" : "Inactive"}
                </span>
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
                    <button className="save-btn" onClick={() => handleSave(worker.id)}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => handleEdit(worker.id)}>
                      Edit
                    </button>
                    <button className="status-btn" onClick={() => handleStatusToggle(worker.id)}>
                      {worker.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(worker.id)}>
                      Delete
                    </button>
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
