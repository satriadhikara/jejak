import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profil" options={{ headerShown: false }} />
      <Stack.Screen name="laporanAll" options={{ headerShown: false }} />
      <Stack.Screen name="laporanNew" options={{ headerShown: false }} />
      <Stack.Screen name="laporanOnProccess" options={{ headerShown: false }} />
      <Stack.Screen name="laporanDone" options={{ headerShown: false }} />
    </Stack>
  );
}
