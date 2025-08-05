// --- React Code (SuperAdminMedia.jsx) ---
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminMedia.css";

function SuperAdminMedia() {
  const [media, setMedia] = useState([]);
  const [areas, setAreas] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [filters, setFilters] = useState({ area_id: '', hotel_id: '', worker_id: '', media_type: '' });
  const [selectedMedia, setSelectedMedia] = useState(null);

  const token = localStorage.getItem("token");

  const fetchDropdownOptions = async () => {
    try {
      const res = await axios.get("/api/media/superadmin/options", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAreas(res.data.areas || []);
      setAllHotels(res.data.hotels || []);
      setAllWorkers(res.data.workers || []);
      setHotels(res.data.hotels || []);
      setWorkers(res.data.workers || []);
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
    fetchDropdownOptions();
    fetchMedia();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  useEffect(() => {
    let cityId = filters.area_id;

    if (filters.hotel_id) {
      const hotel = allHotels.find(h => h.id == filters.hotel_id);
      if (hotel) {
        cityId = hotel.city_id;
      }
    }

    const filteredHotels = filters.area_id
      ? allHotels.filter(h => h.city_id == filters.area_id)
      : allHotels;

    const filteredWorkers = cityId
      ? allWorkers.filter(w => w.city_id == cityId)
      : allWorkers;

    setHotels(filteredHotels);
    setWorkers(filteredWorkers);
  }, [filters.area_id, filters.hotel_id, allHotels, allWorkers]);

  const formatLocation = (loc) => {
    if (!loc) return null;
    const parts = loc.split(",");
    if (parts.length !== 2) return loc;
    const [lat, lon] = parts;
    return `Lat: ${lat.trim()}, Lon: ${lon.trim()}`;
  };

  const closeModal = () => setSelectedMedia(null);

  const clearFilters = () => {
    setFilters({ area_id: '', hotel_id: '', worker_id: '', media_type: '' });
  };

  return (
    <div className="worker-media-wrapper">
      <div className="worker-media-container">
        <h2 className="media-title">All Uploaded Media (Super Admin View)</h2>

        <div className="filters-container">
          <select
            value={filters.area_id}
            onChange={(e) => setFilters({ ...filters, area_id: e.target.value, hotel_id: '', worker_id: '' })}
          >
            <option value="">All Cities</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <select
            value={filters.hotel_id}
            onChange={(e) => setFilters({ ...filters, hotel_id: e.target.value })}
          >
            <option value="">All Hotels</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          <select
            value={filters.worker_id}
            onChange={(e) => setFilters({ ...filters, worker_id: e.target.value })}
          >
            <option value="">All Workers</option>
            {workers.map((w) => (
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

          <button className="clear-filters-button" onClick={clearFilters}>Clear Filters</button>
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
                <p><strong>Uploaded by:</strong> {m.uploaded_by_name || "Unknown"}</p>
                <p><strong>Location:</strong> {formatLocation(m.location) || "N/A"}</p>
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

export default SuperAdminMedia;

