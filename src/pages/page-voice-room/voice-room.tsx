import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VoiceMainView } from 'src/sections/section-voice';

import SocialChat from './social-chat';

// ----------------------------------------------------------------------

const metadata = { title: `Voice Channel - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VoiceMainView />
      <SocialChat />
    </>
  );
}
