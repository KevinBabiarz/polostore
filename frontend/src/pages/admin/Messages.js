// src/pages/admin/Messages.js
import React, { useState, useEffect } from 'react';
import { getContactMessages, markMessageAsRead } from '../../services/contactService';
import {
    Container, Typography, Paper, Box, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip,
    IconButton, CircularProgress, Alert, TablePagination
} from '@mui/material';
import { MarkEmailRead, Email } from '@mui/icons-material';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await getContactMessages();
            setMessages(data);
        } catch (error) {
            console.error("Erreur lors du chargement des messages:", error);
            setError("Impossible de charger les messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markMessageAsRead(id);
            setMessages(messages.map(msg =>
                msg.id === id ? { ...msg, read: true } : msg
            ));
        } catch (error) {
            console.error("Erreur:", error);
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

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Gestion des Messages
            </Typography>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>État</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>De</TableCell>
                                <TableCell>Sujet</TableCell>
                                <TableCell>Message</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messages
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((message) => (
                                    <TableRow
                                        key={message.id}
                                        sx={{
                                            '&:hover': { backgroundColor: 'action.hover' },
                                            backgroundColor: message.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)'
                                        }}
                                    >
                                        <TableCell>
                                            {message.read ? (
                                                <Chip
                                                    icon={<MarkEmailRead />}
                                                    label="Lu"
                                                    color="success"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<Email />}
                                                    label="Non lu"
                                                    color="primary"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(message.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{message.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {message.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{message.subject}</TableCell>
                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {message.message}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {!message.read && (
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleMarkAsRead(message.id)}
                                                    title="Marquer comme lu"
                                                >
                                                    <MarkEmailRead />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {messages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Aucun message reçu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={messages.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Messages par page:"
                />
            </Paper>
        </Container>
    );
};

export default AdminMessages;