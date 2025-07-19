import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';

const TEXT = 'CLIQUE POUR ÉCOUTER';

export default function AnimatedBanner() {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (index < TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + TEXT[index]);
        setIndex(index + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      // Après l'effet typewriter, faire clignoter le texte
      const interval = setInterval(() => {
        setFade((f) => !f);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [index]);

  useEffect(() => {
    if (index >= TEXT.length) {
      const interval = setInterval(() => {
        setFade((f) => !f);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [index]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        height: 40,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.7), rgba(0,0,0,0.8), rgba(0,0,0,0.7))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '1rem', sm: '1.2rem' },
          letterSpacing: '2px',
          fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
          opacity: fade ? 1 : 0.4,
          transition: 'opacity 0.4s',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        }}
      >
        {displayed}
      </Typography>
    </Box>
  );
}

