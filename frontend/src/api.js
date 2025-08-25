// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "/api", // 🔄 If using Vite proxy
  withCredentials: true,
});

// ✅ Attach token to every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔐 Optional: Token getter
export const getAuthToken = () => {
  return sessionStorage.getItem("token");
};

// 🟢 LOGIN
export const login = async (data) => {
  try {
    const res = await API.post("/login", data);
    return res.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// 🔴 LOGOUT
export const logout = async () => {
  try {
    const res = await API.post("/logout");
    return res.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// 🟢 SIGNUP
export const signup = async (data) => {
  try {
    const res = await API.post("/signup", data);
    return res.data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// 🟢 GET Workers (admin only)
export const getWorkers = async () => {
  try {
    const res = await API.get("/admin/workers");
    return res.data;
  } catch (error) {
    console.error("Get Workers error:", error);
    throw error;
  }
};

// 🟢 CREATE Hotel (admin only)
export const createHotel = async (hotelData) => {
  try {
    const res = await API.post("/admin/create_hotel", hotelData);
    return res.data;
  } catch (error) {
    console.error("Create Hotel error:", error);
    throw error;
  }
};

// 🟢 GET Hotels (admin + worker + superadmin)
export const getHotels = async () => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("userRole");

  let url = "/hotels"; // default for admin/superadmin
  if (role === "worker") {
    url = "/worker/hotels";
  }

  try {
    const res = await API.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Get Hotels error:", error);
    throw error;
  }
};



// 🟢 UPLOAD Media (worker only)
export const uploadMedia = async (formData) => {
  try {
    const res = await API.post("/worker/upload_media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Upload Media error:", error);
    throw error;
  }
};

// 🟢 GET My Media (worker)
export const getMedia = async () => {
  try {
    const res = await API.get("/media");
    return res.data;
  } catch (error) {
    console.error("Get Media error:", error);
    throw error;
  }
};

export default API;
