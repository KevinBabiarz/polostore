import React from 'react';
import { Box, Typography } from '@mui/material';

const AnimatedAttentionText = ({ text = "Nouveau !" }) => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
        }}>
            <Typography
                variant="h4"
                sx={{
                    color: '#fff',
                    textShadow: '0 0 10px #00e6ff, 0 0 20px #00e6ff',
                    animation: 'pulseGlow 1.5s infinite',
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    background: 'linear-gradient(90deg, #00e6ff 0%, #ff00cc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {text}
            </Typography>
            <style>{`
                @keyframes pulseGlow {
                    0% { text-shadow: 0 0 10px #00e6ff, 0 0 20px #00e6ff; }
                    50% { text-shadow: 0 0 30px #ff00cc, 0 0 60px #ff00cc; }
                    100% { text-shadow: 0 0 10px #00e6ff, 0 0 20px #00e6ff; }
                }
            `}</style>
        </Box>
    );
};

export default AnimatedAttentionText;

