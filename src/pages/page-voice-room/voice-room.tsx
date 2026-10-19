import { VoiceRoomSettingProvider, VoiceRoomStorageProvider } from '@/core/contexts';
import { useBoolean } from '@/hooks/use-boolean';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VoiceMainView } from 'src/sections/section-voice';

// ----------------------------------------------------------------------

const metadata = { title: `Voice Channel - ${CONFIG.appName}` };

export default function Page() {
  const isAuthOpen = useBoolean();

  return (
    <VoiceRoomStorageProvider>
      <VoiceRoomSettingProvider onOpenAuth={isAuthOpen.onTrue}>
        <Helmet>
          <title> {metadata.title}</title>
        </Helmet>
        <VoiceMainView />
      </VoiceRoomSettingProvider>
    </VoiceRoomStorageProvider>
  );
}
