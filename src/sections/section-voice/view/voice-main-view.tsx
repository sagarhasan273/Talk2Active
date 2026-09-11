import type { RoomResponse } from 'src/types/type-chat';

import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';
import {
  MicIcon,
  UsersIcon,
  Volume2Icon,
  PhoneOffIcon,
  VerifiedIcon,
  ArrowRightIcon,
} from 'lucide-react';

import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AutoAwesomeMosaicOutlined } from '@mui/icons-material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Box,
  Stack,
  alpha,
  Paper,
  Avatar,
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
import { VoiceRoomView } from './voice-room-view';
import { VoiceRoomsFilter } from '../voice-filter-rooms';
import VoiceButtonSocialChat from '../voice-button-social-chat';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type selectedTabType = 'find' | 'entry';

type VoiceParticipant = {
  id?: string;
  userId?: string;
  name?: string;
  username?: string;
  profilePhoto?: string;
  avatar?: string;
  photo?: string;

  // Possible speaking fields depending on your participant object
  isSpeaking?: boolean;
  isTalking?: boolean;
  isSpeakingNow?: boolean;
  speaking?: boolean;
  voiceState?: {
    isSpeaking?: boolean;
    isTalking?: boolean;
  };

  [key: string]: any;
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function getParticipantId(participant: VoiceParticipant) {
  return participant?.id || participant?.userId || '';
}

function getParticipantName(participant: VoiceParticipant) {
  return participant?.name || participant?.username || 'Unknown user';
}

function getParticipantAvatar(participant: VoiceParticipant) {
  return participant?.profilePhoto || participant?.avatar || participant?.photo || '';
}

function isParticipantSpeaking(participant: VoiceParticipant) {
  return Boolean(
    participant?.isSpeaking ||
    participant?.isTalking ||
    participant?.isSpeakingNow ||
    participant?.speaking ||
    participant?.voiceState?.isSpeaking ||
    participant?.voiceState?.isTalking
  );
}

// ----------------------------------------------------------------------
// Tab Panel
// ----------------------------------------------------------------------

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
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------
// Participant Avatar
// ----------------------------------------------------------------------

function ParticipantAvatar({
  participant,
  size = 30,
  speaking = false,
}: {
  participant: VoiceParticipant;
  size?: number;
  speaking?: boolean;
}) {
  const theme = useTheme();

  const name = getParticipantName(participant);
  const avatar = getParticipantAvatar(participant);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Avatar
        src={avatar || undefined}
        alt={name}
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          fontWeight: 700,

          border: `2px solid ${theme.palette.background.paper}`,

          ...(speaking && {
            boxShadow: `0 0 0 2px ${theme.palette.success.main}`,
          }),
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>

      {speaking && (
        <Box
          sx={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: Math.max(8, size * 0.28),
            height: Math.max(8, size * 0.28),
            borderRadius: '50%',
            bgcolor: 'success.main',
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        />
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------
// Participant Avatar Stack
// ----------------------------------------------------------------------

function ParticipantAvatarStack({ participants }: { participants: VoiceParticipant[] }) {
  const visibleParticipants = participants.slice(0, 4);

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 0.5,

        '& > *:not(:first-of-type)': {
          ml: -1.1,
        },
      }}
    >
      {visibleParticipants.map((participant) => (
        <ParticipantAvatar
          key={getParticipantId(participant) || Math.random()}
          participant={participant}
          size={30}
          speaking={isParticipantSpeaking(participant)}
        />
      ))}

      {participants.length > 4 && (
        <Box
          sx={{
            width: 30,
            height: 30,
            ml: -1.1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            border: '2px solid',
            borderColor: 'background.paper',
            zIndex: 5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 800,
              color: 'text.secondary',
            }}
          >
            +{participants.length - 4}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Active Speaker
// ----------------------------------------------------------------------

function ActiveSpeaker({
  speaker,
  mobile = false,
}: {
  speaker?: VoiceParticipant | null;
  mobile?: boolean;
}) {
  const theme = useTheme();

  if (!speaker) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          minWidth: 0,
          maxWidth: mobile ? 120 : 190,
        }}
      >
        <Box
          sx={{
            width: mobile ? 26 : 30,
            height: mobile ? 26 : 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            color: 'text.disabled',
            flexShrink: 0,
          }}
        >
          <MicIcon size={14} />
        </Box>

        <Typography
          variant="caption"
          noWrap
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          No one speaking
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        minWidth: 0,
        maxWidth: mobile ? 140 : 210,
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <ParticipantAvatar participant={speaker} size={mobile ? 26 : 30} speaking />

        <Box
          sx={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1px solid ${alpha(theme.palette.success.main, 0.5)}`,
            animation: 'speakerPulse 1.2s ease-in-out infinite',

            '@keyframes speakerPulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 0.45,
              },
              '50%': {
                transform: 'scale(1.12)',
                opacity: 0,
              },
            },
          }}
        />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: 9,
            lineHeight: 1,
            color: 'success.main',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            mb: 0.25,
          }}
        >
          Speaking
        </Typography>

        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            color: 'text.primary',
            fontWeight: 700,
          }}
        >
          {getParticipantName(speaker)}
        </Typography>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Compact Active Room Header
// ----------------------------------------------------------------------

export const ActiveRoomBar = ({
  room,
  participants,
  currentSpeaker,
  onEnterRoom,
  onLeaveRoom,
}: {
  room: RoomResponse;
  participants: VoiceParticipant[];
  currentSpeaker?: VoiceParticipant | null;
  onEnterRoom: () => void;
  onLeaveRoom: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const participantCount = participants.length;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: { xs: 1.5, sm: 2 },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        bgcolor: 'background.paper',

        boxShadow: {
          xs: `0 3px 14px ${alpha(theme.palette.common.black, 0.06)}`,
          sm: `0 4px 18px ${alpha(theme.palette.common.black, 0.07)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',

          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.9, sm: 1.1 },

          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.8, sm: 1.25 },

          minHeight: { xs: 58, sm: 64 },
        }}
      >
        {/* Active indicator */}
        <Box
          sx={{
            width: 4,
            alignSelf: 'stretch',
            borderRadius: 2,
            bgcolor: 'success.main',
            flexShrink: 0,
          }}
        />

        {/* Room icon */}
        <Box
          sx={{
            width: { xs: 34, sm: 38 },
            height: { xs: 34, sm: 38 },
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Volume2Icon size={isMobile ? 17 : 19} />
        </Box>

        {/* Room information */}
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              minWidth: 0,
              mb: 0.25,
            }}
          >
            <Typography
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',

                fontSize: {
                  xs: '0.8rem',
                  sm: '0.875rem',
                },

                fontWeight: 800,
                color: 'text.primary',
              }}
            >
              {room?.topic || 'Untitled room'}
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                px: 0.6,
                py: 0.2,
                borderRadius: 0.75,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                flexShrink: 0,
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 6,
                  color: 'success.main',
                }}
              />

              <Typography
                sx={{
                  fontSize: 8,
                  lineHeight: 1,
                  fontWeight: 800,
                  color: 'success.main',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              noWrap
              sx={{
                fontSize: 10,
                color: 'text.secondary',
                fontWeight: 600,
              }}
            >
              {room?.language || 'English'}
            </Typography>

            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: 'text.disabled',
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.35}
              sx={{
                flexShrink: 0,
              }}
            >
              <UsersIcon size={11} />

              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  color: 'text.secondary',
                  fontWeight: 700,
                }}
              >
                {participantCount}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Desktop participant avatars */}
        {!isMobile && participantCount > 0 && (
          <ParticipantAvatarStack participants={participants} />
        )}

        {/* Current speaker */}
        {!isMobile && (
          <Box
            sx={{
              pl: 1.25,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            }}
          >
            <ActiveSpeaker speaker={currentSpeaker} />
          </Box>
        )}

        {/* Mobile speaker */}
        {isMobile && (
          <Box
            sx={{
              maxWidth: 120,
              overflow: 'hidden',
            }}
          >
            <ActiveSpeaker speaker={currentSpeaker} mobile />
          </Box>
        )}

        {/* Enter room */}
        <Tooltip title="Open room">
          <IconButton
            onClick={onEnterRoom}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              width: { xs: 34, sm: 38 },
              height: { xs: 34, sm: 38 },
              borderRadius: 1.5,

              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',

              flexShrink: 0,

              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.18),
              },
            }}
          >
            <ArrowRightIcon size={isMobile ? 17 : 19} />
          </IconButton>
        </Tooltip>

        {/* Leave active room */}
        <Tooltip title="Leave room">
          <IconButton
            onClick={onLeaveRoom}
            size="small"
            sx={{
              display: {
                xs: 'none',
                sm: 'flex',
              },

              width: 34,
              height: 34,
              borderRadius: 1.25,

              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.07),

              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.14),
              },
            }}
          >
            <PhoneOffIcon size={15} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

