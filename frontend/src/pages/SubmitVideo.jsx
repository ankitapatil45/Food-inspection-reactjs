import React, { useState, useEffect } from 'react';
import { getHotels, uploadMedia, getAuthToken } from '../api';
import CameraCapture from './CameraCapture';
import CameraVideoRecorder from './CameraVideoRecorder';
import './SubmitVideo.css';


export default function SubmitMedia() {
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [hotels, setHotels] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    getHotels(token).then(setHotels).catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setMediaType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        alert('Only image or video files are allowed');
        setFile(null);
        setMediaType('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();

    if (!file || !hotelId || !mediaType) {
      alert("Please select a valid file and hotel.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', mediaType);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('hotel_id', hotelId);

    try {
      await uploadMedia(formData, token);
      alert(`${mediaType === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
      setFile(null);
      setDescription('');
      setLocation('');
      setHotelId('');
      setMediaType('');
    } catch (err) {
      console.error(err);
      alert("Failed to upload media.");
    }
  };

  return (
    <div className="styled-form-container">
      <h2 className="styled-form-title"> Submit Media </h2>

      <form onSubmit={handleSubmit} className="styled-form">
        <div className="form-group">
          <label htmlFor="hotel">Hotel</label>
          <select
            id="hotel"
            value={hotelId}
            onChange={e => setHotelId(e.target.value)}
            required
          >
            <option value="">Select Hotel</option>
            {hotels.map(h => (
              <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Choose Upload Method</label>
          <div className="submitmedia-buttons">
            <button type="button" onClick={() => document.getElementById('galleryInput').click()}>
              Choose from Gallery
            </button>
            <button type="button" onClick={() => setShowCamera(true)}>
              Take Photo
            </button>
            <button type="button" onClick={() => setShowVideoRecorder(true)}>
              Record Video
            </button>
          </div>
        </div>

        <input
          id="galleryInput"
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {showCamera && (
          <CameraCapture onCapture={(capturedFile) => {
            setFile(capturedFile);
            setMediaType('image');
            setShowCamera(false);
          }} />
        )}

        {showVideoRecorder && (
          <CameraVideoRecorder onCapture={(capturedFile) => {
            setFile(capturedFile);
            setMediaType('video');
            setShowVideoRecorder(false);
          }} />
        )}

        {file && (
          <div className="form-group">
            <strong>Selected:</strong> {file.name}
          </div>
        )}

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Location (optional)</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <button className="submit-btn" type="submit">Upload</button>
      </form>
    </div>
  );
}
