// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import ProductionsList from './pages/productions/ProductionsList';
import ProductionDetail from './pages/productions/ProductionDetail';
import Favorites from './pages/favorites/Favorites';
import Contact from './pages/contact/Contact';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProductions from './pages/admin/Productions';
import AdminMessages from './pages/admin/Messages';

// Layout
import Layout from './components/layout/Layout';

// Routes protégées
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="productions" element={<ProductionsList />} />
              <Route path="productions/:id" element={<ProductionDetail />} />
              <Route path="contact" element={<Contact />} />

              {/* Routes protégées */}
              <Route path="favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />

              {/* Routes admin */}
              <Route path="admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/productions" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminProductions />
                </ProtectedRoute>
              } />
              <Route path="admin/messages" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminMessages />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;