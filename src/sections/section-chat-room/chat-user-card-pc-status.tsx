import { Box, capitalize, Typography } from '@mui/material';

type Props = {
  verified?: boolean;
  PCStatus?: string;
};

export function ChatUserCardPCStatus({ verified, PCStatus = 'connected' }: Props) {
  const showPCStatus = Boolean(PCStatus !== 'connected');

  return (
    <>
      {/* VERIFIED / UNVERIFIED */}
      {!showPCStatus ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            left: -2,
            backgroundColor: verified ? 'primary.main' : 'grey.500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid',
            borderColor: 'background.paper',
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="caption"
            sx={{ px: '4px', fontWeight: 'bold', color: 'common.white' }}
          >
            {verified ? 'VERIFIED' : 'UNVERIFIED'}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            left: 0,
            px: '4px',
            py: '1px',
            backgroundColor: 'background.paper',
            borderRadius: 0.5,
            opacity: showPCStatus ? 1 : 0,
            transform: showPCStatus ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'Yellow' }}>
            {capitalize(PCStatus)}
          </Typography>
        </Box>
      )}
    </>
  );
}
