import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHome,
  FaInfoCircle,
  FaSignInAlt,
  FaTachometerAlt,
  FaSignOutAlt
} from "react-icons/fa";
import "./App.css";
 
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(userRole || "");
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
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setRole("");
      alert("Logged out successfully");
      navigate("/");
    }
  };
 
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">Food Inspection</div>
        <div className="navbar-links">
         
         
 
         
 
          {isLoggedIn && (
            <>
              {role === "admin" && (
                <NavLink to="/admin/dashboard" className="navbar-link">
                  <FaTachometerAlt className="icon" /> Dashboard
                </NavLink>
              )}
              {role === "worker" && (
                <NavLink to="/worker/dashboard" className="navbar-link">
                  <FaTachometerAlt className="icon" /> Dashboard
                </NavLink>
              )}
              {role === "superadmin" && (
                <NavLink to="/superadmin/dashboard" className="navbar-link">
                  <FaTachometerAlt className="icon" /> Dashboard
                </NavLink>
              )}
              <button className="navbar-link logout-button" onClick={handleLogout}>
                <FaSignOutAlt className="icon" /> Logout
              </button>
            </>
          )}
        </div>
      </nav>
 
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
 
 