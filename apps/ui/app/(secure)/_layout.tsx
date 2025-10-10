import { Redirect, Stack } from "expo-router";
import { useSession } from "@/lib/auth-client";
import { ActivityIndicator, View, Text } from "react-native";
import { SessionProvider } from "@/lib/session-context";

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

  return (
    <SessionProvider session={session as any}>
      <Stack screenOptions={{ headerShown: false }} />
    </SessionProvider>
  );
}
