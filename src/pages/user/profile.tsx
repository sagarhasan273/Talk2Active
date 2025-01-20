import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserHeader } from 'src/sections/profile-header/view';

// ----------------------------------------------------------------------

const metadata = { title: `Page two | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserHeader />
    </>
  );
}
