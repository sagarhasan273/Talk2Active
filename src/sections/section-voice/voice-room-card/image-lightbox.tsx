// src/sections/section-voice/voice-room-card/image-lightbox.tsx

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { alpha, Backdrop, Box, Fade, IconButton, Typography } from '@mui/material';

type ImageLightboxProps = {
  src: string;
  name: string;
  onClose: () => void;
};

export const ImageLightbox = ({ src, name, onClose }: ImageLightboxProps) => (
  <Backdrop
    open
    onClick={onClose}
    TransitionComponent={Fade}
    sx={{
      zIndex: 2500,
      bgcolor: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
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
        m: 'auto',
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: -46,
          right: 0,
          color: '#fff',
          bgcolor: alpha('#fff', 0.12),
          '&:hover': { bgcolor: alpha('#fff', 0.22) },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box
        component="img"
        src={src}
        alt={name}
        sx={{
          width: { xs: 260, sm: 340, md: 400 },
          height: { xs: 260, sm: 340, md: 400 },
          objectFit: 'cover',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 64px -8px rgba(0, 0, 0, 0.75)',
        }}
      />

      <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, letterSpacing: -0.2 }}>
        {name}
      </Typography>
    </Box>
  </Backdrop>
);
