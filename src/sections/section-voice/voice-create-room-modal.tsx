import type { CreateRoomInput } from 'src/types/type-chat';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Close, Cancel, MicNone, RecordVoiceOver } from '@mui/icons-material';
import {
  Box,
  Chip,
  alpha,
  Dialog,
  Button,
  Slider,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';
import { useCreateRoomMutation, useUpdateRoomMutation } from 'src/core/apis/api-chat';

import { Scrollbar } from 'src/components/scrollbar';

import { languages } from '../../_mock/data/languages';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: any) => void;
  currentRoom?: CreateRoomInput & {
    roomId: string;
  };
}

const roomTypes = [
  { value: 'conversation', label: 'Conversation Practice', emoji: '💬' },
  { value: 'pronunciation', label: 'Pronunciation Focus', emoji: '🗣️' },
  { value: 'grammar', label: 'Grammar Workshop', emoji: '📝' },
  { value: 'vocabulary', label: 'Vocabulary Building', emoji: '📚' },
  { value: 'debate', label: 'Debate & Discussion', emoji: '⚡' },
  { value: 'storytelling', label: 'Storytelling', emoji: '✨' },
  { value: 'business', label: 'Business Language', emoji: '💼' },
  { value: 'exam-prep', label: 'Exam Preparation', emoji: '🎯' },
];

