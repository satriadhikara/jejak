import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import { useAuthContext } from '@/lib/auth-context';
import { useRouter } from 'expo-router';

export default function EditProfil() {
  const session = useAuthContext();
  const router = useRouter();

  const userData = {
    name: session.session.user.name,
    email: session.session.user.email,
    phone: '',
    gender: '',
    avatar: session.session.user.image,
  };

  return (
    <View className="relative flex-1 bg-[#FAFAFB]">
      <Image
        source={require('../../assets/ProfilBG.png')}
        className="absolute left-0 top-0 h-full w-full"
        resizeMode="cover"
      />

      {/* Header */}
      <View className="absolute left-5 right-5 top-16 z-20 flex-row items-center">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="font-inter-semibold ml-3 text-lg text-white">Edit Profil</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}>
        {/* White Container */}
        <View className="mt-32 min-h-full items-center rounded-t-[32px] bg-white pb-10 pt-10">
          {/* Avatar */}
          <View className="relative">
            <Avatar.Image size={90} source={{ uri: userData.avatar ?? '' }} />
          </View>

          {/* Info List */}
          <View className="mt-8 w-full gap-3 px-6">
            <ProfileField label="Nama" value={userData.name} hideBorder />
            <ProfileField label="Jenis Kelamin" value={userData.gender} hideBorder />
            <ProfileField label="Email" value={userData.email} hideBorder />
            <ProfileField label="Nomor Telepon" value={userData.phone} hideBorder />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileField({
  label,
  value,
  hideBorder,
}: {
  label: string;
  value: string;
  hideBorder?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`flex-row items-center justify-between py-4 ${
        hideBorder ? '' : 'border-b border-[#E9E9E9]'
      }`}>
      <Text className="font-inter-medium text-[16px] text-black">{label}</Text>
      <View className="flex-row items-center">
        <Text className="mr-2 font-inter-regular text-[16px] text-[#8396A7]">{value}</Text>
        <Ionicons name="chevron-forward" size={18} color="#B3B3B3" />
      </View>
    </TouchableOpacity>
  );
}
