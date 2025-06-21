import React, { useState } from 'react';

import { Lock, Close, Public, SmartToy, RecordVoiceOver } from '@mui/icons-material';
import {
  Box,
  Chip,
  Card,
  Grid,
  Dialog,
  Button,
  Select,
  Switch,
  Slider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  CardContent,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { languages } from '../../_mock/data/languages';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: any) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ open, onClose, onCreateRoom }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'en',
    skillLevel: 'mixed',
    maxParticipants: 8,
    isPrivate: false,
    password: '',
    tags: [] as string[],
    aiAssistant: {
      personality: 'friendly',
      specialization: 'general',
      isActive: true,
      responseFrequency: 'medium',
      voiceEnabled: true,
    },
    voiceSettings: {
      isVoiceEnabled: true,
      pushToTalk: false,
      noiseSupression: true,
      echoCancellation: true,
      autoGainControl: true,
      maxSpeakers: 4,
      moderationMode: 'moderated',
    },
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(formData);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create Voice Learning Room
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up your interactive language learning space
          </Typography>
        </Box>
        <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          {/* Basic Information */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Room Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Spanish Conversation Circle"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    required
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe what learners can expect in your room..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={formData.language}
                      label="Language"
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, language: e.target.value }))
                      }
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Skill Level</InputLabel>
                    <Select
                      value={formData.skillLevel}
                      label="Skill Level"
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, skillLevel: e.target.value }))
                      }
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                      <MenuItem value="mixed">Mixed Levels</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Room Settings */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Room Settings
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Maximum Participants: {formData.maxParticipants}
                </Typography>
                <Slider
                  value={formData.maxParticipants}
                  onChange={(e, value) =>
                    setFormData((prev) => ({ ...prev, maxParticipants: value as number }))
                  }
                  min={2}
                  max={20}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                }}
              >
                {formData.isPrivate ? <Lock color="warning" /> : <Public color="success" />}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {formData.isPrivate ? 'Private Room' : 'Public Room'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.isPrivate ? 'Requires password to join' : 'Anyone can join'}
                  </Typography>
                </Box>
                <Switch
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isPrivate: e.target.checked }))
                  }
                />
              </Box>

              {formData.isPrivate && (
                <TextField
                  fullWidth
                  label="Room Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <RecordVoiceOver color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Voice Settings
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.voiceSettings.pushToTalk}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            voiceSettings: { ...prev.voiceSettings, pushToTalk: e.target.checked },
                          }))
                        }
                      />
                    }
                    label="Push to Talk"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.voiceSettings.noiseSupression}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            voiceSettings: {
                              ...prev.voiceSettings,
                              noiseSupression: e.target.checked,
                            },
                          }))
                        }
                      />
                    }
                    label="Noise Suppression"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.voiceSettings.echoCancellation}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            voiceSettings: {
                              ...prev.voiceSettings,
                              echoCancellation: e.target.checked,
                            },
                          }))
                        }
                      />
                    }
                    label="Echo Cancellation"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.voiceSettings.autoGainControl}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            voiceSettings: {
                              ...prev.voiceSettings,
                              autoGainControl: e.target.checked,
                            },
                          }))
                        }
                      />
                    }
                    label="Auto Gain Control"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Max Simultaneous Speakers: {formData.voiceSettings.maxSpeakers}
                  </Typography>
                  <Slider
                    value={formData.voiceSettings.maxSpeakers}
                    onChange={(e, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        voiceSettings: { ...prev.voiceSettings, maxSpeakers: value as number },
                      }))
                    }
                    min={1}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Moderation Mode</InputLabel>
                    <Select
                      value={formData.voiceSettings.moderationMode}
                      label="Moderation Mode"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          voiceSettings: {
                            ...prev.voiceSettings,
                            moderationMode: e.target.value as any,
                          },
                        }))
                      }
                    >
                      <MenuItem value="open">Open - Anyone can speak</MenuItem>
                      <MenuItem value="moderated">Moderated - Host controls speaking</MenuItem>
                      <MenuItem value="push-to-talk-only">Push-to-Talk Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SmartToy color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  AI Assistant
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.aiAssistant.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aiAssistant: { ...prev.aiAssistant, isActive: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable AI Assistant"
                sx={{ mb: 2 }}
              />

              {formData.aiAssistant.isActive && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Personality</InputLabel>
                      <Select
                        value={formData.aiAssistant.personality}
                        label="Personality"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            aiAssistant: {
                              ...prev.aiAssistant,
                              personality: e.target.value as any,
                            },
                          }))
                        }
                      >
                        <MenuItem value="friendly">Friendly & Encouraging</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="encouraging">Motivational</MenuItem>
                        <MenuItem value="strict">Direct & Precise</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Specialization</InputLabel>
                      <Select
                        value={formData.aiAssistant.specialization}
                        label="Specialization"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            aiAssistant: {
                              ...prev.aiAssistant,
                              specialization: e.target.value as any,
                            },
                          }))
                        }
                      >
                        <MenuItem value="general">General Language</MenuItem>
                        <MenuItem value="grammar">Grammar Focus</MenuItem>
                        <MenuItem value="vocabulary">Vocabulary Building</MenuItem>
                        <MenuItem value="pronunciation">Pronunciation</MenuItem>
                        <MenuItem value="culture">Cultural Context</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.aiAssistant.voiceEnabled}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              aiAssistant: { ...prev.aiAssistant, voiceEnabled: e.target.checked },
                            }))
                          }
                        />
                      }
                      label="Enable AI Voice Responses"
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Tags
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="conversation, grammar, culture..."
                />
                <Button variant="outlined" onClick={addTag}>
                  Add
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" startIcon={<RecordVoiceOver />}>
          Create Voice Room
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoomModal;
