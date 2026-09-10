import type { RoomResponse } from 'src/types/type-chat';

import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';
import { PhoneOffIcon, VerifiedIcon, LanguagesIcon } from 'lucide-react';

import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AutoAwesomeMosaicOutlined } from '@mui/icons-material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Box,
  Chip,
  Stack,
  alpha,
  Paper,
  Button,
  Tooltip,
  useTheme,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { toastErrorResponse } from 'src/utils/response';

import { useCredentials } from 'src/core/slices';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useUpdateUserRecentRoomsMutation } from 'src/core/apis';

import { Scrollbar } from 'src/components/scrollbar';
import { LoginPromptDialog } from 'src/components/custom-dialog';

import VoiceRoomsView from './voice-rooms-view';
import { VoiceRoomsFilter } from './voice-rooms-filter';
import SocialChatButton from './voice-social-chat-button';
import { CreateRoomModal } from '../voice-create-room-modal';
import { VoiceRoomView } from '../voice-room-view/voice-room-view';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const isActive = value === index;

  return (
    <Box
      role="tabpanel"
      hidden={!isActive}
      id={`voice-tabpanel-${index}`}
      aria-labelledby={`voice-tab-${index}`}
      sx={{
        height: isActive ? '100%' : 0,
        minHeight: 0,
        overflow: 'hidden',
        display: isActive ? 'flex' : 'none',
        flexDirection: 'column',
      }}
      {...other}
    >
      {isActive && (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

type selectedTabType = 'find' | 'entry';

// ----------------------------------------------------------------------
// Active Voice Room Header
// ----------------------------------------------------------------------
export const RoomInfoHeader = ({
  room,
  onBack,
  isHost,
  onSettingsClick,
  onLeaveRoom,
  participants,
  onShareClick,
}: {
  room: RoomResponse;
  onBack: () => void;
  isHost: boolean;
  onSettingsClick: () => void;
  onLeaveRoom: () => void;
  participants: any[];
  onShareClick?: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1 },
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        maxHeight: 200,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        {/* Left Section: Back Action & Details */}
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ minWidth: 0, flex: 1 }}
        >
          <IconButton
            onClick={onBack}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              mt: 0.25,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              color: 'text.primary',
              borderRadius: 2,
              flexShrink: 0,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              },
            }}
          >
            <ArrowBackIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            {/* Title & Metadata Badges */}
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.75 }}>
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                fontWeight={800}
                noWrap
                sx={{
                  color: 'text.primary',
                  letterSpacing: '-0.01em',
                  maxWidth: { xs: '100%', sm: 360, md: 480 },
                }}
              >
                {room?.topic || 'Untitled room'}
              </Typography>

              <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                <Chip
                  icon={<LanguagesIcon style={{ fontSize: 13 }} />}
                  label={`${room?.language || 'English'} • ${room?.level || 'All Levels'}`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    borderWidth: 1,
                    borderStyle: 'solid',
                    '& .MuiChip-icon': { color: 'primary.main' },
                  }}
                />

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                  }}
                >
                  <FiberManualRecordIcon sx={{ fontSize: 8, color: 'success.main' }} />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ fontSize: 10, textTransform: 'uppercase' }}
                  >
                    Live
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* Sub-details / Welcome Message */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
            >
              {room?.welcome_message ||
                'Welcome to the channel! Take turns speaking and enjoy the discussion.'}
            </Typography>
          </Box>
        </Stack>

        {/* Right Section: Action Toolbar */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
          gap={1}
          sx={{
            width: { xs: '100%', md: 'auto' },
            pt: { xs: 1, md: 0 },
            borderTop: { xs: `1px solid ${alpha(theme.palette.divider, 0.1)}`, md: 'none' },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flex: { xs: 1, sm: 'initial' } }}
          >
            {/* Share Link Button */}
            <Button
              fullWidth={isMobile}
              size="small"
              onClick={onShareClick}
              startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                color: 'text.primary',
                borderRadius: 1,
                px: 2,
                py: 0.8,
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'none',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                },
              }}
            >
              Share
            </Button>

            {/* Settings (Host Only) */}
            {isHost && (
              <Tooltip title="Room Settings">
                <IconButton
                  onClick={onSettingsClick}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                    color: 'text.primary',
                    borderRadius: 1,
                    p: 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    },
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Leave Button */}
          <Button
            size="small"
            onClick={onLeaveRoom}
            startIcon={<PhoneOffIcon size={15} />}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              borderRadius: 1,
              px: { xs: 2, sm: 2.5 },
              py: 0.8,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'none',
              flexShrink: 0,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.2),
              },
            }}
          >
            Leave
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

