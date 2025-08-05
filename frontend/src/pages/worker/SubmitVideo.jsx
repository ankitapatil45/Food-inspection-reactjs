import React, { useState, useRef, useEffect } from 'react';
import API from '../../utils/axiosAuth';
import './SubmitVideo.css';

export default function SubmitMedia() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(28);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    // Fetch hotel list
    API.get('/worker/hotels')
      .then(res => setHotels(res.data))
      .catch(err => {
        console.error('Failed to fetch hotels:', err);
        setError('Could not load hotels');
      });

    // Fetch location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        err => {
          console.warn('Location error:', err);
          setError('Could not access location');
        }
      );
    } else {
      setError('Geolocation not supported');
    }

    return () => {
      resetCamera();
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const startCamera = async () => {
    console.log("Starting camera...");
    if (cameraActive) {
      resetCamera();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraActive(true);
      setPreviewUrl('');
      setMediaFile(null);
      setMediaType('');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied');
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
      console.log("Attached stream to video");
    }
  }, [cameraActive]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        setMediaFile(blob);
        setMediaType('image');
        setPreviewUrl(URL.createObjectURL(blob));
      }, 'image/png');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      clearInterval(countdownIntervalRef.current);
      setRecording(false);
      setPaused(false);
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setMediaFile(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setMediaType('video');
    };

    mediaRecorder.start();
    setRecording(true);
    setPaused(false);
    setCountdown(28);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          mediaRecorder.stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePause = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === 'recording') {
      mr.pause();
      setPaused(true);
    } else if (mr.state === 'paused') {
      mr.resume();
      setPaused(false);
    }
  };

  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }
    setMediaFile(file);
    setMediaType('image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedHotel || !mediaFile || !mediaType || latitude === null || longitude === null) {
      alert('Please complete all fields and grant location access.');
      return;
    }
    const formData = new FormData();
    formData.append('file', mediaFile, mediaType === 'video' ? 'recording.webm' : (mediaFile.name || 'photo.png'));
    formData.append('media_type', mediaType);
    formData.append('description', description);
    formData.append('hotel_id', selectedHotel);
    formData.append('location', JSON.stringify({ latitude, longitude }));

    try {
      await API.post('/worker/upload_media', formData);
      alert('Media uploaded successfully');
      resetForm();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload');
    }
  };

  const resetCamera = () => {
    setCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const resetForm = () => {
    setMediaFile(null);
    setMediaType('');
    setPreviewUrl('');
    setDescription('');
    setRecording(false);
    setPaused(false);
    resetCamera();
    clearInterval(countdownIntervalRef.current);
  };

  return (
    <div className="media-upload-container">
      <h2>Upload Media</h2>
      {error && <p className="error">{error}</p>}
      <label>Select Hotel</label>
      <select value={selectedHotel} onChange={e => setSelectedHotel(e.target.value)}>
        <option value="">-- Select Hotel --</option>
        {hotels.map(hotel => (
          <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
        ))}
      </select>

      <div className="media-controls">
        <button onClick={startCamera}>{cameraActive ? 'Close Camera' : 'Open Camera'}</button>
        {/* Show live camera and Capture Image button */}
        {cameraActive && (!mediaFile || mediaType !== 'image') && (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="preview-video"
              style={{
                width: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                border: '1px solid black'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
            <button onClick={captureImage}>Capture Image</button>
          </>
        )}
        {cameraActive && !recording && (
          <button onClick={startRecording}>Start Recording</button>
        )}
        {recording && (
          <>
            <button onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
            <button onClick={stopRecording}>Stop Recording</button>
            <span className="timer">
              {countdown}s
              {countdown <= 3 && <span className="warning-message"> ⚠️ Recording will stop soon!</span>}
            </span>
          </>
        )}
        <label className="file-upload-button">
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageSelect} hidden />
        </label>
      </div>

      <div className="preview-section">
        {previewUrl && mediaType === 'image' && (
          <>
            <h4>Preview</h4>
            <img src={previewUrl} alt="Preview" className="preview-image" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </>
        )}
        {previewUrl && mediaType === 'video' && (
          <>
            <h4>Preview</h4>
            <video controls src={previewUrl} className="preview-video" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </>
        )}
      </div>

      <textarea
        placeholder="Enter a description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
      />

      <div className="action-buttons">
        <button onClick={handleUpload} disabled={!mediaFile || !selectedHotel}>Upload</button>
        <button onClick={resetForm}>Cancel</button>
      </div>
    </div>
  );
}
