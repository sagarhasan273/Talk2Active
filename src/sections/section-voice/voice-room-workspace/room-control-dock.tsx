import React from 'react';
import { varAlpha } from '@/theme/styles/utils';
import { Mic, Smile, MicOff, PhoneOff, Headphones, MessageSquare } from 'lucide-react';

import { Box, Button, IconButton } from '@mui/material';

import { VoiceButtonRaiseHand } from '../voice-button-raise-hand';

type RoomControlDockProps = {
  micMuted: boolean;
  deafened: boolean;
  handRaised: boolean;
  onToggleMic: () => void;
  onToggleDeafen: () => void;
  onToggleRaiseHand: () => void;
  onOpenReactions?: () => void;
  onToggleChat?: () => void;
  onLeave?: () => void;
};

const dockIconButtonSx = {
  p: 1,
  borderRadius: 1,
  bgcolor: 'background.paper',
  color: 'text.secondary',
  '&:hover': { color: 'text.primary', bgcolor: 'background.paper' },
} as const;

const mobileIconButtonSx = {
  p: 1,
  borderRadius: 1,
  bgcolor: 'background.paper',
  color: 'text.secondary',
  '&:hover': { bgcolor: 'background.default' },
} as const;

export const RoomControlDock = ({
  micMuted,
  deafened,
  handRaised,
  onToggleMic,
  onToggleDeafen,
  onToggleRaiseHand,
  onOpenReactions,
  onToggleChat,
  onLeave,
}: RoomControlDockProps) => (
  <Box
    sx={{
      mt: { xs: 2.5, md: 4 },
      borderRadius: 1,
      bgcolor: 'background.neutral',
      overflow: 'hidden',
    }}
  >
    {/* ---------- Mobile (<360px and up): compact icon-only row ---------- */}
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 1.25,
        py: 1,
        overflowX: 'auto',
      }}
    >
      <IconButton
        onClick={onToggleMic}
        title={micMuted ? 'Unmute' : 'Mute'}
        sx={{
          ...mobileIconButtonSx,
          bgcolor: micMuted ? 'error.main' : 'error.main',
          color: micMuted ? 'common.white' : 'text.secondary',
          '&:hover': { bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.85) },
        }}
      >
        {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </IconButton>

      <IconButton
        onClick={onToggleDeafen}
        title="Mute audio"
        sx={{
          ...mobileIconButtonSx,
          ...(deafened && { color: 'error.main' }),
        }}
      >
        <Headphones size={18} />
      </IconButton>

      <VoiceButtonRaiseHand />

      <IconButton onClick={onOpenReactions} title="Reactions" sx={mobileIconButtonSx}>
        <Smile size={18} />
      </IconButton>

      <IconButton onClick={onToggleChat} title="Toggle chat" sx={mobileIconButtonSx}>
        <MessageSquare size={18} />
      </IconButton>

      <IconButton
        onClick={onLeave}
        title="Leave"
        sx={{
          ...mobileIconButtonSx,
          bgcolor: 'error.main',
          color: '#fff',
          '&:hover': { bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.85) },
        }}
      >
        <PhoneOff size={18} />
      </IconButton>
    </Box>

    {/* ---------- Desktop (sm and up): original labeled layout ---------- */}
    <Box
      sx={{
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        p: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <IconButton
          onClick={onToggleMic}
          sx={{
            ...dockIconButtonSx,
            bgcolor: micMuted ? 'error.main' : 'primary.main',
            color: 'common.white',
            '&:hover': {
              bgcolor: (theme) =>
                micMuted
                  ? varAlpha(theme.palette.error.mainChannel, 0.85)
                  : varAlpha(theme.palette.primary.mainChannel, 0.85),
            },
          }}
        >
          {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </IconButton>
        <IconButton
          onClick={onToggleDeafen}
          title="Mute audio"
          sx={{
            ...dockIconButtonSx,
            color: deafened ? 'error.main' : 'none',
            bgcolor: deafened
              ? (theme) => varAlpha(theme.palette.error.mainChannel, 0.18)
              : 'background.paper',
            '&:hover': {
              color: deafened ? 'error.main' : 'none',
              bgcolor: deafened
                ? (theme) => varAlpha(theme.palette.error.mainChannel, 0.18)
                : 'background.paper',
            },
          }}
        >
          <Headphones size={16} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <VoiceButtonRaiseHand />
        <IconButton onClick={onOpenReactions} title="Reactions" sx={dockIconButtonSx}>
          <Smile size={16} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {/* Chat only lives here on mobile-width dock content — desktop
            viewports (lg+) show the sidebar instead */}
        <IconButton
          onClick={onToggleChat}
          title="Toggle chat"
          sx={{ ...dockIconButtonSx, display: { sm: 'inline-flex', md: 'none' } }}
        >
          <MessageSquare size={16} />
        </IconButton>
        <Button
          onClick={onLeave}
          startIcon={<PhoneOff size={16} />}
          sx={{
            px: 1.75,
            py: 2,
            minWidth: 0,
            borderRadius: 1,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            color: '#fff',
            bgcolor: 'error.main',
            '&:hover': { bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.85) },
          }}
        >
          Leave
        </Button>
      </Box>
    </Box>
  </Box>
);
