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
import { useTranslation } from 'react-i18next';

const AdminProductions = () => {
    const { t } = useTranslation('admin'); // Spécifier le namespace admin
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
            console.error(t('productionManagement.errors.loadProductions'), error);
            setError('productionManagement.errors.loadProductions');
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
            setError("productionManagement.errors.deleteProduction");
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
                    {t('productionManagement.title')}
                </Typography>
                <Button
                    component={Link}
                    to="/admin/productions/add"
                    variant="contained"
                    startIcon={<Add />}
                >
                    {t('productionManagement.newProduction')}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{t(error)}</Alert>}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('productionManagement.image')}</TableCell>
                                <TableCell>{t('productionManagement.titleCol')}</TableCell>
                                <TableCell>{t('productionManagement.artist')}</TableCell>
                                <TableCell>{t('productionManagement.genre')}</TableCell>
                                <TableCell>{t('productionManagement.releaseDate')}</TableCell>
                                <TableCell>{t('productionManagement.actions')}</TableCell>
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
                                        <TableCell>{production.genre || t('productionManagement.genreNotSpecified')}</TableCell>
                                        <TableCell>
                                            {production.release_date
                                                ? new Date(production.release_date).toLocaleDateString()
                                                : t('productionManagement.releaseDateNotSpecified')}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                component={Link}
                                                to={`/productions/${production.id}`}
                                                color="info"
                                                title={t('productionManagement.view')}
                                            >
                                                <VisibilityOutlined />
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/admin/productions/edit/${production.id}`}
                                                color="primary"
                                                title={t('productionManagement.edit')}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(production.id)}
                                                title={t('productionManagement.delete')}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {productions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        {t('productionManagement.noProductions')}
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
                    labelRowsPerPage={t('productionManagement.rowsPerPage')}
                />
            </Paper>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>{t('productionManagement.confirmDeleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('productionManagement.confirmDeleteText')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>{t('common:cancel')}</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        {t('productionManagement.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminProductions;
