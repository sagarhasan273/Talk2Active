import CancelIcon from '@mui/icons-material/Cancel';
import { alpha, Box, Chip, Typography, useTheme } from '@mui/material';
import React from 'react';
import { labelClasses } from './classes';
import { LabelProps } from './types';


export const Label = ({
  label,
  startIcon,
  endIcon,
  color = 'primary',
  variant = 'soft',
  size = 'small',
  onClick,
  onDelete,
  selected = false,
  disabled = false,
  sx,
}: LabelProps) => {
  const theme = useTheme();
  const isSmall = size === 'small';
  const activeColor = theme.palette[color].main;

  const iconStyles = {
    width: 16,
    height: 16,
    '& svg, img': {
      width: 1,
      height: 1,
      objectFit: 'cover',
    },
  };


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          bgcolor: activeColor,
          color: theme.palette[color].contrastText,
          border: '1px solid transparent',
          '&:hover': {
            bgcolor: theme.palette[color].dark,
          },
          '& .MuiChip-deleteIcon': {
            ml: 0.25,
            mr: 0.25,
            color: alpha(theme.palette[color].contrastText, 0.75),
            '&:hover': {
              color: theme.palette[color].contrastText,
            },
          },
        };

      case 'outlined':
        return {
          bgcolor: selected ? alpha(activeColor, 0.12) : 'transparent',
          color: activeColor,
          border: '1.5px solid',
          borderColor: activeColor,
          '&:hover': {
            bgcolor: alpha(activeColor, 0.08),
            borderColor: activeColor,
          },
          '& .MuiChip-deleteIcon': {
            ml: 0.25,
            mr: 0.25,
            color: alpha(activeColor, 0.7),
            '&:hover': {
              color: activeColor,
            },
          },
        };

      case 'soft':
      default:
        return {
          bgcolor: selected ? alpha(activeColor, 0.22) : alpha(activeColor, 0.1),
          color: activeColor,
          border: '1px solid',
          borderColor: selected ? alpha(activeColor, 0.45) : alpha(activeColor, 0.2),
          '&:hover': {
            bgcolor: alpha(activeColor, 0.18),
            borderColor: alpha(activeColor, 0.35),
          },
          '& .MuiChip-deleteIcon': {
            ml: 0.25,
            mr: 0.25,
            color: alpha(activeColor, 0.7),
            '&:hover': {
              color: activeColor,
            },
          },
        };
    }
  };

  return (
    <Chip
      size={size}
      color={color}
      disabled={disabled}
      clickable={Boolean(onClick)}
      onClick={onClick}
      onDelete={onDelete ? handleDelete : undefined}
      deleteIcon={
        onDelete ? (
          <CancelIcon
            sx={{
              fontSize: isSmall ? 15 : 17,
              transition: 'transform 0.16s ease, color 0.16s ease',
              '&:hover': {
                transform: 'scale(1.15)',
              },
            }}
          />
        ) : undefined
      }
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.65 }}>
          {startIcon && (
            <Box component="span" className={labelClasses.icon} sx={{ mr: 0.5, ...iconStyles }}>
              {startIcon}
            </Box>
          )}
          <Typography
            component="span"
            sx={{
              fontSize: isSmall ? '0.75rem' : '0.8125rem',
              fontWeight: 700,
              color: 'inherit',
              lineHeight: 1,
              letterSpacing: '0.015em',
              textTransform: 'capitalize',
            }}
          >

            {typeof label === 'string' ? sentenceCase(label) : label}
          </Typography>

          {endIcon && (
            <Box component="span" className={labelClasses.icon} sx={{ ml: 0.5, ...iconStyles }}>
              {endIcon}
            </Box>
          )}
        </Box>
      }
      sx={{
        height: isSmall ? 26 : 32,
        borderRadius: 1,
        px: 0.5,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiChip-label': {
          px: 0.75,
        },
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        }),
        ...getVariantStyles(),
        ...sx,
      }}
    />
  );
};

// ----------------------------------------------------------------------

function sentenceCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
