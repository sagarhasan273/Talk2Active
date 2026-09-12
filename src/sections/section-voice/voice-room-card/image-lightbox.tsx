import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Box, alpha, Backdrop, IconButton, Typography } from '@mui/material';

type ImageLightboxProps = {
  src: string;
  name: string;
  onClose: () => void;
};

/** Full-screen image viewer for a participant's profile photo. */
export const ImageLightbox = ({ src, name, onClose }: ImageLightboxProps) => (
  <Backdrop
    open
    onClick={onClose}
    sx={{
      zIndex: 2000,
      bgcolor: 'rgba(0,0,0,0.92)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: -40,
          right: -8,
          color: 'white',
          bgcolor: alpha('#fff', 0.1),
          '&:hover': { bgcolor: alpha('#fff', 0.2) },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box
        component="img"
        src={src}
        alt={name}
        sx={{
          width: { xs: 280, sm: 380, md: 440 },
          height: { xs: 280, sm: 380, md: 440 },
          objectFit: 'cover',
          borderRadius: 3,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.12)',
        }}
      />

      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, letterSpacing: 0.3 }}>
        {name}
      </Typography>
    </Box>
  </Backdrop>
);
