import { View, Text, Pressable, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useRef, useMemo } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { signIn as signInBetterAuth } from '@/lib/auth-client';
import { Image } from 'expo-image';
import { router } from 'expo-router';

export default function SignIn() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleOpenModal = () => {
    bottomSheetRef.current?.expand();
  };

  const handleSignInWithGoogle = async () => {
    await signInBetterAuth.social(
      {
        provider: 'google',
        callbackURL: '/',
      },
      {
        onError: (error) => {
          if (error.error.status === 404) {
            ToastAndroid.show('Cant connect to backend', ToastAndroid.SHORT);
          }
        },
      }
    );
    router.replace('/');
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

            <View>
              <View className="mb-6 flex-row items-center gap-4">
                <View className="h-[1px] flex-1 bg-[#ABAFB5]" />
                <Text className="font-inter-regular text-[#ABAFB5]">atau masuk dengan</Text>
                <View className="h-[1px] flex-1 bg-[#ABAFB5]" />
              </View>

              <View className="flex flex-row items-center justify-center gap-3">
                <Pressable
                  className="w-1/2 flex-row items-center justify-center gap-2 rounded-2xl border border-[#ABAFB5] bg-white px-6 py-4"
                  onPress={handleSignInWithGoogle}>
                  <Image
                    source={require('@/assets/icons/google.svg')}
                    style={{ width: 19, height: 19 }}
                  />
                  <Text className="font-inter-semi-bold text-[#4B4D53]">Google</Text>
                </Pressable>

                <Pressable className="w-1/2 flex-row items-center justify-center gap-3 rounded-2xl border border-[#ABAFB5] bg-white px-6 py-4">
                  <Image
                    source={require('@/assets/icons/apple.svg')}
                    style={{ width: 19, height: 19 }}
                  />
                  <Text className="font-inter-semi-bold text-base text-[#4B4D53]">Apple ID</Text>
                </Pressable>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}
