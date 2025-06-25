// src/pages/SignUp.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import './Login.css'; // reuse CSS if applicable

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset previous messages
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirm) {
      setError("Please fill all fields.");
    } else if (password !== confirm) {
      setError("Passwords do not match.");
    } else {
      // Later: Call backend API here to actually register
      console.log("Creating user:", { name, email });
      setSuccess("Account created successfully!");
      setName(""); setEmail(""); setPassword(""); setConfirm("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign Up</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
         

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="********"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">Create Account</button>
        </form>

        <div className="login-links">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
