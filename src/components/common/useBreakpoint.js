import { useEffect, useState } from 'react';

// Define your breakpoints
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 750,
  lg: 1000,
  xl: 1000, // Assuming xl and lg have the same value
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('xs');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint = 'xs';

      if (width >= breakpoints.sm && width < breakpoints.md) {
        newBreakpoint = 'sm';
      } else if (width >= breakpoints.md && width < breakpoints.lg) {
        newBreakpoint = 'md';
      } else if (width >= breakpoints.lg && width < breakpoints.xl) {
        newBreakpoint = 'lg';
      } else if (width >= breakpoints.xl) {
        newBreakpoint = 'xl';
      }

      setBreakpoint(newBreakpoint);
    };

    handleResize(); // Initial check

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return breakpoint;
};
