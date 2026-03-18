// ----------------------------------------------------------------------

const ROOTS = {
  DASHBOARD: '/dashboard',
  USER: '/',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  upgradeToPro: '/#',

  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
  },

  // User
  user: {
    root: ROOTS.USER,
    profile: `${ROOTS.USER}/profile`,
  },
};
