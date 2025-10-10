import { Redirect, Stack } from 'expo-router';
import { getCookie, useSession } from '@/lib/auth-client';
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthProvider } from '@/lib/auth-context';

export default function Layout() {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2431AE" />
      </View>
    );
  }

  if (error) {
    console.log(error);
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  const cookies = getCookie();

  return (
    <AuthProvider session={session} cookies={cookies}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