const levelColors: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
  mixed: '#818cf8',
};

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  open,
  onClose,
  onCreateRoom,
  currentRoom,
}) => {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');
  const user = useSelector(selectAccount);

  const [formData, setFormData] = useState({
    name: currentRoom?.name || '',
    description: currentRoom?.description || '',
    languages: currentRoom?.languages || ['en'],
    roomType: currentRoom?.roomType || 'conversation',
    level: currentRoom?.level || 'mixed',
    maxParticipants: currentRoom?.maxParticipants || 8,
    host: currentRoom?.host || user.id,
  });

  const [inputValue, setInputValue] = useState('');
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isLoadingUpdate }] = useUpdateRoomMutation();

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== languageToRemove),
    }));
  };

  const handleAddLanguage = (languageCode: string) => {
    if (languageCode && !formData.languages.includes(languageCode)) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, languageCode] }));
    }
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue) {
      event.preventDefault();
      const matched = languages.find(
        (lang) => lang.name.toLowerCase() === inputValue.toLowerCase()
      );
      if (matched) {
        handleAddLanguage(matched.code);
      } else {
        const partials = languages.filter((lang) =>
          lang.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (partials.length >= 1) handleAddLanguage(partials[0].code);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    onCreateRoom(formData);
    let response = null;
    if (currentRoom) {
      response = await updateRoom({ roomId: currentRoom?.roomId, ...formData }).unwrap();
    } else {
      response = await createRoom(formData).unwrap();
    }
    if (response.status) onClose();
  };

  const isDark = theme.palette.mode === 'dark';

  const sectionStyle = {
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    p: isMobile ? 1.5 : 2,
    mb: 2,
    background: isDark
      ? alpha(theme.palette.background.paper, 0.4)
      : alpha(theme.palette.grey[50], 0.8),
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: theme.palette.text.disabled,
    mb: 0.75,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          overflow: 'hidden',
          background: theme.palette.background.paper,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          p: 0,
          background: isDark
            ? `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.25)} 0%, ${varAlpha(theme.vars.palette.primary.lightChannel, 0.15)} 100%)`
            : `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)} 0%, ${varAlpha(theme.vars.palette.primary.lightChannel, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            p: isMobile ? 2 : 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 1)} 0%, ${varAlpha(theme.vars.palette.primary.lightChannel, 0.7)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.5)}`,
              }}
            >
              <MicNone sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: isMobile ? 15 : 16,
                  lineHeight: 1.2,
                  color: theme.palette.text.primary,
                }}
              >
                {currentRoom ? 'Update Voice Room' : 'Create Voice Room'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mt: 0.25 }}>
                Set up your language learning space
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={onClose}
            size="small"
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              p: 0,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              '&:hover': { background: alpha(theme.palette.text.primary, 0.06) },
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ p: 0 }}>
        <Scrollbar sx={{ maxHeight: isMobile ? 'calc(100vh - 140px)' : '55vh' }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ p: isMobile ? 1.5 : 2, display: 'flex', flexDirection: 'column', gap: 0 }}
          >
            {/* Section: Basic Info */}
            <Box sx={sectionStyle}>
              <Typography sx={labelStyle}>Basic Info</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  fullWidth
                  label="Room Name"
                  required
                  size="small"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Spanish Conversation Circle"
                />
                <TextField
                  fullWidth
                  label="Description"
                  required
                  size="small"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="What will learners practice here?"
                />
              </Box>
            </Box>

            {/* Section: Languages */}
            <Box sx={sectionStyle}>
              <Typography sx={labelStyle}>Languages</Typography>

              {formData.languages.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {formData.languages.map((code) => {
                    const lang = languages.find((l) => l.code === code);
                    return (
                      <Chip
                        key={code}
                        label={lang ? `${lang.flag} ${lang.name}` : code}
                        size="small"
                        onDelete={() => handleRemoveLanguage(code)}
                        deleteIcon={<Cancel sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          fontSize: 12,
                          height: 26,
                          fontWeight: 500,
                          background: varAlpha(theme.vars.palette.primary.lightChannel, 0.15),
                          color: varAlpha(theme.vars.palette.primary.lightChannel, 1),
                          border: `1px solid ${varAlpha(theme.vars.palette.primary.lightChannel, 0.25)}`,
                          '& .MuiChip-deleteIcon': {
                            color: varAlpha(theme.vars.palette.primary.lightChannel, 1),
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              )}

              <Autocomplete
                freeSolo
                size="small"
                options={languages.map((lang) => ({
                  code: lang.code,
                  label: `${lang.flag} ${lang.name}`,
                }))}
                inputValue={inputValue}
                onInputChange={(_, v) => setInputValue(v)}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue === 'object') {
                    handleAddLanguage(newValue.code);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search language & press Enter…"
                    onKeyDown={handleKeyDown}
                  />
                )}
                renderOption={(props, option) => (
                  <MenuItem {...props} sx={{ fontSize: 13 }}>
                    {option.label}
                  </MenuItem>
                )}
              />
            </Box>

            {/* Section: Room Type */}
            <Box sx={sectionStyle}>
              <Typography sx={labelStyle}>Room Type</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                  gap: 0.75,
                }}
              >
                {roomTypes.map((type) => {
                  const selected = formData.roomType === type.value;
                  return (
                    <Box
                      key={type.value}
                      onClick={() => setFormData((prev) => ({ ...prev, roomType: type.value }))}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        py: 0.9,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        border: `1px solid ${selected ? varAlpha(theme.vars.palette.primary.lightChannel, 0.5) : theme.palette.divider}`,
                        background: selected
                          ? varAlpha(theme.vars.palette.primary.lightChannel, 0.15)
                          : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          border: `1px solid ${varAlpha(theme.vars.palette.primary.lightChannel, 0.5)}`,
                          background: varAlpha(theme.vars.palette.primary.lightChannel, 0.5),
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: 14, lineHeight: 1 }}>{type.emoji}</Typography>
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          fontWeight: selected ? 600 : 400,
                          color: selected
                            ? varAlpha(theme.vars.palette.primary.lightChannel, 1)
                            : theme.palette.text.secondary,
                          lineHeight: 1.3,
                        }}
                      >
                        {type.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Section: Settings */}
            <Box sx={sectionStyle}>
              <Typography sx={labelStyle}>Settings</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Skill Level */}
                <Box>
                  <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mb: 0.75 }}>
                    Skill Level
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {(['beginner', 'intermediate', 'advanced', 'mixed'] as const).map((lvl) => {
                      const selected = formData.level === lvl;
                      const color = levelColors[lvl];
                      return (
                        <Chip
                          key={lvl}
                          label={lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                          size="small"
                          onClick={() => setFormData((prev) => ({ ...prev, level: lvl }))}
                          sx={{
                            fontSize: 11.5,
                            height: 26,
                            fontWeight: selected ? 700 : 400,
                            cursor: 'pointer',
                            border: `1px solid ${selected ? color : alpha(theme.palette.divider, 0.7)}`,
                            background: selected ? alpha(color, 0.12) : 'transparent',
                            color: selected ? color : theme.palette.text.secondary,
                            transition: 'all 0.15s',
                            '&:hover': { background: alpha(color, 0.08), borderColor: color },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Max Participants */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary }}>
                      Max Participants
                    </Typography>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        background: varAlpha(theme.vars.palette.primary.lightChannel, 0.1),
                        border: `1px solid ${varAlpha(theme.vars.palette.primary.lightChannel, 0.2)}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: varAlpha(theme.vars.palette.primary.lightChannel, 1),
                        }}
                      >
                        {formData.maxParticipants}
                      </Typography>
                    </Box>
                  </Box>
                  <Slider
                    value={formData.maxParticipants}
                    onChange={(_, value) =>
                      setFormData((prev) => ({ ...prev, maxParticipants: value as number }))
                    }
                    min={2}
                    max={20}
                    marks
                    valueLabelDisplay="auto"
                    sx={{
                      color: varAlpha(theme.vars.palette.primary.lightChannel, 1),
                      '& .MuiSlider-rail': {
                        background: varAlpha(theme.vars.palette.primary.lightChannel, 0.15),
                      },
                      '& .MuiSlider-mark': {
                        background: varAlpha(theme.vars.palette.primary.lightChannel, 0.25),
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 10, color: theme.palette.text.disabled }}>
                      2
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: theme.palette.text.disabled }}>
                      20
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Scrollbar>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions
        sx={{
          p: isMobile ? 1.5 : 2,
          gap: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          background: isDark
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.grey[50], 0.8),
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size={isMobile ? 'medium' : 'small'}
          fullWidth={isMobile}
          sx={{ borderRadius: 2, fontWeight: 600, flex: isMobile ? 1 : 'unset' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSubmit()}
          variant="contained"
          size={isMobile ? 'medium' : 'small'}
          fullWidth={isMobile}
          startIcon={<RecordVoiceOver />}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            px: 2,
            flex: isMobile ? 2 : 'unset',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 6px 20px rgba(99,102,241,0.45)',
            },
          }}
          disabled={isLoadingUpdate}
        >
          Create Room
        </Button>
      </DialogActions>
    </Dialog>
  );
};
