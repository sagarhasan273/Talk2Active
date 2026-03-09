import 'react-lazy-load-image-component/src/effects/blur.css';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { imageClasses } from './classes';

import type { ImageProps } from './types';

// ----------------------------------------------------------------------

const ImageWrapper = styled(Box)({
  overflow: 'hidden',
  position: 'relative',
  verticalAlign: 'bottom',
  display: 'inline-block',
  [`& .${imageClasses.wrapper}`]: {
    width: '100%',
    height: '100%',
    verticalAlign: 'bottom',
    backgroundSize: 'cover !important',
  },
});

const Overlay = styled('span')({
  top: 0,
  left: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
  position: 'absolute',
});

// ----------------------------------------------------------------------

export const Image = forwardRef<HTMLSpanElement, ImageProps>(
  ({ alt, src, ratio, disabledEffect, slotProps, sx, className, effect, ...other }, ref) => (
    <ImageWrapper
      ref={ref}
      component="span"
      className={imageClasses.root.concat(className ? ` ${className}` : '')}
      sx={{ ...(!!ratio && { width: 1 }), ...sx }}
      {...other}
    >
      {slotProps?.overlay && (
        <Overlay className={imageClasses.overlay} sx={slotProps?.overlay} />
      )}

      <img
        alt={alt}
        src={src}
        loading={disabledEffect ? 'eager' : 'lazy'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          verticalAlign: 'bottom',
          aspectRatio: ratio as string | undefined,
        }}
      />
    </ImageWrapper>
  )
);
