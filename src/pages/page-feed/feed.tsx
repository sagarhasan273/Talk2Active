import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { FeedView } from 'src/sections/section-feed';

// ----------------------------------------------------------------------

const metadata = { title: `Feed - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FeedView />
    </>
  );
}
