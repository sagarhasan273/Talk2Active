import { Quote } from 'lucide-react';

import { Box, Stack, useTheme, IconButton, Typography } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { Iconify } from 'src/components/iconify';

import { DiscoveryPanel } from '../feed-discovery-panal';
import { CategorySidebarView } from '../feed-catagory-sidebar';
import { DiscoveryPanalDrawer } from '../feed-discovery-panal/discovery-panal-drawer';
import { CategorySidebarDrawer } from '../feed-catagory-sidebar/catagory-sidebar-drawer';

export function FeedPostsHeader({
  selectedCategory,
  setSelectedCategory,
  setIsCreatePostOpen,
}: {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setIsCreatePostOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const theme = useTheme();

  const mid = useResponsive('down', 'lg');
  const small = useResponsive('down', 'md');

  return (
    <Box
      sx={{
        m: 'auto',
        pb: 2,
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        width: '100%',
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: '50%',
          background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Quote size={24} color="white" />
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Wisdom Feed
      </Typography>
      <Stack direction="row" sx={{ ml: 'auto', gap: 1 }}>
        {small && (
          <DiscoveryPanalDrawer>
            <DiscoveryPanel />
          </DiscoveryPanalDrawer>
        )}
        {mid && (
          <CategorySidebarDrawer>
            <CategorySidebarView
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </CategorySidebarDrawer>
        )}
        {/* Floating Action Button */}
        <IconButton
          onClick={() => setIsCreatePostOpen(true)}
          sx={{
            p: 1,
            borderRadius: '50%',
            color: 'white',
            background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
            },
          }}
        >
          <Iconify icon="gridicons:create" width={24} height={24} />
        </IconButton>
      </Stack>
    </Box>
  );
}
