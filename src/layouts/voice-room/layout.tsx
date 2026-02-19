import type { Theme, SxProps } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { useRef, useState, useEffect, useCallback } from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Fab, Zoom, Drawer, useTheme, IconButton, useMediaQuery } from '@mui/material';

// ----------------------------------------------------------------------

type MobileMenuButtonProps = {
  isMobile: boolean;
  theme: Theme;
  onToggle: () => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  buttonPosition: number;
  isDragging: boolean;
};

const MobileMenuButton = ({
  isMobile,
  theme,
  onToggle,
  onDragStart,
  buttonPosition,
  isDragging,
}: MobileMenuButtonProps) => (
  <Zoom in={isMobile} timeout={300}>
    <Box
      sx={{
        position: 'fixed',
        left: 8,
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
          boxShadow: `0 8px 16px ${theme.palette.primary.main}40`,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          '&:hover': {
            transform: isDragging ? 'scale(1.05)' : 'scale(1.1)',
            boxShadow: `0 12px 24px ${theme.palette.primary.main}60`,
          },
          '& .MuiFab-label': {
            fontWeight: 600,
          },
          display: 'flex',
          gap: 0.5,
          px: 1,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          '&::after': isDragging
            ? {
                content: '""',
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}40, ${theme.palette.secondary.main}40)`,
                zIndex: -1,
                animation: 'pulse 1.5s infinite',
              }
            : {},
          '@keyframes pulse': {
            '0%': { opacity: 0.6, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.1)' },
            '100%': { opacity: 0.6, transform: 'scale(1)' },
          },
        }}
      >
        <DragIndicatorIcon
          sx={{
            fontSize: 16,
            opacity: 0.8,
            transition: 'transform 0.2s ease',
            transform: isDragging ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
        <MenuIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Menu
        </Box>
      </Fab>
    </Box>
  </Zoom>
);

type DrawerHeaderProps = {
  onClose: () => void;
};

const DrawerHeader = ({ onClose }: DrawerHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.default',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'primary.main',
        fontWeight: 600,
      }}
    >
      <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
      <span>Navigation Menu</span>
    </Box>
    <IconButton
      onClick={onClose}
      sx={{
        color: 'text.secondary',
        '&:hover': {
          color: 'primary.main',
          bgcolor: 'action.hover',
        },
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
  rightSidebar?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
  data?: {
    nav?: NavSectionProps['data'];
  };
};

export function VoiceRoomLayout({
  sx,
  header,
  leftSidebar,
  rightSidebar,
  mainContent,
  footer,
  data,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(24);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const dragConstraints = useRef({ min: 10, max: 0 });

  // Initialize max constraint after component mount
  useEffect(() => {
    dragConstraints.current = {
      min: 10,
      max: window.innerHeight - 100,
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    dragStartPosition.current = buttonPosition;

    // Update constraints based on current window height
    dragConstraints.current = {
      min: 10,
      max: window.innerHeight - 100,
    };
  };

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Calculate how much the mouse has moved
      const deltaY = clientY - dragStartY.current;

      // New position = start position + delta
      // When mouse moves UP (clientY decreases), deltaY is negative, so button moves UP (bottom decreases)
      // When mouse moves DOWN (clientY increases), deltaY is positive, so button moves DOWN (bottom increases)
      const newPosition = dragStartPosition.current - deltaY;

      // Apply constraints
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

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);

      document.body.style.cursor = '';
      document.body.style.userSelect = '';
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

  // Update max constraint on window resize
  useEffect(() => {
    const handleResize = () => {
      dragConstraints.current.max = window.innerHeight - 100;

      // Ensure button stays within bounds after resize
      setButtonPosition((prev) =>
        Math.min(Math.max(prev, dragConstraints.current.min), dragConstraints.current.max)
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Box
        maxWidth="lg"
        sx={{
          width: 1,
          height: { xs: 'calc(100vh - 55px)', lg: 'calc(100vh - 65px)' },
          maxHeight: { xs: 'calc(100vh - 55px)', lg: 'calc(100vh - 65px)' },
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '220px 1fr 60px',
            md: '250px 1fr 60px',
            lg: '250px 1fr 60px',
          },
          gridTemplateRows: {
            xs: '150px 1fr',
            sm: '120px 1fr',
            md: '120px 1fr 20px',
          },
          gap: 1,
          px: 1,
          mx: 'auto',
          ...sx,
        }}
      >
        {/* Header */}
        <Box sx={{ gridArea: { xs: '1 / 1 / 2 / 2', sm: '1 / 1 / 2 / 4' }, mt: 1 }}>{header}</Box>

        {/* Left Sidebar - Hidden on mobile, shown as Drawer */}
        {!isMobile && <Box sx={{ gridArea: '2 / 1 / 3 / 2' }}>{leftSidebar}</Box>}

        {/* Main Content */}
        <Box
          sx={{
            gridArea: { xs: '2 / 1 / 3 / 2', sm: '2 / 2 / 3 / 3' },
            overflow: 'hidden',
          }}
        >
          {mainContent}
        </Box>

        {/* Right Sidebar */}
        <Box
          sx={{
            gridArea: '2 / 3 / 3 / 4',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {rightSidebar}
        </Box>

        {/* Footer */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, gridArea: { sm: '3 / 1 / 4 / 4' } }}>
          {footer}
        </Box>
      </Box>

      {/* Mobile Menu Button with Drag */}
      <MobileMenuButton
        isMobile={isMobile}
        theme={theme}
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
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: `4px 0 24px ${theme.palette.primary.main}20`,
          },
        }}
      >
        <DrawerHeader onClose={handleDrawerToggle} />
        <Box sx={{ p: 2, overflow: 'auto' }}>{leftSidebar}</Box>
      </Drawer>
    </>
  );
}
