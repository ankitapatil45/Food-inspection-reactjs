import React, { useEffect, useState } from "react";
import API from "../utils/axiosAuth";
import "./AdminList.css"; // Reuse consistent styling
 
function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [editedHotel, setEditedHotel] = useState({});
  const [filters, setFilters] = useState({ name: "", city: "" });
 
  useEffect(() => {
    fetchHotels();
  }, [filters]);
 
  const fetchHotels = () => {
    let query = "/hotels";
    const params = [];
 
    if (filters.name.trim()) params.push(`name=${filters.name.trim()}`);
    if (filters.city.trim()) params.push(`city=${filters.city.trim()}`);
    if (params.length) query += `?${params.join("&")}`;
 
    API.get(query)
      .then((res) => setHotels(res.data))
      .catch((err) =>
        alert(err.response?.data?.error || "Failed to load hotels")
      );
  };
 
  const handleEdit = (hotel) => {
    setEditingHotelId(hotel.id);
    setEditedHotel({ ...hotel });
  };
 
  const handleCancel = () => {
    setEditingHotelId(null);
    setEditedHotel({});
  };
 
  const handleChange = (e) => {
    setEditedHotel({ ...editedHotel, [e.target.name]: e.target.value });
  };
 
  const handleSave = () => {
    API.put(`/admin/hotel/${editingHotelId}`, editedHotel)
      .then(() => {
        alert("Hotel updated successfully");
        fetchHotels();
        handleCancel();
      })
      .catch((err) =>
        alert(err.response?.data?.error || "Failed to update hotel")
      );
  };
 
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    API.delete(`/admin/hotel/${id}`)
      .then(() => {
        alert("Hotel deleted successfully");
        fetchHotels();
      })
      .catch((err) =>
        alert(err.response?.data?.error || "Failed to delete hotel")
      );
  };
 
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
 
  const clearFilters = () => {
    setFilters({ name: "", city: "" });
  };
 
  return (
    <div className="admin-list-container">
      <h2 className="admin-title">Hotel List</h2>
 
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
            <th>Phone</th>
            <th>Address</th>
            <th>Location</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel.id}>
              {editingHotelId === hotel.id ? (
                <>
                  <td>
                    <input
                      name="name"
                      value={editedHotel.name}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      name="phone"
                      value={editedHotel.phone}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      name="address"
                      value={editedHotel.address}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      name="location"
                      value={editedHotel.location}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      name="city"
                      value={editedHotel.city}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <button className="btn" onClick={handleSave}>
                      Save
                    </button>
                    <button className="btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{hotel.name}</td>
                  <td>{hotel.phone}</td>
                  <td>{hotel.address}</td>
                  <td>{hotel.location}</td>
                  <td>{hotel.city}</td>
                  <td>
                    <button className="btn" onClick={() => handleEdit(hotel)}>
                      Edit
                    </button>
                    <button className="btn" onClick={() => handleDelete(hotel.id)}>
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
export default HotelList;
 