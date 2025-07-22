import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axiosAuth';
import './WorkerList.css';

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = () => {
    API.get('/superadmin/workers')
      .then((res) => setWorkers(res.data))
      .catch((err) =>
        alert(err.response?.data?.error || 'Failed to load workers')
      );
  };

  const startEdit = (worker) => {
    setEditingId(worker.id);
    setFormData({
      name: worker.name,
      phone: worker.phone,
      address: worker.address,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleUpdate = (id) => {
    API.put(`/superadmin/worker/${id}`, formData)
      .then(() => {
        fetchWorkers();
        cancelEdit();
      })
      .catch((err) =>
        alert(err.response?.data?.error || 'Update failed')
      );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      API.delete(`/superadmin/worker/${id}`)
        .then(() => fetchWorkers())
        .catch((err) =>
          alert(err.response?.data?.error || 'Delete failed')
        );
    }
  };

  const toggleStatus = (id) => {
    API.put(`/admin/worker/${id}/toggle-status`)
      .then((res) => {
        alert(res.data.message);
        fetchWorkers();
      })
      .catch((err) =>
        alert(err.response?.data?.error || 'Status toggle failed')
      );
  };

  return (
    <div className="worker-list-container">
      <h2 className="admin-title">All Workers</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => (
            <tr key={w.id}>
              <td>
                {editingId === w.id ? (
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  w.name
                )}
              </td>
              <td>{w.email}</td>
              <td>
                {editingId === w.id ? (
                  <input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                ) : (
                  w.phone
                )}
              </td>
              <td>
                {editingId === w.id ? (
                  <input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                ) : (
                  w.address
                )}
              </td>
              <td style={{ color: w.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                {w.is_active ? 'Active' : 'Inactive'}
              </td>
              <td>
                {editingId === w.id ? (
                  <>
                    <button onClick={() => handleUpdate(w.id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(w)}>Edit</button>
                    <button onClick={() => handleDelete(w.id)}>Delete</button>
                    <button onClick={() => toggleStatus(w.id)}>
                      {w.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => navigate(`/superadmin/worker-location/${w.id}`)}>
                      View Location
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
