// src/pages/admin/Productions.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getProductions,
    deleteProduction
} from '../../services/productionService';
import {
    Container, Typography, Paper, Box, Button, Table,
    TableBody, TableCell, TableContainer, TableHead,
    TableRow, IconButton, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle,
    CircularProgress, Alert, TablePagination
} from '@mui/material';
import {
    Add, Edit, Delete, VisibilityOutlined
} from '@mui/icons-material';
import config from '../../config/config';

const AdminProductions = () => {
    const [productions, setProductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchProductions = async () => {
        try {
            setLoading(true);
            const data = await getProductions(1, 100);
            setProductions(data.productions || data);
        } catch (error) {
            console.error("Erreur lors du chargement des productions:", error);
            setError("Impossible de charger les productions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductions();
    }, []);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteProduction(deleteId);
            setProductions(productions.filter(prod => prod.id !== deleteId));
            setOpenDialog(false);
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            setError("Impossible de supprimer cette production");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestion des Productions
                </Typography>
                <Button
                    component={Link}
                    to="/admin/productions/add"
                    variant="contained"
                    startIcon={<Add />}
                >
                    Nouvelle Production
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Image</TableCell>
                                <TableCell>Titre</TableCell>
                                <TableCell>Artiste</TableCell>
                                <TableCell>Genre</TableCell>
                                <TableCell>Date de sortie</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((production) => (
                                    <TableRow key={production.id}>
                                        <TableCell>
                                            <Box
                                                component="img"
                                                sx={{
                                                    height: 50,
                                                    width: 50,
                                                    objectFit: 'cover',
                                                    borderRadius: 1
                                                }}
                                                alt={production.title}
                                                src={production.cover_image
                                                    ? `${config.UPLOADS_URL}${production.cover_image}`
                                                    : '/placeholder.jpg'}
                                            />
                                        </TableCell>
                                        <TableCell>{production.title}</TableCell>
                                        <TableCell>{production.artist}</TableCell>
                                        <TableCell>{production.genre || 'Non spécifié'}</TableCell>
                                        <TableCell>
                                            {production.release_date
                                                ? new Date(production.release_date).toLocaleDateString()
                                                : 'Non spécifiée'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                component={Link}
                                                to={`/productions/${production.id}`}
                                                color="info"
                                                title="Voir"
                                            >
                                                <VisibilityOutlined />
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/admin/productions/edit/${production.id}`}
                                                color="primary"
                                                title="Modifier"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(production.id)}
                                                title="Supprimer"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {productions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Aucune production disponible
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={productions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Productions par page:"
                />
            </Paper>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer cette production ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminProductions;