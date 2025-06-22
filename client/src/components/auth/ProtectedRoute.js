// src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 * @param {Object} props - Les propriétés du composant
 * @param {Boolean} props.requireAdmin - Si true, la route nécessite des droits administrateur
 * @param {React.ReactNode} props.children - Les composants enfants à afficher si l'accès est autorisé
 */
const ProtectedRoute = ({ requireAdmin = false, children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    // Afficher un spinner pendant le chargement de l'état d'authentification
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si la route nécessite des droits admin mais que l'utilisateur n'est pas admin
    if (requireAdmin && !isAdmin()) {
        // Rediriger vers une page d'accès refusé ou la page d'accueil
        return <Navigate to="/access-denied" replace />;
    }

    // Si toutes les vérifications sont passées, afficher le contenu de la route
    return children;
};

export default ProtectedRoute;
