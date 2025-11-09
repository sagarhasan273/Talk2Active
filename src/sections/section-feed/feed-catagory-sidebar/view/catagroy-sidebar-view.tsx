import React from 'react';
import { useSelector } from 'react-redux';
import {
  Zap,
  Star,
  Code,
  Quote,
  Heart,
  Globe,
  Music,
  Plane,
  Award,
  Coffee,
  Camera,
  Palette,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Sparkles,
  Lightbulb,
  Briefcase,
} from 'lucide-react';

import {
  Box,
  Grid,
  Card,
  alpha,
  Stack,
  Button,
  styled,
  useTheme,
  IconButton,
  Typography,
} from '@mui/material';

import { selectAccount } from 'src/core/slices';
import { useUpdateUserTagsMutation } from 'src/core/apis';

import { CreatePost } from 'src/sections/section-components/create-post';

interface CategorySidebarProps {
  selectedCategory: string[];
  onCategorySelect: React.Dispatch<React.SetStateAction<string[]>>;
}

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
}));

export const CategorySidebarView: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const theme = useTheme();

  const user = useSelector(selectAccount);

  const [isCreatePostOpen, setIsCreatePostOpen] = React.useState(false);

  const [updateTags] = useUpdateUserTagsMutation();

  const categories = [
    {
      key: 'all',
      label: 'All Posts',
      icon: Globe,
      color: theme.palette.primary.main,
      bgColor: theme.palette.grey[100],
    },
    {
      key: 'quotes',
      label: 'Quotes',
      icon: Quote,
      color: theme.palette.purple.main,
      bgColor: theme.palette.purple.light,
    },
    {
      key: 'motivation',
      label: 'Motivation',
      icon: Zap,
      color: theme.palette.yellow.main,
      bgColor: theme.palette.yellow.light,
    },
    {
      key: 'wisdom',
      label: 'Wisdom',
      icon: Lightbulb,
      color: theme.palette.blue.main,
      bgColor: theme.palette.blue.light,
    },
    {
      key: 'love&life',
      label: 'Love & Life',
      icon: Heart,
      color: theme.palette.red.main,
      bgColor: theme.palette.red.light,
    },
    {
      key: 'success',
      label: 'Success',
      icon: Star,
      color: theme.palette.green.main,
      bgColor: theme.palette.green.light,
    },
    {
      key: 'business',
      label: 'Business',
      icon: Briefcase,
      color: theme.palette.indigo.main,
      bgColor: theme.palette.indigo.light,
    },
    {
      key: 'creativity',
      label: 'Creativity',
      icon: Palette,
      color: theme.palette.pink.main,
      bgColor: theme.palette.pink.light,
    },
    {
      key: 'technology',
      label: 'Technology',
      icon: Code,
      color: theme.palette.cyan.main,
      bgColor: theme.palette.cyan.light,
    },
    {
      key: 'travel',
      label: 'Travel',
      icon: Plane,
      color: theme.palette.teal.main,
      bgColor: theme.palette.teal.light,
    },
    {
      key: 'health&fitness',
      label: 'Health & Fitness',
      icon: Dumbbell,
      color: theme.palette.orange.main,
      bgColor: theme.palette.orange.light,
    },
    {
      key: 'music&arts',
      label: 'Music & Arts',
      icon: Music,
      color: theme.palette.violet.main,
      bgColor: theme.palette.violet.light,
    },
    {
      key: 'gaming',
      label: 'Gaming',
      icon: Gamepad2,
      color: theme.palette.rose.main,
      bgColor: theme.palette.rose.light,
    },
    {
      key: 'photography',
      label: 'Photography',
      icon: Camera,
      color: theme.palette.emerald.main,
      bgColor: theme.palette.emerald.light,
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      icon: Coffee,
      color: theme.palette.stone.main,
      bgColor: theme.palette.stone.light,
    },
    {
      key: 'books&learning',
      label: 'Books & Learning',
      icon: BookOpen,
      color: theme.palette.amber.main,
      bgColor: theme.palette.amber.light,
    },
  ];

  return (
    <Stack gap={2}>
      <Card
        sx={{
          flex: '1 1 auto',
          borderRadius: { xs: 0, sm: 1 },
          backgroundColor: 'background.paper',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              sx={{
                p: 1.5,
                background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                color: 'common.white',
              }}
            >
              <Sparkles size={20} />
            </IconButton>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Categories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore by topic
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Categories */}
        <Box sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory.includes(category.key);
            return (
              <Grid key={category.key} item xs={6}>
                <Button
                  startIcon={
                    <Icon
                      size={18}
                      color={isSelected ? theme.palette.common.white : category.color}
                    />
                  }
                  variant="outlined"
                  sx={{
                    width: 'fit-content',
                    justifyContent: 'flex-start',
                    color: isSelected ? theme.palette.common.white : 'primary',
                    textTransform: 'none',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    bgcolor: isSelected ? alpha(category.color, 1) : alpha(category.color, 0.1),
                    borderColor: isSelected ? alpha(category.color, 1) : alpha(category.color, 0.3),
                    '&:hover': {
                      transform: 'scale(1.05)',
                      color: 'primary',
                      bgcolor: isSelected ? alpha(category.color, 1) : alpha(category.color, 0.2),
                    },
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() =>
                    onCategorySelect((prev) => {
                      if (category.key === 'all') {
                        updateTags({ id: user?.id, tags: ['all'] });
                        return ['all'];
                      }
                      if (prev.includes(category.key)) {
                        const data = prev.filter((cat) => cat !== category.key && cat !== 'all');
                        updateTags({ id: user?.id, tags: data });
                        return data;
                      }
                      const data = [...prev.filter((cat) => cat !== 'all'), category.key];
                      updateTags({ id: user?.id, tags: data });
                      return [...prev.filter((cat) => cat !== 'all'), category.key];
                    })
                  }
                >
                  {category.label}
                </Button>
              </Grid>
            );
          })}
        </Box>
      </Card>
      {/* Quick Actions */}
      <GradientBox>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Award size={24} color="inherit" />
          <Box>
            <Typography fontWeight="bold">Share Your Wisdom</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Inspire others today
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'common.white',
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'scale(1.05)',
            },
          }}
          onClick={() => setIsCreatePostOpen(true)}
        >
          Create Post
        </Button>
      </GradientBox>

      <CreatePost isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </Stack>
  );
};
