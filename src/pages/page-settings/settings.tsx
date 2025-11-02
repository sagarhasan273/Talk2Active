import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { currentUserProfile } from 'src/_mock/data/userProfile';

import { SettingsView } from 'src/sections/section-settings';

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
