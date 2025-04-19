import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import type { CustomBreadcrumbsProps } from './types';

// ----------------------------------------------------------------------

export function VoiceChatBreadcrumbs({
  links,
  heading,
  slotProps,
  sx,
  ...other
}: CustomBreadcrumbsProps) {
  const renderHeading = (
    <Typography variant="h4" sx={{ mb: 2, ...slotProps?.heading }}>
      {heading}
    </Typography>
  );

  const renderLinks = (
    <Breadcrumbs separator={<Separator />} sx={slotProps?.breadcrumbs} {...other}>
      {links.map((link, index) => (
        <Button
          key={link.name ?? index}
          variant="text"
          onClick={() => link.href && slotProps?.onClick?.(link.href)}
          sx={{
            p: 0,
            m: 0,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
          disableRipple
        >
          {link.name}
        </Button>
      ))}
    </Breadcrumbs>
  );

  return (
    <Box gap={2} display="flex" flexDirection="column" sx={sx} {...other}>
      <Box display="flex" alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          {heading && renderHeading}

          {!!links.length && renderLinks}
        </Box>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: 'text.disabled',
      }}
    />
  );
}
