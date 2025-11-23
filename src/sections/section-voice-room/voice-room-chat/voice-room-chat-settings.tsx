import type { VoiceRoomSettings } from 'src/types/type-room';

import React, { useState } from 'react';

import { Settings } from '@mui/icons-material';
import {
  Box,
  Menu,
  Slider,
  Switch,
  Tooltip,
  Divider,
  MenuItem,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

interface VoiceControlsProps {
  isHost: boolean;
  voiceSettings: VoiceRoomSettings;
  onSettingsChange: (settings: Partial<VoiceRoomSettings>) => void;
}

export const VoiceRoomChatSettings: React.FC<VoiceControlsProps> = ({
  isHost,
  voiceSettings,

  onSettingsChange,
}) => {
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  return (
    <Box sx={{}}>
      {/* Settings */}
      {isHost && (
        <>
          <Tooltip title="Voice Settings">
            <IconButton onClick={handleSettingsClick}>
              <Settings />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={handleSettingsClose}
            PaperProps={{
              sx: { minWidth: 280 },
            }}
          >
            <MenuItem>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Voice Room Settings
              </Typography>
            </MenuItem>
            <Divider />

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.pushToTalk}
                    onChange={(e) => onSettingsChange({ pushToTalk: e.target.checked })}
                  />
                }
                label="Push to Talk"
              />
            </MenuItem>

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.noiseSupression}
                    onChange={(e) => onSettingsChange({ noiseSupression: e.target.checked })}
                  />
                }
                label="Noise Suppression"
              />
            </MenuItem>

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.echoCancellation}
                    onChange={(e) => onSettingsChange({ echoCancellation: e.target.checked })}
                  />
                }
                label="Echo Cancellation"
              />
            </MenuItem>

            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceSettings.autoGainControl}
                    onChange={(e) => onSettingsChange({ autoGainControl: e.target.checked })}
                  />
                }
                label="Auto Gain Control"
              />
            </MenuItem>

            <Divider />

            <MenuItem>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" gutterBottom>
                  Max Speakers: {voiceSettings.maxSpeakers}
                </Typography>
                <Slider
                  value={voiceSettings.maxSpeakers}
                  onChange={(e, value) => onSettingsChange({ maxSpeakers: value as number })}
                  min={1}
                  max={10}
                  marks
                  size="small"
                />
              </Box>
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};
