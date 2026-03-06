// src/sections/section-voice-room/components/voice-rooms-empty-state.tsx

import { Box, Fade, Paper, alpha, Button, Typography } from '@mui/material';
import { Add, Mic, Chat, Group, SentimentDissatisfied } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CreateRoomModal } from '../voice-create-room-modal';

interface VoiceRoomsEmptyStateProps {
  title?: string;
  description?: string;
  suggestions?: string[];
}

export function VoiceRoomsEmptyState({
  title = 'No Voice Rooms Yet',
  description = 'It looks quiet in here! Be the first to create a voice room and start connecting with others. Whether it is language practice, discussions, or just hanging out - there is always room for more voices!',
  suggestions = ['🗣️ Language Exchange', '💬 Discussion', '🎯 Practice', '🎉 Social'],
}: VoiceRoomsEmptyStateProps) {
  const createRoomBoolean = useBoolean();

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          px: 3,
          py: 8,
          textAlign: 'center',
        }}
      >
        {/* Animated illustration */}
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha('#667eea', 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha('#667eea', 0.4)}` },
              '70%': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 0 20px ${alpha('#667eea', 0)}`,
              },
              '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha('#667eea', 0)}` },
            },
          }}
        >
          {/* Floating icons */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: 20,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          >
            <Paper
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: '#ff9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 4,
              }}
            >
              <Chat sx={{ color: 'white', fontSize: 28 }} />
            </Paper>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: -10,
              right: 10,
              animation: 'float 3.5s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-15px)' },
              },
            }}
          >
            <Paper
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 4,
              }}
            >
              <Mic sx={{ color: 'white', fontSize: 32 }} />
            </Paper>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: 30,
              right: -10,
              animation: 'float 4s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-12px)' },
              },
            }}
          >
            <Paper
              sx={{
                width: 45,
                height: 45,
                borderRadius: '50%',
                bgcolor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 4,
              }}
            >
              <Group sx={{ color: 'white', fontSize: 24 }} />
            </Paper>
          </Box>

          {/* Center icon */}
          <Paper
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 8,
            }}
          >
            <SentimentDissatisfied sx={{ color: 'white', fontSize: 60 }} />
          </Paper>
        </Paper>

        {/* Text content */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 500,
            mb: 4,
            lineHeight: 1.8,
          }}
        >
          {description}
        </Typography>

        {/* Suggestions */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          {suggestions.map((suggestion) => (
            <Paper
              key={suggestion}
              elevation={0}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 4,
                bgcolor: alpha('#667eea', 0.08),
                border: '1px solid',
                borderColor: alpha('#667eea', 0.2),
                fontSize: '0.9rem',
                color: '#667eea',
              }}
            >
              {suggestion}
            </Paper>
          ))}
        </Box>

        {/* Create button */}

        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={createRoomBoolean.onTrue}
          sx={{
            bgcolor: '#667eea',
            px: { xs: 3, sm: 4 },
            py: { xs: 1.2, sm: 1.5 },
            fontSize: { xs: '1rem', sm: '1.1rem' },
            borderRadius: 3,
            boxShadow: `0 8px 20px -5px ${alpha('#667eea', 0.6)}`,
            '&:hover': {
              bgcolor: '#5a67d8',
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 25px -8px ${alpha('#667eea', 0.8)}`,
            },
            transition: 'all 0.2s',
          }}
        >
          Create Your First Room
        </Button>

        <CreateRoomModal
          open={createRoomBoolean.value}
          onClose={createRoomBoolean.onFalse}
          onCreateRoom={() => {}}
        />
      </Box>
    </Fade>
  );
}
