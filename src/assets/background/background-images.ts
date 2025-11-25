import { CONFIG } from 'src/config-global';

export const backgroundImages = {
  auth: {
    loginLightImageUrl: `url("${CONFIG.assetsDir}/assets/background/lightmode.jpg")`,
    loginImageUrl: `url("${CONFIG.assetsDir}/assets/background/darkmode.jpg")`,
    loginDarkImageUrl: `url("${CONFIG.assetsDir}/assets/background/darkmode.jpg")`,
  },
  profile: {
    cover: `url("${CONFIG.assetsDir}/assets/background/darkmode.jpg")`,
  },
  logo: {
    light: `${CONFIG.assetsDir}/assets/background/talk2active.png`,
    dark: `url("${CONFIG.assetsDir}/assets/background/talk2active.png")`,
  },
};
