// CameraVideoRecorder.jsx
import React, { useRef, useState } from 'react';

export default function CameraVideoRecorder({ onCapture }) {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const recordedChunksRef = useRef([]); // ✅ Use ref instead of state

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play();
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStream(null);
  };

  const startRecording = async () => {
    const activeStream = await startCamera();
    if (!activeStream) return;

    recordedChunksRef.current = []; // ✅ reset on every start

    const recorder = new MediaRecorder(activeStream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data); // ✅ no state issues
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

      if (blob.size === 0) {
        alert("❌ Recording failed or was too short. Try again.");
        stopCamera();
        return;
      }

      const file = new File([blob], `recorded_${Date.now()}.webm`, { type: 'video/webm' });
      setVideoURL(URL.createObjectURL(blob));
      onCapture(file);
      stopCamera();
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
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

      <div style={{ marginTop: '10px' }}>
        {!isRecording ? (
          <button type="button" onClick={startRecording}>🔴 Start Recording</button>
        ) : (
          <button type="button" onClick={stopRecording}>⏹ Stop Recording</button>
        )}
      </div>

      {videoURL && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Preview:</strong></p>
          <video src={videoURL} controls width="300" />
        </div>
      )}
    </div>
  );
}
