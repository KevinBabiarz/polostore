import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, Box, Tooltip, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

const LanguageSelector = ({ size = 'small', showLabel = false, compact = true }) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const languages = [
    { code: 'fr', name: t('language:french'), flag: '🇫🇷' },
    { code: 'en', name: t('language:english'), flag: '🇬🇧' },
    { code: 'pl', name: t('language:polish'), flag: '🇵🇱' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (compact) {
    return (
      <FormControl size={size} sx={{ minWidth: 80 }}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          variant="outlined"
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              py: 0.5,
              px: 1
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.4)'
            }
          }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LanguageIcon fontSize="small" />
          <Typography variant="body2">
            {t('language:selectLanguage')}:
          </Typography>
        </Box>
      )}
      <FormControl size={size} sx={{ minWidth: 120 }}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          variant="outlined"
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
