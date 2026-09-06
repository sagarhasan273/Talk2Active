import type { Theme, SxProps } from '@mui/material/styles';

import { useRef, useState, useEffect, useCallback } from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import {
  Box,
  Fab,
  Zoom,
  Stack,
  alpha,
  Drawer,
  useTheme,
  IconButton,
  Typography,
  useMediaQuery,
  Container,
} from '@mui/material';

// ----------------------------------------------------------------------

type MobileMenuButtonProps = {
  isMobile: boolean;
  onToggle: () => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  buttonPosition: number;
  isDragging: boolean;
};

const MobileMenuButton = ({
  isMobile,
  onToggle,
  onDragStart,
  buttonPosition,
  isDragging,
}: MobileMenuButtonProps) => {
  const theme = useTheme();

  return (
    <Zoom in={isMobile} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          left: { xs: 16, sm: 24 },
          bottom: `${buttonPosition}px`,
          zIndex: 1200,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <Fab
          color="primary"
          aria-label="menu"
          onClick={!isDragging ? onToggle : undefined}
          sx={{
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
            borderRadius: '50%',
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              transform: isDragging ? 'scale(1.1)' : 'scale(1.08)',
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '& .MuiFab-label': {
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            },
          }}
        >
          <DragIndicatorIcon
            sx={{
              fontSize: 18,
              opacity: 0.7,
              transition: 'transform 0.3s ease',
              transform: isDragging ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
          <MenuIcon sx={{ fontSize: 22 }} />
        </Fab>
      </Box>
    </Zoom>
  );
};

type DrawerHeaderProps = {
  onClose: () => void;
};

const DrawerHeader = ({ onClose }: DrawerHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2.5,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.default',
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700}>
        Navigation
      </Typography>
    </Stack>
    <IconButton
      onClick={onClose}
      sx={{
        color: 'text.secondary',
        '&:hover': {
          color: 'primary.main',
          transform: 'rotate(90deg)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CloseIcon />
    </IconButton>
  </Box>
);

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  filter?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
  inVoice?: boolean;
};

export function VoiceRoomLayout({
  sx,
  header,
  leftSidebar,
  filter,
  mainContent,
  footer,
  inVoice,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(24);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const dragConstraints = useRef({ min: 10, max: window.innerHeight - 100 });

  useEffect(() => {
    setButtonPosition(inVoice ? 80 : 24);
  }, [inVoice]);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    dragStartPosition.current = buttonPosition;
    dragConstraints.current.max = window.innerHeight - 100;
  };

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - dragStartY.current;
      const newPosition = dragStartPosition.current - deltaY;
      const constrainedPosition = Math.min(
        Math.max(newPosition, dragConstraints.current.min),
        dragConstraints.current.max
      );
      setButtonPosition(constrainedPosition);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const handleResize = () => {
      dragConstraints.current.max = window.innerHeight - 100;
      setButtonPosition((prev) =>
        Math.min(Math.max(prev, dragConstraints.current.min), dragConstraints.current.max)
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          p: { xs: 1 },
          height: 'calc(100vh - 54px)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          gap: { xs: 1, sm: 2 },
          position: 'relative',
          ...sx,
        }}
      >
          {header}

          {/* Scrollable Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'divider',
                borderRadius: 3,
              },
            }}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              {/* Filter */}
              {filter && (
                <Box
                  sx={{
                    flexShrink: 0,
                  }}
                >
                  {filter}
                </Box>
              )}

              {mainContent}


              {/* Footer */}
              {footer && (
                <Box
                  sx={{
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    mt: 1,
                  }}
                >
                  {footer}
                </Box>
              )}
            </Box>
          </Box>
      </Container>

      {/* Mobile Menu Button */}
      <MobileMenuButton
        isMobile={isMobile}
        onToggle={handleDrawerToggle}
        onDragStart={handleDragStart}
        buttonPosition={buttonPosition}
        isDragging={isDragging}
      />

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 320,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow: `8px 0 40px ${alpha(theme.palette.common.black, 0.15)}`,
            bgcolor: 'background.default',
            overflow: 'hidden',
          },
        }}
      >
        <DrawerHeader onClose={handleDrawerToggle} />
        <Box
          sx={{
            p: 2.5,
            overflow: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': {
              width: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'divider',
              borderRadius: 2,
            },
          }}
        >
          {leftSidebar}
        </Box>
      </Drawer>
    </>
  );
}
