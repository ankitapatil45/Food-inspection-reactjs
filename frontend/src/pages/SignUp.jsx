// // src/pages/SignUp.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./SignUp.css";

// export default function SignUp() {
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [assignedArea, setAssignedArea] = useState("");
//   const [areaList, setAreaList] = useState([]);
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("admin");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios.get("/api/areas")
//       .then((res) => setAreaList(res.data))
//       .catch((err) => console.error("Failed to fetch areas", err));
//   }, []);

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await axios.post("/api/signup", {
//         name,
//         username,
//         email,
//         phone,
//         password,
//         role,
//         assigned_area: assignedArea,
//       });
//       alert("Signup successful! Please login.");
//       navigate("/login");
//     } catch (err) {
//       alert(err.response?.data?.error || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <div className="signup-box">
//         <h2 className="signup-title">Create Account</h2>

//         <form onSubmit={handleSignup}>
//           <div className="form-group">
//             <label>Full Name</label>
//             <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
//           </div>

//           <div className="form-group">
//             <label>Username</label>
//             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
//           </div>

//           <div className="form-group">
//             <label>Email</label>
//             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>

//           <div className="form-group">
//             <label>Phone</label>
//             <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
//           </div>

//           <div className="form-group">
//             <label>Assigned Area</label>
//             <select value={assignedArea} onChange={(e) => setAssignedArea(e.target.value)} required>
//               <option value="">Select Area</option>
//               {areaList.map((area, index) => (
//                 <option key={index} value={area}>{area}</option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </div>

//           <div className="form-group">
//             <label>Role</label>
//             <select value={role} onChange={(e) => setRole(e.target.value)}>
//               <option value="admin">Admin</option>
//               <option value="worker">Worker</option>
//             </select>
//           </div>

//           <button type="submit" className="signup-button" disabled={loading}>
//             {loading ? "Signing up..." : "Signup"}
//           </button>
//         </form>

//         <div className="signup-links">
//           <span>Already have an account? </span>
//           <a href="/login" className="link">Login</a>
//         </div>
//       </div>
//     </div>
//   );
// }
