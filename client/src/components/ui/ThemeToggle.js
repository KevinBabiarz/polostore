import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icône pour le mode sombre
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icône pour le mode clair

const ThemeToggle = ({ toggleColorMode }) => {
  const theme = useTheme();

  return (
    <Tooltip title={theme.palette.mode === 'dark' ? "Mode clair" : "Mode sombre"}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle dark/light mode"
      >
        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
