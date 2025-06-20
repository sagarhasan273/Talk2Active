import React from 'react';
import {
  Zap,
  Star,
  Code,
  Quote,
  Heart,
  Globe,
  Music,
  Plane,
  Coffee,
  Camera,
  Palette,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Sparkles,
  Lightbulb,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

import {
  Box,
  Card,
  List,
  Button,
  styled,
  ListItem,
  useTheme,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

interface CategorySidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  width: '100%',
  transition: theme.transitions.create(['background', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&.selected': {
    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[3],
    transform: 'scale(1.05)',
    '& .MuiListItemIcon-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.common.white,
    },
  },
  '&:not(.selected)': {
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary,
      '& .MuiListItemIcon-root': {
        transform: 'scale(1.1)',
      },
    },
  },
}));

const CategoryIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: theme.transitions.create(['background', 'transform'], {
    duration: theme.transitions.duration.standard,
  }),
}));

export const CategorySidebarView: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const theme = useTheme();

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
      key: 'love',
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
      key: 'health',
      label: 'Health & Fitness',
      icon: Dumbbell,
      color: theme.palette.orange.main,
      bgColor: theme.palette.orange.light,
    },
    {
      key: 'travel',
      label: 'Travel',
      icon: Plane,
      color: theme.palette.teal.main,
      bgColor: theme.palette.teal.light,
    },
    {
      key: 'music',
      label: 'Music & Arts',
      icon: Music,
      color: theme.palette.violet.main,
      bgColor: theme.palette.violet.light,
    },
    {
      key: 'photography',
      label: 'Photography',
      icon: Camera,
      color: theme.palette.emerald.main,
      bgColor: theme.palette.emerald.light,
    },
    {
      key: 'gaming',
      label: 'Gaming',
      icon: Gamepad2,
      color: theme.palette.rose.main,
      bgColor: theme.palette.rose.light,
    },
    {
      key: 'books',
      label: 'Books & Learning',
      icon: BookOpen,
      color: theme.palette.amber.main,
      bgColor: theme.palette.amber.light,
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      icon: Coffee,
      color: theme.palette.stone.main,
      bgColor: theme.palette.stone.light,
    },
  ];

  return (
    <Card>
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
      <Box sx={{ p: 2 }}>
        <List disablePadding>
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.key;

            return (
              <ListItem key={category.key} disablePadding>
                <CategoryButton
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onCategorySelect(category.key)}
                  sx={{ p: 3 }}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 2, borderRadius: 1 }}>
                    <CategoryIconWrapper
                      sx={{
                        backgroundColor: isSelected
                          ? 'rgba(155, 154, 154, 0.27)'
                          : category.bgColor,
                      }}
                    >
                      <Icon
                        size={18}
                        color={isSelected ? theme.palette.common.white : category.color}
                      />
                    </CategoryIconWrapper>
                  </ListItemIcon>
                  <ListItemText
                    primary={category.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isSelected ? 'bold' : 'medium',
                    }}
                  />
                  {isSelected && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        backgroundColor: 'common.white',
                        borderRadius: '50%',
                        ml: 1,
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                  )}
                </CategoryButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Trending Topics */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUp size={16} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight="bold">
            Trending
          </Typography>
        </Box>
        <List disablePadding>
          {['#MondayMotivation', '#WisdomWednesday', '#ThoughtfulThursday'].map((tag) => (
            <ListItem key={tag} disablePadding>
              <ListItemButton
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.lighter,
                  },
                }}
              >
                <Typography variant="body2" color="primary">
                  {tag}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
};
