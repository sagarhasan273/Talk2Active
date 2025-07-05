import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { skipToken } from '@reduxjs/toolkit/query';

import { useUserContext } from 'src/routes/components/user-context';

import { CONFIG } from 'src/config-global';
import { useGetUserByIdQuery } from 'src/services/user-api';
import { currentUserProfile } from 'src/_mock/data/userProfile';

import { UserProfileView } from 'src/sections/user';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `Profile - ${CONFIG.appName}` };

export default function Profile() {
  const { authUser } = useAuthContext();
  const { setUser, setLoading } = useUserContext();

  const { data, isLoading } = useGetUserByIdQuery(authUser?._id ? authUser._id : skipToken);

  useEffect(() => {
    if (data?.status) {
      setUser(data.user);
    }
  }, [data, setUser]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserProfileView profile={currentUserProfile} />
    </>
  );
}
