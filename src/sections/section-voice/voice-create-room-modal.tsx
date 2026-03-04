import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Close, Cancel, RecordVoiceOver } from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Dialog,
  Button,
  Select,
  Slider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  CardContent,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { selectAccount } from 'src/core/slices';
import { useCreateRoomMutation } from 'src/core/apis/api-chat';

import { Scrollbar } from 'src/components/scrollbar';
import { languages } from '../../_mock/data/languages';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: any) => void;
}

// Room type options
const roomTypes = [
  { value: 'conversation', label: 'Conversation Practice' },
  { value: 'pronunciation', label: 'Pronunciation Focus' },
  { value: 'grammar', label: 'Grammar Workshop' },
  { value: 'vocabulary', label: 'Vocabulary Building' },
  { value: 'debate', label: 'Debate & Discussion' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'business', label: 'Business Language' },
  { value: 'exam-prep', label: 'Exam Preparation' },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  open,
  onClose,
  onCreateRoom,
}) => {
  const user = useSelector(selectAccount);

  const [formData, setFormData] = useState({
    name: 'Basic Spanish Conversation',
    description: "Let's practice basic Spanish conversation skills together!",
    languages: ['en'], // Changed to array for multiple languages
    roomType: 'conversation',
    level: 'mixed',
    maxParticipants: 8,
    host: user.id,
  });

  const [inputValue, setInputValue] = useState('');

  const [createRoom] = useCreateRoomMutation();

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== languageToRemove),
    }));
  };

  const handleAddLanguage = (languageCode: string) => {
    if (languageCode && !formData.languages.includes(languageCode)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageCode],
      }));
    }
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue) {
      event.preventDefault();

      // Check if input matches any language name
      const matchedLanguage = languages.find(
        (lang) => lang.name.toLowerCase() === inputValue.toLowerCase()
      );

      if (matchedLanguage) {
        handleAddLanguage(matchedLanguage.code);
      } else {
        // If no exact match, try to find partial matches or show error
        const partialMatches = languages.filter((lang) =>
          lang.name.toLowerCase().includes(inputValue.toLowerCase())
        );

        if (partialMatches.length === 1) {
          // If only one match, add it
          handleAddLanguage(partialMatches[0].code);
        } else if (partialMatches.length > 1) {
          // Multiple matches - you might want to show a dropdown or just the first match
          // For now, add the first match
          handleAddLanguage(partialMatches[0].code);
        }
        // If no matches, you might want to show an error toast here
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(formData);
    const response = await createRoom(formData).unwrap();
    if (response.status) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{}}>
            Create Voice Room
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Set up your interactive language learning space
          </Typography>
        </Box>
        <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 2, height: '50vh' }}>
        <Scrollbar>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* Basic Information */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Basic Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe what learners can expect in your room..."
                  />

                  {/* Multiple Language Selection with Search and Enter to Add */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Languages (Type and press Enter to add)
                    </Typography>

                    {/* Selected Languages Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
                      {formData.languages.map((code) => {
                        const lang = languages.find((l) => l.code === code);
                        return (
                          <Chip
                            key={code}
                            label={lang ? `${lang.flag} ${lang.name}` : code}
                            size="small"
                            onDelete={() => handleRemoveLanguage(code)}
                            deleteIcon={<Cancel />}
                            sx={{
                              color: 'text.primary',
                              backgroundColor: 'background.neutral',
                              '&:hover': {
                                color: 'text.primary',
                                backgroundColor: 'background.neutral',
                              },
                            }}
                          />
                        );
                      })}
                    </Box>

                    {/* Language Input Field */}
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={languages.map((lang) => ({
                        code: lang.code,
                        label: `${lang.flag} ${lang.name}`,
                      }))}
                      inputValue={inputValue}
                      onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                      }}
                      onChange={(event, newValue) => {
                        if (newValue && typeof newValue === 'object') {
                          handleAddLanguage(newValue.code);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          placeholder="Search or type language name and press Enter..."
                          onKeyDown={handleKeyDown}
                        />
                      )}
                      renderOption={(props, option) => (
                        <MenuItem {...props}>{option.label}</MenuItem>
                      )}
                    />
                  </Box>

                  {/* Room Type Selection */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Room Type</InputLabel>
                    <Select
                      value={formData.roomType}
                      label="Room Type"
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, roomType: e.target.value }))
                      }
                    >
                      {roomTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Skill Level</InputLabel>
                    <Select
                      value={formData.level}
                      label="Skill Level"
                      onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                      <MenuItem value="mixed">Mixed Levels</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* Room Settings */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Room Settings
                </Typography>

                <Box sx={{}}>
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
              </CardContent>
            </Card>
          </Box>
        </Scrollbar>
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
