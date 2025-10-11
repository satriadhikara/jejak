import { View, Image, Text, Pressable } from 'react-native';

const EmptyReportHistory = ({ handleCreateReport }: { handleCreateReport: () => void }) => {
  return (
    <View className="mt-2.5 py-14">
      <View className="items-center justify-center gap-2 px-10">
        <Image source={require('../../assets/empty.png')} style={{ width: 60, height: 60 }} />
        <Text className="mt-2 text-center font-inter-semi-bold text-sm text-black">
          Belum ada laporan
        </Text>
        <Text className="mt-1 text-center font-inter-regular text-xs text-black">
          Kamu belum pernah membuat laporan. Yuk, mulai laporkan kerusakan pertama kamu!
        </Text>
        <Pressable
          className="mt-4 items-center justify-center rounded-3xl border border-gray-300 bg-[#F5F5F6] px-4 py-2.5"
          onPress={handleCreateReport}>
          <Text className="text-sm font-semibold text-gray-700">Laporkan Kerusakan</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default EmptyReportHistory;
