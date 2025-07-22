import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminMedia.css";

function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [filters, setFilters] = useState({
    hotel_id: '',
    worker_id: '',
    media_type: '',
  });
  const [dropdowns, setDropdowns] = useState({ hotels: [], workers: [] });
  const [modalMedia, setModalMedia] = useState(null);
  const token = localStorage.getItem("token");

  const fetchDropdownOptions = async () => {
    try {
      const res = await axios.get("/api/media/admin/options", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDropdowns(res.data);
    } catch (err) {
      console.error("Error loading dropdown options", err);
    }
  };

  const fetchMedia = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/media/admin/view?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      console.error("Error fetching media", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    try {
      await axios.delete(`/api/media/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
    fetchMedia();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  return (
    <div className="admin-media-container">
      <h2 className="admin-title">Submitted Media</h2>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.hotel_id}
          onChange={(e) => setFilters({ ...filters, hotel_id: e.target.value })}
        >
          <option value="">All Hotels</option>
          {dropdowns.hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        <select
          value={filters.worker_id}
          onChange={(e) => setFilters({ ...filters, worker_id: e.target.value })}
        >
          <option value="">All Workers</option>
          {dropdowns.workers.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        <select
          value={filters.media_type}
          onChange={(e) => setFilters({ ...filters, media_type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Media Grid */}
      <div className="media-grid">
        {media.map((m) => (
          <div key={m.id} className="media-card">
            <div
              className="media-thumbnail-wrapper"
              onClick={() => setModalMedia(m)}
            >
              {m.media_type === 'image' && (
                <img src={m.file_url} alt={m.description} className="media-thumbnail" />
              )}
              {m.media_type === 'video' && (
                <video src={m.file_url} className="media-thumbnail" muted />
              )}
            </div>

            <div className="media-info">
              <p className="type-label">{m.media_type.toUpperCase()}</p>
              <p><strong>By:</strong> {m.worker?.name}</p>
              <p><strong>Hotel:</strong> {m.hotel?.name}</p>
              <p><strong>Date:</strong> {m.uploaded_at}</p>
            </div>

            <button className="delete-btn" onClick={() => handleDelete(m.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalMedia && (
        <div className="media-modal" onClick={() => setModalMedia(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setModalMedia(null)}>&times;</span>
            {modalMedia.media_type === 'image' && (
              <img src={modalMedia.file_url} alt="Full view" />
            )}
            {modalMedia.media_type === 'video' && (
              <video src={modalMedia.file_url} controls autoPlay />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMedia;
