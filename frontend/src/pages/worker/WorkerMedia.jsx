import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WorkerMedia.css";

function WorkerMedia() {
  const [media, setMedia] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState({ hotel_id: '', media_type: '' });
  const [selectedMedia, setSelectedMedia] = useState(null);

  const token = localStorage.getItem("token");

  const fetchHotelOptions = async () => {
    try {
      const res = await axios.get("/api/media/worker/options", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeHotels = (res.data.hotels || []).filter(h => h);
      setHotels(activeHotels);
    } catch (err) {
      console.error("Error loading hotel options", err);
    }
  };

  const fetchMedia = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/media/worker/view?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      console.error("Error fetching media", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this media?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  useEffect(() => {
    fetchHotelOptions();
    fetchMedia();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  const formatLocation = (loc) => {
    if (!loc) return null;
    const parts = loc.split(",");
    if (parts.length !== 2) return loc;
    const [lat, lon] = parts;
    return `Lat: ${lat.trim()}, Lon: ${lon.trim()}`;
  };

  const closeModal = () => setSelectedMedia(null);

  return (
    <div className="worker-media-wrapper">
      <div className="worker-media-container">
        <h2 className="media-title">My Uploaded Media (Active Hotels)</h2>

        <div className="filters-container">
          <select
            value={filters.hotel_id}
            onChange={(e) => setFilters({ ...filters, hotel_id: e.target.value })}
          >
            <option value="">All Hotels</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.city})
              </option>
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

        {media.length === 0 ? (
          <p className="no-media">No media found.</p>
        ) : (
          <div className="media-grid">
            {media.map((m) => (
              <div key={m.id} className="media-card" onClick={() => setSelectedMedia(m)}>
                {m.media_type === "image" ? (
                  <img src={m.file_url} alt={m.description || "Media"} />
                ) : (
                  <video src={m.file_url} muted />
                )}
                <p><strong>Type:</strong> {m.media_type}</p>
                <p><strong>Hotel:</strong> {m.hotel?.name || "Unknown"}</p>
                <p><strong>Location:</strong> {formatLocation(m.location) || m.hotel?.city || "N/A"}</p>
                <p><strong>Date:</strong> {m.uploaded_at}</p>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="delete-button">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedMedia && (
          <div className="media-modal" onClick={closeModal}>
            <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
              {selectedMedia.media_type === "image" ? (
                <img src={selectedMedia.file_url} alt="Expanded" />
              ) : (
                <video src={selectedMedia.file_url} controls autoPlay />
              )}
              <div className="media-description-overlay">
                <p>{selectedMedia.description || "No description provided."}</p>
              </div>
              <button className="media-modal-close" onClick={closeModal}>×</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerMedia;
