// src/pages/Login.jsx
import './Login.css';
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back 👋</h2>
        <p className="login-subtitle">Login to manage inspections</p>

        <form>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="login-links">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="link">Sign Up</Link>
          </p>
          <p>
            <Link to="/forgot-password" className="link">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
