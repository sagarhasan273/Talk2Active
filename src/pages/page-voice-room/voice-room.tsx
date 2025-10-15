import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VoiceRoomView } from 'src/sections/section-voice-room';

// ----------------------------------------------------------------------

const metadata = { title: `Voice Room - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VoiceRoomView />
    </>
  );
}
