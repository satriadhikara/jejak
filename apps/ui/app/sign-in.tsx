import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useRef, useMemo } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SignIn() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleOpenModal = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-primary">
        <SafeAreaView className="flex flex-1 flex-col justify-end px-4 pb-5">
          <Text className="mb-2 font-inter-regular text-5xl text-white">Jejak</Text>
          <Text className="mb-4 font-inter-regular text-2xl text-secondary">
            Langkah Kecil, Perubahan Besar
          </Text>
          <Text className="mb-11 font-inter-regular text-lg text-white">
            Setiap laporan Anda adalah langkah menuju kota yang lebih baik.
          </Text>
          <View className="flex flex-col items-end justify-end">
            <Pressable
              onPress={handleOpenModal}
              className="flex-row items-center gap-2 rounded-[50px] bg-white px-[22px] py-4">
              <Text className="font-inter-regular text-primary">Mulai</Text>
              <Feather name="arrow-right" size={24} color="#2431AE" />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: '#FFFFFF' }}
          handleIndicatorStyle={{ backgroundColor: '#D9D9D9', width: 64 }}>
          <BottomSheetView className="flex-1 px-6 py-6">
            <View className="mb-6 flex flex-col items-center justify-center">
              <Text className="font-inter-bold text-2xl text-primary">Selamat datang!</Text>
            </View>

            <View className="gap-3">
              <Pressable className="flex-row items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-6 py-4">
                <Feather name="mail" size={20} color="#2431AE" />
                <Text className="font-inter-medium text-base text-primary">
                  Lanjutkan dengan Email
                </Text>
              </Pressable>

              <Pressable className="flex-row items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-6 py-4">
                <Feather name="smartphone" size={20} color="#2431AE" />
                <Text className="font-inter-medium text-base text-primary">
                  Lanjutkan dengan Nomor Telepon
                </Text>
              </Pressable>

              <View className="my-4 flex-row items-center gap-4">
                <View className="h-[1px] flex-1 bg-gray-300" />
                <Text className="font-inter-regular text-gray-500">atau masuk dengan</Text>
                <View className="h-[1px] flex-1 bg-gray-300" />
              </View>

              <View className="flex flex-row items-center justify-center gap-3">
                <Pressable className="w-1/2 flex-row items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-6 py-4">
                  <Feather name="chrome" size={20} color="#2431AE" />
                  <Text className="font-inter-medium text-base text-primary">Google</Text>
                </Pressable>

                <Pressable className="w-1/2 flex-row items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-6 py-4">
                  <Feather name="github" size={20} color="#2431AE" />
                  <Text className="font-inter-medium text-base text-primary">Apple</Text>
                </Pressable>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}
