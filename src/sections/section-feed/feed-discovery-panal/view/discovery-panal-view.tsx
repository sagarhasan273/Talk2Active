import type { UserType } from 'src/types/type-user';

import { useSelector } from 'react-redux';
import { CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Card,
  List,
  Avatar,
  Divider,
  ListItem,
  useTheme,
  CardHeader,
  Typography,
  CardContent,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';

import { selectAccount } from 'src/core/slices';
import { useGetNewUsersQuery } from 'src/core/apis';

import { Iconify } from 'src/components/iconify';
import { ButtonRelationshipToggle } from 'src/components/buttons';

import EngagementProfileCard from '../engagement-profile-card';

export const DiscoveryPanel: React.FC = () => {
  const theme = useTheme();

  const user = useSelector(selectAccount);

  const [suggestedUsers, setSuggestedUsers] = useState<UserType[]>([]);

  const { data } = useGetNewUsersQuery(user.id);

  // const upcomingEvents = [
  //   {
  //     title: 'Wisdom Wednesday Live',
  //     time: 'Today, 3:00 PM',
  //     participants: 234,
  //     type: 'live',
  //   },
  //   {
  //     title: 'Quote of the Week Contest',
  //     time: 'Ends in 2 days',
  //     participants: 89,
  //     type: 'contest',
  //   },
  // ];

  useEffect(() => {
    if (data?.data) {
      setSuggestedUsers(data?.data || []);
    }
  }, [data]);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(3),
      }}
    >
      {/* Engagement Profile Card */}
      <EngagementProfileCard />

      {/* Suggested Users */}
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: { xs: 0, sm: 1 } }}>
        <CardHeader
          avatar={<Iconify icon="foundation:social-myspace" width={24} height={24} />}
          title="Who to Follow"
          subheader="Discover new voices"
          titleTypographyProps={{ fontWeight: 'bold' }}
          sx={{ p: '16px 16px 0px' }}
        />
        <Divider />
        <CardContent sx={{ p: 1 }}>
          <List disablePadding>
            {suggestedUsers.map((userDetails: any) => (
              <ListItem key={userDetails.username} disablePadding sx={{ p: 0 }}>
                <ListItemButton
                  sx={{ borderRadius: 2, p: 1 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    console.log('list');
                  }}
                  disableRipple
                >
                  <ListItemAvatar>
                    <Avatar src={userDetails.profilePhoto} alt={userDetails.name}>
                      {!userDetails.profilePhoto && userDetails.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight="medium">{userDetails.name}</Typography>
                      {userDetails.verified && (
                        <CheckCircle size={14} color={theme.palette.primary.main} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      @{userDetails.username}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {userDetails.followerCount} followers
                    </Typography>
                  </Box>

                  <ButtonRelationshipToggle
                    targetUser={{
                      name: userDetails.name,
                      id: userDetails._id,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      {/* <Card sx={{ backgroundColor: 'background.neutral' }}>
        <CardHeader
          avatar={
            <IconButton
              sx={{
                background: `linear-gradient(to right, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                color: 'common.white',
              }}
            >
              <Calendar size={20} />
            </IconButton>
          }
          title="Upcoming Events"
          subheader="Don't miss out"
          titleTypographyProps={{ fontWeight: 'bold' }}
        />
        <Divider />
        <CardContent sx={{ p: 1 }}>
          <List disablePadding>
            {upcomingEvents.map((event, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    p: 2,
                    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                    border: `1px solid ${theme.palette.primary.lighter}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight="medium">{event.title}</Typography>
                    <Chip
                      label={event.type === 'live' ? 'LIVE' : 'CONTEST'}
                      size="small"
                      sx={{
                        backgroundColor: event.type === 'live' ? 'error.light' : 'info.light',
                        color: event.type === 'live' ? 'error.main' : 'info.main',
                        fontWeight: 'medium',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {event.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {event.participants}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card> */}
    </Box>
  );
};
