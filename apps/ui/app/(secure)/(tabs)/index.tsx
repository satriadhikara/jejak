import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View>
      <View className="flex h-screen items-center justify-center">
        <Text className="font-inter-regular text-3xl">1234567890</Text>
        <Text className="text-3xl">1234567890</Text>
        <Link href="/sign-in">Sign In</Link>
      </View>
    </View>
  );
}
