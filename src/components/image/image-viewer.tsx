import React from 'react';

import { Close } from '@mui/icons-material';
import { Box, Dialog, IconButton, DialogContent } from '@mui/material';

import { Iconify } from '../iconify';

type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
};

export const ImageViewer: React.FC<ImageViewerProps> = ({ open, onClose, imageUrl }) => {
  const [zoom, setZoom] = React.useState<number>(1);
  const [position, setPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{
    clientX: number;
    clientY: number;
    positionX: number;
    positionY: number;
  }>({ clientX: 0, clientY: 0, positionX: 0, positionY: 0 });
  const [transformOrigin, setTransformOrigin] = React.useState<string>('center center');

  const handleZoomIn = (): void => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (): void => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
        setTransformOrigin('center center');
      }
      return newZoom;
    });
  };

  const handleDoubleClick = (e: React.MouseEvent): void => {
    if (zoom === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setTransformOrigin(`${x}% ${y}%`);
      setZoom(2);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setTransformOrigin('center center');
    }
  };

  // Mouse events for dragging - FIXED
  const handleMouseDown = (e: React.MouseEvent): void => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        positionX: position.x,
        positionY: position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (isDragging && zoom > 1) {
      const deltaX = e.clientX - dragStart.clientX;
      const deltaY = e.clientY - dragStart.clientY;

      // Adjust movement speed based on zoom level
      const adjustedDeltaX = deltaX / zoom;
      const adjustedDeltaY = deltaY / zoom;

      setPosition({
        x: dragStart.positionX + adjustedDeltaX,
        y: dragStart.positionY + adjustedDeltaY,
      });
    }
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  const handleClose = (): void => {
    onClose();
    setTimeout(() => {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setTransformOrigin('center center');
    }, 300);
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      // Store original styles
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Apply styles
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Cleanup function
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }

    // Ensure the effect callback returns a value on all code paths
    return undefined;
  }, [open]);

  React.useEffect(() => {
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 1,
        },
      }}
      // Prevent event propagation at Dialog level
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
          zIndex: 1300,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 1300,
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '4px 12px',
          borderRadius: 1,
        }}
      >
        <IconButton
          onClick={handleZoomOut}
          size="small"
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Iconify icon="lucide:zoom-out" />
        </IconButton>

        <Box
          sx={{
            color: 'white',
            fontSize: '0.75rem',
            minWidth: '45px',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        >
          {Math.round(zoom * 100)}%
        </Box>

        <IconButton
          onClick={handleZoomIn}
          size="small"
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Iconify icon="lucide:zoom-in" />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        // Add more event prevention
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Preview"
          onDoubleClick={handleDoubleClick}
          draggable={false}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            // Prevent image drag
            WebkitUserDrag: 'none',
            KhtmlUserDrag: 'none',
            MozUserDrag: 'none',
            OUserDrag: 'none',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
