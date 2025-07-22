import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axiosAuth';
import './AllWorkersList.css';

function AllWorkersList() {
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ name: '', assigned_area: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const admin = JSON.parse(localStorage.getItem('user'));
  const loggedInAdminId = admin?.id;

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchWorkers = () => {
    setIsLoading(true);
    API.get('/admin/workers', { params: filters })
      .then((res) => {
        setWorkers(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        showMessage('error', err.response?.data?.error || 'Failed to load workers');
        setIsLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      setIsLoading(true);
      API.delete(`/admin/worker/${id}`)
        .then(() => {
          fetchWorkers();
          showMessage('success', 'Worker deleted successfully!');
          setIsLoading(false);
        })
        .catch((err) => {
          showMessage('error', err.response?.data?.error || 'Delete failed');
          setIsLoading(false);
        });
    }
  };

  const handleToggle = (id) => {
    setIsLoading(true);
    API.put(`/admin/worker/${id}/toggle-status`)
      .then(() => {
        fetchWorkers();
        showMessage('success', 'Worker status updated successfully!');
        setIsLoading(false);
      })
      .catch((err) => {
        showMessage('error', err.response?.data?.error || 'Status update failed');
        setIsLoading(false);
      });
  };

  const handleEdit = (worker) => {
    navigate(`/admin/manage-workers`, { state: { worker } });
  };

  const clearFilters = () => {
    setFilters({ name: '', assigned_area: '' });
    setTimeout(fetchWorkers, 100);
  };

  return (
    <div className="workers-management">
      <h2 className="admin-title">All Workers</h2>


      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleFilterSubmit} className="search-form">
        <input
          name="name"
          placeholder="Search by worker name..."
          value={filters.name}
          onChange={handleFilterChange}
          className="search-input"
          disabled={isLoading}
        />
        <input
          name="assigned_area"
          placeholder="Search by assigned area..."
          value={filters.assigned_area}
          onChange={handleFilterChange}
          className="search-input"
          disabled={isLoading}
        />
        <button type="submit" className="admin-button" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        {(filters.name || filters.assigned_area) && (
          <button
            type="button"
            onClick={clearFilters}
            className="clear-filters"
            disabled={isLoading}
          >
            Clear
          </button>
        )}
      </form>

      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {workers.length === 0 ? (
            <div className="empty-state">
              <h3>No workers found</h3>
              <p>Try adjusting your search filters or add new workers</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Assigned Area</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td data-label="Worker Name">{w.name}</td>
                    <td data-label="Username">{w.username}</td>
                    <td data-label="Phone">{w.phone}</td>
                    <td data-label="Assigned Area">{w.assigned_area}</td>
                    <td data-label="Status">
                      <span className={w.is_active ? 'status-active' : 'status-inactive'}>
                        {w.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      {w.created_by === loggedInAdminId ? (
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(w)} disabled={isLoading}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(w.id)} disabled={isLoading}>
                            Delete
                          </button>
                          <button onClick={() => handleToggle(w.id)} disabled={isLoading}>
                            {w.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/worker-location/${w.id}`)}
                            className="btn-info"
                            disabled={isLoading}
                          >
                            View Location
                          </button>
                        </div>
                      ) : (
                        <em>Not your worker</em>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {!isLoading && workers.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#1e3a8a',
          fontSize: '1rem'
        }}>
          Total Workers: <strong>{workers.length}</strong>
        </div>
      )}
    </div>
  );
}

export default AllWorkersList;
