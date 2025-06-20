import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/settings';
import { currentUserProfile } from 'src/sections/feed/data/userProfile';

// ----------------------------------------------------------------------

const metadata = { title: `Account - ${CONFIG.appName}` };

export default function Settings() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SettingsView profile={currentUserProfile} onUpdateProfile={() => {}} />
    </>
  );
}
