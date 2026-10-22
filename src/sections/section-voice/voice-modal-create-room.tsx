// src/sections/section-voice/voice-modal-create-room.tsx

import type { RoomType } from '@/types/type-room';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Close, MicNone, RecordVoiceOver } from '@mui/icons-material';
import {
  alpha,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Slider,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { useCreateRoomMutation, useUpdateRoomMutation } from 'src/core/apis/api-chat';
import { selectAccount } from 'src/core/slices';

import { Label, LEVEL_OPTIONS, ParticipantLevel } from '@/components/label';
import { ROOM_LANGUAGE_OPTIONS } from '@/lib/filter-data';

// ----------------------------------------------------------------------

export const LanguageLevelEnum = {
  ALL: 'all',
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  IELTS: 'ielts',
  BUSINESS: 'business',
  CONVERSATION: 'conversation',
} as const;

const LEVEL_COLORS: Record<string, string> = {
  all: '#6366f1',
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
  ielts: '#0ea5e9',
  business: '#8b5cf6',
  conversation: '#f97316',
};

type FormData = {
  topic: string;
  welcome_message: string;
  languages: string[];
  level: string;
  max_participants: number;
};

interface Props {
  open: boolean;
  onClose: () => void;
  currentRoom?: RoomType | null;
}

// ----------------------------------------------------------------------

const getInitialForm = (room: Props['currentRoom']): FormData => {
  if (!room) {
    return {
      topic: '',
      welcome_message: '',
      languages: ['en'],
      level: LanguageLevelEnum.ALL,
      max_participants: 5,
    };
  }
  return {
    topic: room.topic || '',
    welcome_message: room.welcome_message || '',
    languages: room.languages.length ? [...room.languages] : ['en'],
    level: room.level,
    max_participants: room.max_participants || 5,
  };
};

// ----------------------------------------------------------------------

export const VoiceModalCreateRoom: React.FC<Props> = ({
  open,
  onClose,
  currentRoom,
}) => {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');
  const user = useSelector(selectAccount);

  const isEditMode = Boolean(currentRoom);

  const [formData, setFormData] = useState<FormData>(getInitialForm(currentRoom));
  const [inputValue, setInputValue] = useState('');

  const [createRoom, { isLoading: creating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: updating }] = useUpdateRoomMutation();

  const loading = creating || updating;
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (open) {
      setFormData(getInitialForm(currentRoom));
      setInputValue('');
    }
  }, [open, currentRoom]);

  // ----------------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------------

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addLanguage = (code: string) => {
    if (!code || formData.languages.includes(code) || formData.languages.length >= 2) {
      return;
    }

    updateForm('languages', [...formData.languages, code]);
    setInputValue('');
  };

  const removeLanguage = (code: string) => {
    updateForm(
      'languages',
      formData.languages.filter((item) => item !== code)
    );
  };

  const handleLanguageKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !inputValue.trim()) return;

    event.preventDefault();

    const value = inputValue.toLowerCase().trim();

    const language =
      ROOM_LANGUAGE_OPTIONS.find((item) => item.label.toLowerCase() === value) ||
      ROOM_LANGUAGE_OPTIONS.find((item) => item.label.toLowerCase().includes(value));

    if (language) addLanguage(language.code);
  };

  // ----------------------------------------------------------------------
  // Submit
  // ----------------------------------------------------------------------

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!formData.topic.trim() || !formData.languages.length) return;

    const payload = isEditMode
      ? {
        roomId: currentRoom?.roomId,
        topic: formData.topic.trim(),
        welcome_message: formData.welcome_message || '',
        languages: formData.languages,
        level: formData.level || 'all',
        max_participants: formData.max_participants,
        isActive: true,
      }
      : {
        topic: formData.topic.trim(),
        welcome_message: formData.welcome_message.trim(),
        languages: formData.languages,
        level: formData.level,
        max_participants: formData.max_participants,
      };

    try {
      const response = currentRoom
        ? await updateRoom({
          roomId: currentRoom.roomId,
          ...payload,
          host: (currentRoom?.host as any)?.userId || user?.userId,
        }).unwrap()
        : await createRoom({
          ...payload,
          host: user?.userId,
        }).unwrap();

      if (response?.status) onClose();
    } catch (error) {
      console.error('Failed to save voice room:', error);
    }
  };

  // ----------------------------------------------------------------------
  // Styles
  // ----------------------------------------------------------------------

  const sectionSx = {
    p: 1.75,
    borderRadius: 1,
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
    bgcolor: isDark ? alpha('#fff', 0.025) : '#f8fafc',
  };

  const sectionLabelSx = {
    mb: 1,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: isDark ? 'text.secondary' : '#64748b',
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      bgcolor: isDark ? '#181c26' : '#ffffff',
      '& fieldset': {
        borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
      },
      '&:hover fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: isMobile ? 0 : 1,
          overflow: 'hidden',
          bgcolor: isDark ? '#181c26' : '#ffffff',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
          boxShadow: isDark
            ? '0 24px 48px -12px rgba(0, 0, 0, 0.65)'
            : '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 0,
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : '#f8fafc',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                bgcolor: 'primary.main',
                color: '#fff',
              }}
            >
              <MicNone sx={{ fontSize: 20 }} />
            </Box>

            <Box>
              <Typography
                fontWeight={800}
                fontSize={isMobile ? 15 : 16}
                color={isDark ? 'text.primary' : '#0f172a'}
              >
                {isEditMode ? 'Update Voice Channel' : 'Create Voice Channel'}
              </Typography>

              <Typography fontSize={12} color={isDark ? 'text.secondary' : '#64748b'}>
                {isEditMode
                  ? 'Update the topic, languages, or capacity'
                  : 'Set up your language learning space'}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              color: 'text.secondary',
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Body (Native hidden scrollbar) */}
      <DialogContent
        sx={{
          p: 2,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Basic Info */}
          <Box sx={sectionSx}>
            <Typography sx={sectionLabelSx}>Basic Info</Typography>

            <Box sx={{ display: 'grid', gap: 1.25 }}>
              <TextField
                label="Choose a topic"
                placeholder="e.g., Spanish Conversation Circle"
                size="small"
                required
                fullWidth
                value={formData.topic}
                onChange={(e) => updateForm('topic', e.target.value)}
                sx={inputSx}
              />

              {isEditMode ? (
                formData.welcome_message && (
                  <Box>
                    <Typography fontSize={11} color="text.disabled" mb={0.5}>
                      Welcome message (not editable)
                    </Typography>
                    <Typography fontSize={13} color="text.secondary" fontStyle="italic">
                      {formData.welcome_message}
                    </Typography>
                  </Box>
                )
              ) : (
                <TextField
                  label="Welcome message.."
                  placeholder="What will learners practice here?"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.welcome_message}
                  onChange={(e) => updateForm('welcome_message', e.target.value)}
                  sx={inputSx}
                />
              )}
            </Box>
          </Box>

          {/* Languages */}
          <Box sx={sectionSx}>
            <Typography sx={sectionLabelSx}>Languages</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
              {formData.languages.map((code) => {
                const lang = ROOM_LANGUAGE_OPTIONS.find((item) => item.code === code);

                return (
                  <Label
                    key={code}
                    size="small"
                    label={lang ? `${lang.label}` : `${code}`}
                    onDelete={() => removeLanguage(code)}
                    sx={{
                      height: 26,
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.22),
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Autocomplete
              freeSolo
              size="small"
              disabled={formData.languages.length >= 2}
              options={ROOM_LANGUAGE_OPTIONS.map((lang) => ({
                code: lang.code,
                label: `${lang.label}`,
              }))}
              inputValue={inputValue}
              onInputChange={(_, value) => setInputValue(value)}
              onChange={(_, value) => {
                if (value && typeof value !== 'string') {
                  addLanguage(value.code);
                }
              }}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search language & press Enter…"
                  onKeyDown={handleLanguageKeyDown}
                  sx={inputSx}
                />
              )}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.code} sx={{ fontSize: '0.8rem' }}>
                  {option.label}
                </MenuItem>
              )}
            />
          </Box>

          {/* Settings */}
          <Box sx={sectionSx}>
            <Typography sx={sectionLabelSx}>Skill Level</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {LEVEL_OPTIONS.map(({ value, label }) => {
                const selected = formData.level === value;
                const color = LEVEL_COLORS[value] || theme.palette.primary.main;

                return (
                  <ParticipantLevel
                    key={value}
                    value={value}
                    label={label}
                    showEmoji={true}
                    size="small"
                    selected={selected}
                    onClick={() => updateForm('level', value)}
                    sx={{
                      height: 28,
                      borderRadius: 1,
                      fontSize: 11.5,
                      fontWeight: selected ? 700 : 600,
                      transform: 'none !important',
                      border: '1px solid',
                      borderColor: selected
                        ? color
                        : isDark
                          ? alpha('#fff', 0.1)
                          : '#e2e8f0',
                      bgcolor: selected
                        ? alpha(color, isDark ? 0.16 : 0.1)
                        : isDark
                          ? '#181c26'
                          : '#ffffff',
                      color: selected ? color : isDark ? 'text.secondary' : '#475569',
                      transition:
                        'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
                      '&:hover': {
                        transform: 'none !important',
                        bgcolor: selected ? alpha(color, 0.2) : alpha(color, 0.08),
                        borderColor: color,
                        color,
                      },
                    }}
                  />
                );
              })}
            </Box>

            {/* Participants */}
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ ...sectionLabelSx, mb: 0 }}>Max Participants</Typography>

                <Label
                  size="small"
                  label={String(formData.max_participants)}
                  sx={{
                    height: 24,
                    borderRadius: 1,
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }}
                />
              </Box>

              <Slider
                value={formData.max_participants}
                min={2}
                max={20}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => updateForm('max_participants', value as number)}
                sx={{ color: 'primary.main', mt: 1 }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography fontSize={10.5} fontWeight={600} color="text.secondary">
                  2
                </Typography>
                <Typography fontSize={10.5} fontWeight={600} color="text.secondary">
                  20
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: isMobile ? 1.5 : 2,
          gap: 1,
          bgcolor: isDark ? 'transparent' : '#f8fafc',
          borderTop: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          fullWidth={isMobile}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: isDark ? alpha('#fff', 0.14) : '#cbd5e1',
            flex: isMobile ? 1 : undefined,
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={loading}
          onClick={() => handleSubmit()}
          fullWidth={isMobile}
          startIcon={<RecordVoiceOver />}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 700,
            flex: isMobile ? 2 : undefined,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
            },
          }}
        >
          {isEditMode ? 'Update Channel' : 'Create Channel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
