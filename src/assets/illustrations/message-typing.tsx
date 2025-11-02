import type { BoxProps } from '@mui/material/Box';

import { memo } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  hideBackground?: boolean;
};

function MessageTyping({ hideBackground, sx, ...other }: Props) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 24 20"
      style={{ display: 'block' }}
      sx={{ width: 24, maxWidth: 1, flexShrink: 0, height: 'auto', ...sx }}
      {...other}
    >
      <circle cx="16" cy="10" r="0" fill="currentColor">
        <animate
          attributeName="r"
          begin=".67s"
          calcMode="spline"
          dur="1.5s"
          keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
          repeatCount="indefinite"
          values="0;1.75;0;0"
        />
      </circle>
      <circle cx="12" cy="10" r="0" fill="currentColor">
        <animate
          attributeName="r"
          begin=".33s"
          calcMode="spline"
          dur="1.5s"
          keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
          repeatCount="indefinite"
          values="0;1.75;0;0"
        />
      </circle>
      <circle cx="8" cy="10" r="0" fill="currentColor">
        <animate
          attributeName="r"
          begin="0s"
          calcMode="spline"
          dur="1.5s"
          keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
          repeatCount="indefinite"
          values="0;1.75;0;0"
        />
      </circle>
    </Box>
  );
}

export default memo(MessageTyping);
