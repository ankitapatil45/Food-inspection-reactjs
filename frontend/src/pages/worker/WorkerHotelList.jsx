import React, { useEffect, useState } from 'react';
import API from '../../utils/axiosAuth';
import './WorkerHotelList.css';

export default function WorkerHotelList() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hotels, searchName]);

  const fetchHotels = async () => {
    try {
      const res = await API.get('/worker/hotels');
      const activeHotels = res.data.filter(h => h.is_active); // Only active
      setHotels(activeHotels);
    } catch (err) {
      console.error('Error fetching hotels', err);
    }
  };

  const applyFilters = () => {
    let filtered = hotels;

    if (searchName.trim() !== '') {
      filtered = filtered.filter(hotel =>
        hotel.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredHotels(filtered);
  };

  const handleClearFilters = () => {
    setSearchName('');
  };

  return (
    <div className="hotel-list-container">
      <h2>Active Hotels</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button onClick={handleClearFilters}>Clear</button>
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Location</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.name}</td>
                <td>{hotel.phone}</td>
                <td>{hotel.address}</td>
                <td>{hotel.location}</td>
                <td>{hotel.city}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No active hotels found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
