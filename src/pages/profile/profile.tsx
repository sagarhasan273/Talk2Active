import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserProfileView } from 'src/sections/user';
import { currentUserProfile } from 'src/sections/feed/data/userProfile';

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
