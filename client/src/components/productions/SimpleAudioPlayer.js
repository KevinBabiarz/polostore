import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';

/**
 * Composant de lecteur audio minimal et simplifié
 */
const SimpleAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Effet pour réinitialiser l'audio quand la source change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log("SimpleAudioPlayer: Réception nouvelle source:", src);

    // Réinitialiser les états
    setIsPlaying(false);
    setError(null);

    // Construire l'URL absolue pour Railway/production
    let correctedSrc = src;
    if (src && !src.startsWith('http')) {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://polostore-production.up.railway.app'
        : 'http://localhost:5050';

      if (src.startsWith('/uploads/')) {
        correctedSrc = `${baseUrl}${src}`;
      } else if (src.startsWith('/api/uploads/')) {
        const correctedPath = src.replace('/api/uploads/', '/uploads/');
        correctedSrc = `${baseUrl}${correctedPath}`;
      } else {
        const fileName = src.split('/').pop();
        correctedSrc = `${baseUrl}/uploads/${fileName}`;
      }
    }

    console.log("SimpleAudioPlayer: URL corrigée:", correctedSrc);

    // Configurer la source
    audio.src = correctedSrc;

    // Gestionnaire d'erreur simple
    const handleError = () => {
      console.error("SimpleAudioPlayer: Erreur de chargement audio:", correctedSrc);
      setError("Impossible de charger l'audio");
      setIsPlaying(false);
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Tentative de lecture
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("SimpleAudioPlayer: Lecture démarrée");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("SimpleAudioPlayer: Erreur de lecture:", err);
            setError("Erreur de lecture");
            setIsPlaying(false);
          });
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
      <audio ref={audioRef} />

      <IconButton
        onClick={togglePlay}
        disabled={!src || !!error}
        sx={{ mx: 1 }}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}

      {!error && !src && (
        <Typography variant="caption" color="text.secondary">
          Aucun fichier audio disponible
        </Typography>
      )}
    </Box>
  );
};

export default SimpleAudioPlayer;
