import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Tab, Tabs, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { UserContent } from 'src/layouts/user';
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';

import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';
import { ProfileFriends } from '../profile-friends';
import { ProfileGallery } from '../profile-gallery';
import { ProfileFollowers } from '../profile-followers';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Profile', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'followers', label: 'Followers', icon: <Iconify icon="solar:heart-bold" width={24} /> },
  {
    value: 'friends',
    label: 'Friends',
    icon: <Iconify icon="solar:users-group-rounded-bold" width={24} />,
  },
  {
    value: 'gallery',
    label: 'Gallery',
    icon: <Iconify icon="solar:gallery-wide-bold" width={24} />,
  },
];


export function UserHeader() {
  const { user } = useMockedUser();

  const [searchFriends, setSearchFriends] = useState<string>('');

  const tabs = useTabs('profile');

  const handleSearchFriends = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { 
    setSearchFriends(event.target.value);
  }, [])

  return (
    <UserContent>
      <Card sx={{ mt: 3, mb: 3, height: 290, position: 'relative' }}>
        <ProfileCover
          role={_userAbout.role}
          userId={_userAbout.userId}
          name={user?.displayName}
          avatarUrl={user?.photoURL}
          coverUrl={_userAbout.coverUrl}
          followers={_userAbout.totalFollowers}
          following={_userAbout.totalFollowing}
          friends={_userAbout.totalFriends}
        />

        <Box
          display="flex"
          justifyContent={{ xs: 'center', md: 'flex-end' }}
          sx={{
            width: 1,
            bottom: 0,
            borderRadius: '0px',
            px: { md: 3 },
            position: 'absolute',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs value={tabs.value} onChange={tabs.onChange}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </Card>

      {tabs.value === 'profile' && <ProfileHome info={_userAbout} posts={_userFeeds} />}
      
      {tabs.value === 'followers' && <ProfileFollowers followers={_userFollowers} />}

      {tabs.value === 'friends' && (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={handleSearchFriends}
        />
      )}

      {tabs.value === 'gallery' && <ProfileGallery gallery={_userGallery} />}

    </UserContent>
  );
}
