// src/pages/auth/AccessDenied.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { BlockOutlined, HomeOutlined } from '@mui/icons-material';

const AccessDenied = () => {
    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <BlockOutlined
                        sx={{
                            fontSize: 80,
                            color: 'error.main',
                            mb: 2
                        }}
                    />
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Accès refusé
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" paragraph>
                        Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
                        Cette fonctionnalité est réservée aux administrateurs.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        color="primary"
                        startIcon={<HomeOutlined />}
                    >
                        Retour à l'accueil
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AccessDenied;
