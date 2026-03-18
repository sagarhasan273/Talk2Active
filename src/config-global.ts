import { paths } from 'src/routes/route-paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  auth: {
    method: 'jwt';
    skip: boolean;
    redirectPath: string;
  };
  mapboxApiKey: string;
  youtubeApiKey: string;
  googleAuthClientId: string;
  defaultMicGain: number;
  defaultOutputGain: number;
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'Talk2Active',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.user.root,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? '',
  youtubeApiKey: import.meta.env.VITE_YOUTUBE_API_KEY ?? 'YOUTUBE_API_KEY',
  googleAuthClientId: import.meta.env.VITE_GOOGLE_AUTH0_CLIENT_ID ?? '',

  // Default Voice Settings
  defaultMicGain: Number(import.meta.env.VITE_DEFAULT_MIC_GAIN) || 50,
  defaultOutputGain: Number(import.meta.env.VITE_DEFAULT_MIC_VOLUME) || 60,
};
