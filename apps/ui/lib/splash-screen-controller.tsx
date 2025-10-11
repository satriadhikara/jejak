import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useSession } from '@/lib/auth-client';

export function SplashScreenController() {
  const { isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      SplashScreen.hide();
    }
  }, [isPending]);

  return null;
}
