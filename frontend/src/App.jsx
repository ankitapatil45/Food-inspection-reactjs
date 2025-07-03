import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Track login/logout changes based on route changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      alert("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">Food Inspection</div>
        <div className="navbar-links">
          <NavLink to="/" className="navbar-link">Home</NavLink>
          <NavLink to="/about" className="navbar-link">About</NavLink>
          {!isLoggedIn ? (
            <NavLink to="/login" className="navbar-link">Login</NavLink>
          ) : (
            <button onClick={handleLogout} className="logout-button">Logout</button>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
