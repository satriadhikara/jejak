import { Text, View } from 'react-native';

const ErrorComponent = ({ message = '404 Not Found' }: { message: string }) => {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="font-inter-medium text-sm text-gray-600">Error: {message}</Text>
    </View>
  );
};

export default ErrorComponent;