// ----------------------------------------------------------------------
// Small Room Header - shown when inside room
// ----------------------------------------------------------------------

export const CompactRoomHeader = ({
  room,
  isHost,
  onBack,
  onSettingsClick,
  onShareClick,
  onLeaveRoom,
}: {
  room: RoomResponse;
  isHost: boolean;
  onBack: () => void;
  onSettingsClick: () => void;
  onShareClick?: () => void;
  onLeaveRoom: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: { xs: 1, sm: 1.5 },
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.75, sm: 1 }}
        sx={{
          minHeight: { xs: 48, sm: 54 },
          px: { xs: 0.75, sm: 1 },
        }}
      >
        {/* Back */}
        <Tooltip title="Back to rooms">
          <IconButton
            onClick={onBack}
            size="small"
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.25,
              bgcolor: alpha(theme.palette.text.primary, 0.04),

              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Room icon */}
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.09),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Volume2Icon size={15} />
        </Box>

        {/* Room title */}
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              noWrap
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',

                fontSize: {
                  xs: '0.78rem',
                  sm: '0.85rem',
                },

                fontWeight: 800,
              }}
            >
              {room?.topic || 'Untitled room'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.35,
                flexShrink: 0,
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 6,
                  color: 'success.main',
                }}
              />

              <Typography
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },

                  fontSize: 9,
                  color: 'success.main',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Live
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontSize: 9,
              mt: 0.15,
            }}
          >
            {room?.language || 'English'} • {room?.level || 'All Levels'}
          </Typography>
        </Box>

        {/* Share */}
        {onShareClick && (
          <Tooltip title="Share room">
            <IconButton
              onClick={onShareClick}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.25,
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.text.primary, 0.04),

                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ShareIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Settings */}
        {isHost && (
          <Tooltip title="Room settings">
            <IconButton
              onClick={onSettingsClick}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.25,
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.text.primary, 0.04),

                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <SettingsIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Leave */}
        <Tooltip title="Leave room">
          <IconButton
            onClick={onLeaveRoom}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.25,

              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.08),

              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.16),
              },
            }}
          >
            <PhoneOffIcon size={15} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

