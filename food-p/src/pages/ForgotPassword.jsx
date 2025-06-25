// src/pages/ForgotPassword.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import './Login.css'; // Reuse CSS if needed

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email address.");
    } else {
      // Dummy: In real project, call backend API to send reset link
      setMessage("If this email is registered, a reset link has been sent.");
      setEmail("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Forgot Password</h2>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Send Reset Link
          </button>
        </form>

        <div className="login-links">
          <p>
            Back to <Link to="/login" className="link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
