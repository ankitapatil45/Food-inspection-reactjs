import React, { useRef, useState, useEffect } from 'react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [streamReady, setStreamReady] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera(); // cleanup on unmount
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream); // store for stop later
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setStreamReady(true);
      };
    } catch (err) {
      alert("Camera access denied or not available");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!streamReady) {
      alert("Camera not ready. Please wait.");
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPhoto(URL.createObjectURL(blob));
      onCapture(file);        // 📤 pass to parent
      stopCamera();           // 📷 turn off camera
    }, 'image/jpeg');
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <video
        ref={videoRef}
        width="320"
        height="240"
        autoPlay
        muted
        playsInline
        style={{ border: '1px solid black' }}
      />
      <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
      <div style={{ marginTop: '10px' }}>
        <button type="button" onClick={takePhoto}>📸 Capture Photo</button>
      </div>
      {photo && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Preview:</strong></p>
          <img src={photo} alt="Captured" width="200" />
        </div>
      )}
    </div>
  );
}
