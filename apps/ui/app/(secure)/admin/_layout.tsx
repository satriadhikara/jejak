import { Redirect, Stack } from 'expo-router';
import { useAuthContext } from '@/lib/auth-context';

export default function StackLayout() {
  const { role } = useAuthContext();

  // Check if user has admin role
  if (role !== 'admin') {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profil" options={{ headerShown: false }} />
      <Stack.Screen name="laporanAll" options={{ headerShown: false }} />
      <Stack.Screen name="laporanNew" options={{ headerShown: false }} />
      <Stack.Screen name="laporanOnProccess" options={{ headerShown: false }} />
      <Stack.Screen name="laporanDone" options={{ headerShown: false }} />
      <Stack.Screen name="laporanNotUpdated" options={{ headerShown: false }} />
      <Stack.Screen name="laporanJustEntered" options={{ headerShown: false }} />
      <Stack.Screen name="detailLaporan" options={{ headerShown: false }} />
      <Stack.Screen name="laporanComplete" options={{ headerShown: false }} />
    </Stack>
  );
}
