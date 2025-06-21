import type { Room, Activity } from 'src/types/room';

import React, { useState } from 'react';
import { Brain, Users, BookOpen } from 'lucide-react';

import Description from '@mui/icons-material/Description';
import {
  Mic,
  Star,
  PanTool,
  VolumeUp,
  EmojiEvents,
  ChevronLeft,
  MessageSharp,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Chip,
  Grid,
  Tabs,
  List,
  Paper,
  Stack,
  Button,
  Avatar,
  Divider,
  ListItem,
  IconButton,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';

interface ActivityPanelProps {
  room: Room;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ room }) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'activities'>('participants');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const activities: Activity[] = [
    {
      id: '1',
      type: 'vocabulary',
      title: 'Food & Cooking Terms',
      description: 'Learn essential vocabulary for cooking and dining',
      difficulty: 'medium',
      participants: ['1', '2'],
      isActive: false,
      data: {
        words: [
          { spanish: 'cocinar', english: 'to cook', example: 'Me gusta cocinar pasta' },
          {
            spanish: 'ingredientes',
            english: 'ingredients',
            example: 'Los ingredientes están frescos',
          },
          { spanish: 'receta', english: 'recipe', example: 'Esta receta es muy fácil' },
        ],
      },
    },
    {
      id: '2',
      type: 'pronunciation',
      title: 'Spanish RR Sound',
      description: 'Master the rolled R sound in Spanish',
      difficulty: 'hard',
      participants: ['1'],
      isActive: false,
      data: {
        exercises: ['perro', 'carro', 'ferrocarril', 'desarrollar'],
        tips: 'Place your tongue tip against the roof of your mouth and let air flow over it',
      },
    },
    {
      id: '3',
      type: 'grammar',
      title: 'Subjunctive Mood',
      description: 'Practice using the subjunctive in different contexts',
      difficulty: 'hard',
      participants: [],
      isActive: false,
      data: {
        examples: [
          { sentence: 'Espero que tengas un buen día', translation: 'I hope you have a good day' },
          { sentence: 'Dudo que llueva mañana', translation: 'I doubt it will rain tomorrow' },
        ],
      },
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return BookOpen;
      case 'pronunciation':
        return Mic;
      case 'grammar':
        return PanTool;
      case 'conversation':
        return MessageSharp;
      case 'quiz':
      case 'story':
        return Description;
      default:
        return BookOpen;
        return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderVocabularyActivity = (activity: Activity) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Vocabulary Cards</Typography>
        <Button variant="text" color="primary">
          Start Practice
        </Button>
      </Box>

      <Stack spacing={2}>
        {activity.data.words.map((word: any, index: number) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" component="div">
                  {word.spanish}
                </Typography>
                <IconButton size="small">
                  <VolumeUp fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {word.english}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                {word.example}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderPronunciationActivity = (activity: Activity) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Pronunciation Practice</Typography>
        <Button variant="text" color="primary">
          Start Recording
        </Button>
      </Box>

      <Paper elevation={0} sx={{ backgroundColor: 'info.light', p: 2, mb: 2 }}>
        <Typography variant="body2" color="info.dark">
          {activity.data.tips}
        </Typography>
      </Paper>

      <Stack spacing={1}>
        {activity.data.exercises.map((word: string, index: number) => (
          <Paper key={index} elevation={0} sx={{ p: 1.5, backgroundColor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">{word}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="primary">
                  <VolumeUp fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error">
                  <Mic fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );

  const renderGrammarActivity = (activity: Activity) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Grammar Examples</Typography>
        <Button variant="text" color="primary">
          Take Quiz
        </Button>
      </Box>

      <Stack spacing={1}>
        {activity.data.examples.map((example: any, index: number) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                {example.sentence}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {example.translation}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderActivityContent = (activity: Activity) => {
    switch (activity.type) {
      case 'vocabulary':
        return renderVocabularyActivity(activity);
      case 'pronunciation':
        return renderPronunciationActivity(activity);
      case 'grammar':
        return renderGrammarActivity(activity);
      default:
        return <Typography color="text.secondary">Activity content coming soon...</Typography>;
    }
  };

  if (selectedActivity) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            onClick={() => setSelectedActivity(null)}
            startIcon={<ChevronLeft />}
            sx={{ mb: 1 }}
          >
            Back to Activities
          </Button>
          <Typography variant="h6">{selectedActivity.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedActivity.description}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {renderActivityContent(selectedActivity)}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="participants"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users fontSize="small" />
              <span>Participants</span>
              <Chip label={room.participants.length} size="small" />
            </Box>
          }
        />
        <Tab
          value="activities"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents fontSize="small" />
              <span>Activities</span>
              <Chip label={activities.length} size="small" />
            </Box>
          }
        />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'participants' ? (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Room Participants</Typography>
              <Typography variant="body2" color="text.secondary">
                {room.participants.filter((p) => p.isOnline).length} online
              </Typography>
            </Box>

            <List>
              {room.participants.map((participant) => (
                <ListItem key={participant.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemAvatar>
                    <Avatar src={participant.avatar} alt={participant.name}>
                      {participant.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={participant.name}
                    secondary={
                      <>
                        Native: {participant.nativeLanguages.join(', ')}
                        {' • '}
                        Learning: {participant.learningLanguages.join(', ')}
                      </>
                    }
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <ListItemSecondaryAction>
                    {participant.nativeLanguages.includes(room.language) && (
                      <Star color="warning" fontSize="small" />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Learning Activities</Typography>
              <Button variant="text" color="primary">
                Create New
              </Button>
            </Box>

            <Stack spacing={2}>
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <Card
                    key={activity.id}
                    variant="outlined"
                    sx={{
                      '&:hover': { boxShadow: 1 },
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: 'primary.light',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Icon color="primary" fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1">{activity.title}</Typography>
                            <Chip
                              label={activity.difficulty}
                              size="small"
                              color={getDifficultyColor(activity.difficulty)}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {activity.description}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {activity.participants.length} joined
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.type}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

            {/* Quick Activity Buttons */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Quick Start</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    startIcon={<BookOpen fontSize="small" />}
                    sx={{ justifyContent: 'flex-start' }}
                    color="info"
                  >
                    Vocabulary
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    startIcon={<Mic fontSize="small" />}
                    sx={{ justifyContent: 'flex-start' }}
                    color="success"
                  >
                    Speaking
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    startIcon={<PanTool fontSize="small" />}
                    sx={{ justifyContent: 'flex-start' }}
                    color="secondary"
                  >
                    Grammar
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    startIcon={<Brain fontSize="small" />}
                    sx={{ justifyContent: 'flex-start' }}
                    color="warning"
                  >
                    Quiz
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ActivityPanel;
