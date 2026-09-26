import { useState } from 'react';



import { SplashScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: Props) {
  const [isChecking, setIsChecking] = useState<boolean>(true);

  if (isChecking) {
    return <SplashScreen />;
  }
  return <>{children}</>;
}
