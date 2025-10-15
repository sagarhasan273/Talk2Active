// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  USER: '/user',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  upgradeToPro: '/#',
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      signUp: `${ROOTS.AUTH}/sign-up`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },

  // User
  user: {
    root: ROOTS.USER,
    profile: `${ROOTS.USER}/profile`,
  },
};
