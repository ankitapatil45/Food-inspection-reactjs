// src/api.js
import axios from "axios";

const API = "/api"; // 👈 Vite proxy वापरत असाल तर हे ठेवा

// 🟢 LOGIN (admin/worker)
export const login = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};

export const signup = async (data) => {
  const res = await axios.post(`${API}/signup`, data); // ✅ added
  return res.data;
};

// 🟢 GET Workers (admin only)
export const getWorkers = async (token) => {
  const res = await axios.get(`${API}/admin/workers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// 🟢 CREATE Hotel (admin only)
export const createHotel = async (hotelData, token) => {
  const res = await axios.post(`${API}/admin/create_hotel`, hotelData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// 🟢 GET Hotels (admin + worker)
export const getHotels = async (token) => {
  const res = await axios.get(`${API}/hotels`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// 🟢 UPLOAD Media (worker only)
export const uploadMedia = async (formData, token) => {
  const res = await axios.post(`${API}/worker/upload_media`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// 🟢 Token getter for convenience
export const getAuthToken = () => {
  return localStorage.getItem("token");
};
