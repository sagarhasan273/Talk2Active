import { varAlpha } from '@/theme/styles';
import React, { useRef, useState, useCallback } from 'react';

import { Box, useTheme } from '@mui/material';

import type { ResizeHeightBottomProps } from './types';

export const ResizeHeightBottom = ({
  height,
  onHeightChange,
  minHeight = 200,
  maxHeight = 700,
  children,
}: ResizeHeightBottomProps) => {
  const theme = useTheme();

  const [dragging, setDragging] = useState(false);

  const startY = useRef(0);
  const startHeight = useRef(height);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Bottom edge:
      // moving down should increase height.
      const delta = e.clientY - startY.current;

      const next = Math.min(maxHeight, Math.max(minHeight, startHeight.current + delta));

      onHeightChange(next);
    },
    [maxHeight, minHeight, onHeightChange]
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

    startY.current = e.clientY;
    startHeight.current = height;

    setDragging(true);

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
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
          left: 0,
          right: 0,
          bottom: -6,
          height: '1px',
          cursor: 'row-resize',
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
            left: '46%',
            width: 40,
            height: 4,
            borderRadius: 4,

            bgcolor: dragging
              ? theme.palette.primary.main
              : varAlpha(theme.palette.text.primaryChannel, 0.2),

            transition: dragging ? 'none' : 'background-color 0.15s ease',
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
};
