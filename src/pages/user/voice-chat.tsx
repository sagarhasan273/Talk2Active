import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VoiceChatView } from 'src/sections/voice-chat/view';

// ----------------------------------------------------------------------

const metadata = { title: `Voice Chat - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VoiceChatView />
    </>
  );
}
