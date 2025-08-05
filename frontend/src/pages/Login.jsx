import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
 
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
 
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
 
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
 
      
      const role = res.data.user.role;
 
      if (role === "superadmin") {
        navigate("/superadmin/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/worker/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="login-center">
      <form onSubmit={handleLogin} className="login-box">
        <h2>Login</h2>
 
        <label>Enter email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
 
        <label>Enter password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
 
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}