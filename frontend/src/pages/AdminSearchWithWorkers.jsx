import React, { useState } from "react";
import API from "../utils/axiosAuth";
import "./SearchAdminWithWorkers.css";

export default function SearchAdminWithWorkers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setResult(null);
    setError("");

    if (!searchTerm.trim()) return;

    try {
      const res = await API.get("/superadmin/admin-workers", {
        params: { search: searchTerm },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="search-admin-container">
      <h2 className="admin-title">Search Admin & Assigned Workers</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter admin name or username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="admin-button">Search</button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="search-result">
          <div className="admin-info">
            <h3>Admin Info</h3>
            <p><strong>Name:</strong> {result.admin.name}</p>
            <p><strong>Username:</strong> {result.admin.username}</p>
            <p><strong>Phone:</strong> {result.admin.phone}</p>
            <p><strong>City:</strong> {result.admin.city}</p>
          </div>

          <div className="workers-section">
            <h3>Assigned Workers</h3>
            {result.workers.length === 0 ? (
              <p>No workers found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {result.workers.map((w) => (
                    <tr key={w.id}>
                      <td>{w.name}</td>
                      <td>{w.username}</td>
                      <td>{w.phone}</td>
                      <td>{w.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
