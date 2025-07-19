import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/layout/Layout';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductionsList from './pages/productions/ProductionsList';
import ProductionDetail from './pages/productions/ProductionDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AccessDenied from './pages/auth/AccessDenied';
import AddProduction from './pages/admin/AddProduction';
import Dashboard from './pages/admin/Dashboard';
import Messages from './pages/admin/Messages';
import Productions from './pages/admin/Productions';
import UserManagement from './pages/admin/UserManagement';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Contact from './pages/contact/Contact';
import Favorites from './pages/favorites/Favorites';
import UserProfile from './pages/profile/UserProfile';
import CGU from './pages/legal/CGU';
import ThemeToggle from './components/ui/ThemeToggle';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DiagnosticPage from './pages/DiagnosticPage';
import { useTranslation } from 'react-i18next';

// Personnalisation globale des champs de formulaire MUI
// const theme = createTheme({
//   palette: {
//     mode,
//     primary: {
//       main: '#e02323',
//     },
//     secondary: {
//       main: mode === 'dark' ? '#f5f5f5' : '#ffffff',
    // },
    // background: {
    //   default: mode === 'dark' ? '#121212' : '#f5f5f5',
    //   paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    // },
  // },
  // components: {
  //   MuiTextField: {
  //     styleOverrides: {
  //       root: {
  //         backgroundColor: '#fff',
  //         borderRadius: 8,
  //       },
  //     },
  //   },
  //   MuiInputBase: {
  //     styleOverrides: {
  //       root: {
  //         backgroundColor: '#fff',
  //         borderRadius: 8,
  //         border: '1px solid #e0e0e0',
  //         transition: 'border-color 0.2s',
  //       },
  //       input: {
  //         padding: '12px',
  //       },
  //     },
  //   },
  //   MuiOutlinedInput: {
  //     styleOverrides: {
  //       notchedOutline: {
  //         borderColor: '#bdbdbd',
  //       },
  //       root: {
  //         '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
  //           borderColor: '#1976d2',
  //           boxShadow: '0 0 0 2px #1976d220',
  //         },
  //       },
  //     },
  // });

// });

function App() {
  const { t } = useTranslation();

  // Exemple d'utilisation de la traduction
  const pageTitle = t('app.pageTitle');

  // Gestion du thème clair/sombre
  const [mode, setMode] = useState(() => {
    // Récupérer le mode depuis localStorage ou utiliser 'light' par défaut
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // Sauvegarde du mode dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Fonction pour basculer entre les modes
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  // Thème MUI avec personnalisation des champs de formulaire
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#e02323',
          },
          secondary: {
            main: mode === 'dark' ? '#f5f5f5' : '#ffffff',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [mode]
  );

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Layout themeToggle={<ThemeToggle toggleColorMode={colorMode.toggleColorMode} />} />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Routes publiques - accessibles à tous */}
                <Route path="/" element={<Home />} />
                <Route path="/productions" element={<ProductionsList />} />
                <Route path="/productions/:id" element={<ProductionDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes protégées - accessibles seulement aux utilisateurs connectés */}
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />

                {/* Routes protégées - accessibles seulement à l'admin */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/productions" element={
                  <ProtectedRoute adminOnly>
                    <Productions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/productions/add" element={
                  <ProtectedRoute adminOnly>
                    <AddProduction />
                  </ProtectedRoute>
                } />
                <Route path="/admin/productions/edit/:id" element={
                  <ProtectedRoute adminOnly>
                    <AddProduction />
                  </ProtectedRoute>
                } />
                <Route path="/admin/messages" element={
                  <ProtectedRoute adminOnly>
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/diagnostic" element={<DiagnosticPage />} />
                <Route path="/cgu" element={<CGU />} />

                {/* Page d'accès refusé */}
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* Page non trouvée */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
