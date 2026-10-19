import { VoiceRoomSettingProvider, VoiceRoomStorageProvider, useSocialStorage } from '@/core/contexts';
import { useBoolean } from '@/hooks/use-boolean';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { VoiceMainView } from 'src/sections/section-voice';

// ----------------------------------------------------------------------

const metadata = { title: `Voice Channel - ${CONFIG.appName}` };

function DynamicHelmet() {
  const { hasUnreadMessages, totalUnreadMessages } = useSocialStorage();

  const pageTitle = hasUnreadMessages
    ? `(${totalUnreadMessages}) ${metadata.title}`
    : metadata.title;

  useEffect(() => {
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    let link = links[0];

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const baseFaviconUrl = `${CONFIG.assetsDir}/favicon.ico`;

    if (!hasUnreadMessages) {
      link.type = 'image/x-icon';
      link.href = baseFaviconUrl;
      return;
    }

    // Use a 128x128 HiDPI canvas for razor-sharp downscaling
    const SIZE = 128;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = baseFaviconUrl;

    img.onload = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Draw the base favicon slightly inset in the bottom-left (112x112)
      // so the top-right badge has room to pop without clipping
      ctx.drawImage(img, 0, 16, 112, 112);

      // 2. Badge Geometry (Fully inside 128x128 bounds: center 88, 40, radius 34 + 6px border = max 128)
      const badgeX = 88;
      const badgeY = 40;
      const badgeRadius = 34;

      // 3. Draw a crisp white cutout ring around the badge
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius + 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // 4. Draw vibrant red notification circle
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF1E1E'; // High-visibility vibrant red
      ctx.fill();

      // 5. Draw large, bold, readable count text
      const isMultiChar = totalUnreadMessages > 9;
      const displayNum = isMultiChar ? '9+' : String(totalUnreadMessages);

      ctx.font = `900 ${isMultiChar ? 38 : 46}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Optical center adjustment (+2px Y)
      ctx.fillText(displayNum, badgeX, badgeY + 2);

      // 6. Apply PNG Data URI to all icon link tags
      const dataUrl = canvas.toDataURL('image/png');
      link.type = 'image/png';
      link.href = dataUrl;
    };
  }, [hasUnreadMessages, totalUnreadMessages]);

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  );
}

export default function Page() {
  const isAuthOpen = useBoolean();

  return (
    <VoiceRoomStorageProvider>
      <VoiceRoomSettingProvider onOpenAuth={isAuthOpen.onTrue}>
        <DynamicHelmet />
        <VoiceMainView />
      </VoiceRoomSettingProvider>
    </VoiceRoomStorageProvider>
  );
}