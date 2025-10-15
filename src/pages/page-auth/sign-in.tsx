import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtSignInView } from 'src/auth/view';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignInView />
    </>
  );
}
