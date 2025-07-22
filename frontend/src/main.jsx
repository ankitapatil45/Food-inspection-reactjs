import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';

import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

import ProtectedRoute from './components/ProtectedRoute';

import SubmitVideo from './pages/SubmitVideo';
import WorkerHotelList from './pages/WorkerHotelList';
import WorkerLocation from './pages/WorkerLocation';
import WorkerMedia from './pages/WorkerMedia';

import AdminWorkerLocation from './pages/AdminWorkerLocation';
import AllWorkersList from './pages/AllWorkersList';
import ManageWorkers from './pages/ManageWorkers';

import AdminMedia from './pages/AdminMedia';
import SuperAdminMedia from './pages/SuperAdminMedia';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          
          {/* Super Admin */}
          <Route
            path="superadmin/dashboard"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="superadmin/media"
            element={
              <ProtectedRoute>
                <SuperAdminMedia />
              </ProtectedRoute>
            }
          />
          <Route
            path="superadmin/worker-location/:workerId"
            element={
              <ProtectedRoute>
                <AdminWorkerLocation />
              </ProtectedRoute>
            }
          />

          {/* Worker */}
          <Route
            path="worker/dashboard"
            element={
              <ProtectedRoute>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="worker/media"
            element={
              <ProtectedRoute>
                <WorkerMedia />
              </ProtectedRoute>
            }
          />
          <Route
            path="worker/submit-video"
            element={
              <ProtectedRoute>
                <SubmitVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="worker/hotels"
            element={
              <ProtectedRoute>
                <WorkerHotelList />
              </ProtectedRoute>
            }
          />
          <Route
            path="worker/location"
            element={
              <ProtectedRoute>
                <WorkerLocation />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/media"
            element={
              <ProtectedRoute>
                <AdminMedia />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/all-workers"
            element={
              <ProtectedRoute>
                <AllWorkersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/manage-workers"
            element={
              <ProtectedRoute>
                <ManageWorkers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/worker-location/:workerId"
            element={
              <ProtectedRoute>
                <AdminWorkerLocation />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
