import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import StopIcon from '@mui/icons-material/Stop';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled, keyframes } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import {
  Box,
  Chip,
  Zoom,
  alpha,
  Divider,
  useTheme,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { useScreenView } from 'src/hooks/use-screen-view';

import { varAlpha } from 'src/theme/styles';
// useScreenShare: getDisplayMedia only — no peer logic
import { useRoomTools, selectAccount } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { CtrlBtn } from 'src/components/buttons';
import { VoiceRoomMessageGroupDrawer } from 'src/components/drawers';

import { VoiceUserCard } from '../voice-user-card';
import { VoiceMessageGroup } from '../voice-message-group';
import { ScreenSharePreviewPanel } from './screen-share-preview';
import { VoiceParticipantSettingsMenu } from '../voice-participant-settings-menu';

// ─── Animations ───────────────────────────────────────────────────────────────

const liveDot = keyframes`
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.4; transform:scale(0.7); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const RootContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  position: 'relative',
  overflow: 'hidden',
}));

const TopBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 1)}`,
  backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.015),
  flexShrink: 0,
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1, 1.5) },
}));

const ScrollArea = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
});

const ContentPad = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  minHeight: '100%',
  paddingBottom: theme.spacing(12),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(10),
  },
}));

// const FeaturedPanel = styled(Box, {
//   shouldForwardProp: (p) => p !== 'open',
// })<{ open: boolean }>(({ theme, open }) => ({
//   width: '100%',
//   maxHeight: open ? 380 : 0,
//   minHeight: open ? 240 : 0,
//   overflow: 'hidden',
//   borderRadius: theme.spacing(2),
//   border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
//   backgroundColor:
//     theme.palette.mode === 'dark' ? alpha('#000', 0.3) : alpha(theme.palette.primary.main, 0.03),
//   transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   position: 'relative',
//   [theme.breakpoints.down('sm')]: {
//     maxHeight: open ? 280 : 0,
//     minHeight: open ? 200 : 0,
//   },
// }));

const GridPanel = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
  backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.015),
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1) },
}));

const ParticipantsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(1),
  },
  [theme.breakpoints.down(360)]: { gridTemplateColumns: 'repeat(2, 1fr)' },
}));

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceRoomBodyView({ onLeaveRoom }: { onLeaveRoom: () => void }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const primary = theme.palette.primary.main;

  const webRTC = useWebRTCContext();
  const { emit, socket } = useSocketContext();
  const { room, participants, userVoiceState } = useRoomTools();
  const user = useSelector(selectAccount);

  const {
    localStream,
    remoteStreams,

    connectionStatus,

    stopSharing,
    startSharing,
    remoteScreenStreams,
  } = webRTC;

  const { roomId } = userVoiceState;

  // ── Screen capture ────────────────────────────────────────────────────────
  const {
    screenStream,
    isSharing,
    startScreenShare: startCapture,
    stopScreenShare: stopCapture,
    error: shareError,
  } = useScreenView((stream) => {
    if (!socket || !roomId) return;

    const participantSocketIds = Object.values(participants)
      .filter((p) => !p.isLocal)
      .map((p) => p.socketId);

    if (stream) {
      // stream arrived → create screen-share PCs and send offers to all peers
      startSharing(stream, socket, participantSocketIds, roomId);
    } else {
      // stream ended (user clicked browser "Stop sharing" or stopCapture())
      stopSharing(socket, participantSocketIds, roomId);
    }

    emit('user-screen-share', {
      roomId,
      socketId: socket.id,
      sender: user.id,
      isSharing: Boolean(stream),
    });
  });

  const handleToggleScreenShare = async () => {
    if (isSharing) {
      stopCapture();
    } else {
      await startCapture();
    }
  };

  // ── Participants ──────────────────────────────────────────────────────────

  const isHost = room?.host?.id === user?.id;

  const allParticipants = useMemo(() => Object.values(participants), [participants]);

  const handleHostAction = (action: 'mute' | 'kick' | 'block-mic', targetSocketId: string) => {
    // hello
  };

  const participantCount = allParticipants.length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <RootContainer>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <TopBar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              noWrap
              sx={{
                color: 'text.primary',
                letterSpacing: -0.4,
                fontSize: { xs: '0.85rem', sm: '1rem' },
              }}
            >
              {room.name}
            </Typography>
            {isHost && (
              <Chip
                label="HOST"
                size="small"
                sx={{
                  height: 17,
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  bgcolor: alpha(primary, 0.12),
                  color: primary,
                  border: `1px solid ${alpha(primary, 0.3)}`,
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
            {isSharing && (
              <Chip
                icon={<ScreenShareIcon sx={{ fontSize: '11px !important' }} />}
                label="Sharing"
                size="small"
                sx={{
                  height: 17,
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.main,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                boxShadow: `0 0 6px ${theme.palette.success.main}`,
                animation: `${liveDot} 2s ease-in-out infinite`,
                flexShrink: 0,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <PeopleAltIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {participantCount}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              ·
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <CtrlBtn
            tooltip={isSharing ? 'Stop sharing' : 'Share screen'}
            active={isSharing}
            warn={isSharing}
            onClick={handleToggleScreenShare}
          >
            {isSharing ? (
              <StopIcon sx={{ fontSize: 18 }} />
            ) : (
              <ScreenShareIcon sx={{ fontSize: 18 }} />
            )}
          </CtrlBtn>

          <VoiceRoomMessageGroupDrawer>
            <VoiceMessageGroup />
          </VoiceRoomMessageGroupDrawer>

          {isHost && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{ height: 18, alignSelf: 'center', mx: 0.25 }}
            />
          )}

          {isHost ? (
            <CtrlBtn tooltip="Room settings">
              <SettingsIcon sx={{ fontSize: 18 }} />
            </CtrlBtn>
          ) : (
            <CtrlBtn
              tooltip="Leave room"
              danger
              onClick={() => {
                onLeaveRoom();
                stopCapture();
              }}
              sx={{ ml: 1 }}
            >
              <ExitToAppIcon sx={{ fontSize: 18 }} />
            </CtrlBtn>
          )}
        </Box>
      </TopBar>

      {/* ── Scroll area ──────────────────────────────────────────────────── */}
      <ScrollArea>
        <ContentPad>
          {/* Local screen share preview (sharer sees their own stream) */}
          {isSharing && screenStream && (
            <ScreenSharePreviewPanel stream={screenStream} isLocal onStop={stopCapture} />
          )}

          {/* Share error */}
          {shareError && (
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
                {shareError}
              </Typography>
            </Box>
          )}

          {/* Participants grid */}
          <GridPanel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.25,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.65rem',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                All Participants
                <Box component="span" sx={{ ml: 0.6, color: 'text.disabled' }}>
                  · {allParticipants.length}
                </Box>
              </Typography>
            </Box>

            <ParticipantsGrid>
              {Object.entries(remoteScreenStreams).map(([id, stream]) => {
                const name = Object.values(participants).find(
                  (participant) => participant.socketId === id
                )?.name;
                return (
                  <ScreenSharePreviewPanel
                    key={id}
                    stream={stream}
                    isLocal={false}
                    sharerName={name}
                  />
                );
              })}
              {allParticipants.map((participant, index) => (
                <Zoom key={participant.socketId} in timeout={200 + index * 40}>
                  <Box
                    sx={{
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'transform 0.18s ease',
                      '&:hover': { transform: 'scale(1.04)' },
                      '&:hover .host-btn': { opacity: 1 },
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                          : varAlpha(theme.vars.palette.primary.mainChannel, 0.18),
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <VoiceUserCard
                      participant={{
                        userId: participant.userId,
                        name: participant.name,
                        profilePhoto: participant.profilePhoto,
                        status: participant.status,
                        isSpeaking: false,
                        isMuted: Boolean(participant.isMuted),
                        userType: participant.userType,
                        verified: participant.verified,
                        accountType: participant.accountType,
                        connectionStatus: connectionStatus[participant.socketId],
                        isLocal: participant.isLocal,
                        hasJoin: participant.hasJoin,
                      }}
                      size={isMobile ? 'small' : 'medium'}
                      stream={
                        participant.isLocal ? localStream : remoteStreams[participant.socketId]
                      }
                    />

                    <VoiceParticipantSettingsMenu
                      targetSocketId={participant.socketId}
                      targetUserId={participant.userId}
                      targetName={participant.name}
                      targetProfilePhoto={participant.profilePhoto}
                      targetAccountType={participant.accountType}
                      targetVerified={participant.verified}
                      onAction={handleHostAction}
                      isHost={isHost}
                    />
                  </Box>
                </Zoom>
              ))}
            </ParticipantsGrid>
          </GridPanel>
        </ContentPad>
      </ScrollArea>
    </RootContainer>
  );
}
