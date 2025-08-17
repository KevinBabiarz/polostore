// src/pages/admin/Messages.js
import React, { useState, useEffect } from 'react';
import { getContactMessages, markMessageAsRead, getContactMessage, deleteContactMessage } from '../../services/contactService';
import {
    Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip,
    IconButton, CircularProgress, Alert, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box
} from '@mui/material';
import { MarkEmailRead, Email, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AdminMessages = () => {
  const { t } = useTranslation('admin');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Détail
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Confirmation suppression
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setError('messages.loadError');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    try {
      e?.stopPropagation();
      await markMessageAsRead(id);
      setMessages((prev) => prev.map(msg =>
        msg.id === id ? { ...msg, read: true } : msg
      ));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: true });
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleRowClick = async (id) => {
    try {
      setLoadingDetail(true);
      const full = await getContactMessage(id);
      setSelectedMessage(full);
      setDetailOpen(true);
    } catch (e) {
      console.error('Erreur de chargement du message:', e);
      setError('messages.loadError');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAskDelete = (id, e) => {
    e.stopPropagation();
    setToDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await deleteContactMessage(toDeleteId);
      setMessages((prev) => prev.filter(m => m.id !== toDeleteId));
      if (selectedMessage?.id === toDeleteId) {
        setDetailOpen(false);
        setSelectedMessage(null);
      }
    } catch (e) {
      console.error('Erreur suppression:', e);
      setError('messages.deleteError');
    } finally {
      setDeleteOpen(false);
      setToDeleteId(null);
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
        <Alert severity="error">{t(error)}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('messages.title')}
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('messages.state')}</TableCell>
                <TableCell>{t('messages.date')}</TableCell>
                <TableCell>{t('messages.from')}</TableCell>
                <TableCell>{t('messages.subject')}</TableCell>
                <TableCell>{t('messages.message')}</TableCell>
                <TableCell>{t('messages.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((message) => (
                  <TableRow
                    key={message.id}
                    hover
                    onClick={() => handleRowClick(message.id)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: message.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)'
                    }}
                  >
                    <TableCell>
                      {message.read ? (
                        <Chip
                          icon={<MarkEmailRead />}
                          label={t('messages.read')}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<Email />}
                          label={t('messages.unread')}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {!message.read && (
                        <IconButton
                          color="primary"
                          onClick={(e) => handleMarkAsRead(message.id, e)}
                          title={t('messages.markAsRead')}
                        >
                          <MarkEmailRead />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={(e) => handleAskDelete(message.id, e)}
                        title={t('messages.delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('messages.noMessages')}
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
          labelRowsPerPage={t('messages.rowsPerPage')}
        />
      </Paper>

      {/* Détail du message */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('messages.detailTitle')}</DialogTitle>
        <DialogContent dividers>
          {loadingDetail || !selectedMessage ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {new Date(selectedMessage.created_at).toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>{selectedMessage.subject}</Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>{t('messages.from')}:</strong> {selectedMessage.name} &lt;{selectedMessage.email}&gt;
              </Typography>
              {selectedMessage.production_title && (
                <Typography sx={{ mt: 1 }}>
                  <strong>{t('messages.production')}:</strong> {selectedMessage.production_title}
                </Typography>
              )}
              <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!selectedMessage?.read && (
            <Button onClick={(e) => handleMarkAsRead(selectedMessage.id, e)} startIcon={<MarkEmailRead />}>
              {t('messages.markAsRead')}
            </Button>
          )}
          <Button color="error" onClick={() => { setDeleteOpen(true); setToDeleteId(selectedMessage?.id || null); }} startIcon={<DeleteIcon />}>
            {t('messages.delete')}
          </Button>
          <Button onClick={() => setDetailOpen(false)}>{t('common:close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation suppression */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('messages.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('messages.confirmDeleteText')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('common:cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>{t('messages.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminMessages;