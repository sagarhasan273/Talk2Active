import { varAlpha } from '@/theme/styles';
import React, { useRef, useState, useCallback } from 'react';

import { Box, useTheme } from '@mui/material';

import type { ResizeWidthRightProps } from './types';

export const ResizeWidthRight = ({
  width,
  onWidthChange,
  minWidth = 260,
  maxWidth = 480,
  children,
}: ResizeWidthRightProps) => {
  const theme = useTheme();

  const [dragging, setDragging] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(width);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - startX.current;

      const next = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));

      onWidthChange(next);
    },
    [maxWidth, minWidth, onWidthChange]
  );

  const stopDragging = useCallback(() => {
    setDragging(false);

    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopDragging);
  }, [handleMouseMove]);

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();

    startX.current = e.clientX;
    startWidth.current = width;

    setDragging(true);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      {/* Drag handle */}
      <Box
        onMouseDown={startDragging}
        sx={{
          position: 'absolute',
          right: -6,
          top: 0,
          bottom: 0,
          width: '1px',
          cursor: 'col-resize',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          '&:hover .resize-grip': {
            bgcolor: theme.palette.primary.main,
          },

          bgcolor: dragging ? theme.palette.primary.main : 'transparent',
        }}
      >
        <Box
          className="resize-grip"
          sx={{
            position: 'absolute',
            top: '46%',
            width: 4,
            height: 40,
            borderRadius: 4,

            bgcolor: dragging
              ? theme.palette.primary.main
              : varAlpha(theme.palette.text.primaryChannel, 0.2),

            transition: dragging ? 'none' : 'background-color 0.15s ease',
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
};
