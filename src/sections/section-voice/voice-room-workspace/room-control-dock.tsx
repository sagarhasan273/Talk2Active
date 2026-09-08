import React from 'react';
import { Mic, Smile, MicOff, PhoneOff, Headphones, MessageSquare } from 'lucide-react';

import { Box, alpha, Button, IconButton } from '@mui/material';

import { slate, accent } from './theme-tokens';

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
  p: 1.25,
  borderRadius: 2,
  bgcolor: slate[800],
  color: slate[300],
  '&:hover': { bgcolor: slate[700] },
} as const;

// Circular, icon-only variant used in the mobile row — same visual language
// (bg/hover) as dockIconButtonSx, just round and slightly smaller so six of
// them comfortably fit a 360px-wide screen.
const mobileIconButtonSx = {
  p: 1,
  borderRadius: '50%',
  bgcolor: slate[800],
  color: slate[300],
  '&:hover': { bgcolor: slate[700] },
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
      bgcolor: 'rgba(2,6,23,0.9)',
      border: `1px solid ${slate[800]}`,
      boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
      overflow: 'hidden',
    }}
  >
    {/* ---------- Mobile (<360px and up): compact icon-only row ---------- */}
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
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
          bgcolor: accent.brand,
          color: '#fff',
          '&:hover': { bgcolor: alpha(accent.brand, 0.85) },
        }}
      >
        {micMuted ? <MicOff size={17} /> : <Mic size={17} />}
      </IconButton>

      <IconButton
        onClick={onToggleDeafen}
        title="Mute audio"
        sx={{
          ...mobileIconButtonSx,
          ...(deafened && { color: accent.rose }),
        }}
      >
        <Headphones size={17} />
      </IconButton>

      <IconButton
        onClick={onToggleRaiseHand}
        title="Raise hand"
        sx={{
          ...mobileIconButtonSx,
          color: accent.amber,
          bgcolor: alpha(accent.amber, handRaised ? 0.28 : 0.1),
          border: `1px solid ${alpha(accent.amber, 0.2)}`,
          '&:hover': { bgcolor: alpha(accent.amber, 0.28) },
        }}
      >
        <span style={{ fontSize: 15 }}>✋</span>
      </IconButton>

      <IconButton onClick={onOpenReactions} title="Reactions" sx={mobileIconButtonSx}>
        <Smile size={17} />
      </IconButton>

      <IconButton onClick={onToggleChat} title="Toggle chat" sx={mobileIconButtonSx}>
        <MessageSquare size={17} />
      </IconButton>

      <IconButton
        onClick={onLeave}
        title="Leave"
        sx={{
          ...mobileIconButtonSx,
          bgcolor: accent.rose,
          color: '#fff',
          '&:hover': { bgcolor: alpha(accent.rose, 0.85) },
        }}
      >
        <PhoneOff size={17} />
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
        <Button
          onClick={onToggleMic}
          startIcon={micMuted ? <MicOff size={16} /> : <Mic size={16} />}
          sx={{
            px: 1.75,
            py: 1.25,
            minWidth: 0,
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            color: '#fff',
            bgcolor: accent.brand,
            '&:hover': { bgcolor: alpha(accent.brand, 0.85) },
          }}
        >
          {micMuted ? 'Unmute' : 'Mute'}
        </Button>
        <IconButton onClick={onToggleDeafen} title="Mute audio" sx={dockIconButtonSx}>
          <Headphones size={16} color={deafened ? accent.rose : undefined} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Button
          onClick={onToggleRaiseHand}
          startIcon={<span>✋</span>}
          sx={{
            px: 1.75,
            py: 1.25,
            minWidth: 0,
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 500,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            color: accent.amber,
            bgcolor: alpha(accent.amber, handRaised ? 0.22 : 0.1),
            border: `1px solid ${alpha(accent.amber, 0.2)}`,
            '&:hover': { bgcolor: alpha(accent.amber, 0.22) },
          }}
        >
          Raise Hand
        </Button>
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
          sx={{ ...dockIconButtonSx, display: { sm: 'inline-flex', lg: 'none' } }}
        >
          <MessageSquare size={16} />
        </IconButton>
        <Button
          onClick={onLeave}
          startIcon={<PhoneOff size={16} />}
          sx={{
            px: 1.75,
            py: 1.25,
            minWidth: 0,
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            color: '#fff',
            bgcolor: accent.rose,
            '&:hover': { bgcolor: alpha(accent.rose, 0.85) },
          }}
        >
          <Box component="span">Leave</Box>
        </Button>
      </Box>
    </Box>
  </Box>
);
