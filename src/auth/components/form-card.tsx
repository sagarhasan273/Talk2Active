import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type FormBoxProps = {
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};

export function FormCard({ sx, children }: FormBoxProps) {
  return (
    <Box
      sx={{
        my: 3,
        color: 'text.disabled',
        padding: '20px',
        borderRadius: '20px',
        backdropFilter: 'blur(30px)',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.44)',
        '&::before, :after': { borderTopStyle: 'dashed' },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