// ----------------------------------------------------------------------
// Default Hero Header (When not inside a room)
// ----------------------------------------------------------------------
export const DefaultHeader = ({
  onQuickJoin,
  onCreateRoom,
}: {
  onQuickJoin?: () => void;
  onCreateRoom?: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1 },
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Stack
        direction={{ xs: 'column' }}
        alignItems={{ xs: 'flex-start' }}
        justifyContent="space-between"
        spacing={{ xs: 1.5, sm: 2 }}
      >
        {/* Left Side Info */}
        <Box sx={{ maxWidth: 520 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeMosaicOutlined sx={{ fontSize: 16 }} />
            </Box>
            <Typography
              variant="caption"
              fontWeight={800}
              color="primary.main"
              sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              Voice Hub
            </Typography>
          </Stack>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 0.75,
            }}
          >
            Dive Into Real-Time Conversation
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            Join live audio rooms to practice languages, host discussions, or listen in on engaging
            topics with creators.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onCreateRoom}
            sx={{
              borderRadius: 1,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.light',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Create New Room
          </Button>
          <Tooltip
            title={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <VerifiedIcon style={{ fontSize: 14 }} />
                <span>Verified accounts only</span>
              </Stack>
            }
            arrow
          >
            <span>
              <Button
                variant="contained"
                size="small"
                disabled
                sx={{
                  borderRadius: 1,
                  px: 2,
                  opacity: 0.6,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Quick Join
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export function VoiceMainView() {
  const { user, isAuthenticated } = useCredentials();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();
  const settingsOpen = useBoolean();

  const { room, userVoiceState, currentRooms, setRoom, setCurrentRooms } = useRoomTools();

  const [selectedTab, setSelectedTab] = useState<selectedTabType>('find');

  const [updateUserRecentRooms] = useUpdateUserRecentRoomsMutation();

  const isHost = useMemo(() => {
    if (!room || !user) return false;
    return room.host?.id === user.id || room.host?.userId === user.id;
  }, [room, user]);

  const participants = useMemo(() => room?.currentParticipants || [], [room]);

  const handleJoinRoom = useCallback(
    async (roomSelected: RoomResponse) => {
      if (!isAuthenticated) {
        isAuthOpen.onTrue();
        return;
      }

      setRoom(roomSelected);
      setSelectedTab('entry');

      const roomExists = currentRooms.some((roomProp) => roomProp.room?.id === roomSelected.id);

      if (!roomExists) {
        const formData = {
          id: user.id,
          roomId: roomSelected.id,
        };

        const response = await updateUserRecentRooms(formData);

        if (response.data?.status) {
          setCurrentRooms([
            { room: roomSelected, joinedAt: new Date().toISOString() as unknown as string },
            ...currentRooms,
          ]);
        } else {
          toastErrorResponse(response);
        }
      }
    },
    [
      user.id,
      currentRooms,
      isAuthenticated,
      isAuthOpen,
      setCurrentRooms,
      updateUserRecentRooms,
      setRoom,
    ]
  );

  const handleBackToRooms = useCallback(() => {
    setSelectedTab('find');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setSelectedTab('find');
    // Clear room when leaving
    setRoom(null as any);
  }, [setRoom]);

  const handleCreateRoom = useCallback(() => {
    if (!isAuthenticated) {
      isAuthOpen.onTrue();
      return;
    }
    editRoomBoolean.onTrue();
  }, [isAuthenticated, isAuthOpen, editRoomBoolean]);

  const handleShareLink = useCallback(() => {
    if (room) {
      const url = `${window.location.origin}/room/${room.id}`;
      navigator.clipboard?.writeText(url);
      // Show toast notification
      toast.success('Room link copied to clipboard!');
    }
  }, [room]);

  // Header - Show room info if joined, otherwise show default header
  const header = useMemo(() => {
    if (room && !userVoiceState.hasJoined) {
      return (
        <RoomInfoHeader
          room={room}
          onBack={handleBackToRooms}
          isHost={isHost}
          onSettingsClick={settingsOpen.onTrue}
          onLeaveRoom={handleLeaveRoom}
          participants={participants}
          onShareClick={handleShareLink}
        />
      );
    }

    return <DefaultHeader onQuickJoin={() => {}} onCreateRoom={handleCreateRoom} />;
  }, [
    room,
    userVoiceState.hasJoined,
    isHost,
    participants,
    handleBackToRooms,
    handleLeaveRoom,
    settingsOpen,
    handleShareLink,
    handleCreateRoom,
  ]);

  const filter = <VoiceRoomsFilter onFilterChange={() => {}} />;

  const mainContent = (
    <>
      <TabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <Scrollbar sx={{ height: 1 }}>
          <VoiceRoomsView onJoinRoom={handleJoinRoom} />
        </Scrollbar>
      </TabPanel>

      <TabPanel value={selectedTab !== 'find' ? 1 : 0} index={1}>
        <VoiceRoomView />
      </TabPanel>
    </>
  );

  const footer = <SocialChatButton />;

  return (
    <>
      <VoiceRoomLayout
        header={header}
        filter={selectedTab === 'find' ? filter : undefined}
        mainContent={mainContent}
        footer={footer}
      />

      <CreateRoomModal
        open={editRoomBoolean.value}
        onClose={editRoomBoolean.onFalse}
        onCreateRoom={() => {}}
      />

      <LoginPromptDialog openBoolean={isAuthOpen} />
    </>
  );
}
