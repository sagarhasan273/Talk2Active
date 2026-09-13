import type { RoomResponse } from '@/types/type-chat';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Close, Cancel, MicNone, RecordVoiceOver } from '@mui/icons-material';
import {
  Box,
  Chip,
  alpha,
  Button,
  Dialog,
  Slider,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';
import { useCreateRoomMutation, useUpdateRoomMutation } from 'src/core/apis/api-chat';

import { Scrollbar } from 'src/components/scrollbar';
import { languages, LEVEL_OPTIONS } from '@/lib/filter-data';

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
  all: '#818cf8',
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
  ielts: '#38bdf8',
  business: '#c084fc',
  conversation: '#fb923c',
};

const LEVEL_LABELS: Record<string, string> = LEVEL_OPTIONS.reduce(
  (acc, { value, label }) => ({ ...acc, [value]: label }),
  {} as Record<string, string>
);

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
  onCreateRoom: (data: FormData) => void;
  currentRoom: RoomResponse | null;
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
  onCreateRoom,
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
      languages.find((item) => item.name.toLowerCase() === value) ||
      languages.find((item) => item.name.toLowerCase().includes(value));

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
        welcome_message: currentRoom?.welcome_message || '',
        languages: formData.languages,
        level: currentRoom?.level || 'all',
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

    onCreateRoom(payload);

    try {
      const response = currentRoom
        ? await updateRoom({
          roomId: currentRoom.roomId,
          ...payload,
          host: (currentRoom?.host as any)?.userId || user.userId,
        }).unwrap()
        : await createRoom({
          ...payload,
          host: user.userId,
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
    p: 1.5,
    borderRadius: 1,
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    bgcolor: isDark
      ? alpha(theme.palette.background.paper, 0.4)
      : alpha(theme.palette.grey[50], 0.8),
  };

  const sectionLabelSx = {
    mb: 1,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.08em',
    textTransform: 'uppercase' as const,
    color: theme.palette.text.disabled,
  };

  const primaryColor = varAlpha(theme.vars.palette.primary.lightChannel, 1);

  const lockedLevel =  currentRoom?.level || 'all';

  // ----------------------------------------------------------------------

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 1,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        },
      }}
    >
      {/* Header */}

      <DialogTitle
        sx={{
          p: 0,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          background: isDark
            ? `linear-gradient(135deg,
                ${varAlpha(theme.vars.palette.primary.mainChannel, 0.25)},
                ${varAlpha(theme.vars.palette.primary.lightChannel, 0.15)})`
            : `linear-gradient(135deg,
                ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)},
                ${varAlpha(theme.vars.palette.primary.lightChannel, 0.05)})`,
        }}
      >
        <Box
          sx={{
            p: isMobile ? 2 : 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                background: `linear-gradient(
                  135deg,
                  ${varAlpha(theme.vars.palette.primary.mainChannel, 1)},
                  ${varAlpha(theme.vars.palette.primary.lightChannel, 0.7)}
                )`,
              }}
            >
              <MicNone sx={{ color: '#fff', fontSize: 20 }} />
            </Box>

            <Box>
              <Typography fontWeight={700} fontSize={isMobile ? 15 : 16}>
                {isEditMode ? 'Update Voice Channel' : 'Create Voice Channel'}
              </Typography>

              <Typography fontSize={12} color="text.secondary">
                {isEditMode
                  ? 'Update the topic, languages, or capacity'
                  : 'Set up your language learning space'}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={onClose}
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              p: 0,
              color: 'text.secondary',
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Box>
      </DialogTitle>

      {/* Body */}

      <DialogContent sx={{ p: 0 }}>
        <Scrollbar
          sx={{
            maxHeight: isMobile ? 'calc(100vh - 140px)' : '55vh',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: isMobile ? 1.5 : 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Basic Info */}

            <Box sx={sectionSx}>
              <Typography sx={sectionLabelSx}>Basic Info</Typography>

              <Box sx={{ display: 'grid', gap: 1 }}>
                <TextField
                  label="Choose a topic"
                  placeholder="e.g., Spanish Conversation Circle"
                  size="small"
                  required
                  fullWidth
                  value={formData.topic}
                  onChange={(e) => updateForm('topic', e.target.value)}
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
                  />
                )}
              </Box>
            </Box>

            {/* Languages */}

            <Box sx={sectionSx}>
              <Typography sx={sectionLabelSx}>Languages</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {formData.languages.map((code) => {
                  const lang = languages.find((item) => item.code === code);

                  return (
                    <Chip
                      key={code}
                      size="small"
                      label={lang ? `${lang.flag} ${lang.name}` : code}
                      onDelete={() => removeLanguage(code)}
                      deleteIcon={<Cancel sx={{ fontSize: 14 }} />}
                      sx={{
                        height: 26,
                        fontSize: 12,
                        fontWeight: 500,
                        color: primaryColor,
                        bgcolor: varAlpha(theme.vars.palette.primary.lightChannel, 0.15),
                        '&:hover': {
                          bgcolor: varAlpha(theme.vars.palette.primary.lightChannel, 0.25),
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
                options={languages.map((lang) => ({
                  code: lang.code,
                  label: `${lang.flag} ${lang.name}`,
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
                  />
                )}
                renderOption={(props, option) => (
                  <MenuItem {...props} key={option.code}>
                    {option.label}
                  </MenuItem>
                )}
              />
            </Box>

            {/* Settings */}

            <Box sx={sectionSx}>
              <Typography sx={sectionLabelSx}>Settings</Typography>

              {/* Level — editable on create, fixed on edit */}

              {isEditMode ? (
                <Box sx={{ mb: 1.5 }}>
                  <Typography fontSize={12} color="text.secondary" mb={0.75}>
                    Skill Level (not editable)
                  </Typography>
                  <Chip
                    label={LEVEL_LABELS[lockedLevel]}
                    size="small"
                    sx={{
                      height: 28,
                      fontSize: 11.5,
                      fontWeight: 700,
                      border: `1px solid ${LEVEL_COLORS[lockedLevel]}`,
                      bgcolor: alpha(LEVEL_COLORS[lockedLevel], 0.12),
                      color: LEVEL_COLORS[lockedLevel],
                    }}
                  />
                </Box>
              ) : (
                <>
                  <Typography fontSize={12} color="text.secondary" mb={0.75}>
                    Skill Level
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {LEVEL_OPTIONS.map(({ value, label }) => {
                      const selected = formData.level === value;
                      const color = LEVEL_COLORS[value];

                      return (
                        <Chip
                          key={value}
                          label={label}
                          size="small"
                          clickable
                          onClick={() => updateForm('level', value)}
                          sx={{
                            height: 28,
                            fontSize: 11.5,
                            fontWeight: selected ? 700 : 500,
                            border: `1px solid ${selected ? color : alpha(theme.palette.divider, 0.7)}`,
                            bgcolor: selected ? alpha(color, 0.12) : 'transparent',
                            color: selected ? color : theme.palette.text.secondary,
                            '&:hover': {
                              bgcolor: selected
                                ? alpha(color, 0.02)
                                : varAlpha(theme.vars.palette.primary.lightChannel, 0.25),
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </>
              )}

              {/* Participants — always editable */}

              <Box sx={{ mt: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography fontSize={12} color="text.secondary">
                    Max Participants
                  </Typography>

                  <Chip
                    size="small"
                    label={formData.max_participants}
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 700,
                      color: primaryColor,
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
                  sx={{ color: primaryColor }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography fontSize={10} color="text.disabled">
                    2
                  </Typography>
                  <Typography fontSize={10} color="text.disabled">
                    20
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Scrollbar>
      </DialogContent>

      {/* Actions */}

      <DialogActions
        sx={{
          p: isMobile ? 1.5 : 2,
          gap: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            flex: isMobile ? 1 : undefined,
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          onClick={() => handleSubmit()}
          fullWidth={isMobile}
          startIcon={<RecordVoiceOver />}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            flex: isMobile ? 2 : undefined,
            background: `linear-gradient(
              135deg,
              ${theme.palette.primary.dark},
              ${theme.palette.primary.main}
            )`,
          }}
        >
          {isEditMode ? 'Update Channel' : 'Create Channel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
