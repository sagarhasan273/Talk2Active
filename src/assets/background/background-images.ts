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
};
