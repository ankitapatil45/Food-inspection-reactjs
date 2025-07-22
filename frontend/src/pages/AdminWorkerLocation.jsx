import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { ArrowLeft } from 'lucide-react';  // Back arrow icon
 
export default function AdminWorkerLocation() {
  const { workerId } = useParams();
  const navigate = useNavigate(); // navigate vaprun back janar
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await API.get(`/admin/location?worker_id=${workerId}`);
        setLocation(res.data);
      } catch (err) {
        setError('Location not found');
      }
    }
    fetchLocation();
  }, [workerId]);
 
  return (
<div style={{ padding: '20px' }}>
      {/* Back Button */}
<div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
        onClick={() => navigate(-1)} // click kelyavar back
>
<ArrowLeft size={24} />
<span style={{ marginLeft: '8px', fontSize: '16px' }}>Back</span>
</div>
 
      <h2>Worker Live Location</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {location ? (
<>
<p><strong>Latitude:</strong> {location.latitude}</p>
<p><strong>Longitude:</strong> {location.longitude}</p>
<p><strong>Timestamp:</strong> {new Date(location.timestamp).toLocaleString()}</p>
<iframe
            title="map"
            width="100%"
            height="400"
            frameBorder="0"
            src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&hl=es;z=14&output=embed`}
            allowFullScreen
></iframe>
</>
      ) : (
<p>Loading...</p>
      )}
</div>
  );
}