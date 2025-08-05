import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react'; // ✅ Lucide icon import
import './WorkerLocation.css'; // ✅ Optional: include styles here

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const CenterMap = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 15);
    }
  }, [lat, lon, map]);
  return null;
};

const WorkerLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [shouldCenter, setShouldCenter] = useState(true);

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await api.post('/location', { latitude, longitude });
          const res = await api.get('/location');
          setLocation(res.data);
        } catch (err) {
          console.error(err);
          setError('Failed to send or fetch location');
        }
      },
      (err) => {
        console.error(err);
        setError('Failed to get browser location');
      }
    );
  };

  useEffect(() => {
    updateLocation();
    const interval = setInterval(updateLocation, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, []);

  const handleRecenter = () => {
    setShouldCenter(true);
    setTimeout(() => setShouldCenter(false), 500);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Your Live Location</h2>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      {!location ? (
        <p className="text-center">📡 Getting your location...</p>
      ) : (
        <>
          <div className="mb-4 text-sm bg-gray-100 p-3 rounded shadow-sm">
            <p><strong>Latitude:</strong> {location.latitude}</p>
            <p><strong>Longitude:</strong> {location.longitude}</p>
            <p><strong>Updated:</strong> {new Date(location.timestamp).toLocaleString()}</p>
          </div>

          <div className="flex justify-center mb-4">
            <button
              onClick={handleRecenter}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <LocateFixed size={18} /> Center Map
            </button>
          </div>

          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={15}
            scrollWheelZoom
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>You are here</Popup>
            </Marker>
            {shouldCenter && (
              <CenterMap lat={location.latitude} lon={location.longitude} />
            )}
          </MapContainer>
        </>
      )}
    </div>
  );
};

export default WorkerLocation;
