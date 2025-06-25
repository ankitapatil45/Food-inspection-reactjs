// src/App.jsx
import './App.css';
import { NavLink, Outlet, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";

export default function App() {
  return (
    <div className="app-container">
      {/* ✅ Stylish Navbar */}
      <nav className="navbar">
        <div className="logo">🌿 Food Inspection</div>
        <div className="navbar-links">
          <NavLink to="/" className="navbar-link">Home</NavLink>
          <NavLink to="/about" className="navbar-link">About</NavLink>
          <NavLink to="/login" className="navbar-link">Login</NavLink>
        </div>
      </nav>

      {/* ✅ Pages will render here */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
