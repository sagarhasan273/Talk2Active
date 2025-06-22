import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { currentUserProfile } from 'src/_mock/data/userProfile';

import { UserProfileView } from 'src/sections/user';

// ----------------------------------------------------------------------

const metadata = { title: `Profile - ${CONFIG.appName}` };

export default function Profile() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserProfileView profile={currentUserProfile} />
    </>
  );
}
