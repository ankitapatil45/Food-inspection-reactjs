import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminMedia.css";

function SuperAdminMedia() {
  const [media, setMedia] = useState([]);
  const [filters, setFilters] = useState({
    area: "",
    hotel_id: "",
    worker_id: "",
    media_type: "",
  });
  const [dropdowns, setDropdowns] = useState({
    areas: [],
    hotels: [],
    workers: [],
    allHotels: [],
    allWorkers: [],
  });
  const [fullscreenMedia, setFullscreenMedia] = useState(null); // { url, type }

  const token = localStorage.getItem("token");

  const fetchDropdownOptions = async () => {
    try {
      const res = await axios.get("/api/media/superadmin/options", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDropdowns((prev) => ({
        ...prev,
        areas: res.data.areas,
        hotels: res.data.hotels,
        workers: res.data.workers,
        allHotels: res.data.hotels,
        allWorkers: res.data.workers,
      }));
    } catch (err) {
      console.error("Error loading options", err);
    }
  };

  const fetchMedia = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/media/superadmin/view?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      console.error("Error fetching media", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;

    try {
      await axios.delete(`/api/media/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete media", err);
    }
  };

  const clearFilters = () => {
    setFilters({
      area: "",
      hotel_id: "",
      worker_id: "",
      media_type: "",
    });
  };

  useEffect(() => {
    const { allHotels, allWorkers } = dropdowns;

    const filteredHotels = allHotels.filter((h) => h.city === filters.area);
    const filteredWorkers = allWorkers.filter((w) => w.city === filters.area);

    setDropdowns((prev) => ({
      ...prev,
      hotels: filteredHotels,
      workers: filteredWorkers,
    }));

    setFilters((prev) => ({
      ...prev,
      hotel_id: "",
      worker_id: "",
    }));
  }, [filters.area]);

  useEffect(() => {
    fetchDropdownOptions();
    fetchMedia();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  return (
    <div className="admin-media-container">
      <h2 className="media-title">Submitted Media</h2>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
        >
          <option value="">All Areas</option>
          {dropdowns.areas.map((area, i) => (
            <option key={i} value={area}>
              {area}
            </option>
          ))}
        </select>

        <select
          value={filters.hotel_id}
          onChange={(e) => setFilters({ ...filters, hotel_id: e.target.value })}
        >
          <option value="">All Hotels</option>
          {dropdowns.hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        <select
          value={filters.worker_id}
          onChange={(e) => setFilters({ ...filters, worker_id: e.target.value })}
        >
          <option value="">All Workers</option>
          {dropdowns.workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
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

        <button className="clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Media Grid */}
      <div className="media-grid">
        {media.map((m) => (
          <div className="media-card" key={m.id}>
            <div className="media-thumbnail-wrapper">
              {m.media_type === "image" ? (
                <img
                  src={m.file_url}
                  alt={m.description}
                  className="media-thumbnail"
                  onClick={() =>
                    setFullscreenMedia({ url: m.file_url, type: "image" })
                  }
                />
              ) : (
                <video
                  src={m.file_url}
                  className="media-thumbnail"
                  onClick={() =>
                    setFullscreenMedia({ url: m.file_url, type: "video" })
                  }
                />
              )}
            </div>
            <div className="media-info">
              <p className="type-label">{m.media_type.toUpperCase()}</p>
              <p>
                <strong>Hotel:</strong> {m.hotel?.name} ({m.hotel?.city})
              </p>
              <p>
                <strong>Worker:</strong> {m.worker?.name}
              </p>
              <p>
                <strong>Uploaded:</strong> {m.uploaded_at}
              </p>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(m.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenMedia && (
        <div
          className="fullscreen-overlay"
          onClick={() => setFullscreenMedia(null)}
        >
          {fullscreenMedia.type === "image" ? (
            <img
              src={fullscreenMedia.url}
              alt="Full View"
              className="fullscreen-image"
            />
          ) : (
            <video
              src={fullscreenMedia.url}
              controls
              autoPlay
              className="fullscreen-video"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SuperAdminMedia;