// ----------------------------------------------------------------------
// Default Hero Header
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
        direction="column"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={{ xs: 1.5, sm: 2 }}
      >
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
              sx={{
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
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

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.5,
            }}
          >
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

// ----------------------------------------------------------------------
// Main View
// ----------------------------------------------------------------------

export function VoiceMainView() {
  const { user, isAuthenticated } = useCredentials();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();
  const settingsOpen = useBoolean();

  const { room, currentRooms, setRoom, setCurrentRooms } = useRoomTools();

  const [selectedTab, setSelectedTab] = useState<selectedTabType>('find');

  const [updateUserRecentRooms] = useUpdateUserRecentRoomsMutation();

  // --------------------------------------------------------------------
  // Host
  // --------------------------------------------------------------------

  const isHost = useMemo(() => {
    if (!room || !user) return false;

    return room.host?.id === user.id || room.host?.userId === user.id;
  }, [room, user]);

  // --------------------------------------------------------------------
  // Participants
  // --------------------------------------------------------------------

  const participants = useMemo(
    () => (room?.currentParticipants || []) as VoiceParticipant[],
    [room]
  );

  // --------------------------------------------------------------------
  // Current speaker
  //
  // This supports multiple common participant structures:
  // isSpeaking
  // isTalking
  // isSpeakingNow
  // speaking
  // voiceState.isSpeaking
  // voiceState.isTalking
  // --------------------------------------------------------------------

  const currentSpeaker = useMemo(
    () => participants.find((participant) => isParticipantSpeaking(participant)) || null,
    [participants]
  );

  // --------------------------------------------------------------------
  // Join room
  // --------------------------------------------------------------------

  const handleJoinRoom = useCallback(
    async (roomSelected: RoomResponse) => {
      if (!isAuthenticated) {
        isAuthOpen.onTrue();
        return;
      }

      setRoom(roomSelected);

      // Enter room
      setSelectedTab('entry');

      const roomExists = currentRooms.some((roomProp) => roomProp.room?.id === roomSelected.id);

      if (!roomExists && user?.id) {
        const formData = {
          id: user.id,
          roomId: roomSelected.id,
        };

        const response = await updateUserRecentRooms(formData);

        if (response.data?.status) {
          setCurrentRooms([
            {
              room: roomSelected,
              joinedAt: new Date().toISOString(),
            },
            ...currentRooms,
          ]);
        } else {
          toastErrorResponse(response);
        }
      }
    },
    [
      user,
      currentRooms,
      isAuthenticated,
      isAuthOpen,
      setCurrentRooms,
      updateUserRecentRooms,
      setRoom,
    ]
  );

  // --------------------------------------------------------------------
  // Back to rooms
  // --------------------------------------------------------------------

  const handleBackToRooms = useCallback(() => {
    setSelectedTab('find');
  }, []);

  // --------------------------------------------------------------------
  // Leave room
  // --------------------------------------------------------------------

  const handleLeaveRoom = useCallback(() => {
    setSelectedTab('find');

    setRoom(null as any);
  }, [setRoom]);

  // --------------------------------------------------------------------
  // Create room
  // --------------------------------------------------------------------

  const handleCreateRoom = useCallback(() => {
    if (!isAuthenticated) {
      isAuthOpen.onTrue();
      return;
    }

    editRoomBoolean.onTrue();
  }, [isAuthenticated, isAuthOpen, editRoomBoolean]);

  // --------------------------------------------------------------------
  // Share
  // --------------------------------------------------------------------

  const handleShareLink = useCallback(() => {
    if (!room) return;

    const url = `${window.location.origin}/room/${room.id}`;

    navigator.clipboard?.writeText(url);

    toast.success('Room link copied to clipboard!');
  }, [room]);

  // --------------------------------------------------------------------
  // Header
  //
  // FIND:
  //   Show active room + participants + speaker.
  //
  // ENTRY:
  //   Show very small room header.
  //
  // NO ROOM:
  //   Show default Voice Hub header.
  // --------------------------------------------------------------------

  const header = useMemo(() => {
    // ---------------------------------------------------------------
    // User is browsing available rooms but has an active room
    // ---------------------------------------------------------------

    if (room && selectedTab === 'find') {
      return (
        <ActiveRoomBar
          room={room}
          participants={participants}
          currentSpeaker={currentSpeaker}
          onEnterRoom={() => setSelectedTab('entry')}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    // ---------------------------------------------------------------
    // User is inside the room
    // ---------------------------------------------------------------

    if (room && selectedTab === 'entry') {
      return (
        <CompactRoomHeader
          room={room}
          isHost={isHost}
          onBack={handleBackToRooms}
          onSettingsClick={settingsOpen.onTrue}
          onShareClick={handleShareLink}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    // ---------------------------------------------------------------
    // No active room
    // ---------------------------------------------------------------

    return <DefaultHeader onQuickJoin={() => {}} onCreateRoom={handleCreateRoom} />;
  }, [
    room,
    selectedTab,
    participants,
    currentSpeaker,
    isHost,
    handleBackToRooms,
    handleLeaveRoom,
    settingsOpen,
    handleShareLink,
    handleCreateRoom,
  ]);

  // --------------------------------------------------------------------
  // Filter
  // --------------------------------------------------------------------

  const filter = <VoiceRoomsFilter onFilterChange={() => {}} />;

  // --------------------------------------------------------------------
  // Main Content
  // --------------------------------------------------------------------

  const mainContent = (
    <>
      {/* ==============================================================
          AVAILABLE ROOMS
          ============================================================== */}

      <TabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <Box
          sx={{
            height: 1,
            minHeight: 0,

            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ----------------------------------------------------------
              IMPORTANT:
              ActiveRoomBar is OUTSIDE Scrollbar.

              Therefore:
              - user can scroll rooms
              - active room stays visible
              - participants stay visible
              - speaker stays visible
              ---------------------------------------------------------- */}

          {room && (
            <Box
              sx={{
                flexShrink: 0,

                px: {
                  xs: 1,
                  sm: 1.5,
                },

                pt: {
                  xs: 0.75,
                  sm: 1,
                },

                pb: {
                  xs: 0.75,
                  sm: 1,
                },

                bgcolor: 'background.default',

                zIndex: 5,
              }}
            >
              <ActiveRoomBar
                room={room}
                participants={participants}
                currentSpeaker={currentSpeaker}
                onEnterRoom={() => setSelectedTab('entry')}
                onLeaveRoom={handleLeaveRoom}
              />
            </Box>
          )}

          {/* ----------------------------------------------------------
              Scrollable room list
              ---------------------------------------------------------- */}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Scrollbar
              sx={{
                height: 1,
              }}
            >
              <VoiceRoomsView onJoinRoom={handleJoinRoom} />
            </Scrollbar>
          </Box>
        </Box>
      </TabPanel>

      {/* ==============================================================
          ACTIVE VOICE ROOM
          ============================================================== */}

      <TabPanel value={selectedTab !== 'find' ? 1 : 0} index={1}>
        <VoiceRoomView />
      </TabPanel>
    </>
  );

  // --------------------------------------------------------------------
  // Footer
  // --------------------------------------------------------------------

  const footer = <VoiceButtonSocialChat />;

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------

  return (
    <>
      <VoiceRoomLayout
        header={header}
        filter={selectedTab === 'find' ? filter : undefined}
        mainContent={mainContent}
        footer={footer}
      />

      <VoiceModalCreateRoom
        open={editRoomBoolean.value}
        onClose={editRoomBoolean.onFalse}
        onCreateRoom={() => {}}
      />

      <LoginPromptDialog openBoolean={isAuthOpen} />
    </>
  );
}
